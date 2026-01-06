/**
 * Exchange abstraction layer
 * Defines interfaces for multi-exchange support
 */
/**
 * Exchange identifiers
 */
export declare enum Exchange {
    MEXC = "MEXC",
    GATE = "GATE",
    BINANCE = "BINANCE",
    BYBIT = "BYBIT",
    KUCOIN = "KUCOIN",
    OKX = "OKX",
    BITGET = "BITGET",
    BINGX = "BINGX"
}
/**
 * Exchange ID type (string representation of exchange)
 */
export type ExchangeId = string;
/**
 * Position types (Long/Short)
 */
export declare enum PositionType {
    LONG = 1,
    SHORT = 2
}
/**
 * Common position interface for all exchanges
 */
export interface Position {
    exchangeId: ExchangeId;
    symbol: string;
    positionType: PositionType;
    size: number;
    entryPrice: number;
    markPrice?: number;
    liquidationPrice?: number;
    leverage: number;
    margin: number;
    unrealizedPnl: number;
    realizedPnl: number;
    timestamp?: number;
    rawData?: Record<string, unknown>;
}
/**
 * Funding rate information
 */
export interface FundingRate {
    exchangeId: ExchangeId;
    symbol: string;
    rate: number;
    nextSettlementTime?: number;
    timestamp?: number;
    rawData?: Record<string, unknown>;
}
/**
 * Contract/Trading pair information
 */
export interface ContractInfo {
    exchangeId: ExchangeId;
    symbol: string;
    contractSize: number;
    pricePrecision: number;
    quantityPrecision: number;
    minQuantity?: number;
    maxQuantity?: number;
    rawData?: Record<string, unknown>;
}
/**
 * Fair/Mark price information
 */
export interface FairPrice {
    exchangeId: ExchangeId;
    symbol: string;
    price: number;
    timestamp?: number;
    rawData?: Record<string, unknown>;
}
/**
 * Exchange credentials configuration
 */
export interface ExchangeCredentials {
    accessKey: string;
    secretKey: string;
    passphrase?: string;
}
/**
 * Position data result from exchange
 */
export interface PositionDataResult {
    success: boolean;
    positions: Position[];
    fundingRates: Map<string, FundingRate>;
    fairPrices: Map<string, FairPrice>;
    contractInfo: Map<string, ContractInfo>;
    error?: string;
}
/**
 * Abstract interface for exchange clients
 * All exchange implementations must follow this interface
 */
export interface IExchangeClient {
    /**
     * Get the exchange identifier
     */
    getExchangeId(): ExchangeId;
    /**
     * Fetch all open positions
     */
    fetchOpenPositions(): Promise<Position[]>;
    /**
     * Fetch funding rate for a specific symbol
     */
    fetchFundingRate(symbol: string): Promise<FundingRate>;
    /**
     * Fetch funding rates for multiple symbols
     */
    fetchFundingRates(symbols: string[]): Promise<Map<string, FundingRate>>;
    /**
     * Fetch fair/mark price for a specific symbol
     */
    fetchFairPrice(symbol: string): Promise<FairPrice>;
    /**
     * Fetch fair/mark prices for multiple symbols
     */
    fetchFairPrices(symbols: string[]): Promise<Map<string, FairPrice>>;
    /**
     * Fetch contract information for a specific symbol
     */
    fetchContractInfo(symbol: string): Promise<ContractInfo>;
    /**
     * Fetch contract information for multiple symbols
     */
    fetchContractInfos(symbols: string[]): Promise<Map<string, ContractInfo>>;
    /**
     * Test API connection and credentials
     */
    testConnection(): Promise<boolean>;
    /**
     * Get all position data (positions, funding rates, fair prices, contract info)
     */
    fetchAllPositionData(): Promise<PositionDataResult>;
}
/**
 * Configuration for exchange clients
 */
export interface ExchangeConfig {
    exchangeId: ExchangeId;
    credentials: ExchangeCredentials;
    enabled: boolean;
    baseUrl?: string;
    timeout?: number;
    recvWindow?: number;
}
//# sourceMappingURL=exchange.d.ts.map