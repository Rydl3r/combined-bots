#!/bin/bash
# Remote bot update script
# Copy this to ~/update-bot.sh on the Oracle server
# Make executable with: chmod +x ~/update-bot.sh

set -e

echo "======================================"
echo "  Combined Bots Update Script"
echo "======================================"
echo ""

cd ~/combined-bots

echo "📥 Pulling latest changes..."
git pull

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Restarting bot..."
pm2 restart combined-bots

echo ""
echo "✅ Update complete!"
echo ""
echo "Current status:"
pm2 status

echo ""
echo "To view logs, run: pm2 logs combined-bots"
