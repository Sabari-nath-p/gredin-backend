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
    round2(value) {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }
    parseScorecardConfig(fieldOptions) {
        if (!fieldOptions) {
            return null;
        }
        try {
            const parsed = JSON.parse(fieldOptions);
            if (!parsed || typeof parsed !== 'object') {
                return null;
            }
            const optionsRaw = parsed.options;
            if (!Array.isArray(optionsRaw) || optionsRaw.length === 0) {
                return null;
            }
            const options = optionsRaw
                .filter((o) => o && typeof o === 'object')
                .map((o) => ({ label: String(o.label ?? '').trim(), score: Number(o.score) }))
                .filter((o) => o.label.length > 0 && Number.isFinite(o.score) && o.score >= 0 && o.score <= 100);
            if (options.length === 0) {
                return null;
            }
            const weightRaw = parsed.weight;
            const cfg = { options };
            if (weightRaw !== undefined && weightRaw !== null && Number.isFinite(Number(weightRaw))) {
                cfg.weight = Number(weightRaw);
            }
            return cfg;
        }
        catch {
            return null;
        }
    }
    computeScorecardWeights(scorecardFields) {
        if (scorecardFields.length === 0) {
            return {};
        }
        const weights = scorecardFields.map((f) => f.config.weight);
        const definedWeights = weights.filter((w) => w !== undefined && w !== null);
        const definedCount = definedWeights.length;
        if (definedCount !== 0 && definedCount !== scorecardFields.length) {
            throw new common_1.BadRequestException('Either set weights for all scorecard questions or leave all weights empty');
        }
        if (definedCount === scorecardFields.length) {
            const sum = definedWeights.reduce((acc, w) => acc + w, 0);
            const roundedSum = this.round2(sum);
            if (roundedSum !== 100) {
                throw new common_1.BadRequestException('Scorecard question weights must total exactly 100%');
            }
            return Object.fromEntries(scorecardFields.map((f) => [f.id, this.round2(f.config.weight)]));
        }
        const n = scorecardFields.length;
        const base = Math.floor((100 / n) * 100) / 100;
        const result = {};
        let running = 0;
        for (let i = 0; i < n; i++) {
            const id = scorecardFields[i].id;
            if (i === n - 1) {
                result[id] = this.round2(100 - running);
            }
            else {
                result[id] = base;
                running = this.round2(running + base);
            }
        }
        return result;
    }
    findIncomingTextValue(incoming, fieldId) {
        const item = incoming.find((fv) => fv.fieldId === fieldId);
        const text = (item?.textValue ?? '').trim();
        return text.length > 0 ? text : null;
    }
    matchScorecardOption(options, selected) {
        const wanted = selected.trim().toLowerCase();
        return options.find((o) => o.label.trim().toLowerCase() === wanted) ?? null;
    }
    async buildScorecardWrites(prisma, tradeAccountId, tradeEntryId, incomingFieldValues) {
        const account = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
            select: {
                logTemplate: {
                    select: {
                        fields: {
                            select: { id: true, fieldType: true, fieldOptions: true },
                            orderBy: { fieldOrder: 'asc' },
                        },
                    },
                },
            },
        });
        const fields = account?.logTemplate?.fields ?? [];
        const scorecardFields = fields
            .filter((f) => f.fieldType === 'SCORECARD')
            .map((f) => ({
            id: f.id,
            config: this.parseScorecardConfig(f.fieldOptions),
        }))
            .filter((f) => f.config && Array.isArray(f.config.options) && f.config.options.length > 0);
        if (scorecardFields.length === 0) {
            return { scorecardFieldIds: new Set(), writes: [], tradeScore: null };
        }
        const weightById = this.computeScorecardWeights(scorecardFields);
        const writes = [];
        let total = 0;
        for (const f of scorecardFields) {
            const weight = weightById[f.id];
            const selected = this.findIncomingTextValue(incomingFieldValues, f.id);
            if (!selected) {
                writes.push({
                    fieldId: f.id,
                    textValue: null,
                    selectedOption: null,
                    selectedScore: 0,
                    questionWeight: weight,
                    contribution: 0,
                });
                continue;
            }
            const option = this.matchScorecardOption(f.config.options, selected);
            if (!option) {
                throw new common_1.BadRequestException('Invalid scorecard selection');
            }
            const contribution = this.round2((option.score / 100) * weight);
            total = this.round2(total + contribution);
            writes.push({
                fieldId: f.id,
                textValue: option.label,
                selectedOption: option.label,
                selectedScore: Math.round(option.score),
                questionWeight: weight,
                contribution,
            });
        }
        const scorecardFieldIds = new Set(scorecardFields.map((f) => f.id));
        return { scorecardFieldIds, writes, tradeScore: this.round2(total) };
    }
    normalizeRealisedProfitLoss(result, realisedProfitLoss) {
        if (result === client_1.TradeResult.BREAK_EVEN) {
            return 0;
        }
        return Math.abs(realisedProfitLoss);
    }
    getBalanceChange(result, realisedProfitLoss, serviceCharge) {
        const normalizedProfitLoss = this.normalizeRealisedProfitLoss(result, realisedProfitLoss);
        switch (result) {
            case client_1.TradeResult.PROFIT:
                return normalizedProfitLoss - serviceCharge;
            case client_1.TradeResult.LOSS:
                return -(normalizedProfitLoss + serviceCharge);
            case client_1.TradeResult.BREAK_EVEN:
                return -serviceCharge;
        }
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
            const normalizedRealisedProfitLoss = status === create_trade_entry_dto_1.TradeStatus.CLOSED && createDto.result
                ? this.normalizeRealisedProfitLoss(createDto.result, createDto.realisedProfitLoss)
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
            const incomingFieldValues = createDto.fieldValues ?? [];
            const scorecard = await this.buildScorecardWrites(prisma, createDto.tradeAccountId, tradeEntry.id, incomingFieldValues.map((fv) => ({ fieldId: fv.fieldId, textValue: fv.textValue })));
            if (incomingFieldValues.length > 0) {
                for (const fv of incomingFieldValues) {
                    if (scorecard.scorecardFieldIds.has(fv.fieldId)) {
                        continue;
                    }
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
            if (scorecard.writes.length > 0) {
                for (const w of scorecard.writes) {
                    await prisma.tradeFieldValue.create({
                        data: {
                            tradeEntryId: tradeEntry.id,
                            fieldId: w.fieldId,
                            textValue: w.textValue,
                            selectedOption: w.selectedOption,
                            selectedScore: w.selectedScore,
                            questionWeight: w.questionWeight,
                            contribution: w.contribution,
                        },
                    });
                }
                await prisma.tradeEntry.update({
                    where: { id: tradeEntry.id },
                    data: { tradeScore: scorecard.tradeScore },
                });
            }
            if (status === create_trade_entry_dto_1.TradeStatus.CLOSED) {
                await this.updateAccountBalance(prisma, createDto.tradeAccountId, createDto.result, normalizedRealisedProfitLoss, createDto.serviceCharge || 0);
            }
            return prisma.tradeEntry.findUniqueOrThrow({
                where: { id: tradeEntry.id },
            });
        });
    }
    async findAllByAccount(tradeAccountId, userId, userRole, page = 1, limit = 20) {
        const tradeAccount = await this.prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        if (tradeAccount.userId !== userId && userRole !== client_2.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this trade account');
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
                fieldValues: {
                    include: {
                        field: true,
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
        const { fieldValues, ...entryUpdateData } = updateDto;
        const hasCoreTradeChanges = [
            entryUpdateData.entryDateTime,
            entryUpdateData.instrument,
            entryUpdateData.entryPrice,
            entryUpdateData.positionSize,
            entryUpdateData.stopLossAmount,
            entryUpdateData.takeProfitAmount,
        ].some((value) => value !== undefined);
        if (tradeEntry.status === create_trade_entry_dto_1.TradeStatus.CLOSED && hasCoreTradeChanges) {
            throw new common_1.BadRequestException('Cannot update core trade details after the trade is closed');
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
            const incomingFieldValues = fieldValues ?? [];
            const scorecard = await this.buildScorecardWrites(prisma, tradeEntry.tradeAccountId, id, incomingFieldValues.map((fv) => ({ fieldId: fv.fieldId, textValue: fv.textValue })));
            if (incomingFieldValues.length > 0) {
                for (const fieldValue of incomingFieldValues) {
                    if (scorecard.scorecardFieldIds.has(fieldValue.fieldId)) {
                        continue;
                    }
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
            if (scorecard.writes.length > 0) {
                for (const w of scorecard.writes) {
                    await prisma.tradeFieldValue.upsert({
                        where: {
                            tradeEntryId_fieldId: {
                                tradeEntryId: id,
                                fieldId: w.fieldId,
                            },
                        },
                        update: {
                            textValue: w.textValue,
                            selectedOption: w.selectedOption,
                            selectedScore: w.selectedScore,
                            questionWeight: w.questionWeight,
                            contribution: w.contribution,
                        },
                        create: {
                            tradeEntryId: id,
                            fieldId: w.fieldId,
                            textValue: w.textValue,
                            selectedOption: w.selectedOption,
                            selectedScore: w.selectedScore,
                            questionWeight: w.questionWeight,
                            contribution: w.contribution,
                        },
                    });
                }
                await prisma.tradeEntry.update({
                    where: { id },
                    data: { tradeScore: scorecard.tradeScore },
                });
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
            const normalizedRealisedProfitLoss = this.normalizeRealisedProfitLoss(closeDto.result, closeDto.realisedProfitLoss);
            const updatedTrade = await prisma.tradeEntry.update({
                where: { id },
                data: {
                    status: create_trade_entry_dto_1.TradeStatus.CLOSED,
                    result: closeDto.result,
                    realisedProfitLoss: normalizedRealisedProfitLoss,
                    serviceCharge: closeDto.serviceCharge || tradeEntry.serviceCharge,
                    notes: closeDto.notes || tradeEntry.notes,
                },
            });
            const incomingFieldValues = closeDto.fieldValues ?? [];
            const scorecard = await this.buildScorecardWrites(prisma, tradeEntry.tradeAccountId, id, incomingFieldValues.map((fv) => ({ fieldId: fv.fieldId, textValue: fv.textValue })));
            if (incomingFieldValues.length > 0) {
                for (const fv of incomingFieldValues) {
                    if (scorecard.scorecardFieldIds.has(fv.fieldId)) {
                        continue;
                    }
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
            if (scorecard.writes.length > 0) {
                for (const w of scorecard.writes) {
                    await prisma.tradeFieldValue.upsert({
                        where: {
                            tradeEntryId_fieldId: {
                                tradeEntryId: id,
                                fieldId: w.fieldId,
                            },
                        },
                        update: {
                            textValue: w.textValue,
                            selectedOption: w.selectedOption,
                            selectedScore: w.selectedScore,
                            questionWeight: w.questionWeight,
                            contribution: w.contribution,
                        },
                        create: {
                            tradeEntryId: id,
                            fieldId: w.fieldId,
                            textValue: w.textValue,
                            selectedOption: w.selectedOption,
                            selectedScore: w.selectedScore,
                            questionWeight: w.questionWeight,
                            contribution: w.contribution,
                        },
                    });
                }
                await prisma.tradeEntry.update({
                    where: { id },
                    data: { tradeScore: scorecard.tradeScore },
                });
            }
            await this.updateAccountBalance(prisma, tradeEntry.tradeAccountId, closeDto.result, normalizedRealisedProfitLoss, closeDto.serviceCharge || tradeEntry.serviceCharge.toNumber());
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
                await this.reverseAccountBalance(prisma, tradeEntry.tradeAccountId, tradeEntry.result, tradeEntry.realisedProfitLoss.toNumber(), tradeEntry.serviceCharge.toNumber());
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
        const winningTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: client_1.TradeResult.PROFIT },
        });
        const losingTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: client_1.TradeResult.LOSS },
        });
        const breakEvenTrades = await this.prisma.tradeEntry.count({
            where: { tradeAccountId, result: client_1.TradeResult.BREAK_EVEN },
        });
        const closedTradeEntries = await this.prisma.tradeEntry.findMany({
            where: { tradeAccountId, status: create_trade_entry_dto_1.TradeStatus.CLOSED },
        });
        let totalProfit = 0;
        let totalLoss = 0;
        let largestWin = 0;
        let largestLoss = 0;
        for (const trade of closedTradeEntries) {
            const pl = trade.realisedProfitLoss ? Math.abs(trade.realisedProfitLoss.toNumber()) : 0;
            if (trade.result === client_1.TradeResult.PROFIT) {
                totalProfit += pl;
                if (pl > largestWin)
                    largestWin = pl;
            }
            else if (trade.result === client_1.TradeResult.LOSS) {
                const lossAmount = pl + trade.serviceCharge.toNumber();
                totalLoss += lossAmount;
                if (lossAmount > largestLoss)
                    largestLoss = lossAmount;
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
    async updateAccountBalance(prisma, tradeAccountId, result, realisedProfitLoss, serviceCharge) {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        const balanceChange = this.getBalanceChange(result, realisedProfitLoss, serviceCharge);
        const newBalance = tradeAccount.currentBalance.toNumber() + balanceChange;
        await prisma.tradeAccount.update({
            where: { id: tradeAccountId },
            data: { currentBalance: newBalance },
        });
    }
    async reverseAccountBalance(prisma, tradeAccountId, result, realisedProfitLoss, serviceCharge) {
        const tradeAccount = await prisma.tradeAccount.findUnique({
            where: { id: tradeAccountId },
        });
        if (!tradeAccount) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        const balanceChange = -this.getBalanceChange(result, realisedProfitLoss, serviceCharge);
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