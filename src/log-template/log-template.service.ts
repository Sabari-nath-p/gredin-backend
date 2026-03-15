import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LogTemplateService {
    constructor(private prisma: PrismaService) {}

    private serializeFieldOptions(fieldOptions?: string[]) {
        if (!fieldOptions || fieldOptions.length === 0) {
            return null;
        }

        return JSON.stringify(fieldOptions);
    }

    private deserializeFieldOptions(fieldOptions?: string | null): string[] {
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

    private mapTemplate(template: any) {
        if (!template) {
            return template;
        }

        return {
            ...template,
            fields: (template.fields || []).map((field: any) => ({
                ...field,
                fieldOptions: this.deserializeFieldOptions(field.fieldOptions),
            })),
        };
    }

    async create(userId: string, dto: CreateLogTemplateDto) {
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
                        fieldOptions: this.serializeFieldOptions(f.fieldOptions),
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
                                fieldOptions: this.serializeFieldOptions(f.fieldOptions),
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
                                fieldOptions: this.serializeFieldOptions(f.fieldOptions),
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
