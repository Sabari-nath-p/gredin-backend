import { LogTemplateService } from './log-template.service';
import { CreateLogTemplateDto } from './dto/create-log-template.dto';
import { UpdateLogTemplateDto } from './dto/update-log-template.dto';
export declare class LogTemplateController {
    private readonly logTemplateService;
    constructor(logTemplateService: LogTemplateService);
    create(req: any, dto: CreateLogTemplateDto): Promise<any>;
    findAll(req: any, page?: string, limit?: string): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, req: any, dto: UpdateLogTemplateDto): Promise<any>;
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
        mt5Login: string | null;
        mt5Password: string | null;
        mt5Server: string | null;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        lastSyncTime: Date | null;
        logTemplateId: string | null;
    }>;
    unassignFromAccount(accountId: string, req: any): Promise<void>;
    getTemplateForAccount(accountId: string, req: any): Promise<any>;
}
