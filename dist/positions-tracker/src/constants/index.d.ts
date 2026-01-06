/**
 * Constants used throughout the application
 * Centralizes magic numbers and configuration values
 */
export declare const MEXC: {
    readonly BASE_URL: "https://contract.mexc.com";
    readonly DEFAULT_CONTRACT_SIZE: 0.01;
    readonly API_SUCCESS_CODE: 0;
    readonly DEFAULT_PAGE_SIZE: 100;
};
export declare const GATE: {
    readonly BASE_URL: "https://api.gateio.ws";
    readonly TIMEOUT: 10000;
    readonly DEFAULT_CONTRACT_SIZE: 1;
};
export declare const BINANCE: {
    readonly BASE_URL: "https://fapi.binance.com";
    readonly TIMEOUT: 10000;
    readonly DEFAULT_CONTRACT_SIZE: 1;
};
export declare const BYBIT: {
    BASE_URL: string;
    TIMEOUT: number;
    DEFAULT_CONTRACT_SIZE: number;
};
export declare const KUCOIN: {
    BASE_URL: string;
    TIMEOUT: number;
    DEFAULT_CONTRACT_SIZE: number;
};
export declare const OKX: {
    BASE_URL: string;
    TIMEOUT: number;
    DEFAULT_CONTRACT_SIZE: number;
};
export declare const BITGET: {
    BASE_URL: string;
};
export declare const BINGX: {
    BASE_URL: string;
};
export declare enum PositionTypes {
    LONG = 1,
    SHORT = 2
}
export declare const TIME: {
    readonly ONE_DAY: number;
    readonly FIVE_MINUTES: number;
    readonly ONE_MINUTE: number;
};
export declare const FORMAT: {
    readonly DEFAULT_DECIMALS: 2;
    readonly PRICE_DECIMALS: 4;
    readonly PERCENTAGE_DECIMALS: 4;
    readonly PNL_DECIMALS: 4;
};
export declare const ERRORS: {
    readonly MISSING_CONFIG: "Configuration not provided";
    readonly INVALID_CREDENTIALS: "Invalid API credentials";
    readonly BOT_NOT_INITIALIZED: "Bot not initialized. Call initializeBot() first.";
    readonly UNAUTHORIZED_ACCESS: "🚫 Unauthorized access. This bot is for admin use only.";
    readonly UNKNOWN_COMMAND: "❓ Unknown command. Use /help to see available commands.";
    readonly TEXT_NOT_COMMAND: "🤖 I only respond to commands. Use /help to see what I can do.";
    readonly NETWORK_ERROR: "API: No response received - check network connection";
};
export declare const SUCCESS: {
    readonly BOT_STARTED: "✅ Bot started successfully";
    readonly CREDENTIALS_VALID: "✅ API credentials are valid";
    readonly CONFIG_LOADED: "✅ Configuration loaded successfully";
    readonly POSITION_UPDATE_SENT: "✅ Position update sent successfully";
    readonly SCHEDULER_CONFIGURED: "✅ Scheduler configured successfully";
};
export declare const EMOJIS: {
    readonly ROCKET: "🚀";
    readonly CHECK: "✅";
    readonly ERROR: "❌";
    readonly WARNING: "⚠️";
    readonly MONEY: "💰";
    readonly CHART: "📊";
    readonly PHONE: "📱";
    readonly KEY: "🔑";
    readonly LIGHTNING: "⚡";
    readonly CLOCK: "⏰";
    readonly GREEN_CIRCLE: "🟢";
    readonly RED_CIRCLE: "🔴";
    readonly WHITE_CIRCLE: "⚪";
    readonly DIAMOND: "💎";
    readonly DOLLAR: "💵";
    readonly TRENDING_UP: "📈";
    readonly ALARM: "🚨";
    readonly ROBOT: "🤖";
    readonly BOOK: "📖";
    readonly MAGNIFYING_GLASS: "🔍";
    readonly EMAIL: "📧";
    readonly CALENDAR: "📅";
    readonly STOP: "🛑";
    readonly REPEAT: "🔄";
    readonly MUTE: "🔇";
    readonly PROHIBITED: "🚫";
    readonly QUESTION: "❓";
};
export declare const DEFAULTS: {
    readonly MIN_FUNDING_RATE_THRESHOLD: -0.04;
    readonly MIN_UNREALIZED_PNL_THRESHOLD: 5;
    readonly RECV_WINDOW: 5000;
    readonly API_TIMEOUT: 10000;
    readonly RETRY_ATTEMPTS: 3;
    readonly CRON_EXPRESSION: "0 */5 * * * *";
    readonly TIMEZONE: "UTC";
};
export declare const CONSTANTS: {
    readonly MEXC: {
        readonly BASE_URL: "https://contract.mexc.com";
        readonly DEFAULT_CONTRACT_SIZE: 0.01;
        readonly API_SUCCESS_CODE: 0;
        readonly DEFAULT_PAGE_SIZE: 100;
    };
    readonly GATE: {
        readonly BASE_URL: "https://api.gateio.ws";
        readonly TIMEOUT: 10000;
        readonly DEFAULT_CONTRACT_SIZE: 1;
    };
    readonly BINANCE: {
        readonly BASE_URL: "https://fapi.binance.com";
        readonly TIMEOUT: 10000;
        readonly DEFAULT_CONTRACT_SIZE: 1;
    };
    readonly BYBIT: {
        BASE_URL: string;
        TIMEOUT: number;
        DEFAULT_CONTRACT_SIZE: number;
    };
    readonly PositionTypes: typeof PositionTypes;
    readonly TIME: {
        readonly ONE_DAY: number;
        readonly FIVE_MINUTES: number;
        readonly ONE_MINUTE: number;
    };
    readonly FORMAT: {
        readonly DEFAULT_DECIMALS: 2;
        readonly PRICE_DECIMALS: 4;
        readonly PERCENTAGE_DECIMALS: 4;
        readonly PNL_DECIMALS: 4;
    };
    readonly ERRORS: {
        readonly MISSING_CONFIG: "Configuration not provided";
        readonly INVALID_CREDENTIALS: "Invalid API credentials";
        readonly BOT_NOT_INITIALIZED: "Bot not initialized. Call initializeBot() first.";
        readonly UNAUTHORIZED_ACCESS: "🚫 Unauthorized access. This bot is for admin use only.";
        readonly UNKNOWN_COMMAND: "❓ Unknown command. Use /help to see available commands.";
        readonly TEXT_NOT_COMMAND: "🤖 I only respond to commands. Use /help to see what I can do.";
        readonly NETWORK_ERROR: "API: No response received - check network connection";
    };
    readonly SUCCESS: {
        readonly BOT_STARTED: "✅ Bot started successfully";
        readonly CREDENTIALS_VALID: "✅ API credentials are valid";
        readonly CONFIG_LOADED: "✅ Configuration loaded successfully";
        readonly POSITION_UPDATE_SENT: "✅ Position update sent successfully";
        readonly SCHEDULER_CONFIGURED: "✅ Scheduler configured successfully";
    };
    readonly EMOJIS: {
        readonly ROCKET: "🚀";
        readonly CHECK: "✅";
        readonly ERROR: "❌";
        readonly WARNING: "⚠️";
        readonly MONEY: "💰";
        readonly CHART: "📊";
        readonly PHONE: "📱";
        readonly KEY: "🔑";
        readonly LIGHTNING: "⚡";
        readonly CLOCK: "⏰";
        readonly GREEN_CIRCLE: "🟢";
        readonly RED_CIRCLE: "🔴";
        readonly WHITE_CIRCLE: "⚪";
        readonly DIAMOND: "💎";
        readonly DOLLAR: "💵";
        readonly TRENDING_UP: "📈";
        readonly ALARM: "🚨";
        readonly ROBOT: "🤖";
        readonly BOOK: "📖";
        readonly MAGNIFYING_GLASS: "🔍";
        readonly EMAIL: "📧";
        readonly CALENDAR: "📅";
        readonly STOP: "🛑";
        readonly REPEAT: "🔄";
        readonly MUTE: "🔇";
        readonly PROHIBITED: "🚫";
        readonly QUESTION: "❓";
    };
    readonly DEFAULTS: {
        readonly MIN_FUNDING_RATE_THRESHOLD: -0.04;
        readonly MIN_UNREALIZED_PNL_THRESHOLD: 5;
        readonly RECV_WINDOW: 5000;
        readonly API_TIMEOUT: 10000;
        readonly RETRY_ATTEMPTS: 3;
        readonly CRON_EXPRESSION: "0 */5 * * * *";
        readonly TIMEZONE: "UTC";
    };
};
//# sourceMappingURL=index.d.ts.map