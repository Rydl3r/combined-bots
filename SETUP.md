# Setup Guide

## First Time Setup

### 1. Configure Your Server

Edit `server.config` with your server details:

```bash
nano server.config
```

Update these values:

- `SERVER_USER` - your server username (e.g., ubuntu)
- `SERVER_IP` - your server's IP address
- `SERVER_PATH` - where the bot lives on server (e.g., ~/combined-bots)
- `SSH_KEY_PATH` - path to your SSH private key (e.g., ~/.ssh/id_rsa)

**Note**: This file is gitignored and will stay only on your machine.

### 2. Set Up Environment Variables

Create a `.env` file:

```bash
# Which bots to run
BOT_TYPE=both

# TrackFin Bot (required if BOT_TYPE includes trackfin)
TRACKFIN_BOT_TOKEN=your_telegram_bot_token
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Positions Tracker (required if BOT_TYPE includes positions)
BOT_TOKEN=your_telegram_bot_token
ADMIN_CHAT_ID=your_telegram_chat_id
```

### 3. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

### 4. Test Connection

```bash
./scripts/ssh.sh
```

If this works, you're ready to deploy!

## Daily Usage

### Deploy Your Code

```bash
./scripts/deploy.sh
```

Builds locally, uploads to server, and restarts the bot.

### View Logs

```bash
./scripts/logs.sh
```

See real-time logs. Press Ctrl+C to exit.

### Check Status

```bash
./scripts/status.sh
```

### Restart Bot

```bash
./scripts/restart.sh
```

### Quick Update (if you pushed to git)

```bash
./scripts/update.sh
```

Pulls latest code on server and restarts.

## Troubleshooting

### Permission Denied (SSH)

Check your SSH key:

```bash
chmod 600 ~/.ssh/id_rsa
ssh -i ~/.ssh/id_rsa ubuntu@your.server.ip
```

Make sure your public key is in the server's `~/.ssh/authorized_keys`.

### Scripts Not Found

Make sure you're running from the project root:

```bash
cd /path/to/combined-bots
./scripts/deploy.sh
```

Or make them executable:

```bash
chmod +x scripts/*.sh
```
