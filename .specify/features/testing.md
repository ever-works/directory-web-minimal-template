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
10. Total test coverage: 1030 unit tests across 76 test files, 16 suites, 16 packages
11. Plugin pipeline integration tests validate end-to-end data flow, chaining, error handling, ordering, and context propagation

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

## Dependencies

- `vitest` ^4.x (devDependency at root)
