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

    private normalizeRealisedProfitLoss(result: TradeResult, realisedProfitLoss: number): number {
        if (result === TradeResult.BREAK_EVEN) {
            return 0;
        }

        return Math.abs(realisedProfitLoss);
    }

    private getBalanceChange(
        result: TradeResult,
        realisedProfitLoss: number,
        serviceCharge: number,
    ): number {
        const normalizedProfitLoss = this.normalizeRealisedProfitLoss(result, realisedProfitLoss);

        switch (result) {
            case TradeResult.PROFIT:
                return normalizedProfitLoss - serviceCharge;
            case TradeResult.LOSS:
                return -(normalizedProfitLoss + serviceCharge);
            case TradeResult.BREAK_EVEN:
                return -serviceCharge;
        }
    }

    async create(userId: string, createDto: CreateTradeEntryDto): Promise<TradeEntry> {
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

        if (status === TradeStatus.CLOSED) {
            if (!createDto.result) {
                throw new BadRequestException('Result is required when creating a closed trade');
            }

            if (createDto.realisedProfitLoss === undefined || createDto.realisedProfitLoss === null) {
                throw new BadRequestException('Realised profit/loss is required when creating a closed trade');
            }
        }

        return await this.prisma.$transaction(async (prisma) => {
            const normalizedRealisedProfitLoss =
                status === TradeStatus.CLOSED && createDto.result
                    ? this.normalizeRealisedProfitLoss(createDto.result, createDto.realisedProfitLoss!)
                    : createDto.realisedProfitLoss;

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
                    realisedProfitLoss: normalizedRealisedProfitLoss,
                    serviceCharge: createDto.serviceCharge || 0,
                    notes: createDto.notes,
                },
            });

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

            if (status === TradeStatus.CLOSED) {
                await this.updateAccountBalance(
                    prisma,
                    createDto.tradeAccountId,
                    createDto.result!,
                    normalizedRealisedProfitLoss!,
                    createDto.serviceCharge || 0,
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

        const { fieldValues, ...entryUpdateData } = updateDto as UpdateTradeEntryDto & {
            fieldValues?: { fieldId: string; textValue?: string; booleanValue?: boolean; imageUrl?: string }[];
        };

        const hasCoreTradeChanges = [
            entryUpdateData.entryDateTime,
            entryUpdateData.instrument,
            entryUpdateData.entryPrice,
            entryUpdateData.positionSize,
            entryUpdateData.stopLossAmount,
            entryUpdateData.takeProfitAmount,
        ].some((value) => value !== undefined);

        if (tradeEntry.status === TradeStatus.CLOSED && hasCoreTradeChanges) {
            throw new BadRequestException('Cannot update core trade details after the trade is closed');
        }

        return this.prisma.$transaction(async (prisma) => {
            const updatedTrade = await prisma.tradeEntry.update({
                where: { id },
                data: {
                    ...entryUpdateData,
                    ...(entryUpdateData.entryDateTime
                        ? { entryDateTime: new Date(entryUpdateData.entryDateTime) }
                        : {}),
                },
            });

            if (fieldValues && fieldValues.length > 0) {
                for (const fieldValue of fieldValues) {
                    await prisma.tradeFieldValue.upsert({
                        where: {
                            tradeEntryId_fieldId: {
                                tradeEntryId: id,
                                fieldId: fieldValue.fieldId,
                            },
                        },
                        update: {
                            textValue: fieldValue.textValue ?? null,
                            booleanValue: fieldValue.booleanValue ?? null,
                            imageUrl: fieldValue.imageUrl ?? null,
                        },
                        create: {
                            tradeEntryId: id,
                            fieldId: fieldValue.fieldId,
                            textValue: fieldValue.textValue ?? null,
                            booleanValue: fieldValue.booleanValue ?? null,
                            imageUrl: fieldValue.imageUrl ?? null,
                        },
                    });
                }
            }

            return prisma.tradeEntry.findUniqueOrThrow({
                where: { id: updatedTrade.id },
                include: {
                    fieldValues: {
                        include: {
                            field: true,
                        },
                    },
                },
            });
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
            const normalizedRealisedProfitLoss = this.normalizeRealisedProfitLoss(
                closeDto.result,
                closeDto.realisedProfitLoss,
            );

            // Update trade entry
            const updatedTrade = await prisma.tradeEntry.update({
                where: { id },
                data: {
                    status: TradeStatus.CLOSED,
                    result: closeDto.result,
                    realisedProfitLoss: normalizedRealisedProfitLoss,
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
                normalizedRealisedProfitLoss,
                closeDto.serviceCharge || tradeEntry.serviceCharge.toNumber(),
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
            const pl = trade.realisedProfitLoss ? Math.abs(trade.realisedProfitLoss.toNumber()) : 0;
            if (trade.result === TradeResult.PROFIT) {
                totalProfit += pl;
                if (pl > largestWin) largestWin = pl;
            } else if (trade.result === TradeResult.LOSS) {
                const lossAmount = pl + trade.serviceCharge.toNumber();
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
    ): Promise<void> {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });

        if (!tradeAccount) {
            throw new NotFoundException('Trade account not found');
        }

        const balanceChange = this.getBalanceChange(result, realisedProfitLoss, serviceCharge);

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
    ): Promise<void> {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });

        if (!tradeAccount) {
            throw new NotFoundException('Trade account not found');
        }

        const balanceChange = -this.getBalanceChange(result, realisedProfitLoss, serviceCharge);

        const newBalance = tradeAccount.currentBalance.toNumber() + balanceChange;

        await prisma.tradeAccount.update({
            where: { id: tradeAccountId },
            data: { currentBalance: newBalance },
        });
    }
}
