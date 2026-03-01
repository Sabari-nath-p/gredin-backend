export declare enum TradeDirection {
    BUY = "BUY",
    SELL = "SELL"
}
export declare enum TradeStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}
export declare enum TradeResult {
    PROFIT = "PROFIT",
    LOSS = "LOSS",
    BREAK_EVEN = "BREAK_EVEN"
}
export declare class TradeFieldValueDto {
    fieldId: string;
    textValue?: string;
    booleanValue?: boolean;
    imageUrl?: string;
}
export declare class CreateTradeEntryDto {
    tradeAccountId: string;
    entryDateTime: string;
    instrument: string;
    direction: TradeDirection;
    entryPrice?: number;
    positionSize?: number;
    stopLossAmount: number;
    takeProfitAmount: number;
    status?: TradeStatus;
    result?: TradeResult;
    realisedProfitLoss?: number;
    serviceCharge?: number;
    notes?: string;
    fieldValues?: TradeFieldValueDto[];
}
