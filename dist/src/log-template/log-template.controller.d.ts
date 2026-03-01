import { LogTemplateService } from './log-template.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
export declare class LogTemplateController {
    private readonly logTemplateService;
    constructor(logTemplateService: LogTemplateService);
    create(req: any, dto: CreateLogTemplateDto): Promise<{
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
    findAll(req: any, page?: string, limit?: string): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, req: any, dto: UpdateLogTemplateDto): Promise<{
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
    delete(id: string, req: any): Promise<void>;
    assignToAccount(id: string, accountId: string, req: any): Promise<{
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
    unassignFromAccount(accountId: string, req: any): Promise<void>;
    getTemplateForAccount(accountId: string, req: any): Promise<({
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
