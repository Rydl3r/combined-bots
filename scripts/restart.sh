#!/bin/bash
# Restart the bot on the server

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

echo "🔄 Restarting bot on $SERVER_USER@$SERVER_IP"
echo "======================================"

# Build SSH options
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi

ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "pm2 restart combined-bots"

echo ""
echo "✅ Bot restarted!"
echo ""
echo "Run './scripts/status.sh' to check status"
