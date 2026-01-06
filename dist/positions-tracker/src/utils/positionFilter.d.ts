/**
 * Position filtering utilities
 * Handles filtering logic for positions based on various criteria
 */
import { Position, FundingRate, FairPrice, ContractInfo } from '../types/exchange';
import { Thresholds } from '../types';
/**
 * Check if position meets funding rate threshold
 */
export declare function meetsFundingRateThreshold(position: Position, fundingData: FundingRate | null, threshold: number): boolean;
/**
 * Check if position meets minimum (loss) PnL threshold
 */
export declare function meetsMinPnlThreshold(position: Position, fairPriceData: FairPrice | null, contractInfo: ContractInfo | null, threshold: number): boolean;
/**
 * Check if position meets maximum (gain) PnL threshold
 */
export declare function meetsMaxPnlThreshold(position: Position, fairPriceData: FairPrice | null, contractInfo: ContractInfo | null, threshold: number): boolean;
/**
 * Filter positions based on funding rate and PnL thresholds
 */
export declare function filterPositionsForScheduledUpdate(positions: Position[], fundingData: {
    [symbol: string]: FundingRate;
}, fairPriceData: {
    [symbol: string]: FairPrice;
}, contractInfoData: {
    [symbol: string]: ContractInfo;
}, thresholds: Thresholds): Position[];
/**
 * Check if any positions meet the filtering criteria
 */
export declare function hasPositionsToNotify(positions: Position[], fundingData: {
    [symbol: string]: FundingRate;
}, fairPriceData: {
    [symbol: string]: FairPrice;
}, contractInfoData: {
    [symbol: string]: ContractInfo;
}, thresholds: Thresholds): boolean;
//# sourceMappingURL=positionFilter.d.ts.map