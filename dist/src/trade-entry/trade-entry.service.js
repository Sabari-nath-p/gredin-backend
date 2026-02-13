"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeEntryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_trade_entry_dto_1 = require("./dto/create-trade-entry.dto");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
let TradeEntryService = class TradeEntryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDto) {
        const tradeAccount = await this.prisma.tradeAccount.findFirst({
            where: {
                id: createDto.tradeAccountId,
                userId,
            },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found or does not belong to you');
        }
        if (!tradeAccount.isActive) {
            throw new common_1.BadRequestException('Trade account is inactive');
        }
        const status = createDto.status || create_trade_entry_dto_1.TradeStatus.OPEN;
        if (status === create_trade_entry_dto_1.TradeStatus.CLOSED) {
            if (!createDto.result) {
                throw new common_1.BadRequestException('Result is required when creating a closed trade');
            }
            if (createDto.realisedProfitLoss === undefined || createDto.realisedProfitLoss === null) {
                throw new common_1.BadRequestException('Realised profit/loss is required when creating a closed trade');
            }
        }
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
            if (status === create_trade_entry_dto_1.TradeStatus.CLOSED) {
                await this.updateAccountBalance(prisma, createDto.tradeAccountId, createDto.result, createDto.realisedProfitLoss, createDto.serviceCharge || 0, createDto.stopLossAmount);
            }
            return tradeEntry;
        });
    }
    async findAllByAccount(tradeAccountId, userId, userRole) {
        const tradeAccount = await this.prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        if (tradeAccount.userId !== userId && userRole !== client_2.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this trade account');
        }
        return this.prisma.tradeEntry.findMany({
            where: { tradeAccountId },
            orderBy: { entryDateTime: 'desc' },
        });
    }
    async findOne(id, userId, userRole) {
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
            },
        });
        if (!tradeEntry) {
            throw new common_1.NotFoundException('Trade entry not found');
        }
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== client_2.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this trade entry');
        }
        return tradeEntry;
    }
    async update(id, userId, userRole, updateDto) {
        const tradeEntry = await this.prisma.tradeEntry.findUnique({
            where: { id },
            include: { tradeAccount: true },
        });
        if (!tradeEntry) {
            throw new common_1.NotFoundException('Trade entry not found');
        }
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== client_2.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this trade entry');
        }
        if (tradeEntry.status === create_trade_entry_dto_1.TradeStatus.CLOSED) {
            throw new common_1.BadRequestException('Cannot update a closed trade');
        }
        return this.prisma.tradeEntry.update({
            where: { id },
            data: updateDto,
        });
    }
    async closeTrade(id, userId, userRole, closeDto) {
        const tradeEntry = await this.prisma.tradeEntry.findUnique({
            where: { id },
            include: { tradeAccount: true },
        });
        if (!tradeEntry) {
            throw new common_1.NotFoundException('Trade entry not found');
        }
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== client_2.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this trade entry');
        }
        if (tradeEntry.status === create_trade_entry_dto_1.TradeStatus.CLOSED) {
            throw new common_1.BadRequestException('Trade is already closed');
        }
        return await this.prisma.$transaction(async (prisma) => {
            const updatedTrade = await prisma.tradeEntry.update({
                where: { id },
                data: {
                    status: create_trade_entry_dto_1.TradeStatus.CLOSED,
                    result: closeDto.result,
                    realisedProfitLoss: closeDto.realisedProfitLoss,
                    serviceCharge: closeDto.serviceCharge || tradeEntry.serviceCharge,
                    notes: closeDto.notes || tradeEntry.notes,
                },
            });
            await this.updateAccountBalance(prisma, tradeEntry.tradeAccountId, closeDto.result, closeDto.realisedProfitLoss, closeDto.serviceCharge || tradeEntry.serviceCharge.toNumber(), tradeEntry.stopLossAmount.toNumber());
            return updatedTrade;
        });
    }
    async delete(id, userId, userRole) {
        const tradeEntry = await this.prisma.tradeEntry.findUnique({
            where: { id },
            include: { tradeAccount: true },
        });
        if (!tradeEntry) {
            throw new common_1.NotFoundException('Trade entry not found');
        }
        if (tradeEntry.tradeAccount.userId !== userId && userRole !== client_2.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this trade entry');
        }
        if (tradeEntry.status === create_trade_entry_dto_1.TradeStatus.CLOSED) {
            await this.prisma.$transaction(async (prisma) => {
                await this.reverseAccountBalance(prisma, tradeEntry.tradeAccountId, tradeEntry.result, tradeEntry.realisedProfitLoss.toNumber(), tradeEntry.serviceCharge.toNumber(), tradeEntry.stopLossAmount.toNumber());
                await prisma.tradeEntry.delete({ where: { id } });
            });
        }
        else {
            await this.prisma.tradeEntry.delete({ where: { id } });
        }
        return tradeEntry;
    }
    async findAll() {
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
    async getTradeStats(tradeAccountId, userId, userRole) {
        const tradeAccount = await this.prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        if (tradeAccount.userId !== userId && userRole !== client_2.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this trade account');
        }
        const totalTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId },
        });
        const openTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, status: create_trade_entry_dto_1.TradeStatus.OPEN },
        });
        const closedTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, status: create_trade_entry_dto_1.TradeStatus.CLOSED },
        });
        const profitTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: client_1.TradeResult.PROFIT },
        });
        const lossTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: client_1.TradeResult.LOSS },
        });
        const breakEvenTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: client_1.TradeResult.BREAK_EVEN },
        });
        return {
            totalTrades,
            openTrades,
            closedTrades,
            profitTrades,
            lossTrades,
            breakEvenTrades,
            winRate: closedTrades > 0 ? (profitTrades / closedTrades) * 100 : 0,
        };
    }
    async updateAccountBalance(prisma, tradeAccountId, result, realisedProfitLoss, serviceCharge, stopLossAmount) {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        let balanceChange = 0;
        switch (result) {
            case client_1.TradeResult.PROFIT:
                balanceChange = realisedProfitLoss - serviceCharge;
                break;
            case client_1.TradeResult.LOSS:
                balanceChange = -(stopLossAmount + serviceCharge);
                break;
            case client_1.TradeResult.BREAK_EVEN:
                balanceChange = -serviceCharge;
                break;
        }
        const newBalance = tradeAccount.currentBalance.toNumber() + balanceChange;
        await prisma.tradeAccount.update({
            where: { id: tradeAccountId },
            data: { currentBalance: newBalance },
        });
    }
    async reverseAccountBalance(prisma, tradeAccountId, result, realisedProfitLoss, serviceCharge, stopLossAmount) {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        let balanceChange = 0;
        switch (result) {
            case client_1.TradeResult.PROFIT:
                balanceChange = -(realisedProfitLoss - serviceCharge);
                break;
            case client_1.TradeResult.LOSS:
                balanceChange = stopLossAmount + serviceCharge;
                break;
            case client_1.TradeResult.BREAK_EVEN:
                balanceChange = serviceCharge;
                break;
        }
        const newBalance = tradeAccount.currentBalance.toNumber() + balanceChange;
        await prisma.tradeAccount.update({
            where: { id: tradeAccountId },
            data: { currentBalance: newBalance },
        });
    }
};
exports.TradeEntryService = TradeEntryService;
exports.TradeEntryService = TradeEntryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TradeEntryService);
//# sourceMappingURL=trade-entry.service.js.map