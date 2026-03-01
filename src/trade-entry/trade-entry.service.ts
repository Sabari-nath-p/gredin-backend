import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeEntryDto, TradeStatus } from './dto/create-trade-entry.dto';
import { TradeResult } from '@prisma/client';
import { UpdateTradeEntryDto } from './dto/update-trade-entry.dto';
import { CloseTradeDto } from './dto/close-trade.dto';
import { TradeEntry, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class TradeEntryService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createDto: CreateTradeEntryDto): Promise<TradeEntry> {
        // Verify trade account belongs to user
        const tradeAccount = await this.prisma.tradeAccount.findFirst({
            where: {
                id: createDto.tradeAccountId,
                userId,
            },
        });

        if (!tradeAccount) {
            throw new NotFoundException('Trade account not found or does not belong to you');
        }

        if (!tradeAccount.isActive) {
            throw new BadRequestException('Trade account is inactive');
        }

        const status = createDto.status || TradeStatus.OPEN;

        // If creating with CLOSED status, validate required fields
        if (status === TradeStatus.CLOSED) {
            if (!createDto.result) {
                throw new BadRequestException('Result is required when creating a closed trade');
            }
            if (createDto.realisedProfitLoss === undefined || createDto.realisedProfitLoss === null) {
                throw new BadRequestException(
                    'Realised profit/loss is required when creating a closed trade',
                );
            }
        }

        // Use transaction to ensure data consistency
        return await this.prisma.$transaction(async (prisma) => {
            const tradeEntry = await prisma.tradeEntry.create({
                data: {
                    tradeAccountId: createDto.tradeAccountId,
                    entryDateTime: new Date(createDto.entryDateTime),
                    instrument: createDto.instrument,
                    direction: createDto.direction,
                    entryPrice: createDto.entryPrice,
                    positionSize: createDto.positionSize,
                    stopLossAmount: createDto.stopLossAmount,
                    takeProfitAmount: createDto.takeProfitAmount,
                    status,
                    result: createDto.result,
                    realisedProfitLoss: createDto.realisedProfitLoss,
                    serviceCharge: createDto.serviceCharge || 0,
                    notes: createDto.notes,
                },
            });

            // Save dynamic field values if provided
            if (createDto.fieldValues && createDto.fieldValues.length > 0) {
                for (const fv of createDto.fieldValues) {
                    await prisma.tradeFieldValue.create({
                        data: {
                            tradeEntryId: tradeEntry.id,
                            fieldId: fv.fieldId,
                            textValue: fv.textValue ?? null,
                            booleanValue: fv.booleanValue ?? null,
                            imageUrl: fv.imageUrl ?? null,
                        },
                    });
                }
            }

            // If trade is closed, update account balance
            if (status === TradeStatus.CLOSED) {
                await this.updateAccountBalance(
                    prisma,
                    createDto.tradeAccountId,
                    createDto.result!,
                    createDto.realisedProfitLoss!,
                    createDto.serviceCharge || 0,
                    createDto.stopLossAmount,
                );
            }

            return tradeEntry;
        });
    }

    async findAllByAccount(
        tradeAccountId: string,
        userId: string,
        userRole: UserRole,
        page = 1,
        limit = 20,
    ) {
        // Verify access to trade account
        const tradeAccount = await this.prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });

        if (!tradeAccount) {
            throw new NotFoundException('Trade account not found');
        }

        if (tradeAccount.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this trade account');
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.tradeEntry.findMany({
                where: { tradeAccountId },
                include: {
                    fieldValues: {
                        include: { field: true },
                    },
                },
                orderBy: { entryDateTime: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.tradeEntry.count({ where: { tradeAccountId } }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string, userId: string, userRole: UserRole): Promise<TradeEntry> {
        const tradeEntry = await this.prisma.tradeEntry.findUnique({
            where: { id },
            include: {
                tradeAccount: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
                fieldValues: {
                    include: {
                        field: true,
                    },
                },
            },
        });

        if (!tradeEntry) {
            throw new NotFoundException('Trade entry not found');
        }

        // Check access
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this trade entry');
        }

        return tradeEntry;
    }

    async update(
        id: string,
        userId: string,
        userRole: UserRole,
        updateDto: UpdateTradeEntryDto,
    ): Promise<TradeEntry> {
        const tradeEntry = await this.prisma.tradeEntry.findUnique({
            where: { id },
            include: { tradeAccount: true },
        });

        if (!tradeEntry) {
            throw new NotFoundException('Trade entry not found');
        }

        // Check access
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this trade entry');
        }

        // Only allow updates on OPEN trades
        if (tradeEntry.status === TradeStatus.CLOSED) {
            throw new BadRequestException('Cannot update a closed trade');
        }

        return this.prisma.tradeEntry.update({
            where: { id },
            data: updateDto,
        });
    }

    async closeTrade(
        id: string,
        userId: string,
        userRole: UserRole,
        closeDto: CloseTradeDto,
    ): Promise<TradeEntry> {
        const tradeEntry = await this.prisma.tradeEntry.findUnique({
            where: { id },
            include: { tradeAccount: true },
        });

        if (!tradeEntry) {
            throw new NotFoundException('Trade entry not found');
        }

        // Check access
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this trade entry');
        }

        // Check if already closed
        if (tradeEntry.status === TradeStatus.CLOSED) {
            throw new BadRequestException('Trade is already closed');
        }

        // Use transaction to ensure data consistency
        return await this.prisma.$transaction(async (prisma) => {
            // Update trade entry
            const updatedTrade = await prisma.tradeEntry.update({
                where: { id },
                data: {
                    status: TradeStatus.CLOSED,
                    result: closeDto.result,
                    realisedProfitLoss: closeDto.realisedProfitLoss,
                    serviceCharge: closeDto.serviceCharge || tradeEntry.serviceCharge,
                    notes: closeDto.notes || tradeEntry.notes,
                },
            });

            // Save/update dynamic field values if provided
            if (closeDto.fieldValues && closeDto.fieldValues.length > 0) {
                for (const fv of closeDto.fieldValues) {
                    await prisma.tradeFieldValue.upsert({
                        where: {
                            tradeEntryId_fieldId: {
                                tradeEntryId: id,
                                fieldId: fv.fieldId,
                            },
                        },
                        update: {
                            textValue: fv.textValue ?? null,
                            booleanValue: fv.booleanValue ?? null,
                            imageUrl: fv.imageUrl ?? null,
                        },
                        create: {
                            tradeEntryId: id,
                            fieldId: fv.fieldId,
                            textValue: fv.textValue ?? null,
                            booleanValue: fv.booleanValue ?? null,
                            imageUrl: fv.imageUrl ?? null,
                        },
                    });
                }
            }

            // Update account balance
            await this.updateAccountBalance(
                prisma,
                tradeEntry.tradeAccountId,
                closeDto.result,
                closeDto.realisedProfitLoss,
                closeDto.serviceCharge || tradeEntry.serviceCharge.toNumber(),
                tradeEntry.stopLossAmount.toNumber(),
            );

            return updatedTrade;
        });
    }

    async delete(id: string, userId: string, userRole: UserRole): Promise<TradeEntry> {
        const tradeEntry = await this.prisma.tradeEntry.findUnique({
            where: { id },
            include: { tradeAccount: true },
        });

        if (!tradeEntry) {
            throw new NotFoundException('Trade entry not found');
        }

        // Check access
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this trade entry');
        }

        // If trade was closed, we need to reverse the balance change
        if (tradeEntry.status === TradeStatus.CLOSED) {
            await this.prisma.$transaction(async (prisma) => {
                // Reverse the balance change
                await this.reverseAccountBalance(
                    prisma,
                    tradeEntry.tradeAccountId,
                    tradeEntry.result!,
                    tradeEntry.realisedProfitLoss!.toNumber(),
                    tradeEntry.serviceCharge.toNumber(),
                    tradeEntry.stopLossAmount.toNumber(),
                );

                // Delete the trade entry
                await prisma.tradeEntry.delete({ where: { id } });
            });
        } else {
            await this.prisma.tradeEntry.delete({ where: { id } });
        }

        return tradeEntry;
    }

    // Admin methods
    async findAll(): Promise<TradeEntry[]> {
        return this.prisma.tradeEntry.findMany({
            include: {
                tradeAccount: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { entryDateTime: 'desc' },
        });
    }

    async getTradeStats(tradeAccountId: string, userId: string, userRole: UserRole) {
        // Verify access
        const tradeAccount = await this.prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });

        if (!tradeAccount) {
            throw new NotFoundException('Trade account not found');
        }

        if (tradeAccount.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this trade account');
        }

        const totalTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId },
        });

        const openTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, status: TradeStatus.OPEN },
        });

        const closedTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, status: TradeStatus.CLOSED },
        });

        const winningTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: TradeResult.PROFIT },
        });

        const losingTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: TradeResult.LOSS },
        });

        const breakEvenTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: TradeResult.BREAK_EVEN },
        });

        // Get all closed trades for detailed stats
        const closedTradeEntries = await this.prisma.tradeEntry.findMany({
            where: { tradeAccountId, status: TradeStatus.CLOSED },
        });

        let totalProfit = 0;
        let totalLoss = 0;
        let largestWin = 0;
        let largestLoss = 0;

        for (const trade of closedTradeEntries) {
            const pl = trade.realisedProfitLoss ? trade.realisedProfitLoss.toNumber() : 0;
            if (trade.result === TradeResult.PROFIT) {
                totalProfit += pl;
                if (pl > largestWin) largestWin = pl;
            } else if (trade.result === TradeResult.LOSS) {
                const lossAmount = trade.stopLossAmount.toNumber() + trade.serviceCharge.toNumber();
                totalLoss += lossAmount;
                if (lossAmount > largestLoss) largestLoss = lossAmount;
            }
        }

        const netProfitLoss = totalProfit - totalLoss;
        const averageWin = winningTrades > 0 ? totalProfit / winningTrades : 0;
        const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

        return {
            totalTrades,
            openTrades,
            closedTrades,
            totalProfit,
            totalLoss,
            netProfitLoss,
            winningTrades,
            losingTrades,
            breakEvenTrades,
            winRate: closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0,
            averageWin,
            averageLoss,
            profitFactor: profitFactor === Infinity ? 999.99 : profitFactor,
            largestWin,
            largestLoss,
        };
    }

    private async updateAccountBalance(
        prisma: any,
        tradeAccountId: string,
        result: TradeResult,
        realisedProfitLoss: number,
        serviceCharge: number,
        stopLossAmount: number,
    ): Promise<void> {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });

        if (!tradeAccount) {
            throw new NotFoundException('Trade account not found');
        }

        let balanceChange = 0;

        switch (result) {
            case TradeResult.PROFIT:
                // Add profit minus service charge
                balanceChange = realisedProfitLoss - serviceCharge;
                break;

            case TradeResult.LOSS:
                // Subtract stop loss and service charge
                balanceChange = -(stopLossAmount + serviceCharge);
                break;

            case TradeResult.BREAK_EVEN:
                // Only subtract service charge
                balanceChange = -serviceCharge;
                break;
        }

        const newBalance = tradeAccount.currentBalance.toNumber() + balanceChange;

        await prisma.tradeAccount.update({
            where: { id: tradeAccountId },
            data: { currentBalance: newBalance },
        });
    }

    private async reverseAccountBalance(
        prisma: any,
        tradeAccountId: string,
        result: TradeResult,
        realisedProfitLoss: number,
        serviceCharge: number,
        stopLossAmount: number,
    ): Promise<void> {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });

        if (!tradeAccount) {
            throw new NotFoundException('Trade account not found');
        }

        let balanceChange = 0;

        switch (result) {
            case TradeResult.PROFIT:
                // Reverse: Subtract profit and add back service charge
                balanceChange = -(realisedProfitLoss - serviceCharge);
                break;

            case TradeResult.LOSS:
                // Reverse: Add back stop loss and service charge
                balanceChange = stopLossAmount + serviceCharge;
                break;

            case TradeResult.BREAK_EVEN:
                // Reverse: Add back service charge
                balanceChange = serviceCharge;
                break;
        }

        const newBalance = tradeAccount.currentBalance.toNumber() + balanceChange;

        await prisma.tradeAccount.update({
            where: { id: tradeAccountId },
            data: { currentBalance: newBalance },
        });
    }
}
