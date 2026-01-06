"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.parseExpenseInput = parseExpenseInput;
exports.calculateBalance = calculateBalance;
exports.calculateDayTotal = calculateDayTotal;
exports.formatTransactionsList = formatTransactionsList;
exports.formatTransactionsWithCategoriesList = formatTransactionsWithCategoriesList;
exports.isValidAmount = isValidAmount;
exports.getTodayDateString = getTodayDateString;
exports.getCurrentMonth = getCurrentMonth;
const constants_1 = require("./constants");
function formatCurrency(amount, currency = 'UAH') {
    return `${amount.toFixed(2)} ${currency}`;
}
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
function parseExpenseInput(text) {
    // Remove extra spaces and normalize
    const normalized = text.trim().replace(/\s+/g, ' ');
    // Try to match: currency amount [description] (e.g., "USD 100 Purchase")
    const currencyAmountMatch = normalized.match(/^([A-Za-z]{3})\s+(\d+(?:[.,]\d{1,2})?)\s*(.*)$/);
    if (currencyAmountMatch) {
        const currency = currencyAmountMatch[1].toUpperCase();
        const amountStr = currencyAmountMatch[2].replace(',', '.');
        const amount = parseFloat(amountStr);
        const description = currencyAmountMatch[3].trim();
        if (isNaN(amount) || amount <= 0) {
            return null;
        }
        // Validate currency against supported currencies
        const isSupportedCurrency = constants_1.SUPPORTED_CURRENCIES.some((c) => c.code === currency);
        if (!isSupportedCurrency) {
            return null;
        }
        return {
            amount,
            currency,
            description: description || undefined,
        };
    }
    // Try to match: number [description] (original format)
    const amountMatch = normalized.match(/^(\d+(?:[.,]\d{1,2})?)\s*(.*)$/);
    if (!amountMatch) {
        return null;
    }
    const amountStr = amountMatch[1].replace(',', '.');
    const amount = parseFloat(amountStr);
    const description = amountMatch[2].trim();
    if (isNaN(amount) || amount <= 0) {
        return null;
    }
    return {
        amount,
        description: description || undefined,
    };
}
function calculateBalance(transactions) {
    return transactions.reduce((balance, transaction) => {
        return balance - transaction.amount; // Only expenses now
    }, 0);
}
function calculateDayTotal(transactions) {
    // Since we only track expenses now, just sum all transactions
    return transactions.reduce((total, t) => total + t.amount, 0);
}
function formatTransactionsList(transactions) {
    if (transactions.length === 0) {
        return 'No transactions';
    }
    return transactions
        .slice(0, 10) // Show last 10 transactions
        .map((t) => {
        const emoji = '➖'; // Only expenses now
        const sign = '-';
        const description = t.description ? ` (${t.description})` : '';
        return `${emoji} ${sign}${formatCurrency(t.amount)} - ${t.category || 'Unknown Category'}${description}`;
    })
        .join('\n');
}
function formatTransactionsWithCategoriesList(transactions, fallbackCurrency = 'UAH') {
    if (transactions.length === 0) {
        return 'No transactions';
    }
    return transactions
        .slice(0, 10) // Show last 10 transactions
        .map((t) => {
        const emoji = '➖'; // Only expenses now
        const sign = '-';
        const description = t.description ? ` (${t.description})` : '';
        const dateStr = formatDate(t.date);
        // Use transaction's currency if available, fallback to provided currency
        const currency = t.currency || fallbackCurrency;
        return `${emoji} ${sign}${formatCurrency(t.amount, currency)} - ${t.category.emoji} ${t.category.name}${description}\n📅 ${dateStr}`;
    })
        .join('\n\n');
}
function isValidAmount(text) {
    const normalized = text.trim().replace(',', '.');
    const amount = parseFloat(normalized);
    return !isNaN(amount) && amount > 0;
}
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}
function getCurrentMonth() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
    };
}
//# sourceMappingURL=utils.js.map