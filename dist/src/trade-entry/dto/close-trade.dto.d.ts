import { TradeResult } from './create-trade-entry.dto';
export declare class CloseTradeFieldValueDto {
    fieldId: string;
    textValue?: string;
    booleanValue?: boolean;
    imageUrl?: string;
}
export declare class CloseTradeDto {
    result: TradeResult;
    realisedProfitLoss: number;
    serviceCharge?: number;
    notes?: string;
    fieldValues?: CloseTradeFieldValueDto[];
}
