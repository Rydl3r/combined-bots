/**
 * BingX Exchange Client
 * Implements IExchangeClient interface for BingX Perpetual Futures API
 */
import { IExchangeClient, Position, FundingRate, FairPrice, ContractInfo, ExchangeId, PositionDataResult } from '../types/exchange';
interface BingxConfig {
    accessKey: string;
    secretKey: string;
}
export declare class BingxClient implements IExchangeClient {
    private client;
    private secretKey;
    readonly exchangeId: ExchangeId;
    constructor(config: BingxConfig);
    private generateSignature;
    private makeRequest;
    getPositions(): Promise<Position[]>;
    getExchangeId(): string;
    fetchOpenPositions(): Promise<Position[]>;
    getFundingRate(symbol: string): Promise<FundingRate>;
    fetchFundingRate(symbol: string): Promise<FundingRate>;
    testConnection(): Promise<boolean>;
    fetchFundingRates(symbols: string[]): Promise<Map<string, FundingRate>>;
    fetchFairPrice(symbol: string): Promise<FairPrice>;
    fetchFairPrices(symbols: string[]): Promise<Map<string, FairPrice>>;
    fetchContractInfo(symbol: string): Promise<ContractInfo>;
    fetchContractInfos(symbols: string[]): Promise<Map<string, ContractInfo>>;
    fetchAllPositionData(): Promise<PositionDataResult>;
}
export {};
//# sourceMappingURL=bingxClient.d.ts.map