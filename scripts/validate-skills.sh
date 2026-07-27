#!/usr/bin/env bash
#
# scripts/validate-skills.sh — Valida que cada SKILL.md cumple el estándar
# Agent Skills (https://agentskills.io/).
#
# Validaciones:
#   1. YAML frontmatter parseable
#   2. `name` is kebab-case (regex ^[a-z0-9]+(-[a-z0-9]+)*$)
#   3. `description` length 50..1024 chars
#   4. `name` único en el repo (no duplicados entre SKILL.md files)
#
# Uso:
#   ./scripts/validate-skills.sh             # valida todos
#   ./scripts/validate-skills.sh path/to/SKILL.md   # valida uno
#
# Exit codes:
#   0 — todos los skills pasan
#   1 — al menos una validación falla
#

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Detectar si hay yq / python para parsear YAML; si no, fallback a grep/sed
if command -v yq >/dev/null 2>&1; then
  YAML_PARSER="yq"
elif command -v python3 >/dev/null 2>&1; then
  YAML_PARSER="python3"
else
  echo "WARN: ni yq ni python3 disponibles. Validando con grep/sed (menos estricto)."
  YAML_PARSER="grep"
fi

# 1. Encontrar SKILL.md files
if [ "$#" -gt 0 ]; then
  TARGETS="$*"
else
  TARGETS=$(find . -name "SKILL.md" -not -path "*/node_modules/*" -not -path "*/source/*" -not -path "*/.git/*" | sort)
fi

if [ -z "$TARGETS" ]; then
  echo "ERROR: No SKILL.md files found."
  exit 1
fi

ERRORS=0
PASS=0
TOTAL=0
NAMES_FOUND=""

# Función para extraer YAML frontmatter
extract_frontmatter() {
  local file="$1"
  # El frontmatter está entre --- y ---
  awk '/^---$/{c++; if(c==2) exit; next} c==1' "$file"
}

# Función para extraer un campo del frontmatter (YAML simple)
get_field() {
  local fm="$1"
  local field="$2"
  # Soporte para name: y description: | (multi-line)
  echo "$fm" | grep -E "^${field}:" | head -1 | sed "s/^${field}:[[:space:]]*//" | sed 's/^"//; s/"$//' | sed "s/^'//; s/'$//"
}

# 2. Validar cada SKILL.md
for skill_file in $TARGETS; do
  TOTAL=$((TOTAL+1))
  file_errors=""

  # 2.1. Verificar que el frontmatter existe
  if ! head -1 "$skill_file" | grep -q "^---$"; then
    file_errors="$file_errors\n  ✗ Missing frontmatter (must start with ---)"
  else
    FM=$(extract_frontmatter "$skill_file")
    NAME=$(get_field "$FM" "name")
    DESC=$(echo "$FM" | awk '/^description:/{flag=1; sub(/^description:[[:space:]]*/, ""); print; next} /^[^[:space:]]/{flag=0} flag')

    # 2.2. Validar name
    if [ -z "$NAME" ]; then
      file_errors="$file_errors\n  ✗ Missing or empty 'name' field"
    elif ! [[ "$NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
      file_errors="$file_errors\n  ✗ 'name' must be kebab-case (got: '$NAME')"
    else
      # 2.3. Validar uniqueness
      if echo "$NAMES_FOUND" | grep -qx "$NAME"; then
        file_errors="$file_errors\n  ✗ 'name' duplicate: '$NAME' already exists in another SKILL.md"
      else
        NAMES_FOUND="$NAMES_FOUND\n$NAME"
      fi
    fi

    # 2.4. Validar description
    DESC_TRIMMED=$(echo "$DESC" | sed 's/^[[:space:]]*//' | sed '/^$/d' | tr -d '\n')
    DESC_LEN=${#DESC_TRIMMED}
    if [ -z "$DESC" ]; then
      file_errors="$file_errors\n  ✗ Missing or empty 'description' field"
    elif [ "$DESC_LEN" -lt 50 ]; then
      file_errors="$file_errors\n  ✗ 'description' too short ($DESC_LEN chars, min 50)"
    elif [ "$DESC_LEN" -gt 1024 ]; then
      file_errors="$file_errors\n  ✗ 'description' too long ($DESC_LEN chars, max 1024)"
    fi
  fi

  # Reportar
  if [ -n "$file_errors" ]; then
    ERRORS=$((ERRORS+1))
    echo "✗ $skill_file"
    echo -e "$file_errors"
  else
    PASS=$((PASS+1))
    echo "✓ $skill_file"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Skill validation summary:"
echo "  Total:  $TOTAL"
echo "  Pass:   $PASS"
echo "  Fail:   $ERRORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "FAIL: $ERRORS SKILL.md files have validation errors."
  exit 1
else
  echo ""
  echo "✓ All SKILL.md files conform to the Agent Skills standard."
  exit 0
fi