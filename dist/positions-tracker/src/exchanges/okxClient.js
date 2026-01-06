"use strict";
/**
 * OKX Exchange Client
 * Implements IExchangeClient interface for OKX API V5
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
exports.OkxClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const exchange_1 = require("../types/exchange");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../utils/errorHandler");
class OkxClient {
    constructor(config) {
        this.exchangeId = 'OKX';
        this.accessKey = config.accessKey;
        this.secretKey = config.secretKey;
        this.passphrase = config.passphrase;
        this.client = axios_1.default.create({
            baseURL: constants_1.OKX.BASE_URL,
            timeout: constants_1.OKX.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        logger_1.default.info(`OKX client initialized for ${this.exchangeId}`);
    }
    /**
     * Get the exchange identifier
     */
    getExchangeId() {
        return this.exchangeId;
    }
    /**
     * Generate OKX API signature
     */
    generateSignature(timestamp, method, requestPath, body) {
        const message = timestamp + method + requestPath + body;
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(message)
            .digest('base64');
    }
    /**
     * Make authenticated request to OKX API
     */
    async makeAuthenticatedRequest(method, endpoint, params = {}) {
        const timestamp = new Date().toISOString();
        const queryString = Object.keys(params).length > 0
            ? '?' +
                Object.entries(params)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&')
            : '';
        const requestPath = endpoint + queryString;
        const body = '';
        const signature = this.generateSignature(timestamp, method, requestPath, body);
        const headers = {
            'OK-ACCESS-KEY': this.accessKey,
            'OK-ACCESS-SIGN': signature,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this.passphrase,
        };
        try {
            const response = await this.client.request({
                method,
                url: requestPath,
                headers,
            });
            if (response.data.code !== '0') {
                throw new errorHandler_1.APIError(`OKX API error: ${response.data.msg}`, parseInt(response.data.code), response.data);
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`OKX API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Make public request to OKX API (no authentication)
     */
    async makePublicRequest(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, {
                params,
            });
            if (response.data.code !== '0') {
                throw new errorHandler_1.APIError(`OKX API error: ${response.data.msg}`, parseInt(response.data.code), response.data);
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`OKX API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Get all open positions
     */
    async fetchOpenPositions() {
        try {
            logger_1.default.debug('Fetching positions from OKX');
            // Get positions for SWAP (perpetual futures)
            const positionData = await this.makeAuthenticatedRequest('GET', '/api/v5/account/positions', {
                instType: 'SWAP',
            });
            // Filter positions with size > 0
            const openPositions = positionData.filter(pos => parseFloat(pos.pos) !== 0);
            const positions = openPositions.map(pos => {
                const posSize = parseFloat(pos.pos);
                return {
                    exchangeId: this.exchangeId,
                    symbol: pos.instId,
                    positionType: posSize > 0 ? exchange_1.PositionType.LONG : exchange_1.PositionType.SHORT,
                    size: Math.abs(posSize),
                    leverage: parseFloat(pos.lever),
                    entryPrice: parseFloat(pos.avgPx),
                    markPrice: parseFloat(pos.markPx),
                    liquidationPrice: parseFloat(pos.liqPx) || undefined,
                    unrealizedPnl: parseFloat(pos.upl),
                    realizedPnl: parseFloat(pos.realizedPnl),
                    margin: parseFloat(pos.margin),
                    timestamp: parseInt(pos.uTime),
                };
            });
            logger_1.default.info(`Fetched ${positions.length} positions from OKX`);
            return positions;
        }
        catch (error) {
            logger_1.default.error('Error fetching positions from OKX:', error);
            throw error;
        }
    }
    /**
     * Get funding rate for a specific symbol
     */
    async fetchFundingRate(symbol) {
        try {
            logger_1.default.debug(`Fetching funding rate for ${symbol} from OKX`);
            const fundingData = await this.makePublicRequest('/api/v5/public/funding-rate', {
                instId: symbol,
            });
            if (!fundingData || fundingData.length === 0) {
                throw new Error(`No funding rate data for ${symbol} on OKX`);
            }
            const funding = fundingData[0];
            // OKX funding occurs every 8 hours at 00:00, 08:00, 16:00 UTC
            // If nextFundingTime is in the past, add 8 hours
            let nextSettlementTime = parseInt(funding.nextFundingTime);
            const now = Date.now();
            if (nextSettlementTime <= now) {
                nextSettlementTime += 8 * 60 * 60 * 1000; // Add 8 hours in milliseconds
            }
            return {
                exchangeId: this.exchangeId,
                symbol,
                rate: parseFloat(funding.fundingRate) * 100, // Convert to percentage
                nextSettlementTime,
                timestamp: now,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching funding rate for ${symbol} from OKX:`, error);
            throw error;
        }
    }
    /**
     * Get funding rates for multiple symbols
     */
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        // Fetch funding rates individually for better error handling
        await Promise.allSettled(symbols.map(async (symbol) => {
            try {
                const fundingData = await this.makePublicRequest('/api/v5/public/funding-rate', {
                    instId: symbol,
                });
                if (fundingData && fundingData.length > 0) {
                    const funding = fundingData[0];
                    // OKX funding occurs every 8 hours at 00:00, 08:00, 16:00 UTC
                    // If nextFundingTime is in the past, add 8 hours
                    let nextSettlementTime = parseInt(funding.nextFundingTime);
                    const now = Date.now();
                    if (nextSettlementTime <= now) {
                        nextSettlementTime += 8 * 60 * 60 * 1000; // Add 8 hours in milliseconds
                    }
                    fundingRates.set(symbol, {
                        exchangeId: this.exchangeId,
                        symbol: funding.instId,
                        rate: parseFloat(funding.fundingRate) * 100,
                        nextSettlementTime,
                        timestamp: now,
                    });
                }
                else {
                    logger_1.default.warning(`No funding rate data returned for ${symbol} from OKX`);
                }
            }
            catch (error) {
                logger_1.default.warning(`Failed to fetch funding rate for ${symbol} from OKX:`, error);
            }
        }));
        return fundingRates;
    }
    /**
     * Get fair/mark price for a specific symbol
     */
    async fetchFairPrice(symbol) {
        try {
            logger_1.default.debug(`Fetching fair price for ${symbol} from OKX`);
            const priceData = await this.makePublicRequest('/api/v5/public/mark-price', {
                instType: 'SWAP',
                instId: symbol,
            });
            if (!priceData || priceData.length === 0) {
                throw new Error(`No fair price data for ${symbol} on OKX`);
            }
            const price = priceData[0];
            return {
                exchangeId: this.exchangeId,
                symbol,
                price: parseFloat(price.markPx),
                timestamp: parseInt(price.ts),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching fair price for ${symbol} from OKX:`, error);
            throw error;
        }
    }
    /**
     * Get fair/mark prices for multiple symbols
     */
    async fetchFairPrices(symbols) {
        const fairPrices = new Map();
        // OKX allows fetching all mark prices at once
        try {
            const priceData = await this.makePublicRequest('/api/v5/public/mark-price', {
                instType: 'SWAP',
            });
            // Filter for symbols we care about
            priceData.forEach(price => {
                if (symbols.includes(price.instId)) {
                    fairPrices.set(price.instId, {
                        exchangeId: this.exchangeId,
                        symbol: price.instId,
                        price: parseFloat(price.markPx),
                        timestamp: parseInt(price.ts),
                    });
                }
            });
        }
        catch {
            logger_1.default.warning('Failed to fetch fair prices from OKX');
        }
        return fairPrices;
    }
    /**
     * Get contract information for a specific symbol
     */
    async fetchContractInfo(symbol) {
        try {
            logger_1.default.debug(`Fetching contract info for ${symbol} from OKX`);
            const instrumentData = await this.makePublicRequest('/api/v5/public/instruments', {
                instType: 'SWAP',
                instId: symbol,
            });
            if (!instrumentData || instrumentData.length === 0) {
                throw new Error(`No contract info for ${symbol} on OKX`);
            }
            const instrument = instrumentData[0];
            return {
                exchangeId: this.exchangeId,
                symbol: instrument.instId,
                contractSize: parseFloat(instrument.ctVal),
                pricePrecision: this.getPrecision(instrument.tickSz),
                quantityPrecision: this.getPrecision(instrument.lotSz),
                minQuantity: parseFloat(instrument.minSz),
                maxQuantity: parseFloat(instrument.maxMktSz),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching contract info for ${symbol} from OKX:`, error);
            throw error;
        }
    }
    /**
     * Get contract information for multiple symbols
     */
    async fetchContractInfos(symbols) {
        const contractInfos = new Map();
        // OKX allows fetching all instruments at once
        try {
            const instrumentData = await this.makePublicRequest('/api/v5/public/instruments', {
                instType: 'SWAP',
            });
            // Filter for symbols we care about
            instrumentData.forEach(instrument => {
                if (symbols.includes(instrument.instId)) {
                    contractInfos.set(instrument.instId, {
                        exchangeId: this.exchangeId,
                        symbol: instrument.instId,
                        contractSize: parseFloat(instrument.ctVal),
                        pricePrecision: this.getPrecision(instrument.tickSz),
                        quantityPrecision: this.getPrecision(instrument.lotSz),
                        minQuantity: parseFloat(instrument.minSz),
                        maxQuantity: parseFloat(instrument.maxMktSz),
                    });
                }
            });
        }
        catch {
            logger_1.default.warning('Failed to fetch contract infos from OKX');
        }
        return contractInfos;
    }
    /**
     * Test connection to exchange
     */
    async testConnection() {
        try {
            logger_1.default.debug('Testing OKX connection');
            // Test by fetching account balance
            await this.makeAuthenticatedRequest('GET', '/api/v5/account/balance');
            logger_1.default.success('OKX connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('OKX connection test failed:', error);
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
     * Helper function to calculate precision from a decimal number
     */
    getPrecision(value) {
        if (!value || value === '0')
            return 8;
        const parts = value.split('.');
        return parts.length > 1 ? parts[1].length : 0;
    }
}
exports.OkxClient = OkxClient;
//# sourceMappingURL=okxClient.js.map