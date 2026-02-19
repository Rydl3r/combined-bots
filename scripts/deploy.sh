#!/bin/bash
# Deploy latest changes to the server

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
    echo "Please create server.config with your server details."
    exit 1
fi

echo "🚀 Deploying to $SERVER_USER@$SERVER_IP"
echo "======================================"

# Build SSH options
SSH_OPTS=""
if [ ! -z "$SSH_KEY_PATH" ]; then
    SSH_OPTS="-i $SSH_KEY_PATH"
fi

# Build locally
echo ""
echo "📦 Building application locally..."
cd "$PROJECT_ROOT"
npm run build

echo ""
echo "📤 Uploading files to server..."

# Create remote directory if it doesn't exist
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "mkdir -p ~/combined-bots"

# Upload files (excluding node_modules, .git, etc.)
if [ ! -z "$SSH_KEY_PATH" ]; then
    rsync -avz --progress \
        -e "ssh -i $SSH_KEY_PATH" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.env.local' \
        --exclude 'scripts' \
        --exclude 'server.config' \
        ./ $SERVER_USER@$SERVER_IP:~/combined-bots/
else
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.env.local' \
        --exclude 'scripts' \
        --exclude 'server.config' \
        ./ $SERVER_USER@$SERVER_IP:~/combined-bots/
fi

echo ""
echo "🔧 Installing dependencies on server..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd ~/combined-bots && npm install --production"

echo ""
echo "🔄 Restarting application..."
ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cd ~/combined-bots && pm2 restart combined-bots || pm2 start dist/index.js --name combined-bots"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Run './scripts/logs.sh' to view logs"
echo "Run './scripts/status.sh' to check status"
