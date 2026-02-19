#!/bin/bash
# Quick update: pull latest code on server and restart

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

echo "🔄 Updating bot on $SERVER_USER@$SERVER_IP"
echo "======================================"

# Build SSH options
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi

echo ""
echo "📥 Pulling latest code..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd ~/combined-bots && git pull"

echo ""
echo "📦 Installing dependencies..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd ~/combined-bots && npm install"

echo ""
echo "🔨 Building..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd ~/combined-bots && npm run build"

echo ""
echo "🔄 Restarting..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "pm2 restart combined-bots"

echo ""
echo "✅ Update complete!"
echo ""
echo "Run './scripts/status.sh' to check status"
