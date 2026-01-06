"use strict";
/**
 * KuCoin Exchange Client
 * Implements IExchangeClient interface for KuCoin Futures API
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
exports.KucoinClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const exchange_1 = require("../types/exchange");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../utils/errorHandler");
class KucoinClient {
    constructor(config) {
        this.exchangeId = 'KUCOIN';
        this.accessKey = config.accessKey;
        this.secretKey = config.secretKey;
        this.passphrase = config.passphrase;
        this.client = axios_1.default.create({
            baseURL: constants_1.KUCOIN.BASE_URL,
            timeout: constants_1.KUCOIN.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        logger_1.default.info(`KuCoin client initialized for ${this.exchangeId}`);
    }
    /**
     * Get the exchange identifier
     */
    getExchangeId() {
        return this.exchangeId;
    }
    /**
     * Generate KuCoin API signature
     */
    generateSignature(timestamp, method, endpoint, body) {
        const strToSign = timestamp + method + endpoint + body;
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(strToSign)
            .digest('base64');
    }
    /**
     * Generate encrypted passphrase
     */
    encryptPassphrase() {
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(this.passphrase)
            .digest('base64');
    }
    /**
     * Make authenticated request to KuCoin API
     */
    async makeAuthenticatedRequest(method, endpoint, params = {}) {
        const timestamp = Date.now();
        const queryString = Object.keys(params).length > 0
            ? '?' +
                Object.entries(params)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&')
            : '';
        const fullEndpoint = endpoint + queryString;
        const body = '';
        const signature = this.generateSignature(timestamp, method, fullEndpoint, body);
        const passphrase = this.encryptPassphrase();
        const headers = {
            'KC-API-KEY': this.accessKey,
            'KC-API-SIGN': signature,
            'KC-API-TIMESTAMP': timestamp.toString(),
            'KC-API-PASSPHRASE': passphrase,
            'KC-API-KEY-VERSION': '2',
        };
        try {
            const response = await this.client.request({
                method,
                url: fullEndpoint,
                headers,
            });
            if (response.data.code !== '200000') {
                throw new errorHandler_1.APIError(`KuCoin API error: ${response.data.msg || 'Unknown error'}`, parseInt(response.data.code), response.data);
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`KuCoin API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Make public request to KuCoin API (no authentication)
     */
    async makePublicRequest(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, {
                params,
            });
            if (response.data.code !== '200000') {
                throw new errorHandler_1.APIError(`KuCoin API error: ${response.data.msg || 'Unknown error'}`, parseInt(response.data.code), response.data);
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`KuCoin API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Get all open positions
     */
    async fetchOpenPositions() {
        try {
            logger_1.default.debug('Fetching positions from KuCoin');
            // Get all positions
            const positionData = await this.makeAuthenticatedRequest('GET', '/api/v1/positions');
            // Filter only open positions
            const openPositions = positionData.filter(pos => pos.isOpen);
            const positions = openPositions.map(pos => {
                return {
                    exchangeId: this.exchangeId,
                    symbol: pos.symbol,
                    positionType: pos.currentQty > 0 ? exchange_1.PositionType.LONG : exchange_1.PositionType.SHORT,
                    size: Math.abs(pos.currentQty),
                    leverage: pos.realLeverage,
                    entryPrice: pos.avgEntryPrice,
                    markPrice: pos.markPrice,
                    liquidationPrice: pos.liquidationPrice || undefined,
                    unrealizedPnl: pos.unrealisedPnl,
                    realizedPnl: pos.realisedPnl,
                    margin: pos.posMargin,
                    timestamp: pos.currentTimestamp,
                };
            });
            logger_1.default.info(`Fetched ${positions.length} positions from KuCoin`);
            return positions;
        }
        catch (error) {
            logger_1.default.error('Error fetching positions from KuCoin:', error);
            throw error;
        }
    }
    /**
     * Get funding rate for a specific symbol
     */
    async fetchFundingRate(symbol) {
        try {
            logger_1.default.debug(`Fetching funding rate for ${symbol} from KuCoin`);
            const contract = await this.makePublicRequest(`/api/v1/contracts/${symbol}`);
            if (!contract) {
                throw new Error(`No funding rate data for ${symbol} on KuCoin`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol,
                rate: contract.fundingFeeRate * 100, // Convert to percentage
                nextSettlementTime: contract.nextFundingRateTime,
                timestamp: Date.now(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching funding rate for ${symbol} from KuCoin:`, error);
            throw error;
        }
    }
    /**
     * Get funding rates for multiple symbols
     */
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        // KuCoin doesn't have a batch endpoint, fetch individually
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
            logger_1.default.debug(`Fetching fair price for ${symbol} from KuCoin`);
            const contract = await this.makePublicRequest(`/api/v1/contracts/${symbol}`);
            if (!contract) {
                throw new Error(`No fair price data for ${symbol} on KuCoin`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol,
                price: contract.markPrice,
                timestamp: Date.now(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching fair price for ${symbol} from KuCoin:`, error);
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
            logger_1.default.debug(`Fetching contract info for ${symbol} from KuCoin`);
            const contract = await this.makePublicRequest(`/api/v1/contracts/${symbol}`);
            if (!contract) {
                throw new Error(`No contract info for ${symbol} on KuCoin`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol: contract.symbol,
                contractSize: contract.multiplier,
                pricePrecision: this.getPrecision(contract.tickSize.toString()),
                quantityPrecision: this.getPrecision(contract.lotSize.toString()),
                minQuantity: contract.lotSize,
                maxQuantity: contract.maxOrderQty,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching contract info for ${symbol} from KuCoin:`, error);
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
            logger_1.default.debug('Testing KuCoin connection');
            // Test by fetching account overview
            await this.makeAuthenticatedRequest('GET', '/api/v1/account-overview');
            logger_1.default.success('KuCoin connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('KuCoin connection test failed:', error);
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
exports.KucoinClient = KucoinClient;
//# sourceMappingURL=kucoinClient.js.map