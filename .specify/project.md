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

## Current State (Iteration 122)

- **8 apps**: web, web-e2e, docs, sample-basic, sample-jobs, sample-events, sample-real-estate, sample-git
- **18 packages**: core, ui, plugins, adapters, sync, astro-integration, 10 plugin-* packages (seo, rss, pagination, filters, search, sort, sitemap, breadcrumbs, analytics, related-items), tsconfig, eslint-config
- **1122 Vitest unit tests** across 73 Vitest test files, 16 suites — plus **43 Playwright Component Tests** (16 `FilterBar` + 12 `LayoutSwitcher` + 15 `MobileMenu` in `packages/ui/src/__tests__/ct/`) — total 1165 across both runners. The CT split was introduced in iteration 105 (Q22, FilterBar), extended in iteration 107 (Q23, LayoutSwitcher), and extended again in iteration 108 (Q22 follow-up #1, MobileMenu — preemptive migration to defuse the same fingerprint risk).
- **V8 code coverage**: **15/16 packages at 100% branch coverage**; `@ever-works/ui` reports the **full V8+Vitest merged number** at `packages/ui/coverage/merged/`: aggregate **branches 98.72% (232/235), functions 100% (104/104), lines 99.60% (1239/1244), statements 99.15% (352/355)** across 19 files. Per-file gate (Phase 6c hard-fail, allow-list `GATE_TARGETS` ≥ 80% branches): FilterBar.tsx 100% ✅, LayoutSwitcher.tsx 100% ✅, MobileMenu.tsx 91.89% (34/37) ✅. Iteration 121 flipped the gate from informational warning to `process.exit(1)` and added a CI `coverage-gate` job (`.github/workflows/ci.yml`, depends on `ci` + `test-ct`) that inherits the merge script's exit code and uploads `packages/ui/coverage/merged/` as a 14-day artifact. Failure path verified by temporarily raising `GATE_THRESHOLD` to 95 → exit 1 + diagnostic block printed; reverted. Phase 6d (status flips across architecture docs / specs / questions) remains.
- **`pnpm coverage` merge command landed** (iteration 116) + **Q26 ✅ RESOLVED** (iteration 119, Phase 6b): root-level `pnpm coverage` runs `pnpm test:coverage` + `pnpm test:ct` + `tsx packages/ui/scripts/coverage-merge.ts`. The merge script consumes per-test raw V8 entries from BOTH `coverage/raw/<id>.json` (Vitest-side, 40 files; written by `vitest-monocart-coverage` custom provider — Q26 adopted iteration 119) and `coverage/ct/raw/<id>.json` (CT-side, 49 files; written by `monocart-reporter`'s `'raw'` report on `playwright.ct.config.ts`) via MCR's `inputDir` mechanism. Both inputs flow through MCR's V8 path; no Istanbul mixing; no `getCoverageResults` crash. Output at `coverage/merged/{coverage-report.json, codecov.json, lcov.info, index.html, lcov-report/}`. Walltime ~3m on Windows + Node 24.14.1 (~98s Vitest + ~78s CT + ~1s merge). Documented in `CLAUDE.md` Common Commands + Safe Operations.
- **367 E2E test cases** across 57 spec files, 11 Playwright projects, 5 sample apps
- **All 26 .specify/ feature specs** complete and verified against code (added `q22-mobilemenu-ct.md` in iteration 108)
- **Q22 ✅ RESOLVED** (iteration 105): all 16 `FilterBar` cases ported to Playwright CT and pass 16/16 in ~6s on Windows + Node 24.14.0; original Vitest file deleted; `vitest.config.ts` `test.exclude` now carves out `__tests__/ct/**`; decision matrix and authoring conventions published in [`docs/architecture/testing-runners.md`](../docs/architecture/testing-runners.md). The migration also surfaced and fixed a **real bug** in `FilterBar` where the default `selectedTags = []` allocated a fresh `[]` on every render and caused `useEffect([initialTags])` to wipe state on every re-render; fixed via a frozen module-level `EMPTY_TAGS` sentinel. CI matrix landed: `.github/workflows/ci.yml` gained a `test-ct` matrix job (`os: [ubuntu-latest, windows-latest]`, `needs: ci`) with a Playwright-browser cache keyed on `pnpm-lock.yaml` hash and per-OS failure-artifact uploads — the `windows-latest` cell is the canonical Q22 fix signal. Step 6 (first CI run on the new matrix) is observation-only, no code change required. Follow-up #1 ✅ COMPLETE (iteration 108, MobileMenu CT migration). Follow-up #2 SUPERSEDED (iteration 110, soft-deprecated). Follow-up #3 (`playwright-coverage` integration): Phase 0 ✅ (iter 113), Phase 1 ✅ (iter 114), Phase 2 ✅ (iter 115), **Phase 3 ✅ PARTIALLY DONE (iter 116) — CT subgraph merged; full V8+Vitest deferred to Q26**.
- **Q23 ✅ RESOLVED** (iteration 107): all 12 `LayoutSwitcher` cases ported to Playwright CT. Note: a flake/regression in 1-3 of those cases surfaced during iteration-108 full-suite verification — see Q24 below.
- **Q24 ✅ RESOLVED** (iteration 109): `layout-switcher.ct.test.tsx` `EMPTY_MODES` allocation race fixed with the same module-level frozen sentinel pattern that closed Q22 in iteration 105.
- **Q25 ✅ RESOLVED** (iteration 113): `monocart-coverage-reports@^2.12.0` (current `latest`: 2.12.11) adopted as the Q22-follow-up-#3 coverage library. Phase 0 smoke verified the full `page.coverage.startJSCoverage()` + MCR `add()` + `generate()` round-trip on Windows 10 + Node 24.14.0 + Chromium 147 + Playwright 1.59.1.
- **Q26 ✅ RESOLVED — Option A adopted** (iteration 119): `vitest-monocart-coverage@^4.0.0` is now a real `@ever-works/ui` devDependency (resolved version `4.0.2`); `packages/ui/vitest.config.ts` runs `provider: 'custom'` + `customProviderModule: 'vitest-monocart-coverage'`; `packages/ui/mcr.config.ts` (new file) configures the Vitest-side raw V8 stream at `./coverage/raw/`; `packages/ui/scripts/coverage-merge.ts` simplified — Istanbul branch dropped, single `inputDir: ['./coverage/raw', './coverage/ct/raw']` reads both raw V8 streams. Merged number on full include set: branches 94.89% (223/235). The original-plan default `[['raw', { outputDir: './coverage/raw' }]]` per-report-tuple form was found at deploy time to nest under MCR's default `./coverage-reports/` root; the deployed config uses top-level `outputDir: './coverage'` + `reports: ['raw']` for symmetry with `playwright.ct.config.ts` (one delta from the original plan, recorded in the iteration-119 log entry). Phase 6a smoke test (iteration 117), Phase 6b adoption (iteration 119) both ✅. Phase 6c (CI gate) + Phase 6d (status flips) remain.
- **Zero documentation drift** across all specs, catalogs, and reference docs
- **All dependencies at latest versions** (Astro 6.1.9, Preact 10.29.1, Tailwind 4.2.4, TS 6.0.3, Prettier 3.8.3, Vitest 4.1.5, postcss 8.5.12, @typescript-eslint 8.59.0, Playwright 1.59.1, monocart-coverage-reports 2.12.11, monocart-reporter 2.10.1, vitest-monocart-coverage 4.0.2 — added iteration 119)
