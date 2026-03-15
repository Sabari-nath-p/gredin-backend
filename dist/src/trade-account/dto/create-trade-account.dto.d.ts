export declare enum MarketSegment {
    STOCK = "STOCK",
    AUCTION = "AUCTION",
    FUTURES = "FUTURES",
    OPTIONS = "OPTIONS",
    FOREX = "FOREX",
    CRYPTO = "CRYPTO",
    COMMODITIES = "COMMODITIES"
}
export declare enum AccountType {
    DEMO = "DEMO",
    LIVE = "LIVE",
    FUNDED = "FUNDED"
}
export declare class CreateTradeAccountDto {
    accountName: string;
    brokerName: string;
    marketSegment: MarketSegment;
    currencyCode?: string;
    initialBalance: number;
    accountType: AccountType;
    mt5Login?: string;
    mt5Password?: string;
    mt5Server?: string;
}
