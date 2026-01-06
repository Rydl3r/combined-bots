"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthTransactions = exports.getDayTransactions = exports.getDayTransactionsWithCategories = exports.getUserTransactionsWithCategories = exports.getUserTransactions = exports.deleteTransaction = exports.createTransaction = exports.markSetupCompleted = exports.updateUserReminder = exports.updateUserCurrency = exports.getCategoryById = exports.getCategoryByName = exports.getCategories = exports.getAllCategories = exports.ensureCategoriesExist = exports.initializeDefaultCategories = exports.getAllUsers = exports.getUser = exports.createOrUpdateUser = void 0;
const firebase_admin_1 = require("./firebase-admin");
const constants_1 = require("./constants");
// Constants
const COLLECTIONS = {
    USERS: 'users',
    TRANSACTIONS: 'transactions',
    CATEGORIES: 'categories',
};
// Helper functions
const getCurrentTimestamp = () => new Date().toISOString();
const mapDocToEntity = (doc) => ({
    id: doc.id,
    ...doc.data(),
});
const createUser = (telegramUser) => {
    const userId = telegramUser.id.toString();
    const now = getCurrentTimestamp();
    return {
        id: userId,
        telegramId: userId,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || '',
        username: telegramUser.username || '',
        currency: constants_1.DEFAULT_CURRENCY, // Set UAH as default currency
        timezone: 'Europe/Kiev',
        language: 'uk',
        createdAt: now,
        lastLoginAt: now,
        reminderEnabled: true, // Default: reminders enabled
        reminderTime: '20:00', // Default: 8 PM
        setupCompleted: false, // Will be set to true after initial setup
    };
};
const updateUserLastLogin = (user) => ({
    ...user,
    lastLoginAt: getCurrentTimestamp(),
});
const addTimestamps = (data) => ({
    ...data,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
});
const sortTransactionsByDate = (transactions) => transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
const filterTransactionsByDay = (transactions, date) => {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    return transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startOfDay && transactionDate <= endOfDay;
    });
};
const filterTransactionsByMonth = (transactions, year, month) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    return transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });
};
// Database operations
const createOrUpdateUser = async (telegramUser) => {
    const userId = telegramUser.id.toString();
    const userRef = firebase_admin_1.db.collection(COLLECTIONS.USERS).doc(userId);
    try {
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const updatedUser = updateUserLastLogin(userData);
            await userRef.set(updatedUser);
            return updatedUser;
        }
        else {
            const newUser = createUser(telegramUser);
            await userRef.set(newUser);
            await (0, exports.initializeDefaultCategories)();
            return newUser;
        }
    }
    catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
};
exports.createOrUpdateUser = createOrUpdateUser;
const getUser = async (userId) => {
    try {
        const userRef = firebase_admin_1.db.collection(COLLECTIONS.USERS).doc(userId);
        const userDoc = await userRef.get();
        return userDoc.exists ? userDoc.data() : null;
    }
    catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};
exports.getUser = getUser;
const getAllUsers = async () => {
    try {
        const usersRef = firebase_admin_1.db.collection(COLLECTIONS.USERS);
        const snapshot = await usersRef.get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
};
exports.getAllUsers = getAllUsers;
const initializeDefaultCategories = async () => {
    try {
        const categoriesRef = firebase_admin_1.db.collection(COLLECTIONS.CATEGORIES);
        // Check if categories already exist
        const existingCategories = await categoriesRef.limit(1).get();
        if (!existingCategories.empty) {
            return;
        }
        const categoryPromises = constants_1.DEFAULT_CATEGORIES.map((category) => categoriesRef.add(category));
        await Promise.all(categoryPromises);
    }
    catch (error) {
        console.error('Error initializing categories:', error);
        throw error;
    }
};
exports.initializeDefaultCategories = initializeDefaultCategories;
const ensureCategoriesExist = async () => {
    try {
        const categories = await (0, exports.getCategories)();
        if (categories.length === 0) {
            await (0, exports.initializeDefaultCategories)();
        }
    }
    catch (error) {
        console.error('Error ensuring categories exist:', error);
        throw error;
    }
};
exports.ensureCategoriesExist = ensureCategoriesExist;
const getAllCategories = async () => {
    try {
        const categoriesRef = firebase_admin_1.db.collection(COLLECTIONS.CATEGORIES);
        const querySnapshot = await categoriesRef.get();
        return querySnapshot.docs.map((doc) => mapDocToEntity(doc));
    }
    catch (error) {
        console.error('Error getting all categories:', error);
        throw error;
    }
};
exports.getAllCategories = getAllCategories;
const getCategories = async () => {
    try {
        const categoriesRef = firebase_admin_1.db.collection(COLLECTIONS.CATEGORIES);
        const querySnapshot = await categoriesRef.get();
        return querySnapshot.docs.map((doc) => mapDocToEntity(doc));
    }
    catch (error) {
        console.error('Error getting categories:', error);
        throw error;
    }
};
exports.getCategories = getCategories;
const getCategoryByName = async (name) => {
    try {
        const categoriesRef = firebase_admin_1.db.collection(COLLECTIONS.CATEGORIES);
        const querySnapshot = await categoriesRef
            .where('name', '==', name)
            .limit(1)
            .get();
        if (querySnapshot.empty) {
            return null;
        }
        return mapDocToEntity(querySnapshot.docs[0]);
    }
    catch (error) {
        console.error('Error getting category by name:', error);
        throw error;
    }
};
exports.getCategoryByName = getCategoryByName;
const getCategoryById = async (categoryId) => {
    try {
        const categoryRef = firebase_admin_1.db.collection(COLLECTIONS.CATEGORIES).doc(categoryId);
        const categoryDoc = await categoryRef.get();
        if (!categoryDoc.exists) {
            return null;
        }
        return mapDocToEntity(categoryDoc);
    }
    catch (error) {
        console.error('Error getting category by ID:', error);
        throw error;
    }
};
exports.getCategoryById = getCategoryById;
const updateUserCurrency = async (userId, currency) => {
    try {
        const userRef = firebase_admin_1.db.collection(COLLECTIONS.USERS).doc(userId);
        await userRef.update({
            currency,
            updatedAt: getCurrentTimestamp(),
        });
    }
    catch (error) {
        console.error('Error updating user currency:', error);
        throw error;
    }
};
exports.updateUserCurrency = updateUserCurrency;
const updateUserReminder = async (userId, reminderEnabled, reminderTime) => {
    try {
        const userRef = firebase_admin_1.db.collection(COLLECTIONS.USERS).doc(userId);
        const updateData = {
            reminderEnabled,
            updatedAt: getCurrentTimestamp(),
        };
        if (reminderTime !== undefined) {
            updateData.reminderTime = reminderTime;
        }
        await userRef.update(updateData);
    }
    catch (error) {
        console.error('Error updating user reminder settings:', error);
        throw error;
    }
};
exports.updateUserReminder = updateUserReminder;
const markSetupCompleted = async (userId) => {
    try {
        const userRef = firebase_admin_1.db.collection(COLLECTIONS.USERS).doc(userId);
        await userRef.update({
            setupCompleted: true,
            updatedAt: getCurrentTimestamp(),
        });
    }
    catch (error) {
        console.error('Error marking setup as completed:', error);
        throw error;
    }
};
exports.markSetupCompleted = markSetupCompleted;
const createTransaction = async (transaction) => {
    try {
        // Ensure currency is never undefined
        const safeTransaction = {
            ...transaction,
            currency: transaction.currency || 'UAH',
            description: transaction.description || '',
        };
        const transactionData = addTimestamps(safeTransaction);
        const transactionsRef = firebase_admin_1.db.collection(COLLECTIONS.TRANSACTIONS);
        const docRef = await transactionsRef.add(transactionData);
        return {
            id: docRef.id,
            ...transactionData,
        };
    }
    catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};
exports.createTransaction = createTransaction;
const deleteTransaction = async (transactionId) => {
    try {
        const transactionRef = firebase_admin_1.db
            .collection(COLLECTIONS.TRANSACTIONS)
            .doc(transactionId);
        await transactionRef.delete();
    }
    catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};
exports.deleteTransaction = deleteTransaction;
const getUserTransactions = async (userId, limitCount = 10) => {
    try {
        const transactionsRef = firebase_admin_1.db.collection(COLLECTIONS.TRANSACTIONS);
        const querySnapshot = await transactionsRef
            .where('userId', '==', userId)
            .get();
        const transactions = querySnapshot.docs.map((doc) => mapDocToEntity(doc));
        return sortTransactionsByDate(transactions).slice(0, limitCount);
    }
    catch (error) {
        console.error('Error getting user transactions:', error);
        throw error;
    }
};
exports.getUserTransactions = getUserTransactions;
const getUserTransactionsWithCategories = async (userId, limitCount = 10) => {
    try {
        const transactions = await (0, exports.getUserTransactions)(userId, limitCount);
        const transactionsWithCategories = [];
        for (const transaction of transactions) {
            const category = await (0, exports.getCategoryById)(transaction.categoryId);
            if (category) {
                transactionsWithCategories.push({
                    ...transaction,
                    category,
                });
            }
        }
        return transactionsWithCategories;
    }
    catch (error) {
        console.error('Error getting user transactions with categories:', error);
        throw error;
    }
};
exports.getUserTransactionsWithCategories = getUserTransactionsWithCategories;
const getDayTransactionsWithCategories = async (userId, date) => {
    try {
        const transactions = await (0, exports.getDayTransactions)(userId, date);
        const transactionsWithCategories = [];
        for (const transaction of transactions) {
            const category = await (0, exports.getCategoryById)(transaction.categoryId);
            if (category) {
                transactionsWithCategories.push({
                    ...transaction,
                    category,
                });
            }
        }
        return transactionsWithCategories;
    }
    catch (error) {
        console.error('Error getting day transactions with categories:', error);
        throw error;
    }
};
exports.getDayTransactionsWithCategories = getDayTransactionsWithCategories;
const getDayTransactions = async (userId, date) => {
    try {
        const transactionsRef = firebase_admin_1.db.collection(COLLECTIONS.TRANSACTIONS);
        const querySnapshot = await transactionsRef
            .where('userId', '==', userId)
            .get();
        const allTransactions = querySnapshot.docs.map((doc) => mapDocToEntity(doc));
        const dayTransactions = filterTransactionsByDay(allTransactions, date);
        return sortTransactionsByDate(dayTransactions);
    }
    catch (error) {
        console.error('Error getting day transactions:', error);
        throw error;
    }
};
exports.getDayTransactions = getDayTransactions;
const getMonthTransactions = async (userId, year, month) => {
    try {
        const transactionsRef = firebase_admin_1.db.collection(COLLECTIONS.TRANSACTIONS);
        const querySnapshot = await transactionsRef
            .where('userId', '==', userId)
            .get();
        const allTransactions = querySnapshot.docs.map((doc) => mapDocToEntity(doc));
        const monthTransactions = filterTransactionsByMonth(allTransactions, year, month);
        return sortTransactionsByDate(monthTransactions);
    }
    catch (error) {
        console.error('Error getting month transactions:', error);
        throw error;
    }
};
exports.getMonthTransactions = getMonthTransactions;
//# sourceMappingURL=database.js.map