# Feature: Unit Testing Infrastructure

## Description

Vitest-based unit testing alongside the existing Playwright E2E tests. Provides fast feedback loops for testing data loaders, plugin logic, and pure utility functions without spinning up a dev server.

## User Stories

- As a **developer**, I want to run unit tests for core data loaders to verify YAML parsing and type validation.
- As a **developer**, I want to test plugin lifecycle hooks in isolation.
- As an **AI agent**, I want tests that confirm data contracts so I can detect breaking changes early.

## Acceptance Criteria

1. Vitest installed as root devDependency
2. `pnpm test` runs all unit tests via Turborepo
3. Each package with testable logic has a `vitest.config.ts` and `test` script
4. `packages/core` has tests for item-loader, config-loader, category-loader, tag-loader, collection-loader, comparison-loader, content-reader
5. `packages/adapters` has tests for filesystem-adapter, create-adapter (factory + config resolution)
6. `packages/plugins` has tests for PluginRunner lifecycle
7. `packages/plugin-*` each have tests for their core logic (all plugin packages covered)
8. Tests use `vi.mock()` for filesystem/IO mocking
9. All tests pass in CI (add to CI workflow)
10. Total test coverage: **1122 Vitest unit tests** across 73 Vitest test files, 16 suites, 16 packages, **plus 48 Playwright Component Tests** (16 for `FilterBar` in `packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx`, 12 for `LayoutSwitcher` in `packages/ui/src/__tests__/ct/layout-switcher.ct.test.tsx`, **20 for `MobileMenu`** in `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`) — total **1170** across both runners. The CT split was introduced in iteration 105 (Q22, FilterBar), extended in iteration 107 (Q23, LayoutSwitcher), and extended again in iteration 108 (Q22 follow-up #1, MobileMenu — preemptive migration to defuse the same fingerprint risk). MobileMenu CT case count grew 15 → 17 in iteration 120 (focus-trap forward/backward wrap CT tests) and 17 → 20 in iteration 124 (Q27 — empty-panel + synthetic-Tab-from-last + non-boundary Tab tests closing the 3-branch outlier). See `docs/plans/q22-playwright-ct.md`, `docs/plans/q22-mobilemenu-ct.md`, `docs/plans/q27-mobilemenu-empty-items-coverage.md`, and `docs/questions.md` Q22/Q23/Q27.
11. Plugin pipeline integration tests validate end-to-end data flow, chaining, error handling, ordering, and context propagation
12. `pnpm test:ct` runs the Playwright Component Tests in `packages/ui` against headless Chromium with the `react`/`react-dom` → `preact/compat` Vite alias. Browsers are installed once via `pnpm test:ct:install`. The CT runner is hard-pinned to `workers: 1` and `fullyParallel: false` because every CT worker shares the same `ctPort: 3100` Vite dev server (Q23 iteration 107 — multi-worker runs trip `net::ERR_CONNECTION_REFUSED` once 2+ CT files exist). CT V8 coverage is captured via `monocart-reporter`'s `addCoverageReport()` fixture (`packages/ui/src/__tests__/ct/fixtures.ts`, iteration 114) and merged with the Vitest-side raw V8 stream from `vitest-monocart-coverage` (Q26, iteration 119) by `pnpm coverage` → `packages/ui/scripts/coverage-merge.ts`. The earlier `vitest.config.ts` `coverage.exclude` entries for `FilterBar.tsx` / `LayoutSwitcher.tsx` / `MobileMenu.tsx` were dropped in iteration 115 (Phase 2). Per-file gate (≥80% branches, hard-fail) enforced by `coverage-merge.ts` `GATE_TARGETS` allow-list since iteration 121 (Phase 6c). Q22 follow-up #3 ✅ COMPLETE iteration 121; Q27 (3-branch MobileMenu outlier) ✅ RESOLVED iteration 124 — merged report now reports **100% branches (233/233)** across the full `packages/ui/src/` surface.

## Technical Design

### Test Framework

- **Vitest** — Fast, Vite-native, compatible with our TypeScript-first approach
- **vitest/globals** — No import needed for `describe`, `it`, `expect`
- **vi.mock()** — Mock filesystem reads for loader tests

### Configuration

Root `turbo.json` task:
```json
"test": {
    "dependsOn": ["^build"],
    "cache": true
}
```

Per-package `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { globals: true } });
```

### Test Locations

Tests live next to source files in `__tests__/` directories. **Note:** the per-file listing below is a snapshot from early development and is incomplete (it covers ~17 of the 76 total test files). The total counts in Acceptance Criteria #10 are authoritative.
```
packages/core/src/__tests__/item-loader.test.ts       — 13 tests
packages/core/src/__tests__/config-loader.test.ts      — 8 tests
packages/core/src/__tests__/category-loader.test.ts    — 8 tests
packages/core/src/__tests__/tag-loader.test.ts         — 9 tests
packages/core/src/__tests__/collection-loader.test.ts  — 11 tests
packages/core/src/__tests__/comparison-loader.test.ts  — 15 tests
packages/core/src/__tests__/content-reader.test.ts     — 3 tests
packages/adapters/src/__tests__/filesystem-adapter.test.ts — 23 tests
packages/adapters/src/__tests__/create-adapter.test.ts — 14 tests
packages/plugins/src/__tests__/runner.test.ts          — 19 tests
packages/plugins/src/__tests__/integration.test.ts     — 20 tests
packages/plugin-seo/src/__tests__/*.test.ts            — 19 tests
packages/plugin-pagination/src/__tests__/*.test.ts     — 16 tests
packages/plugin-filters/src/__tests__/*.test.ts        — 27 tests
packages/plugin-breadcrumbs/src/__tests__/*.test.ts    — 22 tests
packages/plugin-sort/src/__tests__/*.test.ts           — 9 tests
packages/plugin-search/src/__tests__/plugin.test.ts    — 18 tests
packages/plugin-sitemap/src/__tests__/plugin.test.ts   — 14 tests
```

## Code Coverage

V8 coverage is configured across all 16 test suites via `@vitest/coverage-v8`. Run `pnpm test:coverage` to generate reports.

### Coverage Baselines (Iteration 94)

| Package | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| core | 100% | 100% | 100% | 100% |
| plugins | 100% | 100% | 100% | 100% |
| plugin-filters | 100% | 100% | 100% | 100% |
| plugin-pagination | 100% | 100% | 100% | 100% |
| plugin-search | 100% | 100% | 100% | 100% |
| plugin-sitemap | 100% | 100% | 100% | 100% |
| plugin-seo | 100% | 100% | 100% | 100% |
| plugin-related-items | 100% | 100% | 100% | 100% |
| plugin-sort | 100% | 100% | 100% | 100% |
| plugin-breadcrumbs | 100% | 100% | 100% | 100% |
| plugin-rss | 100% | 100% | 100% | 100% |
| plugin-analytics | 100% | 100% | 100% | 100% |
| adapters | 100% | 100% | 100% | 100% |
| astro-integration | 100% | 100% | 100% | 100% |
| sync | 100% | 100% | 100% | 100% |
| ui | 100% | 100% | 100% | 100% |

### Configuration

Turbo task:
```json
"test:coverage": {
    "dependsOn": ["^build"],
    "outputs": ["coverage/**"],
    "cache": false
}
```

Per-package `vitest.config.ts` includes:
```typescript
coverage: {
    provider: 'v8',
    reporter: ['text', 'json-summary'],
    include: ['src/**/*.ts'],
    exclude: ['src/**/__tests__/**', 'src/**/*.test.ts'],
}
```

## Dependencies

- `vitest` ^4.x (devDependency at root)
- `@vitest/coverage-v8` ^4.x (devDependency at root)
