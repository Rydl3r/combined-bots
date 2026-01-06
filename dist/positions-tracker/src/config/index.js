"use strict";
/**
 * Configuration module for Positions Tracker Bot
 * Centralizes all configuration management and validation
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfiguration = loadConfiguration;
exports.validateConfiguration = validateConfiguration;
exports.logConfiguration = logConfiguration;
const dotenv = __importStar(require("dotenv"));
const errorHandler_1 = require("../utils/errorHandler");
dotenv.config();
/**
 * Application configuration with validation
 */
function loadConfiguration() {
    const config = {
        bot: {
            token: process.env.BOT_TOKEN || '',
            adminChatId: process.env.ADMIN_CHAT_ID || '',
        },
        exchanges: {
            mexc: {
                enabled: process.env.MEXC_ENABLED === 'true',
                accessKey: process.env.MEXC_ACCESS_KEY || '',
                secretKey: process.env.MEXC_SECRET_KEY || '',
            },
            gate: {
                enabled: process.env.GATE_ENABLED === 'true',
                accessKey: process.env.GATE_ACCESS_KEY || '',
                secretKey: process.env.GATE_SECRET_KEY || '',
            },
            binance: {
                enabled: process.env.BINANCE_ENABLED === 'true',
                accessKey: process.env.BINANCE_ACCESS_KEY || '',
                secretKey: process.env.BINANCE_SECRET_KEY || '',
            },
            bybit: {
                enabled: process.env.BYBIT_ENABLED === 'true',
                accessKey: process.env.BYBIT_ACCESS_KEY || '',
                secretKey: process.env.BYBIT_SECRET_KEY || '',
            },
            kucoin: {
                enabled: process.env.KUCOIN_ENABLED === 'true',
                accessKey: process.env.KUCOIN_ACCESS_KEY || '',
                secretKey: process.env.KUCOIN_SECRET_KEY || '',
                passphrase: process.env.KUCOIN_PASSPHRASE || '',
            },
            okx: {
                enabled: process.env.OKX_ENABLED === 'true',
                accessKey: process.env.OKX_ACCESS_KEY || '',
                secretKey: process.env.OKX_SECRET_KEY || '',
                passphrase: process.env.OKX_PASSPHRASE || '',
            },
            bitget: {
                enabled: process.env.BITGET_ENABLED === 'true',
                accessKey: process.env.BITGET_ACCESS_KEY || '',
                secretKey: process.env.BITGET_SECRET_KEY || '',
                passphrase: process.env.BITGET_PASSPHRASE || '',
            },
            bingx: {
                enabled: process.env.BINGX_ENABLED === 'true',
                accessKey: process.env.BINGX_ACCESS_KEY || '',
                secretKey: process.env.BINGX_SECRET_KEY || '',
            },
        },
        thresholds: {
            minFundingRate: process.env.MIN_FUNDING_RATE_THRESHOLD
                ? parseFloat(process.env.MIN_FUNDING_RATE_THRESHOLD)
                : NaN,
            minUnrealizedPnl: process.env.MIN_UNREALIZED_PNL_THRESHOLD
                ? parseFloat(process.env.MIN_UNREALIZED_PNL_THRESHOLD)
                : NaN,
            maxUnrealizedPnl: process.env.MAX_UNREALIZED_PNL_THRESHOLD
                ? parseFloat(process.env.MAX_UNREALIZED_PNL_THRESHOLD)
                : NaN,
        },
        scheduler: {
            cronExpression: process.env.CRON_EXPRESSION || '',
        },
    };
    validateConfiguration(config);
    return config;
}
/**
 * Validate required configuration values
 */
function validateConfiguration(config) {
    const requiredVars = [
        { key: 'BOT_TOKEN', value: config.bot.token },
        { key: 'ADMIN_CHAT_ID', value: config.bot.adminChatId },
        {
            key: 'MIN_FUNDING_RATE_THRESHOLD',
            value: config.thresholds.minFundingRate,
        },
        {
            key: 'MIN_UNREALIZED_PNL_THRESHOLD',
            value: config.thresholds.minUnrealizedPnl,
        },
        {
            key: 'MAX_UNREALIZED_PNL_THRESHOLD',
            value: config.thresholds.maxUnrealizedPnl,
        },
        { key: 'CRON_EXPRESSION', value: config.scheduler.cronExpression },
    ];
    // Check if at least one exchange is enabled and configured
    const enabledExchanges = Object.entries(config.exchanges).filter(([_, cfg]) => cfg.enabled);
    if (enabledExchanges.length === 0) {
        throw new errorHandler_1.ConfigurationError('At least one exchange must be enabled (set MEXC_ENABLED=true)');
    }
    // Validate credentials for enabled exchanges
    enabledExchanges.forEach(([name, cfg]) => {
        if (!cfg.accessKey) {
            requiredVars.push({
                key: `${name.toUpperCase()}_ACCESS_KEY`,
                value: '',
            });
        }
        if (!cfg.secretKey) {
            requiredVars.push({
                key: `${name.toUpperCase()}_SECRET_KEY`,
                value: '',
            });
        }
        // KuCoin requires passphrase
        if (name === 'kucoin' && !cfg.passphrase) {
            requiredVars.push({
                key: 'KUCOIN_PASSPHRASE',
                value: '',
            });
        }
        // OKX requires passphrase
        if (name === 'okx' && !cfg.passphrase) {
            requiredVars.push({
                key: 'OKX_PASSPHRASE',
                value: '',
            });
        }
        // Bitget requires passphrase
        if (name === 'bitget' && !cfg.passphrase) {
            requiredVars.push({
                key: 'BITGET_PASSPHRASE',
                value: '',
            });
        }
    });
    // Filter out missing or invalid values
    const missingVars = requiredVars.filter(({ value }) => {
        if (typeof value === 'string') {
            return !value;
        }
        if (typeof value === 'number') {
            return isNaN(value);
        }
        return !value;
    });
    if (missingVars.length > 0) {
        throw new errorHandler_1.ConfigurationError('Missing required environment variables', missingVars.map(({ key }) => key));
    }
    // Validate admin chat ID is numeric
    if (!/^\d+$/.test(config.bot.adminChatId)) {
        throw new errorHandler_1.ConfigurationError('ADMIN_CHAT_ID must be a numeric value');
    }
}
/**
 * Log configuration details (without sensitive information)
 */
function logConfiguration(config) {
    console.log('✅ Configuration loaded successfully');
    console.log(`📱 Admin Chat ID: ${config.bot.adminChatId}`);
    // Log enabled exchanges
    const enabledExchanges = Object.entries(config.exchanges)
        .filter(([_, cfg]) => cfg.enabled)
        .map(([name]) => name.toUpperCase());
    console.log(`🔄 Enabled Exchanges: ${enabledExchanges.join(', ')}`);
    enabledExchanges.forEach(name => {
        const exchange = config.exchanges[name.toLowerCase()];
        if (exchange) {
            console.log(`🔑 ${name} Access Key: ${exchange.accessKey.substring(0, 8)}...`);
        }
    });
    console.log(`⚡ Min Funding Rate Threshold: ${config.thresholds.minFundingRate}%`);
    console.log(`📉 Min Unrealized PnL Threshold (losses): ${config.thresholds.minUnrealizedPnl}%`);
    console.log(`📈 Max Unrealized PnL Threshold (gains): ${config.thresholds.maxUnrealizedPnl}%`);
    console.log(`⏰ Scheduler: ${config.scheduler.cronExpression}`);
}
//# sourceMappingURL=index.js.map