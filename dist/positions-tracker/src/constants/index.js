"use strict";
/**
 * Constants used throughout the application
 * Centralizes magic numbers and configuration values
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSTANTS = exports.DEFAULTS = exports.EMOJIS = exports.SUCCESS = exports.ERRORS = exports.FORMAT = exports.TIME = exports.PositionTypes = exports.BINGX = exports.BITGET = exports.OKX = exports.KUCOIN = exports.BYBIT = exports.BINANCE = exports.GATE = exports.MEXC = void 0;
exports.MEXC = {
    BASE_URL: 'https://contract.mexc.com',
    DEFAULT_CONTRACT_SIZE: 0.01,
    API_SUCCESS_CODE: 0,
    DEFAULT_PAGE_SIZE: 100,
};
exports.GATE = {
    BASE_URL: 'https://api.gateio.ws',
    TIMEOUT: 10000,
    DEFAULT_CONTRACT_SIZE: 1,
};
exports.BINANCE = {
    BASE_URL: 'https://fapi.binance.com',
    TIMEOUT: 10000,
    DEFAULT_CONTRACT_SIZE: 1,
};
exports.BYBIT = {
    BASE_URL: 'https://api.bybit.com',
    TIMEOUT: 10000,
    DEFAULT_CONTRACT_SIZE: 1,
};
exports.KUCOIN = {
    BASE_URL: 'https://api-futures.kucoin.com',
    TIMEOUT: 10000,
    DEFAULT_CONTRACT_SIZE: 1,
};
exports.OKX = {
    BASE_URL: 'https://www.okx.com',
    TIMEOUT: 10000,
    DEFAULT_CONTRACT_SIZE: 1,
};
exports.BITGET = {
    BASE_URL: 'https://api.bitget.com',
};
exports.BINGX = {
    BASE_URL: 'https://open-api.bingx.com',
};
var PositionTypes;
(function (PositionTypes) {
    PositionTypes[PositionTypes["LONG"] = 1] = "LONG";
    PositionTypes[PositionTypes["SHORT"] = 2] = "SHORT";
})(PositionTypes || (exports.PositionTypes = PositionTypes = {}));
exports.TIME = {
    ONE_DAY: 24 * 60 * 60 * 1000,
    FIVE_MINUTES: 5 * 60 * 1000,
    ONE_MINUTE: 60 * 1000,
};
exports.FORMAT = {
    DEFAULT_DECIMALS: 2,
    PRICE_DECIMALS: 4,
    PERCENTAGE_DECIMALS: 4,
    PNL_DECIMALS: 4,
};
exports.ERRORS = {
    MISSING_CONFIG: 'Configuration not provided',
    INVALID_CREDENTIALS: 'Invalid API credentials',
    BOT_NOT_INITIALIZED: 'Bot not initialized. Call initializeBot() first.',
    UNAUTHORIZED_ACCESS: '🚫 Unauthorized access. This bot is for admin use only.',
    UNKNOWN_COMMAND: '❓ Unknown command. Use /help to see available commands.',
    TEXT_NOT_COMMAND: '🤖 I only respond to commands. Use /help to see what I can do.',
    NETWORK_ERROR: 'API: No response received - check network connection',
};
exports.SUCCESS = {
    BOT_STARTED: '✅ Bot started successfully',
    CREDENTIALS_VALID: '✅ API credentials are valid',
    CONFIG_LOADED: '✅ Configuration loaded successfully',
    POSITION_UPDATE_SENT: '✅ Position update sent successfully',
    SCHEDULER_CONFIGURED: '✅ Scheduler configured successfully',
};
exports.EMOJIS = {
    ROCKET: '🚀',
    CHECK: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    MONEY: '💰',
    CHART: '📊',
    PHONE: '📱',
    KEY: '🔑',
    LIGHTNING: '⚡',
    CLOCK: '⏰',
    GREEN_CIRCLE: '🟢',
    RED_CIRCLE: '🔴',
    WHITE_CIRCLE: '⚪',
    DIAMOND: '💎',
    DOLLAR: '💵',
    TRENDING_UP: '📈',
    ALARM: '🚨',
    ROBOT: '🤖',
    BOOK: '📖',
    MAGNIFYING_GLASS: '🔍',
    EMAIL: '📧',
    CALENDAR: '📅',
    STOP: '🛑',
    REPEAT: '🔄',
    MUTE: '🔇',
    PROHIBITED: '🚫',
    QUESTION: '❓',
};
exports.DEFAULTS = {
    MIN_FUNDING_RATE_THRESHOLD: -0.04,
    MIN_UNREALIZED_PNL_THRESHOLD: 5,
    RECV_WINDOW: 5000,
    API_TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    CRON_EXPRESSION: '0 */5 * * * *',
    TIMEZONE: 'UTC',
};
// Export all constants
exports.CONSTANTS = {
    MEXC: exports.MEXC,
    GATE: exports.GATE,
    BINANCE: exports.BINANCE,
    BYBIT: exports.BYBIT,
    PositionTypes,
    TIME: exports.TIME,
    FORMAT: exports.FORMAT,
    ERRORS: exports.ERRORS,
    SUCCESS: exports.SUCCESS,
    EMOJIS: exports.EMOJIS,
    DEFAULTS: exports.DEFAULTS,
};
//# sourceMappingURL=index.js.map