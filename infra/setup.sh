#!/bin/bash
set -euo pipefail

echo "=== Recomp Tracker — Installation LXC Debian 12 ==="

# 1. Mise a jour systeme
echo "[1/5] Mise a jour systeme..."
apt update && apt upgrade -y
apt install -y curl git

# 2. Node.js 20
echo "[2/5] Installation Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js $(node -v) installe"

# 3. PM2
echo "[3/5] Installation PM2..."
npm install -g pm2

# 4. Clone et build
echo "[4/5] Clone et build de l'app..."
REPO_URL="${1:-}"
if [ -z "$REPO_URL" ]; then
  echo "Usage: ./setup.sh <GIT_REPO_URL>"
  echo "Ex: ./setup.sh https://github.com/CedricNCoding/Reco-tracker.git"
  exit 1
fi

git clone "$REPO_URL" /opt/recomp-tracker
cd /opt/recomp-tracker
npm install
npm run build

# 5. Lancement PM2
echo "[5/5] Lancement avec PM2..."
pm2 start infra/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "=== Installation terminee ==="
echo "L'app tourne sur http://localhost:3000"
echo "- Frontend : fichiers statiques (dist/)"
echo "- API : Hono (server/index.js)"
echo "- Donnees : data/"
echo ""
echo "Prochaine etape : configurer Traefik pour router"
echo "tracker.mondomaine.fr -> http://<IP_LXC>:3000"
echo ""
echo "Pour mettre a jour :"
echo "  cd /opt/recomp-tracker && git pull && npm install && npm run build && pm2 restart recomp-tracker"
