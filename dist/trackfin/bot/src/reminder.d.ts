import { Telegraf, Context } from 'telegraf';
import { User } from './types';
interface BotContext extends Context {
    session?: {
        pendingTransaction?: any;
    };
}
declare class ReminderService {
    private bot;
    private scheduledJobs;
    constructor(bot: Telegraf<BotContext>);
    /**
     * Initialize reminders for all users when bot starts
     */
    initializeReminders(): Promise<void>;
    /**
     * Schedule a reminder for a specific user
     */
    scheduleUserReminder(user: User): void;
    /**
     * Stop reminder for a specific user
     */
    stopUserReminder(userId: string): void;
    /**
     * Send reminder message to user
     */
    private sendReminder;
    /**
     * Update reminder for a user (called when user changes settings)
     */
    updateUserReminder(user: User): void;
    /**
     * Get reminder status for a user
     */
    getUserReminderStatus(userId: string): boolean;
    /**
     * Stop all reminders (called when bot shuts down)
     */
    stopAllReminders(): void;
}
export { ReminderService };
//# sourceMappingURL=reminder.d.ts.map