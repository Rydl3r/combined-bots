"use strict";
/**
 * MEXC Exchange Client
 * Implements the IExchangeClient interface for MEXC exchange
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
exports.MexcClient = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const constants_1 = require("../constants");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
class MexcClient {
    constructor(credentials, baseUrl) {
        this.accessKey = credentials.accessKey;
        this.secretKey = credentials.secretKey;
        this.baseUrl = baseUrl || constants_1.MEXC.BASE_URL;
        this.axiosInstance = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 10000,
        });
    }
    getExchangeId() {
        return 'MEXC';
    }
    /**
     * Generate MEXC API signature
     */
    generateSignature(queryString) {
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(queryString)
            .digest('hex');
    }
    /**
     * Create authenticated request headers
     */
    createAuthenticatedRequest(params = {}) {
        const timestamp = Date.now().toString();
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
            .join('&');
        const signatureTarget = this.accessKey + timestamp + sortedParams;
        const signature = this.generateSignature(signatureTarget);
        return {
            params,
            headers: {
                ApiKey: this.accessKey,
                'Request-Time': timestamp,
                Signature: signature,
                'Content-Type': 'application/json',
                'Recv-Window': '5000',
            },
        };
    }
    /**
     * Convert MEXC position to common Position interface
     */
    convertPosition(mexcPosition) {
        return {
            exchangeId: 'MEXC',
            symbol: mexcPosition.symbol,
            positionType: mexcPosition.positionType,
            size: parseFloat(mexcPosition.holdVol),
            entryPrice: parseFloat(mexcPosition.holdAvgPrice || mexcPosition.openAvgPrice),
            liquidationPrice: mexcPosition.liquidatePrice
                ? parseFloat(mexcPosition.liquidatePrice)
                : undefined,
            leverage: parseFloat(mexcPosition.leverage),
            margin: parseFloat(mexcPosition.im),
            unrealizedPnl: 0, // Will be calculated later
            realizedPnl: parseFloat(mexcPosition.realised),
            rawData: mexcPosition,
        };
    }
    async fetchOpenPositions() {
        try {
            const { params, headers } = this.createAuthenticatedRequest();
            const queryString = Object.keys(params).length > 0
                ? '?' +
                    Object.keys(params)
                        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
                        .join('&')
                : '';
            const response = await this.axiosInstance.get(`/api/v1/private/position/open_positions${queryString}`, { headers });
            if (response.data.code !== constants_1.MEXC.API_SUCCESS_CODE) {
                throw new errorHandler_1.APIError(`MEXC API Error: ${response.data.msg || 'Unknown error'}`, response.status, response.data);
            }
            const positions = (response.data.data || []).map(pos => this.convertPosition(pos));
            logger_1.default.info(`Fetched ${positions.length} positions from MEXC`);
            return positions;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            if (axios_1.default.isAxiosError(error)) {
                if (error.response) {
                    const errorMsg = error.response.data?.msg || error.response.statusText;
                    throw new Error(`MEXC API Error (${error.response.status}): ${errorMsg}`);
                }
                else if (error.request) {
                    throw new Error('MEXC API: No response received - check network connection');
                }
            }
            throw new Error('MEXC API Request Error: Unknown error');
        }
    }
    async fetchFundingRate(symbol) {
        try {
            const response = await this.axiosInstance.get(`/api/v1/contract/funding_rate/${symbol}`);
            if (response.data.code !== constants_1.MEXC.API_SUCCESS_CODE) {
                throw new errorHandler_1.APIError(`MEXC API Error: ${response.data.msg || 'Unknown error'}`, response.status, response.data);
            }
            const data = response.data.data;
            return {
                exchangeId: 'MEXC',
                symbol,
                rate: parseFloat(data.fundingRate) * 100, // Convert to percentage
                nextSettlementTime: data.nextSettleTime,
                rawData: data,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching funding rate for ${symbol}:`, error);
            throw error;
        }
    }
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        await Promise.all(symbols.map(async (symbol) => {
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
    async fetchFairPrice(symbol) {
        try {
            const response = await this.axiosInstance.get(`/api/v1/contract/fair_price/${symbol}`);
            if (response.data.code !== constants_1.MEXC.API_SUCCESS_CODE) {
                throw new errorHandler_1.APIError(`MEXC API Error: ${response.data.msg || 'Unknown error'}`, response.status, response.data);
            }
            const data = response.data.data;
            return {
                exchangeId: 'MEXC',
                symbol,
                price: parseFloat(data.fairPrice),
                timestamp: Date.now(),
                rawData: data,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching fair price for ${symbol}:`, error);
            throw error;
        }
    }
    async fetchFairPrices(symbols) {
        const fairPrices = new Map();
        await Promise.all(symbols.map(async (symbol) => {
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
    async fetchContractInfo(symbol) {
        const allContracts = await this.fetchAllContractInfo();
        const contract = allContracts.find(c => c.symbol === symbol);
        if (!contract) {
            throw new Error(`Contract info not found for ${symbol}`);
        }
        return contract;
    }
    async fetchContractInfos(symbols) {
        const allContracts = await this.fetchAllContractInfo();
        const contractMap = new Map();
        allContracts.forEach(contract => {
            if (symbols.includes(contract.symbol)) {
                contractMap.set(contract.symbol, contract);
            }
        });
        return contractMap;
    }
    /**
     * Fetch all contract information
     */
    async fetchAllContractInfo() {
        try {
            const response = await this.axiosInstance.get('/api/v1/contract/detail');
            if (response.data && response.data.success && response.data.data) {
                return response.data.data.map(contract => ({
                    exchangeId: 'MEXC',
                    symbol: contract.symbol,
                    contractSize: parseFloat(contract.contractSize || '0') ||
                        constants_1.MEXC.DEFAULT_CONTRACT_SIZE,
                    pricePrecision: contract.priceUnit || 4,
                    quantityPrecision: contract.volumeUnit || 0,
                    minQuantity: contract.minVol,
                    maxQuantity: contract.maxVol,
                    rawData: contract,
                }));
            }
            throw new Error('Failed to fetch contract information');
        }
        catch (error) {
            logger_1.default.error('Error fetching contract information:', error);
            throw error;
        }
    }
    async testConnection() {
        try {
            await this.fetchOpenPositions();
            return true;
        }
        catch (error) {
            logger_1.default.error('MEXC API connection test failed:', error);
            return false;
        }
    }
    async fetchAllPositionData() {
        try {
            logger_1.default.info('Fetching all position data from MEXC...');
            const positions = await this.fetchOpenPositions();
            if (positions.length === 0) {
                return {
                    success: true,
                    positions: [],
                    fundingRates: new Map(),
                    fairPrices: new Map(),
                    contractInfo: new Map(),
                };
            }
            const symbols = positions.map(p => p.symbol);
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
            logger_1.default.error('Error fetching all position data:', error);
            return {
                success: false,
                positions: [],
                fundingRates: new Map(),
                fairPrices: new Map(),
                contractInfo: new Map(),
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
}
exports.MexcClient = MexcClient;
//# sourceMappingURL=mexcClient.js.map