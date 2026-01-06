"use strict";
/**
 * Telegram bot command handlers
 * Handles all bot commands and middleware
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMainMenuKeyboard = createMainMenuKeyboard;
exports.createQuickActionsKeyboard = createQuickActionsKeyboard;
exports.setupMiddleware = setupMiddleware;
exports.setupCommandHandlers = setupCommandHandlers;
const messageFormatter_1 = require("../messageFormatter");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("./logger"));
const errorHandler_1 = require("./errorHandler");
/**
 * Create main menu keyboard
 */
function createMainMenuKeyboard() {
    return {
        keyboard: [[`${constants_1.EMOJIS.ALARM} Filtered View`, `${constants_1.EMOJIS.CHART} View All`]],
        resize_keyboard: true,
        persistent: true,
    };
}
/**
 * Create quick actions keyboard (alias for main menu)
 */
function createQuickActionsKeyboard() {
    return createMainMenuKeyboard();
}
/**
 * Setup middleware for the bot
 */
function setupMiddleware(bot, adminChatId) {
    bot.use((ctx, next) => {
        const from = ctx.from;
        const chatId = ctx.chat?.id;
        const message = ctx.message && 'text' in ctx.message
            ? ctx.message.text
            : ctx.callbackQuery && 'data' in ctx.callbackQuery
                ? ctx.callbackQuery.data
                : 'Non-text message';
        logger_1.default.botActivity('Message received', {
            from: from?.username || from?.first_name,
            userId: from?.id,
            chatId,
            message: String(message).substring(0, 100),
        });
        if (chatId?.toString() !== adminChatId.toString()) {
            logger_1.default.warning(`Unauthorized access attempt from chat ID: ${chatId}`);
            return ctx.reply(constants_1.ERRORS.UNAUTHORIZED_ACCESS);
        }
        return next();
    });
    bot.catch((err, ctx) => {
        const error = err instanceof Error ? err : new Error(String(err));
        (0, errorHandler_1.handleBotError)(error, {
            chat: ctx.chat ? { id: ctx.chat.id } : undefined,
            from: ctx.from
                ? { id: ctx.from.id, username: ctx.from.username }
                : undefined,
            message: ctx.message && 'text' in ctx.message
                ? { text: ctx.message.text }
                : undefined,
        });
        if (ctx.chat?.id?.toString() === adminChatId.toString()) {
            const userMessage = (0, messageFormatter_1.formatErrorMessage)(new Error((0, errorHandler_1.formatUserError)(error)));
            ctx.reply(userMessage).catch(error => {
                logger_1.default.error('Failed to send error message:', error);
            });
        }
    });
}
/**
 * Setup bot command handlers
 */
function setupCommandHandlers(bot, sendPositionUpdate) {
    bot.command('start', async (ctx) => {
        try {
            logger_1.default.botActivity('Start command received');
            await ctx.reply((0, messageFormatter_1.formatStartupMessage)(), {
                reply_markup: createMainMenuKeyboard(),
            });
            await sendPositionUpdate(ctx.chat.id, false, true);
        }
        catch (error) {
            logger_1.default.error('Error handling start command:', error);
            await ctx.reply((0, messageFormatter_1.formatErrorMessage)(error));
        }
    });
    bot.command('help', async (ctx) => {
        try {
            logger_1.default.botActivity('Help command received');
            await ctx.reply((0, messageFormatter_1.formatHelpMessage)(), {
                reply_markup: createMainMenuKeyboard(),
            });
        }
        catch (error) {
            logger_1.default.error('Error handling help command:', error);
            await ctx.reply((0, messageFormatter_1.formatErrorMessage)(error));
        }
    });
    bot.command('status', async (ctx) => {
        try {
            logger_1.default.botActivity('Status command received');
            await ctx.reply(`${constants_1.EMOJIS.REPEAT} Fetching current position status...`, {
                reply_markup: createMainMenuKeyboard(),
            });
            await sendPositionUpdate(ctx.chat.id, false, true);
        }
        catch (error) {
            logger_1.default.error('Error handling status command:', error);
            await ctx.reply((0, messageFormatter_1.formatErrorMessage)(error));
        }
    });
    bot.command('menu', async (ctx) => {
        try {
            logger_1.default.botActivity('Menu command received');
            await ctx.reply(`${constants_1.EMOJIS.ROBOT} **Main Menu**\n\nChoose an option below:`, {
                reply_markup: createMainMenuKeyboard(),
                parse_mode: 'Markdown',
            });
        }
        catch (error) {
            logger_1.default.error('Error handling menu command:', error);
            await ctx.reply((0, messageFormatter_1.formatErrorMessage)(error));
        }
    });
    bot.on('callback_query', async (ctx) => {
        try {
            const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
            logger_1.default.botActivity('Callback query received', { data: callbackData });
            await ctx.answerCbQuery();
            await ctx.reply('Please use the menu buttons at the bottom instead.', {
                reply_markup: createMainMenuKeyboard(),
            });
        }
        catch (error) {
            logger_1.default.error('Error handling callback query:', error);
            try {
                await ctx.answerCbQuery('An error occurred. Please try again.');
            }
            catch (ackError) {
                logger_1.default.error('Error acknowledging callback query:', ackError);
            }
        }
    });
    bot.on('text', async (ctx) => {
        const text = 'text' in ctx.message ? ctx.message.text : '';
        if (text.startsWith('/')) {
            await ctx.reply(constants_1.ERRORS.UNKNOWN_COMMAND, {
                reply_markup: createMainMenuKeyboard(),
            });
            return;
        }
        try {
            logger_1.default.botActivity('Text message received', { text });
            if (text.includes('View All')) {
                await ctx.reply(`${constants_1.EMOJIS.CHART} Fetching all positions...`, {
                    reply_markup: createMainMenuKeyboard(),
                });
                await sendPositionUpdate(ctx.chat.id, false, true);
            }
            else if (text.includes('Filtered View')) {
                await ctx.reply(`${constants_1.EMOJIS.ALARM} Fetching filtered positions (high PnL/funding rates)...`, {
                    reply_markup: createMainMenuKeyboard(),
                });
                await sendPositionUpdate(ctx.chat.id, true, true);
            }
            else {
                await ctx.reply(constants_1.ERRORS.TEXT_NOT_COMMAND, {
                    reply_markup: createMainMenuKeyboard(),
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error handling text message:', error);
            await ctx.reply((0, messageFormatter_1.formatErrorMessage)(error), {
                reply_markup: createMainMenuKeyboard(),
            });
        }
    });
}
//# sourceMappingURL=botHandlers.js.map