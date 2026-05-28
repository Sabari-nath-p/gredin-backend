import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
import { UserRole } from '@prisma/client';
import { FieldType, ScorecardConfigDto } from './dto/create-log-template.dto';

@Injectable()
export class LogTemplateService {
    constructor(private prisma: PrismaService) {}

    private serializeFieldOptions(fieldType: FieldType, fieldOptions?: string[], scorecard?: ScorecardConfigDto) {
        if (fieldType === FieldType.MULTIPLE_CHOICE) {
            if (!fieldOptions || fieldOptions.length === 0) {
                return null;
            }

            return JSON.stringify(fieldOptions);
        }

        if (fieldType === FieldType.SCORECARD) {
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

    private deserializeMultipleChoiceOptions(fieldOptions?: string | null): string[] {
        if (!fieldOptions) {
            return [];
        }

        try {
            const parsed = JSON.parse(fieldOptions);
            return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
        } catch {
            return [];
        }
    }

    private deserializeScorecardConfig(fieldOptions?: string | null): ScorecardConfigDto | null {
        if (!fieldOptions) {
            return null;
        }

        try {
            const parsed = JSON.parse(fieldOptions);
            if (!parsed || typeof parsed !== 'object') {
                return null;
            }

            const weight = (parsed as any).weight;
            const options = (parsed as any).options;

            if (!Array.isArray(options)) {
                return null;
            }

            const cleanedOptions = options
                .filter((o: any) => o && typeof o === 'object')
                .map((o: any) => ({ label: o.label, score: o.score }))
                .filter((o: any) => typeof o.label === 'string' && o.label.trim().length > 0)
                .map((o: any) => ({ label: o.label.trim(), score: Number(o.score) }))
                .filter((o: any) => Number.isFinite(o.score) && o.score >= 0 && o.score <= 100);

            if (cleanedOptions.length === 0) {
                return null;
            }

            const cfg: any = { options: cleanedOptions };
            if (weight !== undefined && weight !== null && Number.isFinite(Number(weight))) {
                cfg.weight = Number(weight);
            }

            return cfg as ScorecardConfigDto;
        } catch {
            return null;
        }
    }

    private validateScorecardFields(fields: Array<{ fieldType: FieldType; fieldName?: string; scorecard?: ScorecardConfigDto }>) {
        const scorecardFields = (fields || []).filter((f) => f.fieldType === FieldType.SCORECARD);
        if (scorecardFields.length === 0) {
            return;
        }

        for (const f of scorecardFields) {
            if (!f.scorecard || !Array.isArray(f.scorecard.options) || f.scorecard.options.length < 2) {
                throw new BadRequestException('Scorecard questions must include at least 2 answer options');
            }

            const seen = new Set<string>();
            for (const opt of f.scorecard.options) {
                const label = (opt?.label || '').trim();
                const score = Number((opt as any)?.score);

                if (!label) {
                    throw new BadRequestException('Scorecard option labels cannot be empty');
                }

                if (seen.has(label.toLowerCase())) {
                    throw new BadRequestException(`Duplicate scorecard option label: ${label}`);
                }
                seen.add(label.toLowerCase());

                if (!Number.isFinite(score) || score < 0 || score > 100) {
                    throw new BadRequestException('Scorecard option scores must be between 0 and 100');
                }
            }

            if (f.scorecard.weight !== undefined) {
                const w = Number(f.scorecard.weight);
                if (!Number.isFinite(w) || w < 0 || w > 100) {
                    throw new BadRequestException('Scorecard question weight must be between 0 and 100');
                }
            }
        }

        const weights = scorecardFields.map((f) => f.scorecard?.weight);
        const definedCount = weights.filter((w) => w !== undefined && w !== null).length;

        // Manual weightage is optional, but must be consistent.
        if (definedCount !== 0 && definedCount !== scorecardFields.length) {
            throw new BadRequestException('Either set weights for all scorecard questions or leave all weights empty');
        }

        if (definedCount === scorecardFields.length) {
            const sum = weights.reduce((acc, w) => acc + Number(w), 0);
            const roundedSum = Math.round((sum + Number.EPSILON) * 100) / 100;
            if (roundedSum !== 100) {
                throw new BadRequestException('Scorecard question weights must total exactly 100%');
            }
        }
    }

    private mapTemplate(template: any) {
        if (!template) {
            return template;
        }

        return {
            ...template,
            fields: (template.fields || []).map((field: any) => {
                const base = {
                    ...field,
                    fieldOptions: [] as string[],
                };

                if (field.fieldType === FieldType.MULTIPLE_CHOICE) {
                    return {
                        ...base,
                        fieldOptions: this.deserializeMultipleChoiceOptions(field.fieldOptions),
                    };
                }

                if (field.fieldType === FieldType.SCORECARD) {
                    return {
                        ...base,
                        scorecard: this.deserializeScorecardConfig(field.fieldOptions),
                    };
                }

                return base;
            }),
        };
    }

    async create(userId: string, dto: CreateLogTemplateDto) {
        this.validateScorecardFields(dto.fields as any);
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
                        fieldOptions: this.serializeFieldOptions(f.fieldType as any, (f as any).fieldOptions, (f as any).scorecard),
                    })),
                },
            },
            include: { fields: { orderBy: { fieldOrder: 'asc' } } },
        });

        return this.mapTemplate(template);
    }

    async findAllByUser(
        userId: string,
        page = 1,
        limit = 20,
    ) {
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

    async findOne(id: string, userId: string, userRole: UserRole) {
        const template = await this.prisma.logTemplate.findUnique({
            where: { id },
            include: {
                fields: { orderBy: { fieldOrder: 'asc' } },
                accounts: { select: { id: true, accountName: true } },
            },
        });

        if (!template) throw new NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this template');
        }

        return this.mapTemplate(template);
    }

    async update(id: string, userId: string, userRole: UserRole, dto: UpdateLogTemplateDto) {
        const template = await this.prisma.logTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this template');
        }

        // If fields are provided, do a replace-all strategy
        if (dto.fields) {
            this.validateScorecardFields(dto.fields as any);
            await this.prisma.$transaction(async (tx) => {
                // Delete old fields that are not in the new set
                const existingIds = dto.fields!
                    .filter((f) => f.id)
                    .map((f) => f.id!);

                await tx.logTemplateField.deleteMany({
                    where: {
                        templateId: id,
                        ...(existingIds.length > 0
                            ? { id: { notIn: existingIds } }
                            : {}),
                    },
                });

                // Upsert each field
                for (const f of dto.fields!) {
                    if (f.id) {
                        await tx.logTemplateField.update({
                            where: { id: f.id },
                            data: {
                                fieldName: f.fieldName,
                                fieldType: f.fieldType,
                                fieldOrder: f.fieldOrder,
                                placeholder: f.placeholder,
                                defaultValue: f.defaultValue,
                                fieldOptions: this.serializeFieldOptions(f.fieldType as any, (f as any).fieldOptions, (f as any).scorecard),
                            },
                        });
                    } else {
                        await tx.logTemplateField.create({
                            data: {
                                templateId: id,
                                fieldName: f.fieldName!,
                                fieldType: f.fieldType!,
                                fieldOrder: f.fieldOrder ?? 0,
                                placeholder: f.placeholder,
                                defaultValue: f.defaultValue,
                                fieldOptions: this.serializeFieldOptions(f.fieldType as any, (f as any).fieldOptions, (f as any).scorecard),
                            },
                        });
                    }
                }

                // Update template metadata
                await tx.logTemplate.update({
                    where: { id },
                    data: {
                        ...(dto.name !== undefined && { name: dto.name }),
                        ...(dto.description !== undefined && { description: dto.description }),
                        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    },
                });
            });
        } else {
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

    async delete(id: string, userId: string, userRole: UserRole) {
        const template = await this.prisma.logTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('You do not have access to this template');
        }

        // Unlink accounts first
        await this.prisma.tradeAccount.updateMany({
            where: { logTemplateId: id },
            data: { logTemplateId: null },
        });

        return this.prisma.logTemplate.delete({ where: { id } });
    }

    // ─── Assign/Unassign template to account ───

    async assignToAccount(templateId: string, accountId: string, userId: string, userRole: UserRole) {
        const template = await this.prisma.logTemplate.findUnique({ where: { id: templateId } });
        if (!template) throw new NotFoundException('Template not found');
        if (template.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Not your template');
        }

        const account = await this.prisma.tradeAccount.findUnique({ where: { id: accountId } });
        if (!account) throw new NotFoundException('Trade account not found');
        if (account.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Not your account');
        }

        return this.prisma.tradeAccount.update({
            where: { id: accountId },
            data: { logTemplateId: templateId },
        });
    }

    async unassignFromAccount(accountId: string, userId: string, userRole: UserRole) {
        const account = await this.prisma.tradeAccount.findUnique({ where: { id: accountId } });
        if (!account) throw new NotFoundException('Trade account not found');
        if (account.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Not your account');
        }

        return this.prisma.tradeAccount.update({
            where: { id: accountId },
            data: { logTemplateId: null },
        });
    }

    // ─── Get template for a specific account ───

    async getTemplateForAccount(accountId: string, userId: string, userRole: UserRole) {
        const account = await this.prisma.tradeAccount.findUnique({
            where: { id: accountId },
            include: {
                logTemplate: {
                    include: { fields: { orderBy: { fieldOrder: 'asc' } } },
                },
            },
        });

        if (!account) throw new NotFoundException('Trade account not found');
        if (account.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Not your account');
        }

        return this.mapTemplate(account.logTemplate);
    }
}
