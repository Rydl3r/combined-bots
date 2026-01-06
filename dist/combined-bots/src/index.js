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
require("dotenv/config");
async function main() {
    const botType = process.env.BOT_TYPE || 'both';
    console.log(`🚀 Starting bots... (mode: ${botType})`);
    const promises = [];
    // Start TrackFin bot if enabled
    if (botType === 'trackfin' || botType === 'both') {
        promises.push(startTrackFinBot());
    }
    // Start Positions Tracker bot if enabled
    if (botType === 'positions' || botType === 'both') {
        promises.push(startPositionsBot());
    }
    if (promises.length === 0) {
        console.error('❌ No bots configured to start. Set BOT_TYPE to "trackfin", "positions", or "both"');
        process.exit(1);
    }
    try {
        await Promise.all(promises);
    }
    catch (error) {
        console.error('❌ Error starting bots:', error);
        process.exit(1);
    }
}
async function startTrackFinBot() {
    console.log('🔄 Starting TrackFin Bot...');
    const botToken = process.env.TRACKFIN_BOT_TOKEN;
    if (!botToken) {
        console.error('❌ TRACKFIN_BOT_TOKEN environment variable is required');
        throw new Error('Missing TrackFin bot token');
    }
    // Validate Firebase configuration
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ ${envVar} environment variable is required for TrackFin bot`);
            throw new Error(`Missing ${envVar}`);
        }
    }
    try {
        const { createBot, startBot } = await Promise.resolve().then(() => __importStar(require('../../trackfin/bot/src/bot')));
        const bot = createBot(botToken);
        await startBot(bot);
        console.log('✅ TrackFin Bot started successfully!');
    }
    catch (error) {
        console.error('❌ Failed to start TrackFin Bot:', error);
        throw error;
    }
}
async function startPositionsBot() {
    console.log('🔄 Starting Positions Tracker Bot...');
    try {
        const positionsModule = await Promise.resolve().then(() => __importStar(require('../../positions-tracker/src/index')));
        await positionsModule.main();
        console.log('✅ Positions Tracker Bot started successfully!');
    }
    catch (error) {
        console.error('❌ Failed to start Positions Tracker Bot:', error);
        throw error;
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
// Start the application
main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map