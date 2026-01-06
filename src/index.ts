import 'dotenv/config';

// Define bot types
type BotType = 'trackfin' | 'positions' | 'both';

async function main() {
  const botType = (process.env.BOT_TYPE as BotType) || 'both';

  console.log(`🚀 Starting bots... (mode: ${botType})`);

  const promises: Promise<void>[] = [];

  // Start TrackFin bot if enabled
  if (botType === 'trackfin' || botType === 'both') {
    promises.push(startTrackFinBot());
  }

  // Start Positions Tracker bot if enabled
  if (botType === 'positions' || botType === 'both') {
    promises.push(startPositionsBot());
  }

  if (promises.length === 0) {
    console.error(
      '❌ No bots configured to start. Set BOT_TYPE to "trackfin", "positions", or "both"'
    );
    process.exit(1);
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('❌ Error starting bots:', error);
    process.exit(1);
  }
}

async function startTrackFinBot(): Promise<void> {
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
      console.error(
        `❌ ${envVar} environment variable is required for TrackFin bot`
      );
      throw new Error(`Missing ${envVar}`);
    }
  }

  try {
    const { createBot, startBot } = await import('../../trackfin/bot/src/bot');
    const bot = createBot(botToken);
    await startBot(bot);
    console.log('✅ TrackFin Bot started successfully!');
  } catch (error) {
    console.error('❌ Failed to start TrackFin Bot:', error);
    throw error;
  }
}

async function startPositionsBot(): Promise<void> {
  console.log('🔄 Starting Positions Tracker Bot...');

  try {
    const positionsModule = await import('../../positions-tracker/src/index');
    await positionsModule.main();
    console.log('✅ Positions Tracker Bot started successfully!');
  } catch (error) {
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
