#!/usr/bin/env bash
# scripts/new-template.sh — scaffolds a new template (visual, integration, or backend reference)
#
# Usage:
#   bash scripts/new-template.sh visual <kebab-name> <github-url>
#   bash scripts/new-template.sh integration <kebab-name>
#   bash scripts/new-template.sh backend <kebab-name>
#
# Example:
#   bash scripts/new-template.sh visual food-delivery https://github.com/user/repo.git

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <visual|integration|backend> <kebab-name> [<github-url>]"
  exit 1
fi

LAYER="$1"
NAME="$2"
URL="${3:-}"

# Validate kebab-case
if ! [[ "$NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "ERROR: '$NAME' is not kebab-case (lowercase alphanumeric + hyphens, no leading/trailing hyphen)"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$LAYER" in
  visual)
    TARGET_DIR="$ROOT_DIR/frontend-visual/$NAME"
    [[ -d "$TARGET_DIR" ]] && { echo "ERROR: $TARGET_DIR already exists"; exit 1; }

    mkdir -p "$TARGET_DIR"

    cat > "$TARGET_DIR/SKILL.md" <<EOF
---
name: $NAME
description: TODO — write a 50-1024 char description of when an AI agent should use this visual template. Mention pages, palette, props it accepts, and which integration SDK methods it consumes.
license: MIT
source_repo: $URL
integration_target: @opita/market-integration
template_type: visual
---

# $NAME — Visual Template (TODO)

TODO — document pages, theme variables, props accepted, and installation steps.

See ../agent-skills.md for SKILL.md authoring guidelines.
EOF

    cat > "$TARGET_DIR/THEME.md" <<EOF
# Theme Customization — $NAME

TODO — explain how to override the template's default palette to match a client brand (e.g. Pasiones, Peluquería XYZ).

Example for Pasiones:
\`\`\`css
:root {
  --brand-primary: #C2185B;
  --brand-secondary: #FFC107;
  --font-display: 'Playfair Display', serif;
}
\`\`\`
EOF

    cat > "$TARGET_DIR/INSTALL.md" <<EOF
# Install — $NAME

\`\`\`bash
# 1. Install the template + integration SDK
npm install $NAME @opita/market-integration

# 2. Wire up the SDK in your app
import { createClient } from '@opita/market-integration'
const client = createClient({ baseUrl: process.env.OPITA_API_URL, tenantId: 'your-tenant' })

# 3. See ../integration/docs/usage.md for patterns
\`\`\`
EOF

    # Register as submodule if URL provided
    if [[ -n "$URL" ]]; then
      mkdir -p "$TARGET_DIR/source"
      cd "$ROOT_DIR"
      git submodule add --depth 1 "$URL" "frontend-visual/$NAME/source"
      echo "[new] added submodule at frontend-visual/$NAME/source"
    else
      mkdir -p "$TARGET_DIR/source"
      echo "[new] created empty source/ directory (no URL provided)"
    fi

    echo "[new] visual template scaffolded at frontend-visual/$NAME/"
    echo "Next steps:"
    echo "  1. Edit $TARGET_DIR/SKILL.md with description (50-1024 chars)"
    echo "  2. Edit $TARGET_DIR/THEME.md with Pasiones/peluqueria overrides"
    echo "  3. (If empty) clone source into $TARGET_DIR/source/"
    echo "  4. bash scripts/repack.sh $NAME"
    echo "  5. bash scripts/validate-skills.sh"
    ;;

  integration)
    echo "TODO: integration templates don't exist yet in v0.0.1. The integration/ folder is a single package, not a template registry. Future versions may split it (e.g. integration-currency, integration-webhooks)."
    exit 1
    ;;

  backend)
    echo "TODO: backend templates don't exist yet in v0.0.1. The backend/ folder is a single reference for the opita-market-templates repo. Adding more would require multi-tenant deployment documentation."
    exit 1
    ;;

  *)
    echo "ERROR: unknown layer '$LAYER' (must be: visual | integration | backend)"
    exit 1
    ;;
esac