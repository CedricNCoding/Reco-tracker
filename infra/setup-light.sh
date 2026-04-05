#!/bin/bash
set -euo pipefail

echo "=== Recomp Tracker — Setup LXC leger (pas de build) ==="

# 1. Systeme
echo "[1/3] Mise a jour systeme..."
apt update && apt install -y curl rsync

# 2. Node.js 20
echo "[2/3] Installation Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
echo "Node.js $(node -v) installe"

# 3. Preparer le dossier
echo "[3/3] Preparation..."
mkdir -p /opt/recomp-tracker/data

echo ""
echo "=== LXC pret ==="
echo "Maintenant depuis ton Mac, lance :"
echo "  ./infra/deploy.sh root@$(hostname -I | awk '{print $1}')"
