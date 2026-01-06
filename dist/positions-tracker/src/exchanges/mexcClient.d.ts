/**
 * MEXC Exchange Client
 * Implements the IExchangeClient interface for MEXC exchange
 */
import { IExchangeClient, ExchangeId, Position, FundingRate, FairPrice, ContractInfo, PositionDataResult, ExchangeCredentials } from '../types/exchange';
export declare class MexcClient implements IExchangeClient {
    private readonly accessKey;
    private readonly secretKey;
    private readonly baseUrl;
    private readonly axiosInstance;
    constructor(credentials: ExchangeCredentials, baseUrl?: string);
    getExchangeId(): ExchangeId;
    /**
     * Generate MEXC API signature
     */
    private generateSignature;
    /**
     * Create authenticated request headers
     */
    private createAuthenticatedRequest;
    /**
     * Convert MEXC position to common Position interface
     */
    private convertPosition;
    fetchOpenPositions(): Promise<Position[]>;
    fetchFundingRate(symbol: string): Promise<FundingRate>;
    fetchFundingRates(symbols: string[]): Promise<Map<string, FundingRate>>;
    fetchFairPrice(symbol: string): Promise<FairPrice>;
    fetchFairPrices(symbols: string[]): Promise<Map<string, FairPrice>>;
    fetchContractInfo(symbol: string): Promise<ContractInfo>;
    fetchContractInfos(symbols: string[]): Promise<Map<string, ContractInfo>>;
    /**
     * Fetch all contract information
     */
    private fetchAllContractInfo;
    testConnection(): Promise<boolean>;
    fetchAllPositionData(): Promise<PositionDataResult>;
}
//# sourceMappingURL=mexcClient.d.ts.map