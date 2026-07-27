---
name: landing-marketing
description: Static marketing landing page visual base — Next.js + Tailwind + ESLint + Prettier + Husky. Hero, features, pricing, CTA. Use when an AI agent needs to render a single-page marketing landing (lead capture, product launch, SaaS pre-launch). SKELETON — wire-up with @opita/market-integration deferred until a real client needs a landing. NOT for full storefronts (use ecommerce-storefront) or admin (use admin-tailadmin).
license: MIT
source_repo: https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template
integration_target: @opita/market-integration (optional — for forms + analytics)
template_type: visual
status: skeleton
---

# landing-marketing — Static Marketing Landing (SKELETON)

Visual base for a single-page marketing landing. The upstream is [ixartz Next.js Landing Page Starter](https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template) (MIT).

**This template is currently a SKELETON.** It ships the visual base + tooling (ESLint + Prettier + Husky) but no integration with `@opita/market-integration`. Most landing pages only need a contact form + analytics, which can be added when a real client requests it.

## When to use

An AI agent should use this template when:
- Building a single-page marketing landing (SaaS pre-launch, product launch, lead capture)
- Need fast static-site generation (Next.js SSG)
- Need SEO-optimized (Next.js metadata API + sitemap)

An AI agent should **NOT** use this template when:
- The client needs a full storefront → use `ecommerce-storefront`
- The client needs admin/backoffice → use `admin-tailadmin`
- The client needs services with reservations → use `booking-service`

## What this template contains (skeleton state)

```
landing-marketing/
├── SKILL.md              ← this file
├── THEME.md              ← (TODO — write brand customization guide)
├── INSTALL.md            ← (TODO — write wire-up guide)
├── source/               ← git submodule (ixartz upstream)
└── repomix.txt           ← compressed source (~152KB — smallest of the 4)
```

## Pages the upstream renders

| Section | Purpose |
|---------|---------|
| Hero | Headline + subhead + CTA button + hero image |
| Features | 3-4 column grid of features with icons |
| Pricing | 3-tier pricing table |
| Testimonials | Quote cards with avatar |
| FAQ | Accordion |
| CTA | Final call to action |
| Footer | Social links + legal |

## What needs to happen before this is "ready"

Sprint 7+ work (if/when needed):

1. **Contact form**: optional — POST to `/admin/leads` endpoint (needs backend work)
2. **Analytics**: optional — `@opita/market-integration/analytics` (Sprint 7+)
3. **i18n**: optional — use the integration package's locale bundles
4. **A/B testing**: optional — Sprint 8+

Until then, the upstream renders as-is with placeholder copy.

## Customization for a real client

The typical flow:

```bash
# 1. Clone
npx create-next-app@latest client-landing --typescript --tailwind
cp -r ../frontend-visual/landing-marketing/source/* client-landing/

# 2. Edit copy + assets
# - app/page.tsx (hero, features, pricing)
# - public/og-image.png
# - public/logo.svg
# - tailwind.config.js (brand tokens)

# 3. Deploy to Vercel / Cloudflare Pages
```

## License

Upstream ixartz is MIT. Our wrapper is MIT.

## See also

- `THEME.md` (TODO)
- `INSTALL.md` (TODO)
- `../../integration/SKILL.md` — the SDK (optional for landing pages)
- `../../docs/choosing-template.md` — when to pick this vs alternatives