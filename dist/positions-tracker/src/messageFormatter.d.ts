/**
 * Message formatter for Telegram bot
 * Formats position and funding data into readable messages
 */
import { Position, FundingRate, FairPrice, ContractInfo } from './types/exchange';
/**
 * Format a number with appropriate decimal places and add commas
 */
export declare function formatNumber(num: number | string, decimals?: number): string;
/**
 * Format price with dynamic precision based on price magnitude
 * Small prices (< 0.01) get more decimals for accuracy
 */
export declare function formatPrice(price: number | string): string;
/**
 * Format percentage with appropriate sign and color emoji
 */
export declare function formatPercentage(percentage: number | string, decimals?: number): string;
/**
 * Format PnL with appropriate sign and color emoji
 */
export declare function formatUnrealizedPnL(pnl: number, position: Position): string;
/**
 * Format timestamp to readable date
 */
export declare function formatTimestamp(timestamp: number | string): string;
/**
 * Format a single position into a readable message block
 */
export declare function formatPosition(position: Position, fundingData?: FundingRate | null, fairPriceData?: FairPrice | null, _contractInfo?: ContractInfo | null): string;
/**
 * Format multiple positions into a complete status message
 */
export declare function formatPositionsMessage(positions: Position[], fundingData?: {
    [symbol: string]: FundingRate;
}, fairPriceData?: {
    [symbol: string]: FairPrice;
}, contractInfoData?: {
    [symbol: string]: ContractInfo;
}): string;
/**
 * Format error message for Telegram
 */
export declare function formatErrorMessage(error: Error): string;
/**
 * Format startup message
 */
export declare function formatStartupMessage(): string;
/**
 * Format help message with available commands
 */
export declare function formatHelpMessage(): string;
//# sourceMappingURL=messageFormatter.d.ts.map