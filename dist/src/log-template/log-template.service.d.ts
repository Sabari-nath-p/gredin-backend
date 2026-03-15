import { PrismaService } from '../prisma/prisma.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
import { UserRole } from '@prisma/client';
export declare class LogTemplateService {
    private prisma;
    constructor(prisma: PrismaService);
    private serializeFieldOptions;
    private deserializeFieldOptions;
    private mapTemplate;
    create(userId: string, dto: CreateLogTemplateDto): Promise<any>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<any>;
    update(id: string, userId: string, userRole: UserRole, dto: UpdateLogTemplateDto): Promise<any>;
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
    getTemplateForAccount(accountId: string, userId: string, userRole: UserRole): Promise<any>;
}
