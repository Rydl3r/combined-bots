/**
 * PnL Calculator module
 * Centralizes all profit and loss calculation logic
 */
import { Position, FairPrice, ContractInfo } from '../types/exchange';
import { PnLSummary, PositionSummary } from '../types';
/**
 * Calculate unrealized PnL
 * Formula: (Fair Price - Entry Price) × Position × Contract Size
 */
export declare function calculateUnrealizedPnl(position: Position, fairPriceData?: FairPrice | null, contractInfo?: ContractInfo | null): number;
/**
 * Calculate unrealized PnL percentage
 */
export declare function calculateUnrealizedPnlPercentage(unrealizedPnl: number, position: Position): number;
/**
 * Calculate total PnL for multiple positions
 */
export declare function calculateTotalPnl(positions: Position[], fairPriceData?: {
    [symbol: string]: FairPrice;
}, contractInfoData?: {
    [symbol: string]: ContractInfo;
}): PnLSummary;
/**
 * Check if position meets PnL threshold for filtering
 */
export declare function meetsPnlThreshold(position: Position, fairPriceData: FairPrice | null, contractInfo: ContractInfo | null, threshold: number): boolean;
/**
 * Get position summary statistics
 */
export declare function getPositionSummary(positions: Position[], fairPriceData?: {
    [symbol: string]: FairPrice;
}, contractInfoData?: {
    [symbol: string]: ContractInfo;
}): PositionSummary;
//# sourceMappingURL=pnlCalculator.d.ts.map