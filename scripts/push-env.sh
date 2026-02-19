#!/bin/bash
# Push local .env file to the server

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
CONFIG_FILE="$PROJECT_ROOT/server.config"

# Load server configuration
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "❌ Error: server.config file not found!"
    echo "Expected location: $CONFIG_FILE"
    exit 1
fi

# Check if local .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "❌ Error: .env file not found locally!"
    echo "Expected location: $PROJECT_ROOT/.env"
    exit 1
fi

echo "📤 Pushing .env to $SERVER_USER@$SERVER_IP"
echo "======================================"
echo ""

# Build SCP options
SCP_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SCP_OPTS="-i $SSH_KEY_PATH"
fi

# Backup existing .env on server
echo "📦 Creating backup of current .env on server..."
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd ~/combined-bots && cp .env .env.backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || true"

# Upload new .env
echo "📤 Uploading .env..."
scp $SCP_OPTS "$PROJECT_ROOT/.env" $SERVER_USER@$SERVER_IP:~/combined-bots/.env

echo ""
echo "✅ .env uploaded successfully!"
echo ""
echo "💡 Restart the bot for changes to take effect:"
echo "   ./scripts/restart.sh"
