/**
 * Gate.io Exchange Client
 * Implements IExchangeClient interface for Gate.io API
 */
import { IExchangeClient, Position, FundingRate, FairPrice, ContractInfo, ExchangeId, PositionDataResult } from '../types/exchange';
interface GateConfig {
    accessKey: string;
    secretKey: string;
}
export declare class GateClient implements IExchangeClient {
    private client;
    private accessKey;
    private secretKey;
    private exchangeId;
    constructor(config: GateConfig);
    /**
     * Get the exchange identifier
     */
    getExchangeId(): ExchangeId;
    /**
     * Generate Gate.io API signature
     */
    private generateSignature;
    /**
     * Make authenticated request to Gate.io API
     */
    private makeAuthenticatedRequest;
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
     * Helper function to calculate precision from a decimal string
     */
    private getPrecision;
}
export {};
//# sourceMappingURL=gateClient.d.ts.map