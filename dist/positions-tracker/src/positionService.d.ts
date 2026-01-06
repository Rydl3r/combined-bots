/**
 * Position tracking service
 * Handles fetching and processing position data from multiple exchanges
 */
import { ExchangeManager } from './exchanges/exchangeManager';
import { PositionServiceResult } from './types';
/**
 * Fetch and process all position data from all exchanges
 */
export declare function fetchPositionData(exchangeManager: ExchangeManager): Promise<PositionServiceResult>;
/**
 * Validate exchange credentials
 */
export declare function validateCredentials(exchangeManager: ExchangeManager): Promise<boolean>;
//# sourceMappingURL=positionService.d.ts.map