/**
 * Telegram Bot for Multi-Exchange Position Tracking
 * Sends position updates every 5 minutes and responds to commands
 */
import { AppConfig } from './types';
/**
 * Initialize the Telegram bot with configuration
 */
export declare function initializeBot(botConfig: AppConfig): void;
/**
 * Send position update to specified chat
 */
export declare function sendPositionUpdate(chatId: string | number, applyFilter?: boolean, showMenu?: boolean): Promise<boolean>;
/**
 * Start the bot and begin polling for messages
 */
export declare function startBot(): Promise<void>;
/**
 * Stop the bot gracefully
 */
export declare function stopBot(): Promise<void>;
//# sourceMappingURL=telegramBot.d.ts.map