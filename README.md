# Combined Telegram Bots# Combined Bots

This project combines two Telegram bots into a single deployable application:This project combines two Telegram bots into a single deployable application:

1. **Positions Tracker Bot** - Multi-exchange crypto positions tracker (MEXC, Binance, Bybit, OKX, Gate.io, KuCoin, Bitget, BingX)1. **TrackFin Bot** - Personal finance tracker

2. **TrackFin Bot** - Personal finance and expense tracker2. **Positions Tracker Bot** - Crypto positions tracker for MEXC exchange

## Architecture## Deployment

The combined-bots project references external source code from sibling directories:The application is designed to work with hosting platforms that:

- **Positions Tracker**: `../positions-tracker/src/`1. Run `npm install` from the root folder

- **TrackFin Bot**: `../trackfin/bot/src/`2. Run `node dist/index.js` from the root folder

This architecture allows each bot to be developed and maintained independently while being deployed together.## Build and Run

## Prerequisites```bash

# Install dependencies

- Node.js >= 16.0.0npm install

- npm or yarn

- Telegram bot tokens (from [@BotFather](https://t.me/botfather))# Build the application

- API keys for exchanges (if using Positions Tracker)npm run build

- Firebase project (if using TrackFin)

# Start the application

## Installationnpm start

````

```bash

# Navigate to combined-bots directory## Environment Variables

cd combined-bots

### Bot Control

# Install dependencies

npm install- `BOT_TYPE`: Controls which bots to start

  - `"trackfin"` - Start only TrackFin bot

# Also ensure dependencies are installed in the bot projects  - `"positions"` - Start only Positions Tracker bot

cd ../positions-tracker && npm install  - `"both"` - Start both bots (default)

cd ../trackfin/bot && npm install

cd ../combined-bots### TrackFin Bot

````

- `TRACKFIN_BOT_TOKEN`: Telegram bot token for TrackFin bot

## Configuration- `FIREBASE_PROJECT_ID`: Firebase project ID

- `FIREBASE_CLIENT_EMAIL`: Firebase service account email

Create a `.env` file in the combined-bots root directory. See `.env.example` for all available options.- `FIREBASE_PRIVATE_KEY`: Firebase service account private key

### Required Environment Variables### Positions Tracker Bot

#### Bot ControlAll environment variables required by the positions tracker bot should be set as they were in the original configuration.

- `BOT_TYPE`: Controls which bots to start
  - `"trackfin"` - Start only TrackFin bot## Development

  - `"positions"` - Start only Positions Tracker bot

  - `"both"` - Start both bots (default)```bash

# Development mode with hot reload

#### TrackFin Bot (Required if `BOT_TYPE` includes "trackfin" or "both")npm run dev

- `TRACKFIN_BOT_TOKEN`: Telegram bot token for TrackFin

- `FIREBASE_PROJECT_ID`: Firebase project ID# Lint code

- `FIREBASE_CLIENT_EMAIL`: Firebase service account emailnpm run lint

- `FIREBASE_PRIVATE_KEY`: Firebase service account private key

- Additional Firebase configuration variables (see `.env.example`)# Format code

npm run format

#### Positions Tracker Bot (Required if `BOT_TYPE` includes "positions" or "both")```

- `BOT_TOKEN`: Telegram bot token for Positions Tracker

- `ADMIN_CHAT_ID`: Your Telegram chat ID## Project Structure

#### Exchange Configurations (Optional - enable as needed)```

src/

Each exchange requires three variables (example for MEXC):├── index.ts # Unified entry point

````env├── trackfin-bot/           # TrackFin bot source files

MEXC_ENABLED=true│   ├── bot.ts

MEXC_ACCESS_KEY=your_access_key│   ├── constants.ts

MEXC_SECRET_KEY=your_secret_key│   ├── database.ts

```│   ├── firebase-admin.ts

│   ├── firebase.ts

Supported exchanges:│   ├── reminder.ts

- **MEXC**│   ├── types.ts

- **Gate.io** (GATE)│   └── utils.ts

- **Binance** (BINANCE)└── positions-tracker/      # Positions tracker bot source files

- **Bybit** (BYBIT)    ├── index.js

- **KuCoin** (KUCOIN) - also requires `KUCOIN_PASSPHRASE`    ├── messageFormatter.js

- **OKX** (OKX) - also requires `OKX_PASSPHRASE`    ├── mexcClient.js

- **Bitget** (BITGET) - also requires `BITGET_PASSPHRASE`    ├── positionService.js

- **BingX** (BINGX)    ├── telegramBot.js

    ├── config/

#### Position Filtering Thresholds (Required for Positions Tracker)    ├── constants/

```env    └── utils/

MIN_FUNDING_RATE_THRESHOLD=-0.04```

MIN_UNREALIZED_PNL_THRESHOLD=-20

MAX_UNREALIZED_PNL_THRESHOLD=10## Note on Bot Tokens

````

Since both bots use Telegram, make sure to use different bot tokens:

#### Scheduler Configuration

```env- TrackFin bot uses `TRACKFIN_BOT_TOKEN`

CRON_EXPRESSION=0 _/5 _ \* \* \* # Every 5 minutes- Positions tracker bot should use its original token environment variable

````

Both bots can run simultaneously without conflicts.

## Build and Run

### Development Mode

Run both bots with hot reload:
```bash
npm run dev
````

Run with nodemon for auto-restart:

```bash
npm run dev:watch
```

Run bots individually:

```bash
npm run dev:positions
npm run dev:trackfin
```

### Production Mode

Build the application:

```bash
npm run build
```

Start the application:

```bash
npm start
```

Build individual bots:

```bash
npm run build:positions
npm run build:trackfin
```

### Clean Build

```bash
npm run clean
npm run build
```

## Development

### Linting

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Formatting

```bash
npm run format         # Format code
npm run format:check   # Check formatting
npm run format:all     # Format all files
```

## Project Structure

```
combined-bots/
├── src/
│   └── index.ts           # Unified entry point that imports external bots
├── dist/                  # Compiled output
├── package.json          # Combined dependencies
├── tsconfig.json         # TypeScript configuration with external references
└── .env                  # Environment variables

../positions-tracker/      # External positions tracker bot source
├── src/
│   ├── index.ts
│   ├── exchanges/
│   ├── types/
│   ├── utils/
│   └── ...
└── package.json

../trackfin/bot/          # External TrackFin bot source
├── src/
│   ├── bot.ts
│   ├── firebase-admin.ts
│   └── ...
└── package.json
```

## Deployment

The application is designed to work with hosting platforms that:

1. Run `npm install` from the combined-bots folder
2. Run `npm run build` to compile TypeScript
3. Run `npm start` to start the application

### Environment Variables on Deployment Platform

Set the same environment variables from your `.env` file on your deployment platform (Heroku, Railway, etc.).

## Bot-Specific Information

### Positions Tracker Bot

- Supports multiple exchanges simultaneously
- Tracks open positions, PnL, and funding rates
- Smart filtering for important alerts
- Interactive Telegram menu
- Automatic scheduled updates

### TrackFin Bot

- Personal finance tracking
- Expense categorization
- Firebase integration for data persistence
- Reminder functionality

## Troubleshooting

### "Cannot find module" errors

Make sure both bot projects have their dependencies installed:

```bash
cd ../positions-tracker && npm install
cd ../trackfin/bot && npm install
```

### Bot doesn't start

1. Check that all required environment variables are set for the active bot(s)
2. Verify bot tokens are correct
3. Ensure Firebase credentials are valid (for TrackFin)
4. Check exchange API keys and permissions (for Positions Tracker)

### TypeScript compilation errors

Ensure all three projects are up to date:

```bash
cd combined-bots && npm install
cd ../positions-tracker && npm install
cd ../trackfin/bot && npm install
```

### Build fails

Try a clean build:

```bash
npm run clean
npm run build
```

## Note on Bot Tokens

Both bots use different Telegram bot tokens:

- **Positions Tracker**: Uses `BOT_TOKEN`
- **TrackFin**: Uses `TRACKFIN_BOT_TOKEN`

Both bots can run simultaneously without conflicts.

## Security

- Keep your `.env` file secure and never commit it to version control
- Use environment variables on your deployment platform
- Restrict API key permissions to only what's needed
- Consider using IP whitelisting for exchange APIs

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Important**: This combined bot requires the `positions-tracker` and `trackfin/bot` directories to exist as siblings to the `combined-bots` directory. The source code is not copied - it's referenced directly from those locations.
