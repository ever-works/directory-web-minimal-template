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

## Current State (Iteration 155)

- **8 apps**: web, web-e2e, docs, sample-basic, sample-jobs, sample-events, sample-real-estate, sample-git
- **18 packages**: core, ui, plugins, adapters, sync, astro-integration, 10 plugin-* packages (seo, rss, pagination, filters, search, sort, sitemap, breadcrumbs, analytics, related-items), tsconfig, eslint-config
- **1122 Vitest unit tests** across 73 Vitest test files, 16 suites — plus **48 Playwright Component Tests** (16 `FilterBar` + 12 `LayoutSwitcher` + 20 `MobileMenu` in `packages/ui/src/__tests__/ct/`) — total **1170** across both runners. The CT split was introduced in iteration 105 (Q22, FilterBar), extended in iteration 107 (Q23, LayoutSwitcher), and extended again in iteration 108 (Q22 follow-up #1, MobileMenu — preemptive migration to defuse the same fingerprint risk). MobileMenu CT case count grew 15 → 17 in iteration 120 (focus-trap forward/backward wrap) and 17 → 20 in iteration 124 (Q27 — empty-panel + synthetic-Tab-from-last + non-boundary Tab).
- **V8 code coverage**: **16/16 packages at 100% branch coverage**; `@ever-works/ui` reports the **full V8+Vitest merged number** at `packages/ui/coverage/merged/`: aggregate **branches 100% (233/233), functions 100% (104/104), lines 99.76% (1240/1243), statements 99.72% (352/353)** across 19 files (iteration 124, Q27 ✅ RESOLVED). Per-file gate (Phase 6c hard-fail, allow-list `GATE_TARGETS` ≥ 80% branches): FilterBar.tsx 100% ✅, LayoutSwitcher.tsx 100% ✅, MobileMenu.tsx 100% (35/35) ✅. Iteration 121 flipped the gate from informational warning to `process.exit(1)` and added a CI `coverage-gate` job (`.github/workflows/ci.yml`, depends on `ci` + `test-ct`) that inherits the merge script's exit code and uploads `packages/ui/coverage/merged/` as a 14-day artifact; iteration 124 closed the last 3 outlier branches via synthetic Tab dispatch + one `/* v8 ignore next */` pragma on the defensive `menuRef` race-guard. The CI hard-gate now has zero regression margin.
- **`pnpm coverage` merge command landed** (iteration 116) + **Q26 ✅ RESOLVED** (iteration 119, Phase 6b): root-level `pnpm coverage` runs `pnpm test:coverage` + `pnpm test:ct` + `tsx packages/ui/scripts/coverage-merge.ts`. The merge script consumes per-test raw V8 entries from BOTH `coverage/raw/<id>.json` (Vitest-side, 40 files; written by `vitest-monocart-coverage` custom provider — Q26 adopted iteration 119) and `coverage/ct/raw/<id>.json` (CT-side, 49 files; written by `monocart-reporter`'s `'raw'` report on `playwright.ct.config.ts`) via MCR's `inputDir` mechanism. Both inputs flow through MCR's V8 path; no Istanbul mixing; no `getCoverageResults` crash. Output at `coverage/merged/{coverage-report.json, codecov.json, lcov.info, index.html, lcov-report/}`. Walltime ~3m on Windows + Node 24.14.1 (~98s Vitest + ~78s CT + ~1s merge). Documented in `CLAUDE.md` Common Commands + Safe Operations.
- **367 E2E test cases** across 57 spec files, 11 Playwright projects, 5 sample apps
- **All 33 .specify/ feature specs** complete and verified against code (`ls .specify/features/*.md | wc -l` = 33 — full per-spec catalogue under "Spec Kit (.specify/)" in `docs/index.md`). The 33 = 28-pre-saga-baseline + 3 saga-additions + 2 audit-tooling additions: `q22-mobilemenu-ct.md` (iteration 108), `q27-mobilemenu-empty-items-coverage.md` (iteration 123, ✅ RESOLVED in iteration 124), `q28-eslint-10-upgrade.md` (iteration 129, **✅ RESOLVED in iteration 130**), `audit-docs-script.md` (iteration 149, **✅ RESOLVED in iteration 149** — codifies the `AGENTS.md § Doc-Quality Audit Checklist` greps as an executable `pnpm audit:docs` runner), and `audit-docs-self-parity.md` (iteration 151, **✅ RESOLVED in iteration 151** — adds 7th audit class for AGENTS.md ↔ scripts/audit-docs.ts checklist heading parity self-validation). Q23 / Q25 / Q26 do not have dedicated spec files — those questions were resolved inline in `docs/questions.md` (Q23 + Q25 absorbed into Q22 follow-up arcs; Q26 absorbed into the Q22-follow-up-#3 spec at `q22-playwright-coverage.md`). The "All 28" count drift in iter-129 → iter-137's project.md was a baseline-vs-final off-by-3 (the 3 saga-additions were enumerated but not summed); flipped to "All 31" in iter 138 with explicit `wc -l` provenance. The Q22→Q28 saga (CT migration + V8 coverage merge + per-file gate hard-fail + outlier-branch closure + ESLint 10 in-place upgrade) is **fully closed**; every Q22-arc question (Q22, Q23, Q24, Q25, Q26, Q27, Q28) reports ✅ RESOLVED in `docs/questions.md`, and the merged `pnpm coverage` pipeline writes a per-package report at branches **100% (233/233)**. **Q28 (iter 130)** executed the in-place ESLint 9 → 10 upgrade as a single autonomous cron tick: one-line `packages/eslint-config/package.json` peer-range bump (`"eslint": "^9.0.0"` → `"^10.0.0"`) + `pnpm install` (eslint@9.39.4 → 10.2.1 + 8 transitive bumps + 3 legacy drops, +14 / -19 packages, -38 lines net) + `pnpm lint` 18/18 (zero new violations; only the 4 pre-existing `no-console` warnings in `packages/core/src/logger.ts:40,53` + `packages/plugins/src/logger.ts:22,35` carry forward unchanged) + `pnpm typecheck` 23/23 + `pnpm test` 16/16 / 1122/1122 Vitest tests. Optional `engines.node` bump and optional CT/coverage re-runs skipped per plan AC #6 / Step 4. Total walltime ~13 min, well under the 30-45 min plan estimate. The 5-iteration "ESLint 9 → 10 manual changelog review required" deferral marker (iters 123/125/126/127/128/129) is fully retired; future routine-maintenance audits will not surface this item.
- **Q22 ✅ RESOLVED** (iteration 105): all 16 `FilterBar` cases ported to Playwright CT and pass 16/16 in ~6s on Windows + Node 24.14.0; original Vitest file deleted; `vitest.config.ts` `test.exclude` now carves out `__tests__/ct/**`; decision matrix and authoring conventions published in [`docs/architecture/testing-runners.md`](../docs/architecture/testing-runners.md). The migration also surfaced and fixed a **real bug** in `FilterBar` where the default `selectedTags = []` allocated a fresh `[]` on every render and caused `useEffect([initialTags])` to wipe state on every re-render; fixed via a frozen module-level `EMPTY_TAGS` sentinel. CI matrix landed: `.github/workflows/ci.yml` gained a `test-ct` matrix job (`os: [ubuntu-latest, windows-latest]`, `needs: ci`) with a Playwright-browser cache keyed on `pnpm-lock.yaml` hash and per-OS failure-artifact uploads — the `windows-latest` cell is the canonical Q22 fix signal. Step 6 (first CI run on the new matrix) is observation-only, no code change required. Follow-up #1 ✅ COMPLETE (iteration 108, MobileMenu CT migration). Follow-up #2 SUPERSEDED (iteration 110, soft-deprecated). Follow-up #3 (`playwright-coverage` integration): Phase 0 ✅ (iter 113), Phase 1 ✅ (iter 114), Phase 2 ✅ (iter 115), **Phase 3 ✅ PARTIALLY DONE (iter 116) — CT subgraph merged; full V8+Vitest deferred to Q26**.
- **Q23 ✅ RESOLVED** (iteration 107): all 12 `LayoutSwitcher` cases ported to Playwright CT. Note: a flake/regression in 1-3 of those cases surfaced during iteration-108 full-suite verification — see Q24 below.
- **Q24 ✅ RESOLVED** (iteration 109): `layout-switcher.ct.test.tsx` `EMPTY_MODES` allocation race fixed with the same module-level frozen sentinel pattern that closed Q22 in iteration 105.
- **Q25 ✅ RESOLVED** (iteration 113): `monocart-coverage-reports@^2.12.0` (current `latest`: 2.12.11) adopted as the Q22-follow-up-#3 coverage library. Phase 0 smoke verified the full `page.coverage.startJSCoverage()` + MCR `add()` + `generate()` round-trip on Windows 10 + Node 24.14.0 + Chromium 147 + Playwright 1.59.1.
- **Q26 ✅ RESOLVED — Option A adopted** (iteration 119): `vitest-monocart-coverage@^4.0.0` is now a real `@ever-works/ui` devDependency (resolved version `4.0.2`); `packages/ui/vitest.config.ts` runs `provider: 'custom'` + `customProviderModule: 'vitest-monocart-coverage'`; `packages/ui/mcr.config.ts` (new file) configures the Vitest-side raw V8 stream at `./coverage/raw/`; `packages/ui/scripts/coverage-merge.ts` simplified — Istanbul branch dropped, single `inputDir: ['./coverage/raw', './coverage/ct/raw']` reads both raw V8 streams. Merged number on full include set: branches 94.89% (223/235). The original-plan default `[['raw', { outputDir: './coverage/raw' }]]` per-report-tuple form was found at deploy time to nest under MCR's default `./coverage-reports/` root; the deployed config uses top-level `outputDir: './coverage'` + `reports: ['raw']` for symmetry with `playwright.ct.config.ts` (one delta from the original plan, recorded in the iteration-119 log entry). Phase 6a smoke test (iteration 117), Phase 6b adoption (iteration 119) both ✅. Phase 6c (CI gate) + Phase 6d (status flips) remain.
- **Zero documentation drift** across all specs, catalogs, and reference docs — confirmed by `pnpm audit:docs` (iteration 149: codified the `AGENTS.md § Doc-Quality Audit Checklist` greps as an executable runner at `scripts/audit-docs.ts`; iteration 150: wired `pnpm audit:docs` into `.github/workflows/ci.yml` `ci` job as a PR-blocking step; iteration 151: added 7th audit class — `auditChecklistRunnerParity()` — that self-validates AGENTS.md `### ` sub-section headings against the in-script `EXPECTED_MAPPING` table on every invocation, closing iter-149's "Next Steps #1" parity-by-convention drift; first run reports **8/8 PASS** across 7 drift classes + 1 cross-file consistency parity check; exit non-zero on real drift; CI-gated since iter 150)
- **All dependencies at latest versions** (Astro 6.1.9, Preact 10.29.1, Tailwind 4.2.4, TS 6.0.3, Prettier 3.8.3, Vitest 4.1.5, postcss 8.5.12, @typescript-eslint 8.59.1 — bumped iteration 154 from 8.59.0, Playwright 1.59.1, monocart-coverage-reports 2.12.11, monocart-reporter 2.10.1, vitest-monocart-coverage 4.0.2 — added iteration 119; isomorphic-git 1.37.6 — bumped iteration 128; jsdom 29.1.0 — bumped iteration 154 from 29.0.2 (devDep of `@ever-works/ui`, Vitest jsdom env); **eslint 10.2.1 — Q28 ✅ RESOLVED iteration 130, last out-of-scope drift item retired**, with coordinated transitive bumps (`@eslint/core@1.2.1`, `@eslint/config-array@0.23.5`, `@eslint/config-helpers@0.5.5`, `@eslint/object-schema@3.0.5`, `@eslint/plugin-kit@0.7.1`, `eslint-scope@9.1.2`, `espree@11.2.0`, `eslint-visitor-keys@5.0.1`) and 3 legacy drops (`@eslint/eslintrc@3.3.5`, top-level `@eslint/js@9.39.4`, top-level `eslint-visitor-keys@4.2.1`); matrix re-verified iter 123 / 125 / 126 / 127 / 128 / 130 / 132 / 133 / 135 / 154 / 155 (matrix expanded iter 132: 22 → 23 to reflect the post-Q28 ESLint 10 caret-resolution; expanded iter 133: 23 → 26 by adding `marked@18.0.2`, `yaml@2.8.3`, `pagefind@1.5.2`, and `@playwright/experimental-ct-react@1.59.1` for completeness; iter 135 ran a 9-package quick-check subset; iter 154 lifted 3 patch-level deltas in the iter-153-deferred 14-package cohort — `@typescript-eslint/{parser,eslint-plugin}` 8.59.0 → 8.59.1 and `jsdom` 29.0.2 → 29.1.0 — confirming the deferred-cohort policy works as designed: drift surfaces eventually; iter 155 closed iter-154 deferral #3 by querying the remaining 12 deferred-cohort packages — all 12/12 zero-delta against workspace caret floors). The **26-package matrix** is now **zero-delta with no carried open work** — every dep line at `latest` (caret-resolved or exact-pinned), every named question (Q22-Q28) ✅ RESOLVED. **Out-of-matrix tracking**: react / react-dom 18.3.1 → 19.2.5 in `@ever-works/docs-minimal` is held back by Docusaurus 3.x's React 18 peer-range constraint (major-version bump, not actionable inside `^18.3.0`); whatwg-encoding@3.1.1 deprecation warning is a transitive sub-dep of jsdom (depth 2, not actionable from our manifest).
- **CT-flake watch ✅ CLOSED** at iteration 127 — counter advanced **2/3 → 3/3** after a second consecutive clean full 48-case CT run (1m 39s on the same Windows 10 + Node 24.14.0 + Chromium 147 + Playwright 1.59.1 toolchain; 0 retries / 0 flaky / 772 steps). The iter-111 single-occurrence `filter-bar.ct › selects category on click` retry has not recurred across iter 126 + iter 127 full-suite runs; the Playwright Component-Testing surface is considered stable on the documented toolchain. No active watch carries forward into iter 128.
