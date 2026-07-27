#!/usr/bin/env bash
# scripts/repack.sh — regenerates repomix.txt for each visual template
# Run weekly via GitHub Action or manually:
#   bash scripts/repack.sh [template-name]
#
# If no template-name is given, repacks all templates.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VISUAL_DIR="$ROOT_DIR/frontend-visual"

# Default ignore list — same as the old config but tightened for new repo
IGNORE_PATTERN='**/node_modules/**,**/.next/**,**/dist/**,**/build/**,**/.git/**,**/.cache/**,**/coverage/**,**/.turbo/**,**/.vercel/**,**/.DS_Store,**/*.log,**/yarn.lock,**/pnpm-lock.yaml,**/package-lock.json,**/banner.png,**/next-env.d.ts'

repack_template() {
  local name="$1"
  local source_dir="$VISUAL_DIR/$name/source"
  local output="$VISUAL_DIR/$name/repomix.txt"

  if [[ ! -d "$source_dir" ]]; then
    echo "[skip] $name — source/ not initialized (run: git submodule update --init frontend-visual/$name/source)"
    return 0
  fi

  echo "[repack] $name → repomix.txt"
  cd "$ROOT_DIR"
  npx --yes repomix \
    --style plain \
    --output "$output" \
    --include "**/*" \
    --ignore "$IGNORE_PATTERN" \
    "$source_dir" 2>&1 | tail -3

  if [[ -f "$output" ]]; then
    local size
    size=$(stat -c %s "$output" 2>/dev/null || stat -f %z "$output" 2>/dev/null || echo "?")
    echo "  → $size bytes"
  fi
}

if [[ $# -eq 0 ]]; then
  for dir in "$VISUAL_DIR"/*/; do
    if [[ -d "$dir" ]]; then
      repack_template "$(basename "$dir")"
    fi
  done
else
  repack_template "$1"
fi