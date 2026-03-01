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
exports.LogTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LogTemplateService = class LogTemplateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.logTemplate.create({
            data: {
                userId,
                name: dto.name,
                description: dto.description,
                fields: {
                    create: dto.fields.map((f) => ({
                        fieldName: f.fieldName,
                        fieldType: f.fieldType,
                        fieldOrder: f.fieldOrder,
                        placeholder: f.placeholder,
                        defaultValue: f.defaultValue,
                    })),
                },
            },
            include: { fields: { orderBy: { fieldOrder: 'asc' } } },
        });
    }
    async findAllByUser(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.logTemplate.findMany({
                where: { userId },
                include: { fields: { orderBy: { fieldOrder: 'asc' } }, _count: { select: { accounts: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.logTemplate.count({ where: { userId } }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, userId, userRole) {
        const template = await this.prisma.logTemplate.findUnique({
            where: { id },
            include: {
                fields: { orderBy: { fieldOrder: 'asc' } },
                accounts: { select: { id: true, accountName: true } },
            },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this template');
        }
        return template;
    }
    async update(id, userId, userRole, dto) {
        const template = await this.prisma.logTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this template');
        }
        if (dto.fields) {
            await this.prisma.$transaction(async (tx) => {
                const existingIds = dto.fields
                    .filter((f) => f.id)
                    .map((f) => f.id);
                await tx.logTemplateField.deleteMany({
                    where: {
                        templateId: id,
                        ...(existingIds.length > 0
                            ? { id: { notIn: existingIds } }
                            : {}),
                    },
                });
                for (const f of dto.fields) {
                    if (f.id) {
                        await tx.logTemplateField.update({
                            where: { id: f.id },
                            data: {
                                fieldName: f.fieldName,
                                fieldType: f.fieldType,
                                fieldOrder: f.fieldOrder,
                                placeholder: f.placeholder,
                                defaultValue: f.defaultValue,
                            },
                        });
                    }
                    else {
                        await tx.logTemplateField.create({
                            data: {
                                templateId: id,
                                fieldName: f.fieldName,
                                fieldType: f.fieldType,
                                fieldOrder: f.fieldOrder ?? 0,
                                placeholder: f.placeholder,
                                defaultValue: f.defaultValue,
                            },
                        });
                    }
                }
                await tx.logTemplate.update({
                    where: { id },
                    data: {
                        ...(dto.name !== undefined && { name: dto.name }),
                        ...(dto.description !== undefined && { description: dto.description }),
                        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    },
                });
            });
        }
        else {
            await this.prisma.logTemplate.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.description !== undefined && { description: dto.description }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                },
            });
        }
        return this.findOne(id, userId, userRole);
    }
    async delete(id, userId, userRole) {
        const template = await this.prisma.logTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this template');
        }
        await this.prisma.tradeAccount.updateMany({
            where: { logTemplateId: id },
            data: { logTemplateId: null },
        });
        return this.prisma.logTemplate.delete({ where: { id } });
    }
    async assignToAccount(templateId, accountId, userId, userRole) {
        const template = await this.prisma.logTemplate.findUnique({ where: { id: templateId } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Not your template');
        }
        const account = await this.prisma.tradeAccount.findUnique({ where: { id: accountId } });
        if (!account)
            throw new common_1.NotFoundException('Trade account not found');
        if (account.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Not your account');
        }
        return this.prisma.tradeAccount.update({
            where: { id: accountId },
            data: { logTemplateId: templateId },
        });
    }
    async unassignFromAccount(accountId, userId, userRole) {
        const account = await this.prisma.tradeAccount.findUnique({ where: { id: accountId } });
        if (!account)
            throw new common_1.NotFoundException('Trade account not found');
        if (account.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Not your account');
        }
        return this.prisma.tradeAccount.update({
            where: { id: accountId },
            data: { logTemplateId: null },
        });
    }
    async getTemplateForAccount(accountId, userId, userRole) {
        const account = await this.prisma.tradeAccount.findUnique({
            where: { id: accountId },
            include: {
                logTemplate: {
                    include: { fields: { orderBy: { fieldOrder: 'asc' } } },
                },
            },
        });
        if (!account)
            throw new common_1.NotFoundException('Trade account not found');
        if (account.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Not your account');
        }
        return account.logTemplate;
    }
};
exports.LogTemplateService = LogTemplateService;
exports.LogTemplateService = LogTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogTemplateService);
//# sourceMappingURL=log-template.service.js.map