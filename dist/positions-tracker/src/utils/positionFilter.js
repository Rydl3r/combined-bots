"use strict";
/**
 * Position filtering utilities
 * Handles filtering logic for positions based on various criteria
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetsFundingRateThreshold = meetsFundingRateThreshold;
exports.meetsMinPnlThreshold = meetsMinPnlThreshold;
exports.meetsMaxPnlThreshold = meetsMaxPnlThreshold;
exports.filterPositionsForScheduledUpdate = filterPositionsForScheduledUpdate;
exports.hasPositionsToNotify = hasPositionsToNotify;
const pnlCalculator_1 = require("./pnlCalculator");
const logger_1 = __importDefault(require("./logger"));
/**
 * Check if position meets funding rate threshold
 */
function meetsFundingRateThreshold(position, fundingData, threshold) {
    if (!fundingData || fundingData.rate === undefined) {
        return false;
    }
    const fundingRate = fundingData.rate;
    const meetsThreshold = fundingRate <= threshold;
    if (meetsThreshold) {
        logger_1.default.debug(`${position.symbol} meets funding rate criteria: ${fundingRate.toFixed(4)}% <= ${threshold}%`);
    }
    return meetsThreshold;
}
/**
 * Check if position meets minimum (loss) PnL threshold
 */
function meetsMinPnlThreshold(position, fairPriceData, contractInfo, threshold) {
    const unrealizedPnl = position.unrealizedPnl !== undefined && position.unrealizedPnl !== 0
        ? position.unrealizedPnl
        : (0, pnlCalculator_1.calculateUnrealizedPnl)(position, fairPriceData, contractInfo);
    const pnlPercentage = (0, pnlCalculator_1.calculateUnrealizedPnlPercentage)(unrealizedPnl, position);
    const meetsThreshold = pnlPercentage <= threshold;
    if (meetsThreshold) {
        logger_1.default.debug(`${position.symbol} meets minimum PnL criteria (loss): ${pnlPercentage.toFixed(2)}% <= ${threshold}%`);
    }
    return meetsThreshold;
}
/**
 * Check if position meets maximum (gain) PnL threshold
 */
function meetsMaxPnlThreshold(position, fairPriceData, contractInfo, threshold) {
    const unrealizedPnl = position.unrealizedPnl !== undefined && position.unrealizedPnl !== 0
        ? position.unrealizedPnl
        : (0, pnlCalculator_1.calculateUnrealizedPnl)(position, fairPriceData, contractInfo);
    const pnlPercentage = (0, pnlCalculator_1.calculateUnrealizedPnlPercentage)(unrealizedPnl, position);
    const meetsThreshold = pnlPercentage >= threshold;
    if (meetsThreshold) {
        logger_1.default.debug(`${position.symbol} meets maximum PnL criteria (gain): ${pnlPercentage.toFixed(2)}% >= ${threshold}%`);
    }
    return meetsThreshold;
}
/**
 * Filter positions based on funding rate and PnL thresholds
 */
function filterPositionsForScheduledUpdate(positions, fundingData, fairPriceData, contractInfoData, thresholds) {
    if (!positions || positions.length === 0) {
        return [];
    }
    const filteredPositions = positions.filter(position => {
        const symbol = position.symbol;
        const fundingInfo = fundingData[symbol];
        const fairPriceInfo = fairPriceData[symbol];
        const contractInfo = contractInfoData[symbol];
        if (meetsFundingRateThreshold(position, fundingInfo, thresholds.minFundingRate)) {
            return true;
        }
        if (meetsMinPnlThreshold(position, fairPriceInfo, contractInfo, thresholds.minUnrealizedPnl)) {
            return true;
        }
        if (meetsMaxPnlThreshold(position, fairPriceInfo, contractInfo, thresholds.maxUnrealizedPnl)) {
            return true;
        }
        return false;
    });
    logger_1.default.info(`Filtered ${filteredPositions.length} positions out of ${positions.length} total positions`);
    return filteredPositions;
}
/**
 * Check if any positions meet the filtering criteria
 */
function hasPositionsToNotify(positions, fundingData, fairPriceData, contractInfoData, thresholds) {
    const filtered = filterPositionsForScheduledUpdate(positions, fundingData, fairPriceData, contractInfoData, thresholds);
    return filtered.length > 0;
}
//# sourceMappingURL=positionFilter.js.map