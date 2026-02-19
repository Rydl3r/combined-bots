# Combined Bots

Combined Telegram bots for personal finance tracking (TrackFin) and crypto positions monitoring.

## Quick Start

### First Time Setup

1. **Edit server.config** with your server details:

   ```bash
   nano server.config
   ```

   Update: `SERVER_USER`, `SERVER_IP`, `SERVER_PATH`, `SSH_KEY_PATH`

2. **Configure environment variables** in `.env` file

3. Ready to deploy!

### Daily Commands

```bash
./scripts/deploy.sh     # Build locally & deploy to server
./scripts/logs.sh       # View live logs
./scripts/status.sh     # Check bot status
./scripts/restart.sh    # Restart the bot
./scripts/update.sh     # Pull latest code on server & restart
./scripts/ssh.sh        # SSH to server
```

**Tip**: On macOS, you can double-click these scripts in Finder!

## Environment Variables

Create a `.env` file:

```bash
# Which bots to run
BOT_TYPE=both                    # "trackfin", "positions", or "both"

# TrackFin Bot (if enabled)
TRACKFIN_BOT_TOKEN=your_token
FIREBASE_PROJECT_ID=your_project
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_PRIVATE_KEY=your_key

# Positions Tracker Bot (if enabled)
BOT_TOKEN=your_token
ADMIN_CHAT_ID=your_chat_id
```

## Development

```bash
npm install              # Install dependencies
npm run dev              # Run with hot reload
npm run build           # Build for production
```

## Server Configuration

The `server.config` file stores your server details. This file is **gitignored** and stays only on your local machine.

```bash
SERVER_USER=ubuntu
SERVER_IP=your.server.ip
SERVER_PATH=~/combined-bots
SSH_KEY_PATH=~/.ssh/id_rsa
```

---

For detailed setup instructions, see [SETUP.md](SETUP.md)  
For a quick command reference, see [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
