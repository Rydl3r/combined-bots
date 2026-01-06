"use strict";
/**
 * BingX Exchange Client
 * Implements IExchangeClient interface for BingX Perpetual Futures API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BingxClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const exchange_1 = require("../types/exchange");
const logger_1 = __importDefault(require("../utils/logger"));
const constants_1 = require("../constants");
class BingxClient {
    constructor(config) {
        this.exchangeId = 'BINGX';
        this.secretKey = config.secretKey;
        this.client = axios_1.default.create({
            baseURL: constants_1.BINGX.BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-BX-APIKEY': config.accessKey,
            },
        });
    }
    generateSignature(queryString) {
        return crypto_1.default
            .createHmac('sha256', this.secretKey)
            .update(queryString)
            .digest('hex');
    }
    async makeRequest(endpoint, params = {}) {
        try {
            const timestamp = Date.now();
            const queryParams = {
                ...params,
                timestamp,
            };
            // Build query string
            const queryString = Object.keys(queryParams)
                .sort()
                .map(key => `${key}=${queryParams[key]}`)
                .join('&');
            // Generate signature
            const signature = this.generateSignature(queryString);
            // Make request
            const response = await this.client.get(`${endpoint}?${queryString}&signature=${signature}`);
            if (response.data.code !== 0) {
                throw new Error(`BingX API error: ${response.data.msg || 'Unknown error'}`);
            }
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                logger_1.default.error(`BingX API request failed for ${endpoint}:`, error.response?.data || error.message);
            }
            throw error;
        }
    }
    async getPositions() {
        return this.fetchOpenPositions();
    }
    getExchangeId() {
        return this.exchangeId;
    }
    async fetchOpenPositions() {
        try {
            const positions = (await this.makeRequest('/openApi/swap/v2/user/positions'));
            if (!positions || positions.length === 0) {
                return [];
            }
            // Filter out positions with zero amount
            const openPositions = positions.filter(pos => parseFloat(pos.positionAmt) !== 0);
            if (openPositions.length === 0) {
                return [];
            }
            // Debug: Log first position to see structure
            logger_1.default.debug('BingX position sample:', JSON.stringify(openPositions[0]));
            return openPositions.map(pos => {
                const posAmt = parseFloat(pos.positionAmt);
                return {
                    exchangeId: this.exchangeId,
                    symbol: pos.symbol,
                    positionType: pos.positionSide === 'LONG'
                        ? exchange_1.PositionType.LONG
                        : exchange_1.PositionType.SHORT,
                    size: Math.abs(posAmt),
                    leverage: parseFloat(pos.leverage),
                    entryPrice: parseFloat(pos.avgPrice),
                    markPrice: parseFloat(pos.markPrice),
                    liquidationPrice: parseFloat(pos.liquidationPrice) || undefined,
                    unrealizedPnl: parseFloat(pos.unrealizedProfit),
                    realizedPnl: parseFloat(pos.realisedProfit),
                    margin: parseFloat(pos.initialMargin),
                    timestamp: pos.updateTime,
                };
            });
        }
        catch (error) {
            logger_1.default.error('Error fetching positions from BingX:', error);
            throw error;
        }
    }
    async getFundingRate(symbol) {
        return this.fetchFundingRate(symbol);
    }
    async fetchFundingRate(symbol) {
        try {
            // Get premium index which contains next funding time
            const premiumIndex = (await this.makeRequest('/openApi/swap/v2/quote/premiumIndex', { symbol }));
            logger_1.default.debug(`BingX funding rate response for ${symbol}:`, JSON.stringify(premiumIndex));
            // BingX returns funding rate as decimal (e.g., 0.0001 for 0.01%)
            const rate = parseFloat(premiumIndex.lastFundingRate) * 100;
            const nextSettlementTime = premiumIndex.nextFundingTime;
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
            logger_1.default.error(`Error fetching funding rate for ${symbol} from BingX:`, error);
            throw error;
        }
    }
    async testConnection() {
        try {
            // Test by fetching account balance
            await this.makeRequest('/openApi/swap/v2/user/balance');
            return true;
        }
        catch (error) {
            logger_1.default.error('BingX connection test failed:', error);
            return false;
        }
    }
    async fetchFundingRates(symbols) {
        const fundingRates = new Map();
        await Promise.all(symbols.map(async (symbol) => {
            try {
                const rate = await this.fetchFundingRate(symbol);
                fundingRates.set(symbol, rate);
            }
            catch (error) {
                logger_1.default.error(`Error fetching funding rate for ${symbol}:`, error);
            }
        }));
        return fundingRates;
    }
    async fetchFairPrice(symbol) {
        try {
            const premiumIndex = (await this.makeRequest('/openApi/swap/v2/quote/premiumIndex', { symbol }));
            return {
                exchangeId: this.exchangeId,
                symbol,
                price: parseFloat(premiumIndex.markPrice),
                timestamp: premiumIndex.time,
                rawData: premiumIndex,
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
            catch (error) {
                logger_1.default.error(`Error fetching fair price for ${symbol}:`, error);
            }
        }));
        return fairPrices;
    }
    async fetchContractInfo(symbol) {
        try {
            const response = await this.client.get('/openApi/swap/v2/quote/contracts');
            const contracts = response.data.data;
            if (!Array.isArray(contracts)) {
                throw new Error('Invalid contracts response');
            }
            const contract = contracts.find(c => c.symbol === symbol);
            if (!contract) {
                throw new Error(`Contract not found for ${symbol}`);
            }
            return {
                exchangeId: this.exchangeId,
                symbol: contract.symbol,
                contractSize: parseFloat(contract.size || '1'),
                pricePrecision: parseInt(contract.pricePrecision || '2'),
                quantityPrecision: parseInt(contract.quantityPrecision || '2'),
                minQuantity: parseFloat(contract.minTradeNum || '0'),
                maxQuantity: parseFloat(contract.maxTradeNum || '0'),
                rawData: contract,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching contract info for ${symbol}:`, error);
            throw error;
        }
    }
    async fetchContractInfos(symbols) {
        const contractInfos = new Map();
        await Promise.all(symbols.map(async (symbol) => {
            try {
                const info = await this.fetchContractInfo(symbol);
                contractInfos.set(symbol, info);
            }
            catch (error) {
                logger_1.default.error(`Error fetching contract info for ${symbol}:`, error);
            }
        }));
        return contractInfos;
    }
    async fetchAllPositionData() {
        try {
            const positions = await this.fetchOpenPositions();
            const symbols = positions.map(p => p.symbol);
            const [fundingRates, fairPrices, contractInfos] = await Promise.all([
                this.fetchFundingRates(symbols),
                this.fetchFairPrices(symbols),
                this.fetchContractInfos(symbols),
            ]);
            return {
                success: true,
                positions,
                fundingRates,
                fairPrices,
                contractInfo: contractInfos,
            };
        }
        catch (error) {
            logger_1.default.error('Error fetching all position data from BingX:', error);
            return {
                success: false,
                positions: [],
                fundingRates: new Map(),
                fairPrices: new Map(),
                contractInfo: new Map(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.BingxClient = BingxClient;
//# sourceMappingURL=bingxClient.js.map