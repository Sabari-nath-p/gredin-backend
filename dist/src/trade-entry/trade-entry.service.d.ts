import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeEntryDto } from './dto/create-trade-entry.dto';
import { UpdateTradeEntryDto } from './dto/update-trade-entry.dto';
import { CloseTradeDto } from './dto/close-trade.dto';
import { TradeEntry, UserRole, Prisma } from '@prisma/client';
export declare class TradeEntryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: CreateTradeEntryDto): Promise<TradeEntry>;
    findAllByAccount(tradeAccountId: string, userId: string, userRole: UserRole, page?: number, limit?: number): Promise<{
        data: ({
            fieldValues: ({
                field: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    fieldOrder: number;
                    templateId: string;
                    fieldName: string;
                    fieldType: import(".prisma/client").$Enums.FieldType;
                    placeholder: string | null;
                    defaultValue: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                fieldId: string;
                textValue: string | null;
                booleanValue: boolean | null;
                imageUrl: string | null;
                tradeEntryId: string;
            })[];
        } & {
            result: import(".prisma/client").$Enums.TradeResult | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tradeAccountId: string;
            entryDateTime: Date;
            instrument: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            entryPrice: Prisma.Decimal | null;
            positionSize: number | null;
            stopLossAmount: Prisma.Decimal;
            takeProfitAmount: Prisma.Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            realisedProfitLoss: Prisma.Decimal | null;
            serviceCharge: Prisma.Decimal;
            notes: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<TradeEntry>;
    update(id: string, userId: string, userRole: UserRole, updateDto: UpdateTradeEntryDto): Promise<TradeEntry>;
    closeTrade(id: string, userId: string, userRole: UserRole, closeDto: CloseTradeDto): Promise<TradeEntry>;
    delete(id: string, userId: string, userRole: UserRole): Promise<TradeEntry>;
    findAll(): Promise<TradeEntry[]>;
    getTradeStats(tradeAccountId: string, userId: string, userRole: UserRole): Promise<{
        totalTrades: number;
        openTrades: number;
        closedTrades: number;
        totalProfit: number;
        totalLoss: number;
        netProfitLoss: number;
        winningTrades: number;
        losingTrades: number;
        breakEvenTrades: number;
        winRate: number;
        averageWin: number;
        averageLoss: number;
        profitFactor: number;
        largestWin: number;
        largestLoss: number;
    }>;
    private updateAccountBalance;
    private reverseAccountBalance;
}
