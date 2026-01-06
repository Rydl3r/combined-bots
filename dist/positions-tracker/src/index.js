"use strict";
/**
 * Multi-Exchange Positions Tracker Bot
 *
 * A Telegram bot that tracks cryptocurrency positions across multiple exchanges
 * and sends regular updates with PnL, funding rates, and position details.
 *
 * Features:
 * - Support for multiple exchanges (MEXC, Binance, Bybit, etc.)
 * - Automatic position updates every 5 minutes
 * - Real-time PnL tracking
 * - Funding rate monitoring
 * - Error handling and logging
 * - Admin-only access control
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
exports.main = main;
const telegramBot = __importStar(require("./telegramBot"));
const config_1 = require("./config");
const errorHandler_1 = require("./utils/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
/**
 * Main application startup function
 */
async function main() {
    logger_1.default.startup('Multi-Exchange Positions Tracker Bot');
    try {
        (0, errorHandler_1.setupGlobalErrorHandlers)();
        const config = (0, config_1.loadConfiguration)();
        (0, config_1.logConfiguration)(config);
        telegramBot.initializeBot(config);
        await telegramBot.startBot();
        logger_1.default.success('Multi-Exchange Positions Tracker Bot is running!');
        logger_1.default.info('Position updates will be sent every 5 minutes (filtered)');
        logger_1.default.info('Available commands: /start, /status, /help');
        logger_1.default.info('Press Ctrl+C to stop the bot');
        logger_1.default.info(`Filtering: Funding Rate <= ${config.thresholds.minFundingRate}% OR PnL <= ${config.thresholds.minUnrealizedPnl}% OR PnL >= ${config.thresholds.maxUnrealizedPnl}%`);
    }
    catch (error) {
        if (error instanceof errorHandler_1.ConfigurationError) {
            (0, errorHandler_1.handleConfigurationError)(error);
        }
        else {
            logger_1.default.error('Fatal error starting the application:', error);
        }
        process.exit(1);
    }
}
// Start the application
if (require.main === module) {
    main().catch(error => {
        logger_1.default.error('Failed to start application:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map