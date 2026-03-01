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
exports.TradeAccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TradeAccountService = class TradeAccountService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDto) {
        return this.prisma.tradeAccount.create({
            data: {
                userId,
                accountName: createDto.accountName,
                brokerName: createDto.brokerName,
                marketSegment: createDto.marketSegment,
                currencyCode: createDto.currencyCode || 'USD',
                initialBalance: createDto.initialBalance,
                currentBalance: createDto.initialBalance,
                accountType: createDto.accountType,
            },
        });
    }
    async findAllByUser(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.tradeAccount.findMany({
                where: { userId },
                include: {
                    logTemplate: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.tradeAccount.count({ where: { userId } }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, userId, userRole) {
        const account = await this.prisma.tradeAccount.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                logTemplate: {
                    include: { fields: { orderBy: { fieldOrder: 'asc' } } },
                },
            },
        });
        if (!account) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        if (account.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this account');
        }
        return account;
    }
    async update(id, userId, userRole, updateDto) {
        const account = await this.prisma.tradeAccount.findUnique({
            where: { id },
        });
        if (!account) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        if (account.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this account');
        }
        return this.prisma.tradeAccount.update({
            where: { id },
            data: updateDto,
        });
    }
    async delete(id, userId, userRole) {
        const account = await this.prisma.tradeAccount.findUnique({
            where: { id },
        });
        if (!account) {
            throw new common_1.NotFoundException('Trade account not found');
        }
        if (account.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this account');
        }
        return this.prisma.tradeAccount.delete({
            where: { id },
        });
    }
    async findAll() {
        return this.prisma.tradeAccount.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAccountStats() {
        const totalAccounts = await this.prisma.tradeAccount.count();
        const activeAccounts = await this.prisma.tradeAccount.count({
            where: { isActive: true },
        });
        const accountsByType = await this.prisma.tradeAccount.groupBy({
            by: ['accountType'],
            _count: true,
        });
        const accountsBySegment = await this.prisma.tradeAccount.groupBy({
            by: ['marketSegment'],
            _count: true,
        });
        return {
            totalAccounts,
            activeAccounts,
            inactiveAccounts: totalAccounts - activeAccounts,
            accountsByType,
            accountsBySegment,
        };
    }
};
exports.TradeAccountService = TradeAccountService;
exports.TradeAccountService = TradeAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TradeAccountService);
//# sourceMappingURL=trade-account.service.js.map