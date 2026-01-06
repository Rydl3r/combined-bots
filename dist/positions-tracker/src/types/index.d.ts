/**
 * Common type definitions for the application
 */
import { Position, FundingRate, FairPrice, ContractInfo } from './exchange';
/**
 * Configuration thresholds for filtering
 */
export interface Thresholds {
    minFundingRate: number;
    minUnrealizedPnl: number;
    maxUnrealizedPnl: number;
}
/**
 * Scheduler configuration
 */
export interface SchedulerConfig {
    cronExpression: string;
}
/**
 * Bot configuration
 */
export interface BotConfig {
    token: string;
    adminChatId: string;
}
/**
 * Application configuration
 */
export interface AppConfig {
    bot: BotConfig;
    exchanges: ExchangeConfigMap;
    thresholds: Thresholds;
    scheduler: SchedulerConfig;
}
/**
 * Map of exchange configurations
 */
export interface ExchangeConfigMap {
    [key: string]: {
        enabled: boolean;
        accessKey: string;
        secretKey: string;
        passphrase?: string;
        baseUrl?: string;
    };
}
/**
 * Position service data result
 */
export interface PositionServiceResult {
    success: boolean;
    message: string;
    data?: {
        positions: Position[];
        fundingData: {
            [symbol: string]: FundingRate;
        };
        fairPriceData: {
            [symbol: string]: FairPrice;
        };
        contractInfoData: {
            [symbol: string]: ContractInfo;
        };
        totalPositions: number;
        totalPnl: number;
    };
    error?: string;
}
/**
 * PnL summary
 */
export interface PnLSummary {
    totalUnrealizedPnl: number;
    totalRealizedPnl: number;
    totalMargin: number;
    totalPnl: number;
    totalUnrealizedPnlPercentage: number;
}
/**
 * Position summary statistics
 */
export interface PositionSummary extends PnLSummary {
    totalPositions: number;
    longPositions: number;
    shortPositions: number;
    profitablePositions: number;
    losingPositions: number;
}
/**
 * Logger context information
 */
export interface LoggerContext {
    [key: string]: any;
}
//# sourceMappingURL=index.d.ts.map