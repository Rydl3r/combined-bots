export interface Transaction {
    id?: string;
    userId: string;
    amount: number;
    currency: string;
    categoryId: string;
    description?: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}
export interface Category {
    id?: string;
    name: string;
    emoji: string;
    color: string;
}
export interface User {
    id: string;
    telegramId: string;
    firstName: string;
    lastName: string;
    username: string;
    currency: string;
    timezone: string;
    language: string;
    createdAt: string;
    lastLoginAt: string;
    reminderEnabled?: boolean;
    reminderTime?: string;
    setupCompleted?: boolean;
}
export interface PendingTransaction {
    userId: string;
    amount: number;
    currency: string;
    description?: string;
    timestamp: number;
}
export interface Currency {
    code: string;
    symbol: string;
    name: string;
}
export interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    lastUpdated: string;
}
export interface ExchangeRatesResponse {
    base: string;
    rates: Record<string, number>;
    lastUpdated: string;
}
//# sourceMappingURL=types.d.ts.map