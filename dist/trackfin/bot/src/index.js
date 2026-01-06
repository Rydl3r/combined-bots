"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bot_1 = require("./bot");
async function main() {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
        console.error('BOT_TOKEN environment variable is required');
        process.exit(1);
    }
    // Validate Firebase configuration
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`${envVar} environment variable is required`);
            process.exit(1);
        }
    }
    try {
        const bot = (0, bot_1.createBot)(botToken);
        await (0, bot_1.startBot)(bot);
    }
    catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=index.js.map