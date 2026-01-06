"use strict";
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
exports.startBot = exports.createBot = void 0;
const telegraf_1 = require("telegraf");
const db = __importStar(require("./database"));
const constants_1 = require("./constants");
const reminder_1 = require("./reminder");
const utils_1 = require("./utils");
// State management for pending transactions
const pendingTransactions = new Map();
// Global reminder service instance
let reminderService;
// Helper functions
const getUserId = (ctx) => ctx.from.id.toString();
const formatUserCurrency = async (amount, userId) => {
    try {
        const user = await db.getUser(userId);
        const currency = user?.currency || 'UAH';
        return (0, utils_1.formatCurrency)(amount, currency);
    }
    catch (error) {
        console.error('Error formatting currency:', error);
        return (0, utils_1.formatCurrency)(amount, 'UAH');
    }
};
const createCategoriesKeyboard = (categories) => {
    const buttons = categories.map((category) => telegraf_1.Markup.button.callback(`${category.emoji} ${category.name}`, `category:${category.id}`));
    // Group buttons by 2 per row
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) {
        rows.push(buttons.slice(i, i + 2));
    }
    return telegraf_1.Markup.inlineKeyboard(rows).reply_markup;
};
const createCurrencyKeyboard = () => {
    const buttons = constants_1.SUPPORTED_CURRENCIES.map((currency) => telegraf_1.Markup.button.callback(`${currency.symbol} ${currency.name}`, `currency:${currency.code}`));
    // Group buttons by 1 per row for better readability
    const rows = buttons.map((button) => [button]);
    return telegraf_1.Markup.inlineKeyboard(rows).reply_markup;
};
const createPendingTransaction = (userId, amount, currency, description) => ({
    userId,
    amount,
    currency,
    description,
    timestamp: Date.now(),
});
const storePendingTransaction = (userId, transaction) => {
    pendingTransactions.set(userId, transaction);
};
const getPendingTransaction = (userId) => {
    return pendingTransactions.get(userId);
};
const clearPendingTransaction = (userId) => {
    pendingTransactions.delete(userId);
};
// Command handlers
const handleStart = async (ctx) => {
    try {
        const user = await db.createOrUpdateUser(ctx.from);
        // Check if user needs to set up currency
        if (!user.currency) {
            const currencyMessage = `
🎉 Welcome to TrackFin!

Choose your currency:
      `;
            await ctx.reply(currencyMessage, {
                reply_markup: createCurrencyKeyboard(),
            });
            return;
        }
        const welcome = `
🎉 Welcome to TrackFin!

Send expenses in format: \`100 Coffee\` or \`USD 50 Lunch\`

Use /help to view commands.
    `;
        await ctx.reply(welcome, { parse_mode: 'Markdown' });
    }
    catch (error) {
        console.error('Error in start command:', error);
        await ctx.reply('Error occurred during initialization. Please try again later.');
    }
};
const handleHelp = async (ctx) => {
    const help = `
📊 *TrackFin Bot*

*Adding expenses:*
Write: \`100 Lunch\` or \`USD 50 Coffee\`
Choose category from the list.

*Commands:*
/today - today's expenses
/month - monthly expenses  
/recent - recent transactions
/currency - change currency
/reminders - reminder settings
  `;
    await ctx.reply(help, { parse_mode: 'Markdown' });
};
const handleToday = async (ctx) => {
    try {
        const userId = getUserId(ctx);
        const today = (0, utils_1.getTodayDateString)();
        const transactions = await db.getDayTransactionsWithCategories(userId, today);
        const totalExpense = (0, utils_1.calculateDayTotal)(transactions);
        const user = await db.getUser(userId);
        const currency = user?.currency || 'UAH';
        let message = `📅 *For today (${new Date().toLocaleDateString('en-US')})*\n\n`;
        if (totalExpense > 0) {
            message += `💸 Expenses: ${await formatUserCurrency(totalExpense, userId)}\n`;
        }
        else {
            message += 'No expenses yet.\n';
        }
        if (transactions.length > 0) {
            message += `\n📋 *Transactions:*\n${(0, utils_1.formatTransactionsWithCategoriesList)(transactions, currency)}`;
        }
        await ctx.reply(message, { parse_mode: 'Markdown' });
    }
    catch (error) {
        console.error('Error in today command:', error);
        await ctx.reply("Error retrieving today's data.");
    }
};
const handleMonth = async (ctx) => {
    try {
        const userId = getUserId(ctx);
        const { year, month } = (0, utils_1.getCurrentMonth)();
        const transactions = await db.getMonthTransactions(userId, year, month);
        const totalExpense = (0, utils_1.calculateDayTotal)(transactions);
        const monthName = new Date(year, month - 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
        let message = `📅 *For ${monthName}*\n\n`;
        message += `💸 Expenses: ${await formatUserCurrency(totalExpense, userId)}\n`;
        message += `📈 Transaction count: ${transactions.length}`;
        await ctx.reply(message, { parse_mode: 'Markdown' });
    }
    catch (error) {
        console.error('Error in month command:', error);
        await ctx.reply('Error retrieving monthly data.');
    }
};
const handleRecent = async (ctx) => {
    try {
        const userId = getUserId(ctx);
        const transactions = await db.getUserTransactionsWithCategories(userId, 10);
        const user = await db.getUser(userId);
        const currency = user?.currency || 'UAH';
        if (transactions.length === 0) {
            await ctx.reply('You have no transactions yet.');
            return;
        }
        let message = '📋 *Recent transactions:*\n\n';
        message += (0, utils_1.formatTransactionsWithCategoriesList)(transactions, currency);
        await ctx.reply(message, { parse_mode: 'Markdown' });
    }
    catch (error) {
        console.error('Error in recent command:', error);
        await ctx.reply('Error retrieving recent transactions.');
    }
};
const handleCurrency = async (ctx) => {
    try {
        const userId = getUserId(ctx);
        const user = await db.getUser(userId);
        if (!user) {
            await ctx.reply('Error: user not found.');
            return;
        }
        const currentCurrency = constants_1.SUPPORTED_CURRENCIES.find((c) => c.code === user.currency);
        const currentCurrencyName = currentCurrency
            ? `${currentCurrency.symbol} ${currentCurrency.name}`
            : user.currency;
        const message = `
💱 *Current currency:* ${currentCurrencyName}

Choose new currency:
    `;
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: createCurrencyKeyboard(),
        });
    }
    catch (error) {
        console.error('Error in currency command:', error);
        await ctx.reply('Error changing currency.');
    }
};
const handleReminders = async (ctx) => {
    try {
        const userId = getUserId(ctx);
        const user = await db.getUser(userId);
        if (!user) {
            await ctx.reply('Error: user not found.');
            return;
        }
        const reminderStatus = user.reminderEnabled ? '✅ Enabled' : '❌ Disabled';
        const reminderTime = user.reminderTime || '20:00';
        const isActive = reminderService?.getUserReminderStatus(userId) || false;
        const message = `
🔔 *Reminder settings*

Status: ${reminderStatus}
Reminder time: ${reminderTime}
Active: ${isActive ? '✅ Yes' : '❌ No'}

Reminders help you remember to record your daily expenses.
    `;
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback(user.reminderEnabled ? '❌ Disable' : '✅ Enable', `reminder_toggle:${!user.reminderEnabled}`),
            ],
            [telegraf_1.Markup.button.callback('🕐 Change time', 'reminder_time')],
            [telegraf_1.Markup.button.callback('📝 Test reminder', 'reminder_test')],
        ]);
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup,
        });
    }
    catch (error) {
        console.error('Error in reminders command:', error);
        await ctx.reply('Error retrieving reminder settings.');
    }
};
const handleExpenseText = async (ctx) => {
    // Type guard to ensure we have a text message
    if (!ctx.message || !('text' in ctx.message)) {
        return;
    }
    const text = ctx.message.text;
    const userId = getUserId(ctx);
    try {
        // Check if we're waiting for reminder time input during initial setup
        const reminderSetupKey = `reminder_setup:${userId}`;
        const reminderUpdateKey = `reminder_time_update:${userId}`;
        const isWaitingForReminderTime = pendingTransactions.has(reminderSetupKey);
        const isWaitingForTimeUpdate = pendingTransactions.has(reminderUpdateKey);
        if (isWaitingForReminderTime) {
            await handleReminderTimeInput(ctx, text, userId);
            return;
        }
        if (isWaitingForTimeUpdate) {
            await handleReminderTimeUpdate(ctx, text, userId);
            return;
        }
        const parsed = (0, utils_1.parseExpenseInput)(text);
        if (!parsed) {
            await ctx.reply('❌ Incorrect format. Use: `100 Expense description` or `USD 100 Expense description`\n\n' +
                'Examples:\n' +
                '• `50 Coffee`\n' +
                '• `USD 100 Lunch`\n' +
                '• `EUR 25.50 Bus`\n' +
                '• `1200 Utilities`', { parse_mode: 'Markdown' });
            return;
        }
        // Get user currency for pending transaction
        const user = await db.getUser(userId);
        const userCurrency = user?.currency || 'UAH';
        // Use parsed currency if provided, otherwise use user's default currency
        const transactionCurrency = parsed.currency || userCurrency;
        // Store pending transaction
        const pendingTransaction = createPendingTransaction(userId, parsed.amount, transactionCurrency, parsed.description || '');
        storePendingTransaction(userId, pendingTransaction);
        // Get categories and create keyboard
        let categories = await db.getCategories();
        if (categories.length === 0) {
            // Try to initialize categories if they don't exist
            try {
                await db.ensureCategoriesExist();
                categories = await db.getCategories();
            }
            catch (error) {
                console.error('Failed to initialize categories:', error);
            }
            if (categories.length === 0) {
                await ctx.reply('❌ No categories available. Contact administrator.');
                return;
            }
        }
        const keyboard = createCategoriesKeyboard(categories);
        const confirmMessage = `💰 *Expense: ${(0, utils_1.formatCurrency)(parsed.amount, transactionCurrency)}*\n` +
            (parsed.description ? `📝 Description: ${parsed.description}\n` : '') +
            '\n🏷️ Choose category:';
        await ctx.reply(confirmMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
    catch (error) {
        console.error('Error processing expense input:', error);
        await ctx.reply('An error occurred while processing the expense. Please try again.');
    }
};
const handleCallbackQuery = async (ctx) => {
    const callbackQuery = ctx.callbackQuery;
    // Check if it's a data callback query
    if (!('data' in callbackQuery)) {
        await ctx.answerCbQuery('Unknown command');
        return;
    }
    const callbackData = callbackQuery.data;
    const userId = getUserId(ctx);
    try {
        if (callbackData?.startsWith('category:')) {
            await handleCategorySelection(ctx, callbackData, userId);
        }
        else if (callbackData?.startsWith('currency:')) {
            await handleCurrencySelection(ctx, callbackData, userId);
        }
        else if (callbackData?.startsWith('cancel:')) {
            await handleTransactionCancel(ctx, callbackData);
        }
        else if (callbackData?.startsWith('reminder_toggle:')) {
            await handleReminderToggle(ctx, callbackData, userId);
        }
        else if (callbackData === 'reminder_time') {
            await handleReminderTimeSetup(ctx, userId);
        }
        else if (callbackData === 'reminder_test') {
            await handleReminderTest(ctx);
        }
        else if (callbackData === 'reminder_settings') {
            await handleReminders(ctx);
        }
        else if (callbackData === 'add_expense_reminder') {
            await ctx.answerCbQuery();
            await ctx.reply('💰 Enter expense amount:');
        }
        else if (callbackData === 'view_today_reminder') {
            await handleToday(ctx);
        }
        else if (callbackData === 'reminder_default_time') {
            await handleReminderDefaultTime(ctx, userId);
        }
        else if (callbackData === 'reminder_skip') {
            await handleReminderSkip(ctx, userId);
        }
        else {
            await ctx.answerCbQuery('Unknown command');
        }
    }
    catch (error) {
        console.error('Error processing callback query:', error);
        await ctx.answerCbQuery('Error processing command');
    }
};
const handleCategorySelection = async (ctx, callbackData, userId) => {
    const categoryId = callbackData.replace('category:', '');
    const pendingTransaction = getPendingTransaction(userId);
    if (!pendingTransaction) {
        await ctx.answerCbQuery('Session expired. Enter expense again.');
        await ctx.editMessageText('❌ Session expired. Enter expense again.');
        return;
    }
    // Get category details
    const category = await db.getCategoryById(categoryId);
    if (!category) {
        await ctx.answerCbQuery('Category not found');
        return;
    }
    // Create transaction
    const user = await db.getUser(userId);
    const userCurrency = user?.currency || 'UAH';
    // Ensure currency is never undefined or empty
    const finalCurrency = pendingTransaction.currency || userCurrency || 'UAH';
    const transactionData = {
        userId,
        amount: pendingTransaction.amount,
        currency: finalCurrency,
        categoryId: category.id,
        description: pendingTransaction.description || '',
        date: new Date().toISOString(),
    };
    const transaction = await db.createTransaction(transactionData);
    // Clean up pending transaction
    clearPendingTransaction(userId);
    // Get today's total for confirmation
    const today = (0, utils_1.getTodayDateString)();
    const todayTransactions = await db.getDayTransactions(userId, today);
    const todayTotal = (0, utils_1.calculateDayTotal)(todayTransactions);
    const successMessage = `✅ *Expense recorded!*\n\n` +
        `💰 Amount: ${(0, utils_1.formatCurrency)(transaction.amount, transaction.currency)}\n` +
        `🏷️ Category: ${category.emoji} ${category.name}\n` +
        (transaction.description
            ? `📝 Description: ${transaction.description}\n`
            : '') +
        `\n📅 Today's total: ${await formatUserCurrency(todayTotal, userId)}`;
    // Only add cancel button if transaction has an ID
    if (transaction.id) {
        const cancelButton = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback('🚫 Cancel', `cancel:${transaction.id}`),
        ]);
        await ctx.editMessageText(successMessage, {
            parse_mode: 'Markdown',
            reply_markup: cancelButton.reply_markup,
        });
    }
    else {
        console.error('Transaction ID is missing, cannot add cancel button');
        await ctx.editMessageText(successMessage, { parse_mode: 'Markdown' });
    }
    await ctx.answerCbQuery('Expense recorded!');
};
const handleCurrencySelection = async (ctx, callbackData, userId) => {
    const currencyCode = callbackData.replace('currency:', '');
    try {
        // Update user's currency
        await db.updateUserCurrency(userId, currencyCode);
        const currency = constants_1.SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
        const currencyName = currency ? currency.name : currencyCode;
        // Check if this is initial setup (new user or user without completed setup)
        const user = await db.getUser(userId);
        const isInitialSetup = user && !user.setupCompleted;
        if (isInitialSetup) {
            // Continue to reminder setup for new users
            const reminderMessage = `
✅ Currency set: ${currencyName}

🔔 *Reminder setup*

Daily reminders will help you remember to record your expenses.

Enter time in HH:MM format (e.g., 20:00 or 14:24) or choose an action:
      `;
            await ctx.editMessageText(reminderMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '⏰ Use 20:00',
                                callback_data: 'reminder_default_time',
                            },
                            { text: '⏭️ Skip', callback_data: 'reminder_skip' },
                        ],
                    ],
                },
            });
            await ctx.answerCbQuery('Currency set! Now set up reminders.');
            // Set a flag to indicate we're waiting for reminder time input
            pendingTransactions.set(`reminder_setup:${userId}`, {
                userId,
                amount: 0,
                currency: 'UAH', // Default currency for reminder setup
                timestamp: Date.now(),
            });
            return;
        }
        // For existing users changing currency, show normal completion message
        const welcomeMessage = `
✅ Currency set: ${currencyName}

🎉 Welcome to TrackFin!

I'll help you track your finances.

📝 To add an expense, simply write:
\`100 Grocery shopping\`

📊 Available commands:
/today - today's expenses
/month - monthly expenses
/recent - recent transactions
/currency - change currency
/reminders - reminder settings
/help - help

Let's start tracking your finances! 💰
    `;
        await ctx.editMessageText(welcomeMessage, { parse_mode: 'Markdown' });
        await ctx.answerCbQuery('Currency set!');
    }
    catch (error) {
        console.error('Error updating currency:', error);
        await ctx.answerCbQuery('Error setting currency');
    }
};
const handleTransactionCancel = async (ctx, callbackData) => {
    const transactionId = callbackData.replace('cancel:', '');
    try {
        // Delete the transaction
        await db.deleteTransaction(transactionId);
        const cancelMessage = '❌ *Transaction cancelled*\n\nThe expense has been removed from your history.';
        await ctx.editMessageText(cancelMessage, { parse_mode: 'Markdown' });
        await ctx.answerCbQuery('Transaction cancelled');
    }
    catch (error) {
        console.error('Error canceling transaction:', error);
        await ctx.answerCbQuery('Error cancelling transaction');
        await ctx.editMessageText('❌ Error cancelling transaction. Please try again later.');
    }
};
const handleReminderTimeInput = async (ctx, timeInput, userId) => {
    try {
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        const match = timeInput.trim().match(timeRegex);
        if (!match) {
            await ctx.reply('❌ Incorrect time format. Use HH:MM format\n\n' +
                'Examples:\n' +
                '• `20:00` - 8 PM\n' +
                '• `14:24` - 2:24 PM\n' +
                '• `09:15` - 9:15 AM\n' +
                '• `00:30` - 12:30 AM\n\n' +
                'Enter time again:');
            return;
        }
        const [hours, minutes] = match.slice(1).map((num) => parseInt(num, 10));
        const reminderTime = `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}`;
        // Update user's reminder settings
        await db.updateUserReminder(userId, true, reminderTime);
        // Mark setup as completed
        await db.markSetupCompleted(userId);
        // Setup the reminder in the service
        const user = await db.getUser(userId);
        if (user && reminderService) {
            reminderService.updateUserReminder(user);
        }
        // Clear the setup flag
        const reminderSetupKey = `reminder_setup:${userId}`;
        pendingTransactions.delete(reminderSetupKey);
        // Show completion message
        const completionMessage = `
✅ *Setup completed!*

🔔 Reminders: ${reminderTime} daily
💱 Currency: ${user?.currency || 'UAH'}

🎉 Welcome to TrackFin!

📝 To add an expense, simply write:
\`100 Grocery shopping\`

📊 Available commands:
/today - today's expenses
/month - monthly expenses
/recent - recent transactions
/currency - change currency
/reminders - reminder settings
/help - help

Let's start tracking your finances! 💰
    `;
        await ctx.reply(completionMessage, { parse_mode: 'Markdown' });
    }
    catch (error) {
        console.error('Error setting reminder time during setup:', error);
        await ctx.reply('Error setting up reminder. Please try again later.');
    }
};
const handleReminderTimeUpdate = async (ctx, timeInput, userId) => {
    try {
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        const match = timeInput.trim().match(timeRegex);
        if (!match) {
            await ctx.reply('❌ Incorrect time format. Use HH:MM format\n\n' +
                'Examples:\n' +
                '• `20:00` - 8 PM\n' +
                '• `14:24` - 2:24 PM\n' +
                '• `09:15` - 9:15 AM\n' +
                '• `00:30` - 12:30 AM\n\n' +
                'Enter time again or use /reminders to return:');
            return;
        }
        const [hours, minutes] = match.slice(1).map((num) => parseInt(num, 10));
        const reminderTime = `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}`;
        // Update user's reminder settings and enable reminders
        await db.updateUserReminder(userId, true, reminderTime);
        // Update the reminder service
        const user = await db.getUser(userId);
        if (user && reminderService) {
            reminderService.updateUserReminder(user);
        }
        // Clear the update flag
        const reminderUpdateKey = `reminder_time_update:${userId}`;
        pendingTransactions.delete(reminderUpdateKey);
        await ctx.reply(`✅ Reminder time updated: ${reminderTime}\n\n` +
            'Reminders are enabled and will be sent daily at this time.', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⚙️ Reminder Settings',
                            callback_data: 'reminder_settings',
                        },
                    ],
                ],
            },
        });
    }
    catch (error) {
        console.error('Error updating reminder time:', error);
        await ctx.reply('Error updating reminder time. Please try again later.');
    }
};
const handleReminderDefaultTime = async (ctx, userId) => {
    try {
        // Use default time 20:00
        await db.updateUserReminder(userId, true, '20:00');
        await db.markSetupCompleted(userId);
        // Setup the reminder in the service
        const user = await db.getUser(userId);
        if (user && reminderService) {
            reminderService.updateUserReminder(user);
        }
        // Clear the setup flag
        const reminderSetupKey = `reminder_setup:${userId}`;
        pendingTransactions.delete(reminderSetupKey);
        const completionMessage = `
✅ *Setup completed!*

🔔 Reminders: 20:00 daily
💱 Currency: ${user?.currency || 'UAH'}

🎉 Welcome to TrackFin!

📝 To add an expense, simply write:
\`100 Grocery shopping\`

📊 Available commands:
/today - today's expenses
/month - monthly expenses
/recent - recent transactions
/currency - change currency
/reminders - reminder settings
/help - help

Let's start tracking your finances! 💰
    `;
        await ctx.editMessageText(completionMessage, { parse_mode: 'Markdown' });
        await ctx.answerCbQuery('✅ Reminders set to 20:00');
    }
    catch (error) {
        console.error('Error setting default reminder time:', error);
        await ctx.answerCbQuery('Error setting up reminder');
    }
};
const handleReminderSkip = async (ctx, userId) => {
    try {
        // Disable reminders and mark setup as completed
        await db.updateUserReminder(userId, false, '20:00');
        await db.markSetupCompleted(userId);
        // Clear the setup flag
        const reminderSetupKey = `reminder_setup:${userId}`;
        pendingTransactions.delete(reminderSetupKey);
        const user = await db.getUser(userId);
        const completionMessage = `
✅ *Setup completed!*

🔔 Reminders: disabled (can be enabled in /reminders)
💱 Currency: ${user?.currency || 'UAH'}

🎉 Welcome to TrackFin!

📝 To add an expense, simply write:
\`100 Grocery shopping\`

📊 Available commands:
/today - today's expenses
/month - monthly expenses
/recent - recent transactions
/currency - change currency
/reminders - reminder settings
/help - help

Let's start tracking your finances! 💰
    `;
        await ctx.editMessageText(completionMessage, { parse_mode: 'Markdown' });
        await ctx.answerCbQuery('✅ Reminders skipped');
    }
    catch (error) {
        console.error('Error skipping reminder setup:', error);
        await ctx.answerCbQuery('Error skipping setup');
    }
};
const handleReminderToggle = async (ctx, callbackData, userId) => {
    try {
        const enabled = callbackData.replace('reminder_toggle:', '') === 'true';
        const user = await db.getUser(userId);
        if (!user) {
            await ctx.answerCbQuery('Error: user not found');
            return;
        }
        const reminderTime = user.reminderTime || '20:00';
        await db.updateUserReminder(userId, enabled, reminderTime);
        if (enabled) {
            const updatedUser = await db.getUser(userId);
            if (updatedUser && reminderService) {
                reminderService.updateUserReminder(updatedUser);
            }
            await ctx.answerCbQuery('✅ Reminders enabled');
        }
        else {
            if (reminderService) {
                reminderService.stopUserReminder(userId);
            }
            await ctx.answerCbQuery('❌ Reminders disabled');
        }
        // Refresh the reminders menu
        await handleReminders(ctx);
    }
    catch (error) {
        console.error('Error toggling reminder:', error);
        await ctx.answerCbQuery('Error changing settings');
    }
};
const handleReminderTimeSetup = async (ctx, userId) => {
    try {
        const user = await db.getUser(userId);
        const currentTime = user?.reminderTime || '20:00';
        const message = `
🕐 *Reminder time setup*

Current time: ${currentTime}

Enter new time in HH:MM format:

*Examples:*
• \`20:00\` - 8 PM
• \`14:24\` - 2:24 PM  
• \`09:15\` - 9:15 AM
• \`00:30\` - 12:30 AM

Just send a message with the time:
    `;
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Back to settings',
                            callback_data: 'reminder_settings',
                        },
                    ],
                ],
            },
        });
        // Set a flag to indicate we're waiting for time input in existing settings
        pendingTransactions.set(`reminder_time_update:${userId}`, {
            userId,
            amount: 0,
            currency: 'UAH', // Default currency for reminder setup
            timestamp: Date.now(),
        });
        await ctx.answerCbQuery();
    }
    catch (error) {
        console.error('Error setting up reminder time:', error);
        await ctx.answerCbQuery('Error setting up time');
    }
};
const handleReminderTest = async (ctx) => {
    try {
        const message = "🔔 This is a test reminder!\n\n🕗 The day is ending, don't forget to record your expenses.";
        await ctx.reply(message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '💰 Add Expense',
                            callback_data: 'add_expense_reminder',
                        },
                        {
                            text: '📊 View Today',
                            callback_data: 'view_today_reminder',
                        },
                    ],
                ],
            },
        });
        await ctx.answerCbQuery('📝 Test reminder sent');
    }
    catch (error) {
        console.error('Error sending test reminder:', error);
        await ctx.answerCbQuery('Error sending test reminder');
    }
};
const handleError = (err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('An unexpected error occurred. Please try again later.');
};
// Bot setup and initialization
const setupBotHandlers = (bot) => {
    // Command handlers
    bot.start(handleStart);
    bot.help(handleHelp);
    bot.command('today', handleToday);
    bot.command('month', handleMonth);
    bot.command('recent', handleRecent);
    bot.command('currency', handleCurrency);
    bot.command('reminders', handleReminders);
    // Message handlers
    bot.on('text', handleExpenseText);
    bot.on('callback_query', handleCallbackQuery);
    // Error handling
    bot.catch(handleError);
};
const createBot = (token) => {
    const bot = new telegraf_1.Telegraf(token);
    // Initialize reminder service
    reminderService = new reminder_1.ReminderService(bot);
    setupBotHandlers(bot);
    return bot;
};
exports.createBot = createBot;
const startBot = async (bot) => {
    try {
        await db.ensureCategoriesExist();
        await reminderService.initializeReminders();
    }
    catch (error) {
        console.error('Initialization failed:', error);
    }
    bot.launch();
    // Graceful shutdown
    process.once('SIGINT', () => {
        reminderService.stopAllReminders();
        bot.stop('SIGINT');
    });
    process.once('SIGTERM', () => {
        reminderService.stopAllReminders();
        bot.stop('SIGTERM');
    });
};
exports.startBot = startBot;
//# sourceMappingURL=bot.js.map