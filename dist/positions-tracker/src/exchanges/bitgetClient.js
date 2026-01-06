"use strict";
/**
 * Bitget Exchange Client
 * Implements IExchangeClient interface for Bitget API V2
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
exports.BitgetClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const exchange_1 = require("../types/exchange");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../utils/errorHandler");
class BitgetClient {
    constructor(config) {
        this.exchangeId = 'BITGET';
        this.accessKey = config.accessKey;
        this.secretKey = config.secretKey;
        this.passphrase = config.passphrase;
        this.client = axios_1.default.create({
            baseURL: constants_1.BITGET.BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        logger_1.default.info(`Bitget client initialized for ${this.exchangeId}`);
    }
    /**
     * Get the exchange identifier
     */
    getExchangeId() {
        return this.exchangeId;
    }
    /**
     * Generate Bitget API signature
     */
    generateSignature(timestamp, method, requestPath, body) {
        const message = timestamp + method + requestPath + body;
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(message)
            .digest('base64');
    }
    /**
     * Make authenticated request to Bitget API
     */
    async makeAuthenticatedRequest(method, endpoint, params = {}) {
        const timestamp = Date.now().toString();
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
            'ACCESS-KEY': this.accessKey,
            'ACCESS-SIGN': signature,
            'ACCESS-TIMESTAMP': timestamp,
            'ACCESS-PASSPHRASE': this.passphrase,
            locale: 'en-US',
        };
        try {
            const response = await this.client.request({
                method,
                url: requestPath,
                headers,
            });
            if (response.data.code !== '00000') {
                throw new errorHandler_1.APIError(`Bitget API error: ${response.data.msg}`, parseInt(response.data.code), response.data);
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`Bitget API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Make public request to Bitget API (no authentication)
     */
    async makePublicRequest(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, {
                params,
            });
            if (response.data.code !== '00000') {
                throw new errorHandler_1.APIError(`Bitget API error: ${response.data.msg}`, parseInt(response.data.code), response.data);
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`Bitget API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Get all open positions
     */
    async fetchOpenPositions() {
        try {
            logger_1.default.debug('Fetching positions from Bitget');
            // Get positions for USDT-margined perpetual futures
            const positionData = await this.makeAuthenticatedRequest('GET', '/api/v2/mix/position/all-position', {
                productType: 'USDT-FUTURES',
                marginCoin: 'USDT',
            });
            // Filter positions with size > 0
            const openPositions = positionData.filter(pos => parseFloat(pos.total) > 0);
            // Log first position to see actual fields
            if (openPositions.length > 0) {
                logger_1.default.debug('Bitget position sample:', JSON.stringify(openPositions[0]));
            }
            const positions = openPositions.map(pos => {
                const total = parseFloat(pos.total);
                const avgPx = parseFloat(pos.openPriceAvg);
                const markPx = parseFloat(pos.markPrice);
                // Realized PnL calculation for Bitget:
                // - achievedProfits: Contains closing profit when position is closed
                // - totalFee: Accumulated funding fees (negative = paid)
                // - deductedFee: Transaction fees (always positive, need to negate)
                // For open positions: realizedPnL = totalFee - deductedFee
                // For closed positions: achievedProfits already includes everything
                const achievedProfits = parseFloat(pos.achievedProfits || '0');
                const totalFee = parseFloat(pos.totalFee || '0');
                const deductedFee = parseFloat(pos.deductedFee || '0');
                const realizedPnl = achievedProfits !== 0 ? achievedProfits : totalFee - deductedFee;
                return {
                    exchangeId: this.exchangeId,
                    symbol: pos.symbol,
                    positionType: pos.holdSide === 'long' ? exchange_1.PositionType.LONG : exchange_1.PositionType.SHORT,
                    size: total,
                    leverage: parseFloat(pos.leverage),
                    entryPrice: avgPx,
                    markPrice: markPx,
                    liquidationPrice: parseFloat(pos.liquidationPrice) || undefined,
                    unrealizedPnl: parseFloat(pos.unrealizedPL),
                    realizedPnl: realizedPnl,
                    margin: parseFloat(pos.marginSize),
                    timestamp: parseInt(pos.uTime),
                };
            });
            logger_1.default.info(`Fetched ${positions.length} positions from Bitget`);
            return positions;
        }
        catch (error) {
            logger_1.default.error('Error fetching positions from Bitget:', error);
            throw error;
        }
    }
    /**
     * Get funding rate for a specific symbol
     */
    async fetchFundingRate(symbol) {
        try {
            logger_1.default.debug(`Fetching funding rate for ${symbol} from Bitget`);
            // Bitget V2 returns an array
            const fundingData = await this.makePublicRequest('/api/v2/mix/market/current-fund-rate', {
                symbol,
                productType: 'USDT-FUTURES',
            });
            if (!fundingData || fundingData.length === 0) {
                throw new Error(`No funding rate data for ${symbol} on Bitget`);
            }
            const funding = fundingData[0];
            // Log the actual response to debug
            logger_1.default.debug(`Bitget funding rate response for ${symbol}:`, JSON.stringify(funding));
            // Bitget returns funding rate as decimal (e.g., 0.0001 for 0.01%)
            const rate = parseFloat(funding.fundingRate) * 100;
            const nextSettlementTime = parseInt(funding.nextUpdate);
            logger_1.default.debug(`Parsed funding data - rate: ${rate}, nextSettleTime: ${nextSettlementTime}`);
            return {
                exchangeId: this.exchangeId,
                symbol,
                rate,
                nextSettlementTime,
                timestamp: Date.now(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching funding rate for ${symbol} from Bitget:`, error);
            throw error;
        }
    }
    /**
     * Get funding rates for multiple symbols
     */
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        // Fetch funding rates individually
        await Promise.allSettled(symbols.map(async (symbol) => {
            try {
                const rate = await this.fetchFundingRate(symbol);
                fundingRates.set(symbol, rate);
            }
            catch {
                logger_1.default.warning(`Failed to fetch funding rate for ${symbol}`);
            }
        }));
        return fundingRates;
    }
    /**
     * Get fair/mark price for a specific symbol
     */
    async fetchFairPrice(symbol) {
        try {
            logger_1.default.debug(`Fetching fair price for ${symbol} from Bitget`);
            // Bitget V2 ticker returns an array
            const priceData = await this.makePublicRequest('/api/v2/mix/market/ticker', {
                symbol,
                productType: 'USDT-FUTURES',
            });
            if (!priceData || priceData.length === 0) {
                throw new Error(`No fair price data for ${symbol} on Bitget`);
            }
            const ticker = priceData[0];
            return {
                exchangeId: this.exchangeId,
                symbol,
                price: parseFloat(ticker.markPrice || ticker.markPr || '0'),
                timestamp: parseInt(ticker.timestamp || ticker.ts || Date.now().toString()),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching fair price for ${symbol} from Bitget:`, error);
            throw error;
        }
    }
    /**
     * Get fair/mark prices for multiple symbols
     */
    async fetchFairPrices(symbols) {
        const fairPrices = new Map();
        // Fetch prices individually
        await Promise.allSettled(symbols.map(async (symbol) => {
            try {
                const price = await this.fetchFairPrice(symbol);
                fairPrices.set(symbol, price);
            }
            catch {
                logger_1.default.warning(`Failed to fetch fair price for ${symbol}`);
            }
        }));
        return fairPrices;
    }
    /**
     * Get contract information for a specific symbol
     */
    async fetchContractInfo(symbol) {
        try {
            logger_1.default.debug(`Fetching contract info for ${symbol} from Bitget`);
            // Bitget V2 uses contracts endpoint (plural)
            const contractData = await this.makePublicRequest('/api/v2/mix/market/contracts', {
                productType: 'USDT-FUTURES',
            });
            if (!contractData || contractData.length === 0) {
                throw new Error(`No contract info for ${symbol} on Bitget`);
            }
            // Find the specific contract for our symbol
            const contract = contractData.find(c => c.symbol === symbol);
            if (!contract) {
                throw new Error(`Contract ${symbol} not found on Bitget`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol: contract.symbol,
                contractSize: parseFloat(contract.sizeMultiplier),
                pricePrecision: parseInt(contract.pricePlace),
                quantityPrecision: parseInt(contract.volumePlace),
                minQuantity: parseFloat(contract.minTradeNum),
                maxQuantity: parseFloat(contract.maxPositionNum),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching contract info for ${symbol} from Bitget:`, error);
            throw error;
        }
    }
    /**
     * Get contract information for multiple symbols
     */
    async fetchContractInfos(symbols) {
        const contractInfos = new Map();
        // Fetch contract infos individually
        await Promise.allSettled(symbols.map(async (symbol) => {
            try {
                const info = await this.fetchContractInfo(symbol);
                contractInfos.set(symbol, info);
            }
            catch {
                logger_1.default.warning(`Failed to fetch contract info for ${symbol}`);
            }
        }));
        return contractInfos;
    }
    /**
     * Test connection to exchange
     */
    async testConnection() {
        try {
            logger_1.default.debug('Testing Bitget connection');
            // Test by fetching account info
            await this.makeAuthenticatedRequest('GET', '/api/v2/mix/account/accounts', {
                productType: 'USDT-FUTURES',
            });
            logger_1.default.success('Bitget connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('Bitget connection test failed:', error);
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
exports.BitgetClient = BitgetClient;
//# sourceMappingURL=bitgetClient.js.map