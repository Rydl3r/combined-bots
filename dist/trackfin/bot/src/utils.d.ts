import { Transaction } from './types';
import { TransactionWithCategory } from './database';
export declare function formatCurrency(amount: number, currency?: string): string;
export declare function formatDate(date: string): string;
export declare function parseExpenseInput(text: string): {
    amount: number;
    description?: string;
    currency?: string;
} | null;
export declare function calculateBalance(transactions: Transaction[]): number;
export declare function calculateDayTotal(transactions: Transaction[]): number;
export declare function formatTransactionsList(transactions: Transaction[]): string;
export declare function formatTransactionsWithCategoriesList(transactions: TransactionWithCategory[], fallbackCurrency?: string): string;
export declare function isValidAmount(text: string): boolean;
export declare function getTodayDateString(): string;
export declare function getCurrentMonth(): {
    year: number;
    month: number;
};
//# sourceMappingURL=utils.d.ts.map