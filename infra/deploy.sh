#!/bin/bash
set -euo pipefail

# Deploy Recomp Tracker to LXC
# Usage: ./infra/deploy.sh user@host
# Example: ./infra/deploy.sh root@192.168.1.50

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: ./infra/deploy.sh user@host"
  echo "Ex: ./infra/deploy.sh root@192.168.1.50"
  exit 1
fi

REMOTE_DIR="/opt/recomp-tracker"

echo "=== Building locally ==="
npm run build

echo "=== Deploying to $TARGET ==="
# Sync dist + server + package files
rsync -avz --delete \
  dist/ \
  "$TARGET:$REMOTE_DIR/dist/"

rsync -avz \
  server/ \
  "$TARGET:$REMOTE_DIR/server/"

rsync -avz \
  package.json package-lock.json \
  "$TARGET:$REMOTE_DIR/"

echo "=== Installing production deps on server ==="
ssh "$TARGET" "cd $REMOTE_DIR && npm install --omit=dev && pm2 restart recomp-tracker 2>/dev/null || pm2 start server/index.js --name recomp-tracker"

echo "=== Done ==="
echo "App live on $TARGET:3000"
