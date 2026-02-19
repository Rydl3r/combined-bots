#!/bin/bash
# Edit .env file on the server

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

echo "📝 Editing .env on $SERVER_USER@$SERVER_IP"
echo "======================================"
echo ""

# Build SSH options
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi

# SSH and edit .env with nano
ssh $SSH_OPTS -t $SERVER_USER@$SERVER_IP "cd ~/combined-bots && nano .env"

echo ""
echo "💡 Don't forget to restart the bot for changes to take effect:"
echo "   ./scripts/restart.sh"
