#!/bin/bash
# Check the status of the bot on the server

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

echo "📊 Status of bot on $SERVER_USER@$SERVER_IP"
echo "======================================"
echo ""

# Build SSH options
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi

ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "pm2 status combined-bots"

echo ""
echo "💾 Memory usage:"
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "pm2 describe combined-bots | grep -A 5 'memory\|cpu'"
