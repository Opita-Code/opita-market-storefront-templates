---
name: opita-market-storefront-templates
description: 3-template monorepo for Opita Code storefront development. Three layers, all in one repo, all consumable as Agent Skills: (1) backend reference (OpenAPI 3.1 + curl examples for opita-market-templates API), (2) integration (framework-agnostic TypeScript SDK with Result<T,E>, FSM helpers, i18n, currency, mock), (3) frontend-visual (4 open-source templates as git submodules). Use this repo when an AI agent needs to build a storefront for a new client and wants to compose the right layer for each concern.
license: MIT
source_repo: https://github.com/Opita-Code/opita-market-storefront-templates
integration_target: any TS/JS frontend + the opita-market backend
template_type: meta (catalog of 3 templates)
oca_integration: yes
architecture: 3-layer (backend/integration/frontend-visual)
---

# opita-market-storefront-templates

A 3-template monorepo for building storefronts. Each of the 3 folders is a **template** (in the Agent Skills sense): an AI agent can read its `SKILL.md` to know what it does, when to use it, and how to consume it.

## The 3 layers

```
opita-market-storefront-templates/
├── backend/            ← Layer 1: backend reference (contract surface)
├── integration/        ← Layer 2: framework-agnostic TypeScript SDK
├── frontend-visual/    ← Layer 3: visual templates (4 open-source options)
├── SKILL.md            ← this file (root catalog)
├── README.md
├── LICENSE
├── package.json
├── docs/               ← cross-layer guides
├── scripts/            ← repack, validate-skills, build-integration
└── .github/workflows/  ← CI: repack.yml + integration-test.yml
```

| Layer | Folder | Type | Purpose | Use when |
|-------|--------|------|---------|----------|
| **1. Backend reference** | `backend/` | OpenAPI 3.1 + curl + docs | Document how to call the actual backend (which lives in `Opita-Code/opita-market-templates`) | AI agent needs to know the contract |
| **2. Integration** | `integration/` | TypeScript npm package | Typed SDK with `Result<T,E>` + FSM helpers + i18n + currency + mock | Any TS/JS frontend needs to call the backend |
| **3. Frontend visual** | `frontend-visual/<x>/` | Git submodule (open-source MIT) | Visual base + theme overrides per client | Choosing/customizing the look |

## When to use this repo

An AI agent should reach for this repo when:
- Building a new storefront for a client (Pasiones, Peluquería XYZ, SaaS B2B, etc.)
- Onboarding a new dev who needs to understand the architecture
- Writing documentation that needs to reference the full stack
- Creating tooling that spans all 3 layers (e.g. a Storybook story that uses the mock + a visual template + the integration SDK)

An AI agent should **NOT** use this repo when:
- It needs to *modify* the backend (use `Opita-Code/opita-market-templates` directly)
- It needs to deploy a specific client app (use the client's own repo)
- It needs to write production code that's tightly coupled to a single backend endpoint (use `integration/` + the specific visual template)

## Architecture: hexagonal applied to frontend

```
       ┌─────────────────────────────┐
       │  Frontend Visual            │
       │  (TailAdmin, Next-ecom, ...)│
       └──────────────┬──────────────┘
                      │ consumes
       ┌──────────────▼──────────────┐
       │  Integration (framework-    │
       │  agnostic TS SDK)           │
       └──────────────┬──────────────┘
                      │ typed client over
       ┌──────────────▼──────────────┐
       │  Backend (Lambda + DDB)     │
       │  (opita-market-templates)   │
       └─────────────────────────────┘
```

The visual layer never knows about HTTP. The integration layer never knows about visual styling. The backend never knows about either.

## Quick start

### For AI agents

1. Read the root `SKILL.md` (this file) to discover the 3 layers
2. Read each layer's `SKILL.md` to understand its purpose
3. Decide which layer(s) you need for the task
4. For frontend work: pick a visual template in `frontend-visual/`, then `npm install @opita/market-integration`
5. For backend work: read `backend/api-spec.json` for the contract
6. For integration work: read `integration/SKILL.md` + `integration/docs/usage.md`

### For human engineers

```bash
# 1. Clone with submodules
git clone --recurse-submodules https://github.com/Opita-Code/opita-market-storefront-templates.git
cd opita-market-storefront-templates

# 2. Build the integration package
cd integration && pnpm install && pnpm build && pnpm test && cd ..

# 3. Validate all SKILL.md files
bash scripts/validate-skills.sh

# 4. (Optional) Regenerate repomix.txt for visual templates
bash scripts/repack.sh
```

## Version

- **v0.0.1** (current) — OCAIS workspace update with 3-layer architecture, framework-agnostic integration, 4 visual templates

## What's shipped

| Component | Status | Lines / Size |
|-----------|--------|--------------|
| `backend/api-spec.json` | ✅ v6.0.0 | 20 paths, 15 schemas |
| `backend/examples/` | ✅ 11 curl scripts | per endpoint family |
| `backend/docs/` | ✅ 4 docs | auth, errors, rate-limits, fsm |
| `integration/src/` | ✅ 8 modules | types, client, mock, fsm, webhooks, i18n, currency, text |
| `integration/tests/` | ✅ 6 test files | vitest with FSM/i18n/currency/text/webhooks/mock |
| `frontend-visual/admin-tailadmin` | ✅ submodule @ d3526b35 | TailAdmin/free-nextjs-admin-dashboard |
| `frontend-visual/ecommerce-storefront` | ✅ submodule @ 8618a008 | Epic-Design-Labs/nextjs-ecommerce-starter |
| `frontend-visual/booking-service` | ✅ submodule @ aa5747b75 | HAAR Salon (skeleton — Sprint 7+) |
| `frontend-visual/landing-marketing` | ✅ submodule @ cd6694e6 | ixartz landing (skeleton — Sprint 7+) |

## License

MIT — see LICENSE file. Submodules retain their respective upstream licenses (TailAdmin MIT, Epic-Design-Labs open-source, HAAR open-source, ixartz MIT).

## See also

- `docs/oca-integration.md` — how OCAIS discovers and uses the 3 layers
- `docs/choosing-template.md` — decision tree for picking the right visual template
- `docs/api-cookbook.md` — recipes for common API workflows
- `docs/agent-skills.md` — SKILL.md authoring guide
- `backend/SKILL.md` — backend layer details
- `integration/SKILL.md` — integration layer details
- `frontend-visual/admin-tailadmin/SKILL.md` (etc.) — visual layer details