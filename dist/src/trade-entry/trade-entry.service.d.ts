import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeEntryDto } from './dto/create-trade-entry.dto';
import { UpdateTradeEntryDto } from './dto/update-trade-entry.dto';
import { CloseTradeDto } from './dto/close-trade.dto';
import { TradeEntry, UserRole } from '@prisma/client';
export declare class TradeEntryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createDto: CreateTradeEntryDto): Promise<TradeEntry>;
    findAllByAccount(tradeAccountId: string, userId: string, userRole: UserRole): Promise<TradeEntry[]>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<TradeEntry>;
    update(id: string, userId: string, userRole: UserRole, updateDto: UpdateTradeEntryDto): Promise<TradeEntry>;
    closeTrade(id: string, userId: string, userRole: UserRole, closeDto: CloseTradeDto): Promise<TradeEntry>;
    delete(id: string, userId: string, userRole: UserRole): Promise<TradeEntry>;
    findAll(): Promise<TradeEntry[]>;
    getTradeStats(tradeAccountId: string, userId: string, userRole: UserRole): Promise<{
        totalTrades: number;
        openTrades: number;
        closedTrades: number;
        profitTrades: number;
        lossTrades: number;
        breakEvenTrades: number;
        winRate: number;
    }>;
    private updateAccountBalance;
    private reverseAccountBalance;
}
