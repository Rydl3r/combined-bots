/**
 * Telegram bot command handlers
 * Handles all bot commands and middleware
 */
import { Context, Telegraf } from 'telegraf';
/**
 * Reply keyboard button layout
 */
interface ReplyKeyboard {
    keyboard: string[][];
    resize_keyboard: boolean;
    persistent: boolean;
}
/**
 * Create main menu keyboard
 */
export declare function createMainMenuKeyboard(): ReplyKeyboard;
/**
 * Create quick actions keyboard (alias for main menu)
 */
export declare function createQuickActionsKeyboard(): ReplyKeyboard;
/**
 * Setup middleware for the bot
 */
export declare function setupMiddleware(bot: Telegraf<Context>, adminChatId: string): void;
/**
 * Type for position update function
 */
type SendPositionUpdateFn = (chatId: string | number, applyFilter: boolean, showMenu: boolean) => Promise<boolean>;
/**
 * Setup bot command handlers
 */
export declare function setupCommandHandlers(bot: Telegraf<Context>, sendPositionUpdate: SendPositionUpdateFn): void;
export {};
//# sourceMappingURL=botHandlers.d.ts.map