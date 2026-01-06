"use strict";
/**
 * Telegram Bot for Multi-Exchange Position Tracking
 * Sends position updates every 5 minutes and responds to commands
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
exports.initializeBot = initializeBot;
exports.sendPositionUpdate = sendPositionUpdate;
exports.startBot = startBot;
exports.stopBot = stopBot;
const telegraf_1 = require("telegraf");
const exchangeManager_1 = require("./exchanges/exchangeManager");
const messageFormatter_1 = require("./messageFormatter");
const positionFilter_1 = require("./utils/positionFilter");
const botHandlers_1 = require("./utils/botHandlers");
const scheduler_1 = require("./utils/scheduler");
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./utils/errorHandler");
const constants_1 = require("./constants");
const positionService = __importStar(require("./positionService"));
let bot = null;
let config = null;
let scheduledJob = null;
let exchangeManager = null;
/**
 * Initialize the Telegram bot with configuration
 */
function initializeBot(botConfig) {
    if (!botConfig) {
        throw new errorHandler_1.BotError('Bot configuration is required');
    }
    config = botConfig;
    bot = new telegraf_1.Telegraf(config.bot.token);
    exchangeManager = new exchangeManager_1.ExchangeManager(config);
    logger_1.default.info('Initializing Telegram bot...');
    logger_1.default.info(`Funding rate threshold: ${config.thresholds.minFundingRate}%`);
    logger_1.default.info(`Min PnL threshold (losses): ${config.thresholds.minUnrealizedPnl}%`);
    logger_1.default.info(`Max PnL threshold (gains): ${config.thresholds.maxUnrealizedPnl}%`);
    setupBotHandlers();
}
/**
 * Setup bot command handlers and middleware
 */
function setupBotHandlers() {
    if (!bot || !config) {
        throw new errorHandler_1.BotError('Bot not initialized');
    }
    (0, botHandlers_1.setupMiddleware)(bot, config.bot.adminChatId);
    (0, botHandlers_1.setupCommandHandlers)(bot, sendPositionUpdate);
    logger_1.default.success('Bot handlers configured');
}
/**
 * Send position update to specified chat
 */
async function sendPositionUpdate(chatId, applyFilter = true, showMenu = false) {
    try {
        if (!bot || !exchangeManager || !config) {
            throw new errorHandler_1.BotError('Bot not initialized');
        }
        logger_1.default.info(`Sending position update to chat ${chatId}${applyFilter ? ' (with filtering)' : ''}`);
        const result = await positionService.fetchPositionData(exchangeManager);
        if (result.success) {
            let message = result.message;
            if (applyFilter && result.data && result.data.positions) {
                const filteredPositions = (0, positionFilter_1.filterPositionsForScheduledUpdate)(result.data.positions, result.data.fundingData, result.data.fairPriceData, result.data.contractInfoData, config.thresholds);
                if (filteredPositions.length === 0) {
                    logger_1.default.info('No positions meet the filtering criteria, skipping scheduled update');
                    return true;
                }
                message = (0, messageFormatter_1.formatPositionsMessage)(filteredPositions, result.data.fundingData, result.data.fairPriceData, result.data.contractInfoData || {});
                logger_1.default.info(`Filtered ${filteredPositions.length} positions out of ${result.data.positions.length} total positions`);
            }
            const messageOptions = {
                disable_web_page_preview: true,
                ...(showMenu ? { reply_markup: (0, botHandlers_1.createQuickActionsKeyboard)() } : {}),
            };
            await bot.telegram.sendMessage(chatId, message, messageOptions);
            logger_1.default.success('Position update sent successfully');
            return true;
        }
        else {
            const messageOptions = {
                disable_web_page_preview: true,
                ...(showMenu ? { reply_markup: (0, botHandlers_1.createQuickActionsKeyboard)() } : {}),
            };
            await bot.telegram.sendMessage(chatId, result.message, messageOptions);
            logger_1.default.warning('Position update failed, error message sent');
            return false;
        }
    }
    catch (error) {
        (0, errorHandler_1.handleBotError)(error);
        if (bot) {
            try {
                const messageOptions = {
                    disable_web_page_preview: true,
                    ...(showMenu ? { reply_markup: (0, botHandlers_1.createQuickActionsKeyboard)() } : {}),
                };
                await bot.telegram.sendMessage(chatId, `${constants_1.EMOJIS.ERROR} An error occurred while fetching positions.`, messageOptions);
            }
            catch (sendError) {
                logger_1.default.error('Failed to send error message:', sendError);
            }
        }
        return false;
    }
}
/**
 * Send automatic position updates to admin with filtering applied
 */
async function sendScheduledUpdate() {
    try {
        if (!config) {
            throw new errorHandler_1.BotError('Configuration not available');
        }
        logger_1.default.scheduler('Sending scheduled position update with filtering...');
        await sendPositionUpdate(config.bot.adminChatId);
    }
    catch (error) {
        logger_1.default.error('Error in scheduled update:', error);
    }
}
/**
 * Setup automatic scheduler
 */
function setupAutomaticScheduler() {
    if (!config) {
        throw new errorHandler_1.BotError('Configuration not available');
    }
    scheduledJob = (0, scheduler_1.setupScheduler)(sendScheduledUpdate, config.scheduler);
}
/**
 * Start the bot and begin polling for messages
 */
async function startBot() {
    try {
        if (!bot || !exchangeManager || !config) {
            throw new errorHandler_1.BotError('Bot not initialized. Call initializeBot() first.');
        }
        logger_1.default.info('Validating exchange credentials...');
        const credentialsValid = await positionService.validateCredentials(exchangeManager);
        if (!credentialsValid) {
            throw new errorHandler_1.BotError('Invalid exchange credentials. Please check your API keys.');
        }
        logger_1.default.info('Starting Telegram bot...');
        setupAutomaticScheduler();
        await bot.launch();
        logger_1.default.success('Bot started successfully');
        logger_1.default.info('Bot is now listening for messages...');
        logger_1.default.info(`Automatic updates scheduled: ${config.scheduler.cronExpression}`);
        await sendPositionUpdate(config.bot.adminChatId);
    }
    catch (error) {
        logger_1.default.error('Failed to start bot:', error);
        throw error;
    }
}
/**
 * Stop the bot gracefully
 */
async function stopBot() {
    try {
        if (scheduledJob) {
            logger_1.default.info('Stopping scheduled job...');
            scheduledJob.stop();
        }
        if (bot) {
            logger_1.default.info('Stopping bot...');
            await bot.stop();
            logger_1.default.success('Bot stopped successfully');
        }
    }
    catch (error) {
        logger_1.default.error('Error stopping bot:', error);
    }
}
//# sourceMappingURL=telegramBot.js.map