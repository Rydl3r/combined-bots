/**
 * KuCoin Exchange Client
 * Implements IExchangeClient interface for KuCoin Futures API
 */
import { IExchangeClient, Position, FundingRate, FairPrice, ContractInfo, ExchangeId, PositionDataResult } from '../types/exchange';
interface KucoinConfig {
    accessKey: string;
    secretKey: string;
    passphrase: string;
}
export declare class KucoinClient implements IExchangeClient {
    private client;
    private accessKey;
    private secretKey;
    private passphrase;
    private exchangeId;
    constructor(config: KucoinConfig);
    /**
     * Get the exchange identifier
     */
    getExchangeId(): ExchangeId;
    /**
     * Generate KuCoin API signature
     */
    private generateSignature;
    /**
     * Generate encrypted passphrase
     */
    private encryptPassphrase;
    /**
     * Make authenticated request to KuCoin API
     */
    private makeAuthenticatedRequest;
    /**
     * Make public request to KuCoin API (no authentication)
     */
    private makePublicRequest;
    /**
     * Get all open positions
     */
    fetchOpenPositions(): Promise<Position[]>;
    /**
     * Get funding rate for a specific symbol
     */
    fetchFundingRate(symbol: string): Promise<FundingRate>;
    /**
     * Get funding rates for multiple symbols
     */
    fetchFundingRates(symbols: string[]): Promise<Map<string, FundingRate>>;
    /**
     * Get fair/mark price for a specific symbol
     */
    fetchFairPrice(symbol: string): Promise<FairPrice>;
    /**
     * Get fair/mark prices for multiple symbols
     */
    fetchFairPrices(symbols: string[]): Promise<Map<string, FairPrice>>;
    /**
     * Get contract information for a specific symbol
     */
    fetchContractInfo(symbol: string): Promise<ContractInfo>;
    /**
     * Get contract information for multiple symbols
     */
    fetchContractInfos(symbols: string[]): Promise<Map<string, ContractInfo>>;
    /**
     * Test connection to exchange
     */
    testConnection(): Promise<boolean>;
    /**
     * Fetch all position data (positions, funding rates, fair prices, contract info)
     */
    fetchAllPositionData(): Promise<PositionDataResult>;
    /**
     * Helper function to calculate precision from a decimal number
     */
    private getPrecision;
}
export {};
//# sourceMappingURL=kucoinClient.d.ts.map