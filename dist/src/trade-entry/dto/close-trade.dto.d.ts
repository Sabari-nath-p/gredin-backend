import { TradeResult } from './create-trade-entry.dto';
export declare class CloseTradeDto {
    result: TradeResult;
    realisedProfitLoss: number;
    serviceCharge?: number;
    notes?: string;
}
