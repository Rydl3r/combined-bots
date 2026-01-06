"use strict";
/**
 * Bybit Exchange Client
 * Implements IExchangeClient interface for Bybit V5 API
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
exports.BybitClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const exchange_1 = require("../types/exchange");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../utils/errorHandler");
class BybitClient {
    constructor(config) {
        this.exchangeId = 'BYBIT';
        this.recvWindow = 5000;
        this.accessKey = config.accessKey;
        this.secretKey = config.secretKey;
        this.client = axios_1.default.create({
            baseURL: constants_1.BYBIT.BASE_URL,
            timeout: constants_1.BYBIT.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        logger_1.default.info(`Bybit client initialized for ${this.exchangeId}`);
    }
    /**
     * Get the exchange identifier
     */
    getExchangeId() {
        return this.exchangeId;
    }
    /**
     * Generate Bybit API signature
     */
    generateSignature(timestamp, params) {
        const signString = timestamp + this.accessKey + this.recvWindow + params;
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(signString)
            .digest('hex');
    }
    /**
     * Make authenticated request to Bybit API
     */
    async makeAuthenticatedRequest(method, endpoint, params = {}) {
        const timestamp = Date.now();
        const queryString = Object.keys(params).length > 0
            ? Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
            : '';
        const signature = this.generateSignature(timestamp, queryString);
        const headers = {
            'X-BAPI-API-KEY': this.accessKey,
            'X-BAPI-TIMESTAMP': timestamp.toString(),
            'X-BAPI-SIGN': signature,
            'X-BAPI-RECV-WINDOW': this.recvWindow.toString(),
        };
        try {
            const url = queryString ? `${endpoint}?${queryString}` : endpoint;
            const response = await this.client.request({
                method,
                url,
                headers,
            });
            if (response.data.retCode !== 0) {
                throw new errorHandler_1.APIError(`Bybit API error: ${response.data.retMsg}`, response.data.retCode, response.data);
            }
            return response.data.result;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`Bybit API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Make public request to Bybit API (no authentication)
     */
    async makePublicRequest(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, {
                params,
            });
            if (response.data.retCode !== 0) {
                throw new errorHandler_1.APIError(`Bybit API error: ${response.data.retMsg}`, response.data.retCode, response.data);
            }
            return response.data.result;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`Bybit API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Get all open positions
     */
    async fetchOpenPositions() {
        try {
            logger_1.default.debug('Fetching positions from Bybit');
            // Get linear (USDT) perpetual positions
            const positionData = await this.makeAuthenticatedRequest('GET', '/v5/position/list', {
                category: 'linear',
                settleCoin: 'USDT',
            });
            // Filter only positions with size (open positions)
            const openPositions = positionData.list.filter(pos => parseFloat(pos.size) > 0);
            const positions = openPositions.map(pos => {
                // Use avgPrice if entryPrice is 0, as Bybit sometimes returns 0 for entryPrice
                const entryPrice = parseFloat(pos.avgPrice) || parseFloat(pos.entryPrice);
                return {
                    exchangeId: this.exchangeId,
                    symbol: pos.symbol,
                    positionType: pos.side === 'Buy' ? exchange_1.PositionType.LONG : exchange_1.PositionType.SHORT,
                    size: parseFloat(pos.size),
                    leverage: parseFloat(pos.leverage),
                    entryPrice: entryPrice,
                    markPrice: parseFloat(pos.markPrice),
                    liquidationPrice: parseFloat(pos.liqPrice) || undefined,
                    unrealizedPnl: parseFloat(pos.unrealisedPnl),
                    realizedPnl: parseFloat(pos.cumRealisedPnl),
                    margin: parseFloat(pos.positionIM),
                    timestamp: parseInt(pos.updatedTime),
                };
            });
            logger_1.default.info(`Fetched ${positions.length} positions from Bybit`);
            return positions;
        }
        catch (error) {
            logger_1.default.error('Error fetching positions from Bybit:', error);
            throw error;
        }
    }
    /**
     * Get funding rate for a specific symbol
     */
    async fetchFundingRate(symbol) {
        try {
            logger_1.default.debug(`Fetching funding rate for ${symbol} from Bybit`);
            const tickers = await this.makePublicRequest('/v5/market/tickers', {
                category: 'linear',
                symbol,
            });
            if (!tickers.list || tickers.list.length === 0) {
                throw new Error(`No funding rate data for ${symbol} on Bybit`);
            }
            const ticker = tickers.list[0];
            return {
                exchangeId: this.exchangeId,
                symbol,
                rate: parseFloat(ticker.fundingRate) * 100, // Convert to percentage
                nextSettlementTime: parseInt(ticker.nextFundingTime),
                timestamp: Date.now(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching funding rate for ${symbol} from Bybit:`, error);
            throw error;
        }
    }
    /**
     * Get funding rates for multiple symbols
     */
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        // Bybit allows fetching all tickers at once
        try {
            const tickers = await this.makePublicRequest('/v5/market/tickers', {
                category: 'linear',
            });
            symbols.forEach(symbol => {
                const ticker = tickers.list.find(t => t.symbol === symbol);
                if (ticker) {
                    fundingRates.set(symbol, {
                        exchangeId: this.exchangeId,
                        symbol,
                        rate: parseFloat(ticker.fundingRate) * 100,
                        nextSettlementTime: parseInt(ticker.nextFundingTime),
                        timestamp: Date.now(),
                    });
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching funding rates from Bybit:', error);
        }
        return fundingRates;
    }
    /**
     * Get fair/mark price for a specific symbol
     */
    async fetchFairPrice(symbol) {
        try {
            logger_1.default.debug(`Fetching fair price for ${symbol} from Bybit`);
            const tickers = await this.makePublicRequest('/v5/market/tickers', {
                category: 'linear',
                symbol,
            });
            if (!tickers.list || tickers.list.length === 0) {
                throw new Error(`No fair price data for ${symbol} on Bybit`);
            }
            const ticker = tickers.list[0];
            return {
                exchangeId: this.exchangeId,
                symbol,
                price: parseFloat(ticker.markPrice),
                timestamp: Date.now(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching fair price for ${symbol} from Bybit:`, error);
            throw error;
        }
    }
    /**
     * Get fair/mark prices for multiple symbols
     */
    async fetchFairPrices(symbols) {
        const fairPrices = new Map();
        // Fetch all tickers at once
        try {
            const tickers = await this.makePublicRequest('/v5/market/tickers', {
                category: 'linear',
            });
            symbols.forEach(symbol => {
                const ticker = tickers.list.find(t => t.symbol === symbol);
                if (ticker) {
                    fairPrices.set(symbol, {
                        exchangeId: this.exchangeId,
                        symbol,
                        price: parseFloat(ticker.markPrice),
                        timestamp: Date.now(),
                    });
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching fair prices from Bybit:', error);
        }
        return fairPrices;
    }
    /**
     * Get contract information for a specific symbol
     */
    async fetchContractInfo(symbol) {
        try {
            logger_1.default.debug(`Fetching contract info for ${symbol} from Bybit`);
            const instruments = await this.makePublicRequest('/v5/market/instruments-info', {
                category: 'linear',
                symbol,
            });
            if (!instruments.list || instruments.list.length === 0) {
                throw new Error(`No contract info for ${symbol} on Bybit`);
            }
            const instrument = instruments.list[0];
            return {
                exchangeId: this.exchangeId,
                symbol: instrument.symbol,
                contractSize: 1, // Bybit uses 1:1 contract size for linear contracts
                pricePrecision: this.getPrecision(instrument.priceFilter.tickSize),
                quantityPrecision: this.getPrecision(instrument.lotSizeFilter.qtyStep),
                minQuantity: parseFloat(instrument.lotSizeFilter.minOrderQty),
                maxQuantity: parseFloat(instrument.lotSizeFilter.maxOrderQty),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching contract info for ${symbol} from Bybit:`, error);
            throw error;
        }
    }
    /**
     * Get contract information for multiple symbols
     */
    async fetchContractInfos(symbols) {
        const contractInfos = new Map();
        // Fetch all instruments at once
        try {
            const instruments = await this.makePublicRequest('/v5/market/instruments-info', {
                category: 'linear',
            });
            symbols.forEach(symbol => {
                const instrument = instruments.list.find(i => i.symbol === symbol);
                if (instrument) {
                    contractInfos.set(symbol, {
                        exchangeId: this.exchangeId,
                        symbol: instrument.symbol,
                        contractSize: 1,
                        pricePrecision: this.getPrecision(instrument.priceFilter.tickSize),
                        quantityPrecision: this.getPrecision(instrument.lotSizeFilter.qtyStep),
                        minQuantity: parseFloat(instrument.lotSizeFilter.minOrderQty),
                        maxQuantity: parseFloat(instrument.lotSizeFilter.maxOrderQty),
                    });
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching contract infos from Bybit:', error);
        }
        return contractInfos;
    }
    /**
     * Test connection to exchange
     */
    async testConnection() {
        try {
            logger_1.default.debug('Testing Bybit connection');
            // Test by fetching account balance
            await this.makeAuthenticatedRequest('GET', '/v5/account/wallet-balance', {
                accountType: 'UNIFIED',
            });
            logger_1.default.success('Bybit connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('Bybit connection test failed:', error);
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
    /**
     * Helper function to calculate precision from a decimal string
     */
    getPrecision(value) {
        if (!value || value === '0')
            return 8;
        const parts = value.split('.');
        return parts.length > 1 ? parts[1].length : 0;
    }
}
exports.BybitClient = BybitClient;
//# sourceMappingURL=bybitClient.js.map