#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/deploy/.env.production"
EXAMPLE_FILE="$ROOT_DIR/deploy/.env.production.example"

cd "$ROOT_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$EXAMPLE_FILE" "$ENV_FILE"
  echo "Created $ENV_FILE from example. Fill it in and rerun this script."
  exit 1
fi

mkdir -p data storage
touch data/.gitkeep storage/.gitkeep

docker compose pull caddy || true
docker compose up -d --build
docker compose ps

echo
echo "Deployment complete."
echo "Health check: curl https://southmississippisports.com/api/health"
