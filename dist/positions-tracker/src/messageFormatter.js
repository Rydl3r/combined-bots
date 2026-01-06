"use strict";
/**
 * Message formatter for Telegram bot
 * Formats position and funding data into readable messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = formatNumber;
exports.formatPrice = formatPrice;
exports.formatPercentage = formatPercentage;
exports.formatUnrealizedPnL = formatUnrealizedPnL;
exports.formatTimestamp = formatTimestamp;
exports.formatPosition = formatPosition;
exports.formatPositionsMessage = formatPositionsMessage;
exports.formatErrorMessage = formatErrorMessage;
exports.formatStartupMessage = formatStartupMessage;
exports.formatHelpMessage = formatHelpMessage;
const constants_1 = require("./constants");
const linkHelper_1 = require("./utils/linkHelper");
const pnlCalculator_1 = require("./utils/pnlCalculator");
/**
 * Format a number with appropriate decimal places and add commas
 */
function formatNumber(num, decimals = constants_1.FORMAT.DEFAULT_DECIMALS) {
    if (num === null || num === undefined || isNaN(Number(num))) {
        return '0.00';
    }
    const number = parseFloat(String(num));
    return number.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
/**
 * Format price with dynamic precision based on price magnitude
 * Small prices (< 0.01) get more decimals for accuracy
 */
function formatPrice(price) {
    if (price === null || price === undefined || isNaN(Number(price))) {
        return '0.00';
    }
    const priceNum = parseFloat(String(price));
    // Determine appropriate decimals based on price magnitude
    let decimals;
    if (priceNum < 0.001) {
        decimals = 8; // Very small prices need high precision
    }
    else if (priceNum < 0.01) {
        decimals = 6; // Small prices like SWEATUSDT (0.001338)
    }
    else if (priceNum < 1) {
        decimals = 5; // Prices between 0.01 and 1
    }
    else if (priceNum < 100) {
        decimals = 4; // Normal range prices
    }
    else {
        decimals = 2; // Large prices
    }
    return priceNum.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
/**
 * Format percentage with appropriate sign and color emoji
 */
function formatPercentage(percentage, decimals = constants_1.FORMAT.DEFAULT_DECIMALS) {
    const pct = parseFloat(String(percentage || 0));
    const formatted = formatNumber(Math.abs(pct), decimals);
    if (pct > 0) {
        return `${constants_1.EMOJIS.GREEN_CIRCLE} +${formatted}%`;
    }
    else if (pct < 0) {
        return `${constants_1.EMOJIS.RED_CIRCLE} -${formatted}%`;
    }
    else {
        return `${constants_1.EMOJIS.WHITE_CIRCLE} ${formatted}%`;
    }
}
/**
 * Format PnL with appropriate sign and color emoji
 */
function formatUnrealizedPnL(pnl, position) {
    const value = (0, pnlCalculator_1.calculateUnrealizedPnlPercentage)(pnl, position);
    const formatted = formatNumber(Math.abs(value), constants_1.FORMAT.PNL_DECIMALS);
    if (value > 0) {
        return `${constants_1.EMOJIS.GREEN_CIRCLE} +${formatted} %`;
    }
    else if (value < 0) {
        return `${constants_1.EMOJIS.RED_CIRCLE} -${formatted} %`;
    }
    else {
        return `${constants_1.EMOJIS.WHITE_CIRCLE} ${formatted} %`;
    }
}
/**
 * Format timestamp to readable date
 */
function formatTimestamp(timestamp) {
    if (!timestamp)
        return 'N/A';
    const date = new Date(parseInt(String(timestamp)));
    return (date.toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }) + ' UTC');
}
/**
 * Format a single position into a readable message block
 */
function formatPosition(position, fundingData = null, fairPriceData = null, _contractInfo = null) {
    const ticker = `${position.symbol} (${position.exchangeId})`;
    const entryPrice = formatPrice(position.entryPrice);
    const markPrice = fairPriceData
        ? formatPrice(fairPriceData.price)
        : formatPrice(position.markPrice || position.entryPrice);
    const margin = formatNumber(position.margin, constants_1.FORMAT.PRICE_DECIMALS);
    // Use the unrealized PnL provided by the exchange API if available (most exchanges),
    // otherwise calculate it (MEXC and others that don't provide it)
    const unrealizedPnl = position.unrealizedPnl !== undefined && position.unrealizedPnl !== 0
        ? position.unrealizedPnl
        : (0, pnlCalculator_1.calculateUnrealizedPnl)(position, fairPriceData, _contractInfo);
    const unrealizedPnlPercentage = formatUnrealizedPnL(unrealizedPnl, position);
    const realisedPnL = position.realizedPnl;
    let fundingRate = 'N/A';
    let nextSettlement = 'N/A';
    if (fundingData) {
        fundingRate = formatPercentage(fundingData.rate, constants_1.FORMAT.PERCENTAGE_DECIMALS);
        nextSettlement = fundingData.nextSettlementTime
            ? formatTimestamp(fundingData.nextSettlementTime)
            : 'N/A';
    }
    let message = `${ticker}\n`;
    message += `${constants_1.EMOJIS.MONEY} Entry Price: ${entryPrice} USDT\n`;
    message += `📍 Mark Price: ${markPrice} USDT\n`;
    message += `${constants_1.EMOJIS.DIAMOND} Margin: ${margin} USDT\n`;
    message += `${constants_1.EMOJIS.DOLLAR} Realized PnL: ${realisedPnL} USDT\n`;
    message += `${constants_1.EMOJIS.TRENDING_UP} Unrealized PnL%: ${unrealizedPnlPercentage}\n`;
    message += `${constants_1.EMOJIS.LIGHTNING} Funding Rate: ${fundingRate}\n`;
    message += `${constants_1.EMOJIS.CLOCK} Next Funding Rate Settlement: ${nextSettlement}\n`;
    // Add a quick link to the contract on the exchange if available
    try {
        const quickLink = (0, linkHelper_1.getFundingSourceLink)(position.exchangeId, position.symbol);
        if (quickLink) {
            message += `🔗 Quick Link: ${quickLink}\n`;
        }
    }
    catch {
        // Silently ignore link generation errors
    }
    return message;
}
/**
 * Format multiple positions into a complete status message
 */
function formatPositionsMessage(positions, fundingData = {}, fairPriceData = {}, contractInfoData = {}) {
    if (!positions || positions.length === 0) {
        return `${constants_1.EMOJIS.CHART} **Positions Status**\n\n${constants_1.EMOJIS.CHECK} No open positions found.`;
    }
    let message = `${constants_1.EMOJIS.CHART} **Positions Status**\n`;
    message += `${constants_1.EMOJIS.CALENDAR} ${formatTimestamp(Date.now())}\n\n`;
    positions.forEach((position, index) => {
        const symbol = position.symbol;
        const fundingInfo = fundingData[symbol] || null;
        const fairPriceInfo = fairPriceData[symbol] || null;
        const contractInfo = contractInfoData[symbol] || null;
        message += `${index + 1}. ${formatPosition(position, fundingInfo, fairPriceInfo, contractInfo)}\n`;
        if (index < positions.length - 1) {
            message += '─────────────────────\n';
        }
    });
    return message;
}
/**
 * Format error message for Telegram
 */
function formatErrorMessage(error) {
    const timestamp = formatTimestamp(Date.now());
    return `${constants_1.EMOJIS.ALARM} **Error Occurred**\n${constants_1.EMOJIS.CALENDAR} ${timestamp}\n\n${constants_1.EMOJIS.ERROR} ${error.message}`;
}
/**
 * Format startup message
 */
function formatStartupMessage() {
    return `${constants_1.EMOJIS.ROCKET} **Crypto Positions Tracker Started**\n${constants_1.EMOJIS.CALENDAR} ${formatTimestamp(Date.now())}\n\n${constants_1.EMOJIS.CHECK} Bot is now monitoring your positions every 5 minutes.`;
}
/**
 * Format help message with available commands
 */
function formatHelpMessage() {
    return (`${constants_1.EMOJIS.BOOK} **Crypto Positions Tracker Help**\n\n` +
        `${constants_1.EMOJIS.ROBOT} **Available Commands:**\n` +
        '/start - Start the bot\n' +
        '/status - Get current positions status (shows ALL positions)\n' +
        '/menu - Show interactive menu\n' +
        '/help - Show this help message\n\n' +
        `${constants_1.EMOJIS.CLOCK} **Automatic Updates:**\n` +
        'The bot automatically sends filtered position updates every 5 minutes.\n' +
        'Only positions with high funding rates or significant PnL changes are sent.\n\n' +
        `${constants_1.EMOJIS.MAGNIFYING_GLASS} **Filtering Criteria:**\n` +
        '• Funding rate >= 0.04% (configurable)\n' +
        '• Unrealized PnL >= 5% (configurable)\n\n' +
        `${constants_1.EMOJIS.CHART} **Features:**\n` +
        '• Real-time position tracking across multiple exchanges\n' +
        '• PnL monitoring\n' +
        '• Funding rate information\n' +
        '• Smart filtering for alerts\n' +
        '• Interactive menu buttons\n\n' +
        `${constants_1.EMOJIS.EMAIL} **Support:**\n` +
        'Contact your administrator for technical support.');
}
//# sourceMappingURL=messageFormatter.js.map