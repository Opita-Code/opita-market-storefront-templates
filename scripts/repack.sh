#!/usr/bin/env bash
#
# scripts/repack.sh — Regenera repomix.txt para todas las plantillas (o una).
#
# Uso:
#   ./scripts/repack.sh                 # todas las plantillas
#   ./scripts/repack.sh templates/admin-tailadmin   # solo una
#
# Requiere: npx (incluido con Node.js >= 16) y acceso a internet para
# descargar repomix via npm.
#
# El compressed repomix.txt es lo que los AI agents leen cuando necesitan
# entender el código fuente completo de una plantilla sin clonar el submodule.
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# 1. Determinar targets
if [ "$#" -eq 0 ]; then
  # Todas las plantillas que tengan source/ inicializado
  TARGETS=$(find templates -mindepth 2 -maxdepth 2 -type d -name source | sort)
else
  # Targets explícitos
  TARGETS=""
  for arg in "$@"; do
    if [ -d "$arg/source" ]; then
      TARGETS="$TARGETS $arg/source"
    else
      echo "ERROR: $arg/source no existe. ¿Corriste 'git submodule update --init'?"
      exit 1
    fi
  done
fi

if [ -z "$TARGETS" ]; then
  echo "No hay templates con source/ inicializado."
  echo "Corre primero: git submodule update --init --recursive"
  exit 1
fi

# 2. Detectar nombre de plantilla desde el path
pack_template() {
  local source_dir="$1"
  local template_path
  template_path=$(dirname "$source_dir")  # templates/<name>
  local template_name
  template_name=$(basename "$template_path")
  local output_file="$template_path/repomix.txt"

  echo "→ Repacking $template_name → $output_file"

  # npx invoca repomix sin requerir instalación global.
  # --style plain: output en texto plano (más token-efficient que XML).
  # --include "**/*": incluye todos los archivos.
  # --ignore: excluye dependencias, builds, dotfiles, configs no esenciales.
  npx --yes repomix \
    --style plain \
    --output "$output_file" \
    --include "**/*" \
    --ignore "**/node_modules/**,**/.next/**,**/dist/**,**/build/**,**/.git/**,**/.cache/**,**/coverage/**,**/.turbo/**,**/.vercel/**,**/.DS_Store,**/*.log,**/yarn.lock,**/pnpm-lock.yaml,**/package-lock.json" \
    "$source_dir" 2>&1 | tail -5

  # 3. Stats post-pack
  if [ -f "$output_file" ]; then
    local size_kb=$(du -k "$output_file" | cut -f1)
    local line_count=$(wc -l < "$output_file")
    echo "  ✓ $output_file — ${size_kb}KB / ${line_count} lines"
  else
    echo "  ✗ ERROR: repomix no generó el archivo"
    exit 1
  fi
}

# 4. Ejecutar para cada target
echo "Repacking $(echo "$TARGETS" | wc -w) templates..."
echo ""

for source_dir in $TARGETS; do
  pack_template "$source_dir"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ All repomix.txt files regenerated"
echo ""
echo "Next steps:"
echo "  1. Review the diff:           git diff templates/*/repomix.txt"
echo "  2. Run skill validator:       ./scripts/validate-skills.sh"
echo "  3. Commit if changes look ok: git add templates/*/repomix.txt && git commit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"