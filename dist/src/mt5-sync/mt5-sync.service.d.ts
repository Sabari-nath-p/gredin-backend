import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LinkMt5Dto } from './dto/link-mt5.dto';
export declare class Mt5SyncService {
    private prisma;
    private config;
    private readonly logger;
    private readonly algorithm;
    private readonly fixedKey;
    constructor(prisma: PrismaService, config: ConfigService);
    private encrypt;
    private decrypt;
    linkAccount(userId: string, accountId: string, dto: LinkMt5Dto): Promise<{
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
    unlinkAccount(userId: string, accountId: string): Promise<{
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
    syncAccount(userId: string, accountId: string): Promise<{
        added: number;
        message: string;
    }>;
}
