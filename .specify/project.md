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
3. No full SSR — static-first with optional ISR via `@astrojs/vercel`
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
| Phase 2 | Headless UI components (25 Astro + 8 Preact + 22 primitives + 5 shadcn-style) | Complete |
| Phase 3 | Astro web app with all 16 page routes | Complete |
| Phase 4 | Built-in plugins (SEO, pagination, filters, search, sort, sitemap, breadcrumbs, rss, analytics, related-items) | Complete |
| Phase 5 | Sample implementations (basic, jobs, events, real-estate, git) | Complete |
| Phase 6 | Deployment, CI/CD, docs site, E2E tests | Complete |
| Phase 7 | Polish: UI package, docs quality, interactive components | Complete |
| Phase 8 | Testing: unit tests (1058), E2E expansion (57 spec files) | Complete |
| Phase 9 | Breadcrumbs, content sync, ISR, Git adapter (isomorphic-git) | Complete |
| Phase 10 | Static pages, collections, comparisons, sample-git (3200+ items) | Complete |
| Phase 11 | Sample-jobs, sample-events, sample-real-estate directories | Complete |
| Phase 12 | Component catalog: primitives, shadcn-style, item detail decomposition | Complete |
| Phase 13 | Accessibility: skip-to-content, mobile hamburger menu, ARIA, keyboard nav | Complete |
| Phase 14 | SEO: JSON-LD (WebSite, ItemPage, BreadcrumbList, ItemList), structured data | Complete |
| Phase 15 | Quality: dependency upgrades, E2E test hardening, docs health audits | Complete |
| Phase 16 | Analytics plugin: Plausible, Umami, Fathom, GA4, custom | Complete |
| Phase 17 | Related items plugin: tag/category scoring, build-time computation | Complete |
| Phase 18 | Code coverage infrastructure: V8 coverage across all 16 packages, CI hardening | Complete |

## Current State (Iteration 105)

- **8 apps**: web, web-e2e, docs, sample-basic, sample-jobs, sample-events, sample-real-estate, sample-git
- **18 packages**: core, ui, plugins, adapters, sync, astro-integration, 10 plugin-* packages (seo, rss, pagination, filters, search, sort, sitemap, breadcrumbs, analytics, related-items), tsconfig, eslint-config
- **1149 Vitest unit tests** across 75 Vitest test files, 16 suites — plus **16 Playwright Component Tests** for `FilterBar` (`packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx`) — total 1165 across both runners. The CT split was introduced in iteration 105 to bypass the Q22 Worker-IPC crash that prevented the original `packages/ui/src/__tests__/preact/filter-bar.test.tsx` from running on Windows + Node 24.
- **V8 code coverage**: **16/16 packages at 100% branch coverage** — every package (core, plugins, astro-integration, adapters, sync, ui, plugin-filters, plugin-pagination, plugin-search, plugin-sitemap, plugin-rss, plugin-related-items, plugin-sort, plugin-analytics, plugin-breadcrumbs, plugin-seo) at 100% branch. `src/preact/FilterBar.tsx` is excluded from `packages/ui` coverage.include pending Q22 follow-up #3 (`playwright-coverage` integration to merge CT runs into the V8 report).
- **367 E2E test cases** across 57 spec files, 11 Playwright projects, 5 sample apps
- **All 25 .specify/ feature specs** complete and verified against code
- **Q22 ✅ RESOLVED** (iteration 105): all 16 `FilterBar` cases ported to Playwright CT and pass 16/16 in ~6s on Windows + Node 24.14.0; original Vitest file deleted; `vitest.config.ts` `test.exclude` now carves out `__tests__/ct/**`; decision matrix and authoring conventions published in [`docs/architecture/testing-runners.md`](../docs/architecture/testing-runners.md). The migration also surfaced and fixed a **real bug** in `FilterBar` where the default `selectedTags = []` allocated a fresh `[]` on every render and caused `useEffect([initialTags])` to wipe state on every re-render; fixed via a frozen module-level `EMPTY_TAGS` sentinel. CI matrix landed: `.github/workflows/ci.yml` gained a `test-ct` matrix job (`os: [ubuntu-latest, windows-latest]`, `needs: ci`) with a Playwright-browser cache keyed on `pnpm-lock.yaml` hash and per-OS failure-artifact uploads — the `windows-latest` cell is the canonical Q22 fix signal. Step 6 (first CI run on the new matrix) is observation-only, no code change required. Follow-ups remain: #1 (preemptive `MobileMenu` migration), #2 (`pnpm test:ui:safe` removal once safe — blocked on Q23 candidate `layout-switcher.test.tsx` stall observed this iteration), #3 (`playwright-coverage` merge).
- **Zero documentation drift** across all specs, catalogs, and reference docs
- **All dependencies at latest versions** (Astro 6.1.9, Preact 10.29.1, Tailwind 4.2.4, TS 6.0.3, Prettier 3.8.3, Vitest 4.1.5, postcss 8.5.12, @typescript-eslint 8.59.0, Playwright 1.59.1)
