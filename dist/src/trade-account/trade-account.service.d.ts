import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeAccountDto } from './dto/create-trade-account.dto';
import { UpdateTradeAccountDto } from './dto/update-trade-account.dto';
import { TradeAccount, UserRole } from '@prisma/client';
export declare class TradeAccountService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: CreateTradeAccountDto): Promise<TradeAccount>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            logTemplate: {
                name: string;
                id: string;
            } | null;
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<TradeAccount>;
    update(id: string, userId: string, userRole: UserRole, updateDto: UpdateTradeAccountDto): Promise<TradeAccount>;
    delete(id: string, userId: string, userRole: UserRole): Promise<TradeAccount>;
    findAll(): Promise<TradeAccount[]>;
    getAccountStats(): Promise<{
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
