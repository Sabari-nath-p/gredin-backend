import { PrismaService } from '../prisma/prisma.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
import { UserRole } from '@prisma/client';
export declare class LogTemplateService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateLogTemplateDto): Promise<{
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fieldOrder: number;
            templateId: string;
            fieldName: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            defaultValue: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                accounts: number;
            };
            fields: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                fieldOrder: number;
                templateId: string;
                fieldName: string;
                fieldType: import(".prisma/client").$Enums.FieldType;
                placeholder: string | null;
                defaultValue: string | null;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<{
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fieldOrder: number;
            templateId: string;
            fieldName: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            defaultValue: string | null;
        }[];
        accounts: {
            id: string;
            accountName: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, userId: string, userRole: UserRole, dto: UpdateLogTemplateDto): Promise<{
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fieldOrder: number;
            templateId: string;
            fieldName: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            defaultValue: string | null;
        }[];
        accounts: {
            id: string;
            accountName: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    delete(id: string, userId: string, userRole: UserRole): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    assignToAccount(templateId: string, accountId: string, userId: string, userRole: UserRole): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        accountName: string;
        brokerName: string;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        currencyCode: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        accountType: import(".prisma/client").$Enums.AccountType;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        logTemplateId: string | null;
    }>;
    unassignFromAccount(accountId: string, userId: string, userRole: UserRole): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        accountName: string;
        brokerName: string;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        currencyCode: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        accountType: import(".prisma/client").$Enums.AccountType;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        logTemplateId: string | null;
    }>;
    getTemplateForAccount(accountId: string, userId: string, userRole: UserRole): Promise<({
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fieldOrder: number;
            templateId: string;
            fieldName: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            defaultValue: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }) | null>;
}
