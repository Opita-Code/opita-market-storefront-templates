# OCAIS Integration — how OCAIS uses this repo

This guide explains how [OCAIS](https://github.com/Opita-Code/ocais) (Opita Code AI System) discovers and uses the 3-template monorepo.

## What is OCAIS?

OCAIS is Opita Code's internal AI coding infrastructure. It wraps multiple AI model providers (Anthropic Claude, OpenAI, local models) behind a unified interface and provides:

- **Session management** — long-running work with persistent state
- **Memory + governance** — audit trail of every tool call
- **Skill discovery** — agents can load domain knowledge from Skills
- **Multi-agent orchestration** — subagents for parallel work
- **Vibe-loop-protocol** — drift_judge + spec publication for spec-driven development

OCAIS is operator-side. The AI agent that responds to the operator's request IS an OCAIS instance.

## Discovery flow

When an OCAIS agent starts a new session, it scans the workspace for `SKILL.md` files. The discovery process:

```
1. Walk the repo tree (skipping node_modules, dist, source/)
2. Find every file named SKILL.md
3. Parse YAML frontmatter
4. Cache the catalog (name + description + path)
5. When a user asks a question, match against catalog descriptions
6. On match, load the full SKILL.md (lazy-load the body)
```

For this repo, OCAIS will discover:

```
{
  "opita-market-storefront-templates": {
    path: "./SKILL.md",
    type: "meta",
    description: "3-template monorepo for Opita Code storefront development..."
  },
  "backend": {
    path: "./backend/SKILL.md",
    type: "reference",
    description: "Reference template for opita-market-templates backend API..."
  },
  "integration": {
    path: "./integration/SKILL.md",
    type: "code",
    description: "Framework-agnostic TypeScript package that wraps the opita-market backend..."
  },
  "admin-tailadmin": {
    path: "./frontend-visual/admin-tailadmin/SKILL.md",
    type: "visual",
    description: "POS + backoffice template (TailAdmin MIT, 2.5k stars)..."
  },
  // ... 3 more visual Skills
}
```

## Composition patterns

OCAIS agents learn to compose Skills by their `integration_target` field:

| Skill | integration_target | Composes with |
|-------|-------------------|---------------|
| `opita-market-storefront-templates` (meta) | any | discovers the other 5 |
| `backend` | `../integration/` + curl | consumed by `integration/` |
| `integration` | any TS/JS frontend | consumes `backend/`, used by `frontend-visual/<x>/` |
| `admin-tailadmin` | `@opita/market-integration` | consumes `integration/` |
| `ecommerce-storefront` | `@opita/market-integration` | consumes `integration/` |
| `booking-service` | `@opita/market-integration` (skeleton) | consumes `integration/` |
| `landing-marketing` | `@opita/market-integration` (skeleton) | consumes `integration/` |

## OCAIS workflow: "Build me a Pasiones storefront"

```python
# Pseudocode — how an OCAIS agent handles this request

def build_pasiones_storefront(request):
    # 1. Discover the catalog
    catalog = scan_skills("./SKILL.md", "./backend/SKILL.md", "./integration/SKILL.md", ...)

    # 2. Load root catalog
    load_skill("opita-market-storefront-templates")

    # 3. Identify the right Skills for the task
    #    "Pasiones" = retail clothing, B2C, COP, es-CO
    #    → visual: ecommerce-storefront
    #    → integration (always)
    #    → backend (reference, for the agent to know the contract)

    # 4. Load the relevant Skills
    load_skill("ecommerce-storefront")  # SKILL.md says: "install @opita/market-integration + copy source/ to pasiones-storefront/"
    load_skill("integration")           # SKILL.md says: framework-agnostic TS SDK with Result<T,E>
    load_skill("backend")               # SKILL.md says: OpenAPI 3.1 snapshot, 47 endpoints

    # 5. Execute the plan
    shell("cp -r frontend-visual/ecommerce-storefront/source pasiones-storefront/")
    shell("cd pasiones-storefront && pnpm install @opita/market-integration")
    edit("pasiones-storefront/lib/client.ts", client_setup_code)
    edit("pasiones-storefront/pages/checkout.tsx", habeas_data_code)
    edit("pasiones-storefront/tailwind.config.js", pasiones_tokens)
    shell("cd pasiones-storefront && pnpm build && pnpm test")

    # 6. Drift_judge evaluates the spec vs the implementation
    drift_judge(spec, implementation)

    # 7. Report back to operator
    return {
      status: "complete",
      files_changed: ["pasiones-storefront/lib/client.ts", ...],
      drift_verdict: "aligned",
      confidence: 0.94
    }
```

## Multi-tenant deployment via OCAIS

When onboarding a new client (e.g. Peluquería XYZ):

```python
def onboard_new_client(client_config):
    # 1. Pick visual template based on client type
    if client_config.type == "salon":
        template = "booking-service"
    elif client_config.type == "retail":
        template = "ecommerce-storefront"
    elif client_config.type == "saas":
        template = "admin-tailadmin"

    # 2. Deploy new SST stack for the backend
    shell(f"sst deploy --stage {client_config.tenant_id}-prod")

    # 3. Scaffold new client frontend repo
    shell(f"cp -r frontend-visual/{template}/source {client_config.tenant_id}-storefront/")

    # 4. Wire integration
    edit(f"{client_config.tenant_id}-storefront/lib/client.ts", tenant_config)

    # 5. Apply branding
    edit(f"{client_config.tenant_id}-storefront/tailwind.config.js", client_config.brand_tokens)

    # 6. Build + deploy
    shell(f"cd {client_config.tenant_id}-storefront && vercel deploy --prod")
```

## Drift_judge on Skill updates

Whenever a `SKILL.md` is updated, OCAIS runs drift_judge:

- `aligned` (≥0.9) — description still accurate, no changes needed
- `drift_detected` (0.7-0.89) — minor mismatch, operator reviews
- `needs_human` (<0.7) — major mismatch, blocking

Common drift causes:
- Description references a removed feature
- New endpoint added to backend but not in `backend/api-spec.json`
- New audit action added but not in `integration/src/types/audit-log.ts`

## OCAIS update lifecycle

When this repo gets a new release:

```
1. Operator pushes to main
2. GitHub Actions:
   - repack.yml (weekly): regenerates repomix.txt for visual templates
   - integration-test.yml (on push): tsc + vitest + validate-skills.sh
3. OCAIS workspace update:
   - Operator runs `ocais workspace update opita-market-storefront-templates`
   - OCAIS re-scans all SKILL.md files
   - New descriptions, paths, and code patterns are cached
4. AI agents in OCAIS pick up the new catalog on next session
```

## What OCAIS does NOT do

- ❌ Modify Skills directly (operator-only)
- ❌ Publish Skills to a registry (OCAIS workspace only for v0.0.1)
- ❌ Auto-update visual templates from upstream (manual via `git submodule update --remote`)
- ❌ Deploy without operator confirmation (the build command produces artifacts but doesn't push)

## See also

- `docs/agent-skills.md` — how to write Skills
- `docs/choosing-template.md` — decision tree
- `backend/SKILL.md` — backend layer
- `integration/SKILL.md` — integration layer
- `frontend-visual/*/SKILL.md` — visual layers
- OCAIS admin token: `process.env.OCAIS_ADMIN_TOKEN` (operator-side)