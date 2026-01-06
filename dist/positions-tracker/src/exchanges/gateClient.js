"use strict";
/**
 * Gate.io Exchange Client
 * Implements IExchangeClient interface for Gate.io API
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
exports.GateClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const exchange_1 = require("../types/exchange");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../utils/errorHandler");
class GateClient {
    constructor(config) {
        this.exchangeId = 'GATE';
        this.accessKey = config.accessKey;
        this.secretKey = config.secretKey;
        this.client = axios_1.default.create({
            baseURL: constants_1.GATE.BASE_URL,
            timeout: constants_1.GATE.TIMEOUT,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        logger_1.default.info(`Gate.io client initialized for ${this.exchangeId}`);
    }
    /**
     * Get the exchange identifier
     */
    getExchangeId() {
        return this.exchangeId;
    }
    /**
     * Generate Gate.io API signature
     */
    generateSignature(method, url, queryString, bodyPayload, timestamp) {
        // Hash the request body if it exists
        const hashedPayload = bodyPayload
            ? crypto.createHash('sha512').update(bodyPayload).digest('hex')
            : crypto.createHash('sha512').update('').digest('hex');
        // Create signature string: METHOD\nURL\nQUERY_STRING\nHASHED_PAYLOAD\nTIMESTAMP
        const signatureString = `${method}\n${url}\n${queryString}\n${hashedPayload}\n${timestamp}`;
        // Sign with HMAC SHA512
        const signature = crypto
            .createHmac('sha512', this.secretKey)
            .update(signatureString)
            .digest('hex');
        return signature;
    }
    /**
     * Make authenticated request to Gate.io API
     */
    async makeAuthenticatedRequest(method, endpoint, queryParams = {}, body = null) {
        const timestamp = Math.floor(Date.now() / 1000);
        const queryString = new URLSearchParams(queryParams).toString();
        const bodyPayload = body ? JSON.stringify(body) : '';
        const signature = this.generateSignature(method, endpoint, queryString, bodyPayload, timestamp);
        const headers = {
            KEY: this.accessKey,
            Timestamp: timestamp.toString(),
            SIGN: signature,
        };
        try {
            const url = queryString ? `${endpoint}?${queryString}` : endpoint;
            const response = await this.client.request({
                method,
                url,
                headers,
                data: bodyPayload || undefined,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorData = error.response?.data;
                throw new errorHandler_1.APIError(`Gate.io API error: ${error.message}`, statusCode || null, errorData);
            }
            throw error;
        }
    }
    /**
     * Get all open positions
     */
    async fetchOpenPositions() {
        try {
            logger_1.default.debug('Fetching positions from Gate.io');
            // Get USDT perpetual positions
            const gatePositions = await this.makeAuthenticatedRequest('GET', '/api/v4/futures/usdt/positions');
            // Filter only positions with size (open positions)
            const openPositions = gatePositions.filter(pos => pos.size !== 0 && pos.size !== null);
            const positions = openPositions.map(pos => ({
                exchangeId: this.exchangeId,
                symbol: pos.contract,
                positionType: pos.size > 0 ? exchange_1.PositionType.LONG : exchange_1.PositionType.SHORT,
                size: Math.abs(pos.size),
                leverage: parseFloat(pos.leverage),
                entryPrice: parseFloat(pos.entry_price),
                markPrice: parseFloat(pos.mark_price),
                liquidationPrice: pos.liq_price ? parseFloat(pos.liq_price) : undefined,
                unrealizedPnl: parseFloat(pos.unrealised_pnl),
                realizedPnl: parseFloat(pos.realised_pnl),
                margin: parseFloat(pos.margin),
                timestamp: pos.update_time * 1000, // Convert to milliseconds
            }));
            logger_1.default.info(`Fetched ${positions.length} positions from Gate.io`);
            return positions;
        }
        catch (error) {
            logger_1.default.error('Error fetching positions from Gate.io:', error);
            throw error;
        }
    }
    /**
     * Get funding rate for a specific symbol
     */
    async fetchFundingRate(symbol) {
        try {
            logger_1.default.debug(`Fetching funding rate for ${symbol} from Gate.io`);
            // Get contract info which includes current funding rate
            const contract = await this.makeAuthenticatedRequest('GET', `/api/v4/futures/usdt/contracts/${symbol}`);
            if (!contract || !contract.funding_rate) {
                throw new Error(`No funding rate data for ${symbol} on Gate.io`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol,
                rate: parseFloat(contract.funding_rate) * 100, // Convert to percentage
                nextSettlementTime: contract.funding_next_apply * 1000, // Convert to milliseconds
                timestamp: Date.now(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching funding rate for ${symbol} from Gate.io:`, error);
            throw error;
        }
    }
    /**
     * Get funding rates for multiple symbols
     */
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        // Fetch funding rates in parallel
        const results = await Promise.allSettled(symbols.map(symbol => this.fetchFundingRate(symbol)));
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                fundingRates.set(symbols[index], result.value);
            }
            else {
                logger_1.default.warning(`Failed to fetch funding rate for ${symbols[index]}:`, result.reason);
            }
        });
        return fundingRates;
    }
    /**
     * Get fair/mark price for a specific symbol
     */
    async fetchFairPrice(symbol) {
        try {
            logger_1.default.debug(`Fetching fair price for ${symbol} from Gate.io`);
            // Get contract info which includes mark price and index price
            const contract = await this.makeAuthenticatedRequest('GET', `/api/v4/futures/usdt/contracts/${symbol}`);
            if (!contract) {
                throw new Error(`No fair price data for ${symbol} on Gate.io`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol,
                price: parseFloat(contract.mark_price),
                timestamp: Date.now(),
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching fair price for ${symbol} from Gate.io:`, error);
            throw error;
        }
    }
    /**
     * Get fair/mark prices for multiple symbols
     */
    async fetchFairPrices(symbols) {
        const fairPrices = new Map();
        // Fetch fair prices in parallel
        const results = await Promise.allSettled(symbols.map(symbol => this.fetchFairPrice(symbol)));
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                fairPrices.set(symbols[index], result.value);
            }
            else {
                logger_1.default.warning(`Failed to fetch fair price for ${symbols[index]}:`, result.reason);
            }
        });
        return fairPrices;
    }
    /**
     * Get contract information for a specific symbol
     */
    async fetchContractInfo(symbol) {
        try {
            logger_1.default.debug(`Fetching contract info for ${symbol} from Gate.io`);
            const contract = await this.makeAuthenticatedRequest('GET', `/api/v4/futures/usdt/contracts/${symbol}`);
            if (!contract) {
                throw new Error(`No contract info for ${symbol} on Gate.io`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol: contract.name,
                contractSize: parseFloat(contract.quanto_multiplier),
                pricePrecision: this.getPrecision(contract.mark_price_round),
                quantityPrecision: 0, // Gate uses integer quantities
                minQuantity: contract.order_size_min,
                maxQuantity: contract.order_size_max,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching contract info for ${symbol} from Gate.io:`, error);
            throw error;
        }
    }
    /**
     * Get contract information for multiple symbols
     */
    async fetchContractInfos(symbols) {
        const contractInfos = new Map();
        // Fetch contract infos in parallel
        const results = await Promise.allSettled(symbols.map(symbol => this.fetchContractInfo(symbol)));
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                contractInfos.set(symbols[index], result.value);
            }
            else {
                logger_1.default.warning(`Failed to fetch contract info for ${symbols[index]}:`, result.reason);
            }
        });
        return contractInfos;
    }
    /**
     * Test connection to exchange
     */
    async testConnection() {
        try {
            logger_1.default.debug('Testing Gate.io connection');
            // Test by fetching account info
            await this.makeAuthenticatedRequest('GET', '/api/v4/futures/usdt/accounts');
            logger_1.default.success('Gate.io connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('Gate.io connection test failed:', error);
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
exports.GateClient = GateClient;
//# sourceMappingURL=gateClient.js.map