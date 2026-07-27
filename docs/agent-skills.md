# Agent Skills — authoring guide

This guide explains how to write a `SKILL.md` file that conforms to the [Agent Skills standard](https://agentskills.io/) (the same standard used by Anthropic's [skills repo](https://github.com/anthropics/skills)).

## What is a Skill?

A Skill is a discoverable, self-describing capability that an AI agent can load and use. Skills have:

1. A `SKILL.md` file with YAML frontmatter + markdown body
2. A unique kebab-case `name`
3. A clear `description` (50-1024 chars)
4. Optional supporting files (scripts, examples, docs)

When an agent discovers a Skill, it reads `SKILL.md` to learn:
- **What** the Skill does
- **When** to use it
- **How** to use it (patterns, examples, gotchas)

## Required frontmatter

```yaml
---
name: kebab-case-name             # required, unique, kebab-case
description: 50-1024 char string  # required, what + when + how
license: MIT                       # optional but recommended
---
```

### Name rules

- Lowercase alphanumeric + hyphens
- No leading/trailing hyphen
- No consecutive hyphens
- Unique across the repo (validate with `scripts/validate-skills.sh`)
- Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`

Examples: `admin-tailadmin`, `ecommerce-storefront`, `integration`, `backend`

### Description rules

- 50-1024 chars
- Must answer 3 questions:
  1. **What** does this Skill do?
  2. **When** should an agent use it?
  3. **How** does the agent consume it (or where to find more)?

Bad example (too vague):
> "A template for the storefront."

Good example:
> "Framework-agnostic TypeScript SDK that wraps opita-market backend in typed contracts + utilities (Result<T,E> SDK + zod schemas + in-memory mock + FSM helpers + Wompi webhook parsers + i18n ICU + currency formatters + Habeas Data text). Use when an AI agent needs to consume the backend from any frontend."

## Recommended frontmatter (extra fields)

We use these optional fields to give agents more context:

```yaml
name: integration
description: ... (required)
license: MIT
source_repo: https://github.com/Opita-Code/opita-market-storefront-templates
integration_target: any TypeScript / JavaScript frontend
template_type: code | visual | reference | meta
oca_integration: true | false
```

- `source_repo` — where the actual code lives (for reference templates)
- `integration_target` — what consumes this Skill
- `template_type` — categorization for discoverability
- `oca_integration` — whether OCAIS auto-loads this Skill

## Body structure

The body of `SKILL.md` should follow this structure:

```markdown
# {Skill Name}

One-paragraph summary.

## When to use this Skill
- Bullet list of scenarios where the agent SHOULD reach for this Skill
- Bullet list of scenarios where the agent should NOT

## What this Skill contains
- Tree view of the folder structure
- Brief explanation of each major file

## How to consume this Skill
- Code examples (3-5 patterns)
- Common gotchas
- Links to detailed docs in `docs/`

## What this Skill does NOT contain
- Explicit list to prevent agent overreach

## See also
- Related Skills
- External references
```

## Examples in this repo

| Skill | File | Type |
|-------|------|------|
| Root catalog | `SKILL.md` | meta |
| Backend reference | `backend/SKILL.md` | reference |
| Integration SDK | `integration/SKILL.md` | code |
| Visual: admin-tailadmin | `frontend-visual/admin-tailadmin/SKILL.md` | visual |
| Visual: ecommerce-storefront | `frontend-visual/ecommerce-storefront/SKILL.md` | visual |
| Visual: booking-service | `frontend-visual/booking-service/SKILL.md` | visual |
| Visual: landing-marketing | `frontend-visual/landing-marketing/SKILL.md` | visual |

## Visual-only Skills

Visual templates must have SKILL.md focused on:
- What pages/screens render
- Default color palette + theme variables
- What props/components the template accepts
- How to install + wire to `@opita/market-integration`

They must NOT include:
- Backend API endpoints
- HTTP requests
- Auth flows
- Anything that ties the visual layer to a specific backend

Bad (current anti-pattern, what we're fixing):
```markdown
## Integration with backend
- GET /tenants/{tenantId}/catalog/products
- POST /tenants/{tenantId}/cart/{cartId}/items
```

Good (what visual Skills should have):
```markdown
## Props it accepts
```typescript
interface ProductCardProps {
  product: Product              // from @opita/market-integration
  onAddToCart: (variantId: string, quantity: number) => void
  locale: Locale                // 'es-CO' | 'en-US' | 'pt-BR'
}
```

## Installation
1. `npm install @opita/market-integration`
2. Import the SDK: `import { createClient } from '@opita/market-integration'`
3. See `../../integration/docs/usage.md` for React/Vue/Svelte/HTML patterns
```

## Validation

Run `bash scripts/validate-skills.sh` before committing. It checks:
- YAML frontmatter is parseable
- `name` is kebab-case
- `name` is unique
- `description` is 50-1024 chars

The validator exits non-zero if any Skill fails — this fails CI in `integration-test.yml`.

## Multi-Skill composition

When a task spans multiple Skills, agents should:
1. Load the root `SKILL.md` to discover the catalog
2. Read each relevant Skill's `SKILL.md` for details
3. Cross-reference via `docs/oca-integration.md` for multi-Skill workflows

Example: "Build a Pasiones storefront" →
1. Read root `SKILL.md` → discover 3 layers
2. Read `backend/SKILL.md` → know the contract
3. Read `integration/SKILL.md` → know the SDK
4. Read `frontend-visual/ecommerce-storefront/SKILL.md` → know the visual
5. Read `docs/oca-integration.md` → know how to compose all 3

## See also

- [Agent Skills standard](https://agentskills.io/) — official spec
- [anthropics/skills](https://github.com/anthropics/skills) — example Skills
- `docs/oca-integration.md` — how OCAIS uses Skills
- `scripts/validate-skills.sh` — validation script