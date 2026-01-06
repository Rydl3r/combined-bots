"use strict";
/**
 * PnL Calculator module
 * Centralizes all profit and loss calculation logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUnrealizedPnl = calculateUnrealizedPnl;
exports.calculateUnrealizedPnlPercentage = calculateUnrealizedPnlPercentage;
exports.calculateTotalPnl = calculateTotalPnl;
exports.meetsPnlThreshold = meetsPnlThreshold;
exports.getPositionSummary = getPositionSummary;
const exchange_1 = require("../types/exchange");
const constants_1 = require("../constants");
/**
 * Calculate unrealized PnL
 * Formula: (Fair Price - Entry Price) × Position × Contract Size
 */
function calculateUnrealizedPnl(position, fairPriceData = null, contractInfo = null) {
    const entryPrice = position.entryPrice;
    const fairPrice = fairPriceData?.price ?? position.markPrice ?? entryPrice;
    const size = position.size;
    if (entryPrice <= 0 || size <= 0) {
        return 0;
    }
    const contractSize = contractInfo?.contractSize ?? constants_1.MEXC.DEFAULT_CONTRACT_SIZE;
    let unrealizedPnl = 0;
    if (position.positionType === exchange_1.PositionType.LONG) {
        unrealizedPnl = (fairPrice - entryPrice) * size * contractSize;
    }
    else if (position.positionType === exchange_1.PositionType.SHORT) {
        unrealizedPnl = (entryPrice - fairPrice) * size * contractSize;
    }
    return unrealizedPnl;
}
/**
 * Calculate unrealized PnL percentage
 */
function calculateUnrealizedPnlPercentage(unrealizedPnl, position) {
    const margin = position.margin;
    if (margin <= 0) {
        return 0;
    }
    return (unrealizedPnl / margin) * 100;
}
/**
 * Calculate total PnL for multiple positions
 */
function calculateTotalPnl(positions, fairPriceData = {}, contractInfoData = {}) {
    let totalUnrealizedPnl = 0;
    let totalRealizedPnl = 0;
    let totalMargin = 0;
    positions.forEach(position => {
        const symbol = position.symbol;
        const fairPrice = fairPriceData[symbol];
        const contractInfo = contractInfoData[symbol];
        const unrealizedPnl = position.unrealizedPnl !== undefined && position.unrealizedPnl !== 0
            ? position.unrealizedPnl
            : calculateUnrealizedPnl(position, fairPrice, contractInfo);
        totalUnrealizedPnl += unrealizedPnl;
        totalRealizedPnl += position.realizedPnl;
        totalMargin += position.margin;
    });
    return {
        totalUnrealizedPnl,
        totalRealizedPnl,
        totalMargin,
        totalPnl: totalUnrealizedPnl + totalRealizedPnl,
        totalUnrealizedPnlPercentage: totalMargin > 0 ? (totalUnrealizedPnl / totalMargin) * 100 : 0,
    };
}
/**
 * Check if position meets PnL threshold for filtering
 */
function meetsPnlThreshold(position, fairPriceData, contractInfo, threshold) {
    const unrealizedPnl = position.unrealizedPnl !== undefined && position.unrealizedPnl !== 0
        ? position.unrealizedPnl
        : calculateUnrealizedPnl(position, fairPriceData, contractInfo);
    const pnlPercentage = calculateUnrealizedPnlPercentage(unrealizedPnl, position);
    return pnlPercentage >= threshold;
}
/**
 * Get position summary statistics
 */
function getPositionSummary(positions, fairPriceData = {}, contractInfoData = {}) {
    if (!positions || positions.length === 0) {
        return {
            totalPositions: 0,
            longPositions: 0,
            shortPositions: 0,
            profitablePositions: 0,
            losingPositions: 0,
            ...calculateTotalPnl([], {}, {}),
        };
    }
    let longPositions = 0;
    let shortPositions = 0;
    let profitablePositions = 0;
    let losingPositions = 0;
    positions.forEach(position => {
        const symbol = position.symbol;
        const fairPrice = fairPriceData[symbol];
        const contractInfo = contractInfoData[symbol];
        const unrealizedPnl = position.unrealizedPnl !== undefined && position.unrealizedPnl !== 0
            ? position.unrealizedPnl
            : calculateUnrealizedPnl(position, fairPrice, contractInfo);
        if (position.positionType === exchange_1.PositionType.LONG) {
            longPositions++;
        }
        else if (position.positionType === exchange_1.PositionType.SHORT) {
            shortPositions++;
        }
        if (unrealizedPnl > 0) {
            profitablePositions++;
        }
        else if (unrealizedPnl < 0) {
            losingPositions++;
        }
    });
    const pnlSummary = calculateTotalPnl(positions, fairPriceData, contractInfoData);
    return {
        totalPositions: positions.length,
        longPositions,
        shortPositions,
        profitablePositions,
        losingPositions,
        ...pnlSummary,
    };
}
//# sourceMappingURL=pnlCalculator.js.map