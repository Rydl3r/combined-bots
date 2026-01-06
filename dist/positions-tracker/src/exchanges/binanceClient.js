"use strict";
/**
 * Binance Exchange Client
 * Implements IExchangeClient interface for Binance Futures API
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const exchange_1 = require("../types/exchange");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../utils/errorHandler");
class BinanceClient {
    constructor(config) {
        this.exchangeId = 'BINANCE';
        this.recvWindow = 5000;
        this.accessKey = config.accessKey;
        this.secretKey = config.secretKey;
        this.client = axios_1.default.create({
            baseURL: constants_1.BINANCE.BASE_URL,
            timeout: constants_1.BINANCE.TIMEOUT,
            headers: {
                'X-MBX-APIKEY': this.accessKey,
                'Content-Type': 'application/json',
            },
        });
        logger_1.default.info(`Binance client initialized for ${this.exchangeId}`);
    }
    /**
     * Get the exchange identifier
     */
    getExchangeId() {
        return this.exchangeId;
    }
    /**
     * Generate Binance API signature
     */
    generateSignature(queryString) {
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(queryString)
            .digest('hex');
    }
    /**
     * Make authenticated request to Binance API
     */
    async makeAuthenticatedRequest(method, endpoint, params = {}) {
        const timestamp = Date.now();
        const queryParams = {
            ...params,
            timestamp,
            recvWindow: this.recvWindow,
        };
        const queryString = Object.entries(queryParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        const signature = this.generateSignature(queryString);
        const url = `${endpoint}?${queryString}&signature=${signature}`;
        try {
            const response = await this.client.request({
                method,
                url,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`Binance API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Make public request to Binance API (no authentication)
     */
    async makePublicRequest(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, { params });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`Binance API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Get all open positions
     */
    async fetchOpenPositions() {
        try {
            logger_1.default.debug('Fetching positions from Binance');
            // Get account info which includes positions
            const accountInfo = await this.makeAuthenticatedRequest('GET', '/fapi/v2/account');
            // Filter only positions with size (open positions)
            const openPositions = accountInfo.positions.filter(pos => parseFloat(pos.positionAmt) !== 0 && pos.positionSide === 'BOTH');
            const positions = openPositions.map(pos => {
                const positionAmt = parseFloat(pos.positionAmt);
                return {
                    exchangeId: this.exchangeId,
                    symbol: pos.symbol,
                    positionType: positionAmt > 0 ? exchange_1.PositionType.LONG : exchange_1.PositionType.SHORT,
                    size: Math.abs(positionAmt),
                    leverage: parseFloat(pos.leverage),
                    entryPrice: parseFloat(pos.entryPrice),
                    markPrice: undefined, // Will be fetched separately
                    liquidationPrice: undefined, // Will be fetched separately
                    unrealizedPnl: parseFloat(pos.unrealizedProfit),
                    realizedPnl: 0, // Binance doesn't provide this in position data
                    margin: parseFloat(pos.positionInitialMargin),
                    timestamp: pos.updateTime,
                };
            });
            // Fetch position risk data for mark price and liquidation price
            if (positions.length > 0) {
                const positionRisks = await this.makeAuthenticatedRequest('GET', '/fapi/v2/positionRisk');
                positions.forEach(position => {
                    const risk = positionRisks.find(r => r.symbol === position.symbol && r.positionSide === 'BOTH');
                    if (risk) {
                        position.markPrice = parseFloat(risk.markPrice);
                        position.liquidationPrice =
                            parseFloat(risk.liquidationPrice) || undefined;
                    }
                });
            }
            logger_1.default.info(`Fetched ${positions.length} positions from Binance`);
            return positions;
        }
        catch (error) {
            logger_1.default.error('Error fetching positions from Binance:', error);
            throw error;
        }
    }
    /**
     * Get funding rate for a specific symbol
     */
    async fetchFundingRate(symbol) {
        try {
            logger_1.default.debug(`Fetching funding rate for ${symbol} from Binance`);
            const premiumIndex = await this.makePublicRequest('/fapi/v1/premiumIndex', { symbol });
            if (!premiumIndex) {
                throw new Error(`No funding rate data for ${symbol} on Binance`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol,
                rate: parseFloat(premiumIndex.lastFundingRate) * 100, // Convert to percentage
                nextSettlementTime: premiumIndex.nextFundingTime,
                timestamp: premiumIndex.time,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching funding rate for ${symbol} from Binance:`, error);
            throw error;
        }
    }
    /**
     * Get funding rates for multiple symbols
     */
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        // Fetch all premium indices at once
        try {
            const allPremiumIndices = await this.makePublicRequest('/fapi/v1/premiumIndex');
            symbols.forEach(symbol => {
                const premiumIndex = allPremiumIndices.find(p => p.symbol === symbol);
                if (premiumIndex) {
                    fundingRates.set(symbol, {
                        exchangeId: this.exchangeId,
                        symbol,
                        rate: parseFloat(premiumIndex.lastFundingRate) * 100,
                        nextSettlementTime: premiumIndex.nextFundingTime,
                        timestamp: premiumIndex.time,
                    });
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching funding rates from Binance:', error);
        }
        return fundingRates;
    }
    /**
     * Get fair/mark price for a specific symbol
     */
    async fetchFairPrice(symbol) {
        try {
            logger_1.default.debug(`Fetching fair price for ${symbol} from Binance`);
            const premiumIndex = await this.makePublicRequest('/fapi/v1/premiumIndex', { symbol });
            if (!premiumIndex) {
                throw new Error(`No fair price data for ${symbol} on Binance`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol,
                price: parseFloat(premiumIndex.markPrice),
                timestamp: premiumIndex.time,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching fair price for ${symbol} from Binance:`, error);
            throw error;
        }
    }
    /**
     * Get fair/mark prices for multiple symbols
     */
    async fetchFairPrices(symbols) {
        const fairPrices = new Map();
        // Fetch all premium indices at once
        try {
            const allPremiumIndices = await this.makePublicRequest('/fapi/v1/premiumIndex');
            symbols.forEach(symbol => {
                const premiumIndex = allPremiumIndices.find(p => p.symbol === symbol);
                if (premiumIndex) {
                    fairPrices.set(symbol, {
                        exchangeId: this.exchangeId,
                        symbol,
                        price: parseFloat(premiumIndex.markPrice),
                        timestamp: premiumIndex.time,
                    });
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching fair prices from Binance:', error);
        }
        return fairPrices;
    }
    /**
     * Get contract information for a specific symbol
     */
    async fetchContractInfo(symbol) {
        try {
            logger_1.default.debug(`Fetching contract info for ${symbol} from Binance`);
            const exchangeInfo = await this.makePublicRequest('/fapi/v1/exchangeInfo');
            const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === symbol);
            if (!symbolInfo) {
                throw new Error(`No contract info for ${symbol} on Binance`);
            }
            // Find min/max quantity from filters
            const lotSizeFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');
            return {
                exchangeId: this.exchangeId,
                symbol: symbolInfo.symbol,
                contractSize: 1, // Binance uses 1:1 contract size
                pricePrecision: symbolInfo.pricePrecision,
                quantityPrecision: symbolInfo.quantityPrecision,
                minQuantity: lotSizeFilter?.minQty
                    ? parseFloat(lotSizeFilter.minQty)
                    : undefined,
                maxQuantity: lotSizeFilter?.maxQty
                    ? parseFloat(lotSizeFilter.maxQty)
                    : undefined,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching contract info for ${symbol} from Binance:`, error);
            throw error;
        }
    }
    /**
     * Get contract information for multiple symbols
     */
    async fetchContractInfos(symbols) {
        const contractInfos = new Map();
        try {
            const exchangeInfo = await this.makePublicRequest('/fapi/v1/exchangeInfo');
            symbols.forEach(symbol => {
                const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === symbol);
                if (symbolInfo) {
                    const lotSizeFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');
                    contractInfos.set(symbol, {
                        exchangeId: this.exchangeId,
                        symbol: symbolInfo.symbol,
                        contractSize: 1,
                        pricePrecision: symbolInfo.pricePrecision,
                        quantityPrecision: symbolInfo.quantityPrecision,
                        minQuantity: lotSizeFilter?.minQty
                            ? parseFloat(lotSizeFilter.minQty)
                            : undefined,
                        maxQuantity: lotSizeFilter?.maxQty
                            ? parseFloat(lotSizeFilter.maxQty)
                            : undefined,
                    });
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching contract infos from Binance:', error);
        }
        return contractInfos;
    }
    /**
     * Test connection to exchange
     */
    async testConnection() {
        try {
            logger_1.default.debug('Testing Binance connection');
            // Test by fetching account info
            await this.makeAuthenticatedRequest('GET', '/fapi/v2/account');
            logger_1.default.success('Binance connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('Binance connection test failed:', error);
            return false;
        }
    }
    /**
     * Fetch all position data (positions, funding rates, fair prices, contract info)
     */
    async fetchAllPositionData() {
        try {
            // Fetch all open positions
            const positions = await this.fetchOpenPositions();
            // If no positions, return empty result
            if (positions.length === 0) {
                return {
                    success: true,
                    positions: [],
                    fundingRates: new Map(),
                    fairPrices: new Map(),
                    contractInfo: new Map(),
                };
            }
            // Extract unique symbols from positions
            const symbols = [...new Set(positions.map(p => p.symbol))];
            // Fetch all related data in parallel
            const [fundingRates, fairPrices, contractInfo] = await Promise.all([
                this.fetchFundingRates(symbols),
                this.fetchFairPrices(symbols),
                this.fetchContractInfos(symbols),
            ]);
            return {
                success: true,
                positions,
                fundingRates,
                fairPrices,
                contractInfo,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to fetch all position data:', error);
            throw error;
        }
    }
}
exports.BinanceClient = BinanceClient;
//# sourceMappingURL=binanceClient.js.map