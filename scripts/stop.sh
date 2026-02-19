#!/bin/bash
# Stop the bot on the server

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_FILE="$SCRIPT_DIR/../server.config"

# Load server configuration
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "❌ Error: server.config file not found!"
    echo "Expected location: $CONFIG_FILE"
    exit 1
fi

echo "🛑 Stopping bot on $SERVER_USER@$SERVER_IP"
echo "======================================"

# Build SSH options
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi

ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "pm2 stop combined-bots"

echo ""
echo "✅ Bot stopped!"
echo ""
echo "Run './scripts/start.sh' to start it again"
