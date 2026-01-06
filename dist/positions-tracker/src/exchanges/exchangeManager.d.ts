/**
 * Exchange Manager
 * Manages multiple exchange clients and aggregates data
 */
import { IExchangeClient, Position, PositionDataResult } from '../types/exchange';
import { AppConfig } from '../types';
export declare class ExchangeManager {
    private clients;
    constructor(config: AppConfig);
    /**
     * Initialize exchange clients based on configuration
     */
    private initializeClients;
    /**
     * Get all enabled exchange clients
     */
    getClients(): IExchangeClient[];
    /**
     * Get a specific exchange client
     */
    getClient(exchangeName: string): IExchangeClient | undefined;
    /**
     * Fetch positions from all exchanges
     */
    fetchAllPositions(): Promise<Position[]>;
    /**
     * Fetch all position data from all exchanges
     */
    fetchAllPositionData(): Promise<PositionDataResult>;
    /**
     * Aggregate results from multiple exchanges
     */
    private aggregateResults;
    /**
     * Test connections to all exchanges
     */
    testAllConnections(): Promise<Map<string, boolean>>;
    /**
     * Validate all exchange credentials
     */
    validateAllCredentials(): Promise<boolean>;
}
//# sourceMappingURL=exchangeManager.d.ts.map