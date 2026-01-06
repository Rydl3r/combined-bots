"use strict";
/**
 * Position tracking service
 * Handles fetching and processing position data from multiple exchanges
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPositionData = fetchPositionData;
exports.validateCredentials = validateCredentials;
const messageFormatter_1 = require("./messageFormatter");
const pnlCalculator_1 = require("./utils/pnlCalculator");
const logger_1 = __importDefault(require("./utils/logger"));
/**
 * Fetch and process all position data from all exchanges
 */
async function fetchPositionData(exchangeManager) {
    try {
        logger_1.default.info('Fetching position data from all exchanges...');
        const result = await exchangeManager.fetchAllPositionData();
        if (!result.success && result.error) {
            logger_1.default.error('Error fetching position data:', result.error);
            return {
                success: false,
                message: (0, messageFormatter_1.formatErrorMessage)(new Error(result.error)),
                error: result.error,
            };
        }
        const positions = result.positions;
        logger_1.default.info(`Found ${positions.length} open positions across all exchanges`);
        if (positions.length === 0) {
            return {
                success: true,
                message: (0, messageFormatter_1.formatPositionsMessage)([], {}, {}, {}),
                data: {
                    positions: [],
                    fundingData: {},
                    fairPriceData: {},
                    contractInfoData: {},
                    totalPositions: 0,
                    totalPnl: 0,
                },
            };
        }
        // Convert Maps to objects for easier handling
        const fundingBySymbol = {};
        result.fundingRates.forEach((value, key) => {
            fundingBySymbol[key] = value;
        });
        const fairPriceBySymbol = {};
        result.fairPrices.forEach((value, key) => {
            fairPriceBySymbol[key] = value;
        });
        const contractInfoBySymbol = {};
        result.contractInfo.forEach((value, key) => {
            contractInfoBySymbol[key] = value;
        });
        logger_1.default.info(`Fetched funding rates for ${Object.keys(fundingBySymbol).length} symbols`);
        logger_1.default.info(`Fetched fair prices for ${Object.keys(fairPriceBySymbol).length} symbols`);
        const formattedMessage = (0, messageFormatter_1.formatPositionsMessage)(positions, fundingBySymbol, fairPriceBySymbol, contractInfoBySymbol);
        const pnlSummary = (0, pnlCalculator_1.calculateTotalPnl)(positions, fairPriceBySymbol, contractInfoBySymbol);
        return {
            success: true,
            message: formattedMessage,
            data: {
                positions,
                fundingData: fundingBySymbol,
                fairPriceData: fairPriceBySymbol,
                contractInfoData: contractInfoBySymbol,
                totalPositions: positions.length,
                totalPnl: pnlSummary.totalPnl,
            },
        };
    }
    catch (error) {
        logger_1.default.error('Error fetching position data:', error);
        return {
            success: false,
            message: (0, messageFormatter_1.formatErrorMessage)(error instanceof Error ? error : new Error(String(error))),
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Validate exchange credentials
 */
async function validateCredentials(exchangeManager) {
    try {
        logger_1.default.info('Validating exchange credentials...');
        const isValid = await exchangeManager.validateAllCredentials();
        if (isValid) {
            logger_1.default.success('All exchange credentials are valid');
        }
        else {
            logger_1.default.error('Some exchange credentials are invalid');
        }
        return isValid;
    }
    catch (error) {
        logger_1.default.error('Credential validation failed:', error);
        return false;
    }
}
//# sourceMappingURL=positionService.js.map