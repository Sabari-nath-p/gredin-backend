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
const create_log_template_dto_1 = require("./dto/create-log-template.dto");
let LogTemplateService = class LogTemplateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    serializeFieldOptions(fieldType, fieldOptions, scorecard) {
        if (fieldType === create_log_template_dto_1.FieldType.MULTIPLE_CHOICE) {
            if (!fieldOptions || fieldOptions.length === 0) {
                return null;
            }
            return JSON.stringify(fieldOptions);
        }
        if (fieldType === create_log_template_dto_1.FieldType.SCORECARD) {
            if (!scorecard || !Array.isArray(scorecard.options) || scorecard.options.length === 0) {
                return null;
            }
            return JSON.stringify({
                ...(scorecard.weight !== undefined ? { weight: scorecard.weight } : {}),
                options: scorecard.options.map((o) => ({ label: o.label, score: o.score })),
            });
        }
        return null;
    }
    deserializeMultipleChoiceOptions(fieldOptions) {
        if (!fieldOptions) {
            return [];
        }
        try {
            const parsed = JSON.parse(fieldOptions);
            return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
        }
        catch {
            return [];
        }
    }
    deserializeScorecardConfig(fieldOptions) {
        if (!fieldOptions) {
            return null;
        }
        try {
            const parsed = JSON.parse(fieldOptions);
            if (!parsed || typeof parsed !== 'object') {
                return null;
            }
            const weight = parsed.weight;
            const options = parsed.options;
            if (!Array.isArray(options)) {
                return null;
            }
            const cleanedOptions = options
                .filter((o) => o && typeof o === 'object')
                .map((o) => ({ label: o.label, score: o.score }))
                .filter((o) => typeof o.label === 'string' && o.label.trim().length > 0)
                .map((o) => ({ label: o.label.trim(), score: Number(o.score) }))
                .filter((o) => Number.isFinite(o.score) && o.score >= 0 && o.score <= 100);
            if (cleanedOptions.length === 0) {
                return null;
            }
            const cfg = { options: cleanedOptions };
            if (weight !== undefined && weight !== null && Number.isFinite(Number(weight))) {
                cfg.weight = Number(weight);
            }
            return cfg;
        }
        catch {
            return null;
        }
    }
    validateScorecardFields(fields) {
        const scorecardFields = (fields || []).filter((f) => f.fieldType === create_log_template_dto_1.FieldType.SCORECARD);
        if (scorecardFields.length === 0) {
            return;
        }
        for (const f of scorecardFields) {
            if (!f.scorecard || !Array.isArray(f.scorecard.options) || f.scorecard.options.length < 2) {
                throw new common_1.BadRequestException('Scorecard questions must include at least 2 answer options');
            }
            const seen = new Set();
            for (const opt of f.scorecard.options) {
                const label = (opt?.label || '').trim();
                const score = Number(opt?.score);
                if (!label) {
                    throw new common_1.BadRequestException('Scorecard option labels cannot be empty');
                }
                if (seen.has(label.toLowerCase())) {
                    throw new common_1.BadRequestException(`Duplicate scorecard option label: ${label}`);
                }
                seen.add(label.toLowerCase());
                if (!Number.isFinite(score) || score < 0 || score > 100) {
                    throw new common_1.BadRequestException('Scorecard option scores must be between 0 and 100');
                }
            }
            if (f.scorecard.weight !== undefined) {
                const w = Number(f.scorecard.weight);
                if (!Number.isFinite(w) || w < 0 || w > 100) {
                    throw new common_1.BadRequestException('Scorecard question weight must be between 0 and 100');
                }
            }
        }
        const weights = scorecardFields.map((f) => f.scorecard?.weight);
        const definedWeights = weights.filter((w) => w !== undefined && w !== null);
        const definedCount = definedWeights.length;
        if (definedCount !== 0 && definedCount !== scorecardFields.length) {
            throw new common_1.BadRequestException('Either set weights for all scorecard questions or leave all weights empty');
        }
        if (definedCount === scorecardFields.length) {
            const sum = definedWeights.reduce((acc, w) => acc + w, 0);
            const roundedSum = Math.round((sum + Number.EPSILON) * 100) / 100;
            if (roundedSum !== 100) {
                throw new common_1.BadRequestException('Scorecard question weights must total exactly 100%');
            }
        }
    }
    mapTemplate(template) {
        if (!template) {
            return template;
        }
        return {
            ...template,
            fields: (template.fields || []).map((field) => {
                const base = {
                    ...field,
                    fieldOptions: [],
                };
                if (field.fieldType === create_log_template_dto_1.FieldType.MULTIPLE_CHOICE) {
                    return {
                        ...base,
                        fieldOptions: this.deserializeMultipleChoiceOptions(field.fieldOptions),
                    };
                }
                if (field.fieldType === create_log_template_dto_1.FieldType.SCORECARD) {
                    return {
                        ...base,
                        scorecard: this.deserializeScorecardConfig(field.fieldOptions),
                    };
                }
                return base;
            }),
        };
    }
    async create(userId, dto) {
        this.validateScorecardFields(dto.fields);
        const template = await this.prisma.logTemplate.create({
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
                        fieldOptions: this.serializeFieldOptions(f.fieldType, f.fieldOptions, f.scorecard),
                    })),
                },
            },
            include: { fields: { orderBy: { fieldOrder: 'asc' } } },
        });
        return this.mapTemplate(template);
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
            data: data.map((template) => this.mapTemplate(template)),
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
        return this.mapTemplate(template);
    }
    async update(id, userId, userRole, dto) {
        const template = await this.prisma.logTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('You do not have access to this template');
        }
        if (dto.fields) {
            this.validateScorecardFields(dto.fields);
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
                                fieldOptions: this.serializeFieldOptions(f.fieldType, f.fieldOptions, f.scorecard),
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
                                fieldOptions: this.serializeFieldOptions(f.fieldType, f.fieldOptions, f.scorecard),
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
        return this.mapTemplate(account.logTemplate);
    }
};
exports.LogTemplateService = LogTemplateService;
exports.LogTemplateService = LogTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogTemplateService);
//# sourceMappingURL=log-template.service.js.map