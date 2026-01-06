import { Telegraf, Context } from 'telegraf';
import { PendingTransaction } from './types';
interface BotContext extends Context {
    session?: {
        pendingTransaction?: PendingTransaction;
    };
}
export declare const createBot: (token: string) => Telegraf<BotContext>;
export declare const startBot: (bot: Telegraf<BotContext>) => Promise<void>;
export {};
//# sourceMappingURL=bot.d.ts.map