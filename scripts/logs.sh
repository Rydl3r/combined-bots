#!/bin/bash
# View live logs from the server

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

echo "📋 Viewing logs from $SERVER_USER@$SERVER_IP"
echo "Press Ctrl+C to exit"
echo "======================================"
echo ""

# Build SSH options
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi

ssh $SSH_OPTS -t $SERVER_USER@$SERVER_IP "pm2 logs combined-bots"
