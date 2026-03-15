export declare class UpdateTradeFieldValueDto {
    fieldId: string;
    textValue?: string;
    booleanValue?: boolean;
    imageUrl?: string;
}
export declare class UpdateTradeEntryDto {
    entryDateTime?: string;
    instrument?: string;
    entryPrice?: number;
    positionSize?: number;
    stopLossAmount?: number;
    takeProfitAmount?: number;
    notes?: string;
    fieldValues?: UpdateTradeFieldValueDto[];
}
