import { Transaction, Category, User } from './types';
export declare const createOrUpdateUser: (telegramUser: any) => Promise<User>;
export declare const getUser: (userId: string) => Promise<User | null>;
export declare const getAllUsers: () => Promise<User[]>;
export declare const initializeDefaultCategories: () => Promise<void>;
export declare const ensureCategoriesExist: () => Promise<void>;
export declare const getAllCategories: () => Promise<Category[]>;
export declare const getCategories: () => Promise<Category[]>;
export declare const getCategoryByName: (name: string) => Promise<Category | null>;
export declare const getCategoryById: (categoryId: string) => Promise<Category | null>;
export declare const updateUserCurrency: (userId: string, currency: string) => Promise<void>;
export declare const updateUserReminder: (userId: string, reminderEnabled: boolean, reminderTime?: string) => Promise<void>;
export declare const markSetupCompleted: (userId: string) => Promise<void>;
export declare const createTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Promise<Transaction>;
export declare const deleteTransaction: (transactionId: string) => Promise<void>;
export declare const getUserTransactions: (userId: string, limitCount?: number) => Promise<Transaction[]>;
export interface TransactionWithCategory extends Transaction {
    category: Category;
}
export declare const getUserTransactionsWithCategories: (userId: string, limitCount?: number) => Promise<TransactionWithCategory[]>;
export declare const getDayTransactionsWithCategories: (userId: string, date: string) => Promise<TransactionWithCategory[]>;
export declare const getDayTransactions: (userId: string, date: string) => Promise<Transaction[]>;
export declare const getMonthTransactions: (userId: string, year: number, month: number) => Promise<Transaction[]>;
//# sourceMappingURL=database.d.ts.map