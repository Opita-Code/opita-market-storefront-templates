# opita-market-storefront-templates

3-template monorepo for Opita Code storefront development.

## What's inside

```
opita-market-storefront-templates/
├── backend/            ← Layer 1: backend reference (OpenAPI 3.1 + curl + docs)
├── integration/        ← Layer 2: framework-agnostic TypeScript SDK
├── frontend-visual/    ← Layer 3: 4 open-source visual templates as submodules
├── SKILL.md            ← root catalog (read first)
├── docs/               ← cross-layer guides
├── scripts/            ← repack, validate-skills, build-integration
└── .github/workflows/  ← CI: repack.yml + integration-test.yml
```

All 3 folders are **templates** (Agent Skills standard). Each has a `SKILL.md` that an AI agent can discover and consume.

## Architecture

```
Frontend Visual (TailAdmin, Next-ecommerce, HAAR, ixartz)
        │ consumes
        ▼
Integration (@opita/market-integration — TS SDK with Result<T,E>)
        │ HTTP over
        ▼
Backend (opita-market-templates — Lambda + DDB, deployed per-tenant)
```

Each layer is independent:
- Visual layer has zero backend knowledge
- Integration layer is framework-agnostic (no React/Vue/Svelte components)
- Backend is serverless and stateless

## Quick start

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/Opita-Code/opita-market-storefront-templates.git
cd opita-market-storefront-templates

# Validate all SKILL.md
bash scripts/validate-skills.sh

# Build the integration package
cd integration && pnpm install && pnpm build && pnpm test
```

## Choosing your layers

For **Pasiones** (our first client):
- **Backend**: already deployed at `https://market.opitacode.com/tenants/pasiones/...`
- **Integration**: install from `integration/`
- **Visual**: copy `frontend-visual/ecommerce-storefront/` → `pasiones-storefront/`, customize

For a **new client** (e.g. Peluquería XYZ):
- **Backend**: deploy a new tenant via SST stack (one stack per client)
- **Integration**: same package, different `tenantId` config
- **Visual**: copy `frontend-visual/booking-service/` → `peluqueria-storefront/`, customize

See `docs/choosing-template.md` for the decision tree.

## OCAIS integration

This repo is designed to be consumed by OCAIS (Opita Code AI System) as a workspace update. OCAIS agents:
1. Read the root `SKILL.md` to discover the 3 layers
2. Read each layer's `SKILL.md` to understand its purpose
3. Use `docs/oca-integration.md` for advanced orchestration (e.g. multi-tenant deployments)

See `docs/oca-integration.md` for the full OCAIS workflow.

## Repository structure

```
opita-market-storefront-templates/
├── README.md (this file)
├── SKILL.md            ← root catalog for AI agents
├── LICENSE             ← MIT
├── package.json        ← workspaces config
├── .gitignore
├── .gitmodules         ← git submodules for visual templates
├── docs/               ← cross-layer guides
│   ├── choosing-template.md
│   ├── api-cookbook.md
│   ├── brand-customization.md
│   ├── agent-skills.md
│   └── oca-integration.md    ← how OCAIS consumes this repo
├── scripts/
│   ├── repack.sh            ← regenerates repomix.txt for visual templates
│   ├── validate-skills.sh   ← validates all SKILL.md files
│   ├── new-template.sh      ← scaffolds a new template (visual or otherwise)
│   └── build-integration.sh ← tsc + vitest for the integration package
├── backend/                ← Layer 1: backend reference
│   ├── SKILL.md
│   ├── README.md
│   ├── api-spec.json        ← OpenAPI 3.1
│   ├── examples/            ← curl scripts
│   └── docs/                ← auth.md, errors.md, rate-limits.md, fsm.md
├── integration/             ← Layer 2: framework-agnostic TS SDK
│   ├── SKILL.md
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── types/           ← Result + all domain types
│   │   ├── client/          ← Result<T,E> SDK
│   │   ├── mock/            ← in-memory mock backend
│   │   ├── fsm/             ← canRefund, saleNextStates, ...
│   │   ├── webhooks/        ← Wompi parser
│   │   ├── i18n/            ← ICU + 3 locales
│   │   ├── currency/        ← COP/USD/BRL formatters
│   │   └── text/            ← Habeas Data banner + receipt
│   ├── tests/               ← vitest
│   └── docs/                ← usage, mock-vs-real
├── frontend-visual/         ← Layer 3: visual templates as submodules
│   ├── admin-tailadmin/     ← TailAdmin (POS + backoffice)
│   │   ├── SKILL.md         ← VISUAL ONLY (pages, palette, props)
│   │   ├── THEME.md         ← cómo customizar para Pasiones
│   │   ├── INSTALL.md       ← cómo wirear con @opita/market-integration
│   │   └── source/          ← git submodule
│   ├── ecommerce-storefront/   ← Next-ecommerce (B2C tienda online)
│   ├── booking-service/     ← HAAR (servicios con reserva)
│   └── landing-marketing/   ← ixartz (landing estática)
└── .github/workflows/
    ├── repack.yml           ← weekly cron: regenera repomix.txt
    └── integration-test.yml ← PR check: tsc + vitest
```

## Versioning

- **v0.0.1** (current) — first OCAIS update. Validates 3-layer architecture.
- **v0.1.0** — full integration coverage (all backend endpoints)
- **v1.0.0** — stable, public-npm-ready

## Contributing

This is an OCAIS workspace — changes are coordinated via:
1. Open an issue describing the change
2. AI agent picks up the issue, writes a spec
3. Drift_judge evaluates the spec
4. Human operator approves
5. Commit + push (auto-triggered weekly repack)

## License

MIT — see LICENSE file.

## See also

- `SKILL.md` — root catalog for AI agents
- `docs/oca-integration.md` — OCAIS workflow
- `backend/SKILL.md` — backend layer
- `integration/SKILL.md` — integration layer
- `frontend-visual/*/SKILL.md` — visual layers