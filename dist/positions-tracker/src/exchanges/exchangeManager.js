"use strict";
/**
 * Exchange Manager
 * Manages multiple exchange clients and aggregates data
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeManager = void 0;
const mexcClient_1 = require("./mexcClient");
const gateClient_1 = require("./gateClient");
const binanceClient_1 = require("./binanceClient");
const bybitClient_1 = require("./bybitClient");
const kucoinClient_1 = require("./kucoinClient");
const okxClient_1 = require("./okxClient");
const bitgetClient_1 = require("./bitgetClient");
const bingxClient_1 = require("./bingxClient");
const logger_1 = __importDefault(require("../utils/logger"));
class ExchangeManager {
    constructor(config) {
        this.clients = new Map();
        this.initializeClients(config);
    }
    /**
     * Initialize exchange clients based on configuration
     */
    initializeClients(config) {
        // Initialize MEXC if enabled
        if (config.exchanges.mexc?.enabled) {
            try {
                const mexcClient = new mexcClient_1.MexcClient({
                    accessKey: config.exchanges.mexc.accessKey,
                    secretKey: config.exchanges.mexc.secretKey,
                }, config.exchanges.mexc.baseUrl);
                this.clients.set('mexc', mexcClient);
                logger_1.default.success('MEXC client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize MEXC client:', error);
            }
        }
        // Initialize Gate.io if enabled
        if (config.exchanges.gate?.enabled) {
            try {
                const gateClient = new gateClient_1.GateClient({
                    accessKey: config.exchanges.gate.accessKey,
                    secretKey: config.exchanges.gate.secretKey,
                });
                this.clients.set('gate', gateClient);
                logger_1.default.success('Gate.io client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize Gate.io client:', error);
            }
        }
        // Initialize Binance if enabled
        if (config.exchanges.binance?.enabled) {
            try {
                const binanceClient = new binanceClient_1.BinanceClient({
                    accessKey: config.exchanges.binance.accessKey,
                    secretKey: config.exchanges.binance.secretKey,
                });
                this.clients.set('binance', binanceClient);
                logger_1.default.success('Binance client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize Binance client:', error);
            }
        }
        // Initialize Bybit if enabled
        if (config.exchanges.bybit?.enabled) {
            try {
                const bybitClient = new bybitClient_1.BybitClient({
                    accessKey: config.exchanges.bybit.accessKey,
                    secretKey: config.exchanges.bybit.secretKey,
                });
                this.clients.set('bybit', bybitClient);
                logger_1.default.success('Bybit client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize Bybit client:', error);
            }
        }
        // Initialize KuCoin if enabled
        if (config.exchanges.kucoin?.enabled) {
            try {
                const kucoinClient = new kucoinClient_1.KucoinClient({
                    accessKey: config.exchanges.kucoin.accessKey,
                    secretKey: config.exchanges.kucoin.secretKey,
                    passphrase: config.exchanges.kucoin.passphrase || '',
                });
                this.clients.set('kucoin', kucoinClient);
                logger_1.default.success('KuCoin client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize KuCoin client:', error);
            }
        }
        // Initialize OKX if enabled
        if (config.exchanges.okx?.enabled) {
            try {
                const okxClient = new okxClient_1.OkxClient({
                    accessKey: config.exchanges.okx.accessKey,
                    secretKey: config.exchanges.okx.secretKey,
                    passphrase: config.exchanges.okx.passphrase || '',
                });
                this.clients.set('okx', okxClient);
                logger_1.default.success('OKX client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize OKX client:', error);
            }
        }
        // Initialize Bitget if enabled
        if (config.exchanges.bitget?.enabled) {
            try {
                const bitgetClient = new bitgetClient_1.BitgetClient({
                    accessKey: config.exchanges.bitget.accessKey,
                    secretKey: config.exchanges.bitget.secretKey,
                    passphrase: config.exchanges.bitget.passphrase || '',
                });
                this.clients.set('bitget', bitgetClient);
                logger_1.default.success('Bitget client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize Bitget client:', error);
            }
        }
        // Initialize BingX if enabled
        if (config.exchanges.bingx?.enabled) {
            try {
                const bingxClient = new bingxClient_1.BingxClient({
                    accessKey: config.exchanges.bingx.accessKey,
                    secretKey: config.exchanges.bingx.secretKey,
                });
                this.clients.set('bingx', bingxClient);
                logger_1.default.success('BingX client initialized');
            }
            catch (error) {
                logger_1.default.error('Failed to initialize BingX client:', error);
            }
        }
        // Future exchanges can be initialized here
        // if (config.exchanges.okx?.enabled) {
        //   const okxClient = new OkxClient(...);
        //   this.clients.set('okx', okxClient);
        // }
        if (this.clients.size === 0) {
            throw new Error('No exchange clients initialized');
        }
        logger_1.default.info(`Initialized ${this.clients.size} exchange client(s)`);
    }
    /**
     * Get all enabled exchange clients
     */
    getClients() {
        return Array.from(this.clients.values());
    }
    /**
     * Get a specific exchange client
     */
    getClient(exchangeName) {
        return this.clients.get(exchangeName.toLowerCase());
    }
    /**
     * Fetch positions from all exchanges
     */
    async fetchAllPositions() {
        const allPositions = [];
        await Promise.all(Array.from(this.clients.entries()).map(async ([name, client]) => {
            try {
                logger_1.default.info(`Fetching positions from ${name.toUpperCase()}...`);
                const positions = await client.fetchOpenPositions();
                allPositions.push(...positions);
                logger_1.default.success(`Fetched ${positions.length} positions from ${name.toUpperCase()}`);
            }
            catch (error) {
                logger_1.default.error(`Failed to fetch positions from ${name.toUpperCase()}:`, error);
            }
        }));
        return allPositions;
    }
    /**
     * Fetch all position data from all exchanges
     */
    async fetchAllPositionData() {
        const results = [];
        await Promise.all(Array.from(this.clients.entries()).map(async ([name, client]) => {
            try {
                logger_1.default.info(`Fetching all data from ${name.toUpperCase()}...`);
                const result = await client.fetchAllPositionData();
                results.push(result);
            }
            catch (error) {
                logger_1.default.error(`Failed to fetch data from ${name.toUpperCase()}:`, error);
                results.push({
                    success: false,
                    positions: [],
                    fundingRates: new Map(),
                    fairPrices: new Map(),
                    contractInfo: new Map(),
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }));
        // Aggregate results from all exchanges
        return this.aggregateResults(results);
    }
    /**
     * Aggregate results from multiple exchanges
     */
    aggregateResults(results) {
        const allPositions = [];
        const allFundingRates = new Map();
        const allFairPrices = new Map();
        const allContractInfo = new Map();
        const errors = [];
        results.forEach(result => {
            if (result.success) {
                allPositions.push(...result.positions);
                result.fundingRates.forEach((value, key) => {
                    allFundingRates.set(key, value);
                });
                result.fairPrices.forEach((value, key) => {
                    allFairPrices.set(key, value);
                });
                result.contractInfo.forEach((value, key) => {
                    allContractInfo.set(key, value);
                });
            }
            else if (result.error) {
                errors.push(result.error);
            }
        });
        const hasErrors = errors.length > 0;
        const hasSuccess = results.some(r => r.success);
        return {
            success: hasSuccess,
            positions: allPositions,
            fundingRates: allFundingRates,
            fairPrices: allFairPrices,
            contractInfo: allContractInfo,
            error: hasErrors ? errors.join('; ') : undefined,
        };
    }
    /**
     * Test connections to all exchanges
     */
    async testAllConnections() {
        const results = new Map();
        await Promise.all(Array.from(this.clients.entries()).map(async ([name, client]) => {
            try {
                logger_1.default.info(`Testing connection to ${name.toUpperCase()}...`);
                const isConnected = await client.testConnection();
                results.set(name, isConnected);
                if (isConnected) {
                    logger_1.default.success(`${name.toUpperCase()} connection successful`);
                }
                else {
                    logger_1.default.error(`${name.toUpperCase()} connection failed`);
                }
            }
            catch (error) {
                logger_1.default.error(`Error testing ${name.toUpperCase()} connection:`, error);
                results.set(name, false);
            }
        }));
        return results;
    }
    /**
     * Validate all exchange credentials
     */
    async validateAllCredentials() {
        const results = await this.testAllConnections();
        const allValid = Array.from(results.values()).every(valid => valid);
        if (allValid) {
            logger_1.default.success('All exchange credentials validated successfully');
        }
        else {
            logger_1.default.error('Some exchange credentials are invalid');
        }
        return allValid;
    }
}
exports.ExchangeManager = ExchangeManager;
//# sourceMappingURL=exchangeManager.js.map