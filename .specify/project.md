# Project: Ever Works Minimal Directory Template

## Summary

A minimal, static-rendered Astro template for AI-generated directory websites. Lightweight alternative to the full Next.js `directory-web-template`. AI agents assemble headless components and apply styling to create complete directory sites.

## Goals

1. Provide a minimal, AI-optimizable foundation for directory websites
2. Connect to the same git-backed data repos as the full Next.js template
3. Generate fully static output for maximum performance
4. Enable rapid site creation through AI-driven customization
5. Support vertical-specific templates (SaaS, jobs, events, real estate)

## Non-Goals

1. No user authentication or accounts
2. No payment processing or subscriptions
3. No server-side rendering (SSR)
4. No database requirements
5. No geo/maps/location features
6. No CRM or external service integrations
7. No admin dashboard or content management UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 6 (static output) |
| Build | Vite + Turborepo |
| Language | TypeScript (strict) |
| Interactive Islands | Preact |
| CSS | Tailwind CSS (optional, AI-applied) |
| Search | Pagefind (static search index) |
| Data | YAML files in Git repositories |
| Package Manager | pnpm 10 |
| Deployment | Vercel (via GitHub Actions) |
| Testing | Playwright (E2E), Vitest (unit) |
| Docs | Docusaurus 3.x (React-based) |

## Architecture

- **Monorepo** with `apps/` and `packages/`
- **Plugin-first** — almost every feature is a plugin
- **Adapter pattern** — data sources are swappable
- **Headless components** — unstyled, composable building blocks
- **Git-first data** — content stored in separate Git repos

## Stakeholders

- **AI Agents** (primary consumer) — Build directory sites from this template
- **Developers** — Create custom plugins, adapters, and templates
- **End Users** — Browse the generated static directory websites
- **Ever Works Team** — Maintain and extend the template

## Timeline

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Foundation: monorepo, types, data layer, adapters | Complete |
| Phase 2 | Headless UI components (24 Astro + 8 Preact) | Complete |
| Phase 3 | Astro web app with all 13 page routes | Complete |
| Phase 4 | Built-in plugins (SEO, pagination, filters, search, sort, sitemap, breadcrumbs) | Complete |
| Phase 5 | Sample implementations (basic, jobs, events, real-estate, git) | Complete |
| Phase 6 | Deployment, CI/CD, docs site, E2E tests | Complete |
| Phase 7 | Polish: UI package, docs quality, interactive components | Complete |
| Phase 8 | Testing: unit tests (430), E2E expansion (293 tests, 42 specs) | Complete |
| Phase 9 | Breadcrumbs, content sync, ISR, Git adapter (isomorphic-git) | Complete |
| Phase 10 | Static pages, collections, comparisons, sample-git (3200+ items) | Complete |
| Phase 11 | Sample-jobs, sample-events, sample-real-estate directories | Complete |
| Phase 12 | Component catalog: primitives, shadcn-style, item detail decomposition | Complete |
| Phase 13 | Accessibility: skip-to-content, mobile hamburger menu, ARIA, keyboard nav | Complete |
| Phase 14 | SEO: JSON-LD (WebSite, ItemPage, BreadcrumbList, ItemList), structured data | Complete |
| Phase 15 | Quality: dependency upgrades, E2E test hardening, docs health audits | Complete |

## Current State (Iteration 40)

- **8 apps**: web, web-e2e, docs, sample-basic, sample-jobs, sample-events, sample-real-estate, sample-git
- **15 packages**: core, ui, plugins, adapters, sync, astro-integration, 7 plugin-* packages, tsconfig, eslint-config
- **430 unit tests** (Vitest) across 12 test suites — all passing
- **293 E2E tests** (Playwright) across 42 spec files, 5 sample projects — all passing
- **All dependencies at latest versions** (Astro 6.1.5, Preact 10.29.1, Tailwind 4.2.2, TS 5.9.3)
