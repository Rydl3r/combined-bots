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
exports.ReminderService = void 0;
const cron = __importStar(require("node-cron"));
const db = __importStar(require("./database"));
class ReminderService {
    constructor(bot) {
        this.scheduledJobs = new Map();
        this.bot = bot;
    }
    /**
     * Initialize reminders for all users when bot starts
     */
    async initializeReminders() {
        try {
            const users = await db.getAllUsers();
            for (const user of users) {
                if (user.reminderEnabled && user.reminderTime) {
                    this.scheduleUserReminder(user);
                }
            }
        }
        catch (error) {
            console.error('Error initializing reminders:', error);
        }
    }
    /**
     * Schedule a reminder for a specific user
     */
    scheduleUserReminder(user) {
        const userId = user.id;
        // Stop existing reminder if any
        this.stopUserReminder(userId);
        if (!user.reminderEnabled || !user.reminderTime) {
            return;
        }
        try {
            const [hours, minutes] = user.reminderTime
                .split(':')
                .map((num) => parseInt(num, 10));
            if (isNaN(hours) ||
                isNaN(minutes) ||
                hours < 0 ||
                hours > 23 ||
                minutes < 0 ||
                minutes > 59) {
                console.error(`❌ Invalid reminder time for user ${userId}: ${user.reminderTime}`);
                return;
            }
            // Create cron expression for daily reminder
            // Format: "minute hour * * *" (every day at specified time)
            const cronExpression = `${minutes} ${hours} * * *`;
            const task = cron.schedule(cronExpression, async () => {
                await this.sendReminder(userId);
            }, {
                timezone: user.timezone || 'Europe/Kiev',
            });
            this.scheduledJobs.set(userId, task);
        }
        catch (error) {
            console.error(`Error scheduling reminder for user ${userId}:`, error);
        }
    }
    /**
     * Stop reminder for a specific user
     */
    stopUserReminder(userId) {
        const existingTask = this.scheduledJobs.get(userId);
        if (existingTask) {
            existingTask.stop();
            existingTask.destroy();
            this.scheduledJobs.delete(userId);
        }
    }
    /**
     * Send reminder message to user
     */
    async sendReminder(userId) {
        try {
            const user = await db.getUser(userId);
            if (!user || !user.reminderEnabled) {
                // User disabled reminders or doesn't exist, stop the reminder
                this.stopUserReminder(userId);
                return;
            }
            const message = "🕗 The day is ending, don't forget to record your expenses.";
            await this.bot.telegram.sendMessage(userId, message, {
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
            // If user blocked the bot or chat not found, stop the reminder
            if (error && typeof error === 'object' && 'response' in error) {
                const telegramError = error;
                if (telegramError.response?.error_code === 403 ||
                    telegramError.response?.error_code === 400) {
                    this.stopUserReminder(userId);
                }
            }
        }
    }
    /**
     * Update reminder for a user (called when user changes settings)
     */
    updateUserReminder(user) {
        this.scheduleUserReminder(user);
    }
    /**
     * Get reminder status for a user
     */
    getUserReminderStatus(userId) {
        return this.scheduledJobs.has(userId);
    }
    /**
     * Stop all reminders (called when bot shuts down)
     */
    stopAllReminders() {
        for (const [_userId, task] of this.scheduledJobs) {
            task.stop();
            task.destroy();
        }
        this.scheduledJobs.clear();
    }
}
exports.ReminderService = ReminderService;
//# sourceMappingURL=reminder.js.map