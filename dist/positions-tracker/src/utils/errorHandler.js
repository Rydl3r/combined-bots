"use strict";
/**
 * Centralized error handling utilities
 * Provides consistent error handling and reporting throughout the application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotError = exports.APIError = exports.ConfigurationError = void 0;
exports.handleConfigurationError = handleConfigurationError;
exports.handleAPIError = handleAPIError;
exports.handleBotError = handleBotError;
exports.handleUncaughtException = handleUncaughtException;
exports.handleUnhandledRejection = handleUnhandledRejection;
exports.wrapAsync = wrapAsync;
exports.formatUserError = formatUserError;
exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("./logger"));
/**
 * Custom error classes for better error categorization
 */
class ConfigurationError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'ConfigurationError';
        this.details = details;
        Object.setPrototypeOf(this, ConfigurationError.prototype);
    }
}
exports.ConfigurationError = ConfigurationError;
class APIError extends Error {
    constructor(message, statusCode = null, response = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.response = response;
        Object.setPrototypeOf(this, APIError.prototype);
    }
}
exports.APIError = APIError;
class BotError extends Error {
    constructor(message, context = null) {
        super(message);
        this.name = 'BotError';
        this.context = context;
        Object.setPrototypeOf(this, BotError.prototype);
    }
}
exports.BotError = BotError;
/**
 * Handle and log configuration errors
 */
function handleConfigurationError(error) {
    logger_1.default.error('Configuration Error:', error);
    if (error.details) {
        console.error(`${constants_1.EMOJIS.ERROR} Missing required environment variables:`);
        error.details.forEach((variable) => {
            console.error(`   - ${variable}`);
        });
        console.error('\nPlease check your .env file and ensure all required variables are set.');
    }
    console.error(`\n${constants_1.EMOJIS.BOOK} Troubleshooting steps:`);
    console.error('1. Check your .env file contains all required variables');
    console.error('2. Verify your Telegram bot token is correct');
    console.error('3. Ensure your exchange API credentials are valid');
    console.error('4. Check your network connection');
    console.error('5. Verify the admin chat ID is correct');
}
/**
 * Handle and log API errors
 */
function handleAPIError(error, context = 'API Call') {
    logger_1.default.error(`API Error in ${context}:`, error);
    if (error instanceof APIError) {
        if (error.statusCode) {
            logger_1.default.error(`Status Code: ${error.statusCode}`);
        }
        if (error.response) {
            logger_1.default.debug('API Response:', error.response);
        }
    }
}
/**
 * Handle and log bot errors
 */
function handleBotError(error, ctx) {
    logger_1.default.error('Bot Error:', error);
    if (ctx) {
        const contextInfo = {
            chatId: ctx.chat?.id,
            userId: ctx.from?.id,
            username: ctx.from?.username,
            message: ctx.message?.text,
        };
        logger_1.default.debug('Bot Error Context:', contextInfo);
    }
}
/**
 * Handle uncaught exceptions
 */
function handleUncaughtException(error) {
    logger_1.default.error('Uncaught Exception:', error);
    logger_1.default.error('Shutting down due to uncaught exception');
    process.exit(1);
}
/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection(reason, promise) {
    logger_1.default.error('Unhandled Rejection:', { reason, promise });
    logger_1.default.error('Shutting down due to unhandled promise rejection');
    process.exit(1);
}
/**
 * Wrap async functions with error handling
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapAsync(fn, context = 'Async Function') {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            logger_1.default.error(`Error in ${context}:`, error);
            throw error;
        }
    });
}
/**
 * Format error for user display (removes sensitive information)
 */
function formatUserError(error) {
    if (error instanceof ConfigurationError) {
        return 'Configuration issue detected. Please contact administrator.';
    }
    if (error instanceof APIError) {
        return 'External service temporarily unavailable. Please try again later.';
    }
    if (error instanceof BotError) {
        return error.message;
    }
    return 'An unexpected error occurred. Please try again later.';
}
/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers() {
    process.on('uncaughtException', handleUncaughtException);
    process.on('unhandledRejection', handleUnhandledRejection);
    process.on('SIGINT', () => {
        logger_1.default.info('Received SIGINT, initiating graceful shutdown...');
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        logger_1.default.info('Received SIGTERM, initiating graceful shutdown...');
        process.exit(0);
    });
}
//# sourceMappingURL=errorHandler.js.map