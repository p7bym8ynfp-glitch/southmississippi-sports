#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_PATH="$BACKUP_DIR/southmississippi-sports-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

tar -czf "$ARCHIVE_PATH" \
  -C "$ROOT_DIR" \
  data \
  storage

echo "Backup created at $ARCHIVE_PATH"
