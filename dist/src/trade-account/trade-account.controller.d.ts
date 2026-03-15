import { TradeAccountService } from './trade-account.service';
import { CreateTradeAccountDto } from './dto/create-trade-account.dto';
import { UpdateTradeAccountDto } from './dto/update-trade-account.dto';
export declare class TradeAccountController {
    private readonly tradeAccountService;
    constructor(tradeAccountService: TradeAccountService);
    create(req: any, createDto: CreateTradeAccountDto): Promise<{
        id: string;
        userId: string;
        accountName: string;
        brokerName: string;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        currencyCode: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        accountType: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        mt5Login: string | null;
        mt5Password: string | null;
        mt5Server: string | null;
        lastSyncTime: Date | null;
        logTemplateId: string | null;
    }>;
    findAllByUser(req: any, page?: string, limit?: string): Promise<{
        data: ({
            logTemplate: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            userId: string;
            accountName: string;
            brokerName: string;
            marketSegment: import(".prisma/client").$Enums.MarketSegment;
            currencyCode: string;
            initialBalance: import("@prisma/client/runtime/library").Decimal;
            currentBalance: import("@prisma/client/runtime/library").Decimal;
            accountType: import(".prisma/client").$Enums.AccountType;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            mt5Login: string | null;
            mt5Password: string | null;
            mt5Server: string | null;
            lastSyncTime: Date | null;
            logTemplateId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        id: string;
        userId: string;
        accountName: string;
        brokerName: string;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        currencyCode: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        accountType: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        mt5Login: string | null;
        mt5Password: string | null;
        mt5Server: string | null;
        lastSyncTime: Date | null;
        logTemplateId: string | null;
    }>;
    update(id: string, req: any, updateDto: UpdateTradeAccountDto): Promise<{
        id: string;
        userId: string;
        accountName: string;
        brokerName: string;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        currencyCode: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        accountType: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        mt5Login: string | null;
        mt5Password: string | null;
        mt5Server: string | null;
        lastSyncTime: Date | null;
        logTemplateId: string | null;
    }>;
    delete(id: string, req: any): Promise<void>;
    findAll(req: any): Promise<{
        id: string;
        userId: string;
        accountName: string;
        brokerName: string;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        currencyCode: string;
        initialBalance: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        accountType: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        mt5Login: string | null;
        mt5Password: string | null;
        mt5Server: string | null;
        lastSyncTime: Date | null;
        logTemplateId: string | null;
    }[]>;
    getStats(req: any): Promise<{
        totalAccounts: number;
        activeAccounts: number;
        inactiveAccounts: number;
        accountsByType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TradeAccountGroupByOutputType, "accountType"[]> & {
            _count: number;
        })[];
        accountsBySegment: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TradeAccountGroupByOutputType, "marketSegment"[]> & {
            _count: number;
        })[];
    }>;
}
