# Phase 1: Foundation

> Monorepo scaffold, core types, data layer, adapter system

## Goal

Establish the working monorepo with all packages initialized and the core data layer functional. After this phase, we can load and type-check data from a content repository.

## Tasks

### 1.1 Monorepo Setup
- [x] Root `package.json` with scripts
- [x] `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
- [x] `turbo.json` with task graph
- [x] `.gitignore`, `.npmrc`
- [x] `CLAUDE.md`, `AGENTS.md`
- [x] Root `tsconfig.json` (base config in @ever-works/tsconfig)
- [x] `.editorconfig`
- [x] `.github/` workflows (CI, deploy)

### 1.2 Package: `@ever-works/tsconfig`
- [x] `packages/tsconfig/base.json` — strict TypeScript base
- [x] `packages/tsconfig/astro.json` — Astro-specific extends
- [x] `packages/tsconfig/package.json`

### 1.3 Package: `@ever-works/eslint-config`
- [x] `packages/eslint-config/index.mjs` — ESLint 9 flat config
- [x] `packages/eslint-config/package.json`

### 1.4 Package: `@ever-works/core`
- [x] `packages/core/src/types/item.ts` — ItemData
- [x] `packages/core/src/types/category.ts` — CategoryData, CategoryWithCount
- [x] `packages/core/src/types/tag.ts` — TagData, TagWithCount
- [x] `packages/core/src/types/collection.ts` — CollectionData
- [x] `packages/core/src/types/comparison.ts` — ComparisonData, ComparisonDimension
- [x] `packages/core/src/types/config.ts` — SiteConfig and sub-types
- [x] `packages/core/src/types/index.ts` — Barrel export
- [x] `packages/core/src/content-reader.ts` — Content orchestration, computes counts
- [x] `packages/core/src/loaders/config-loader.ts` — Config file loading
- [x] `packages/core/src/loaders/item-loader.ts` — Item directory traversal + parsing
- [x] `packages/core/src/loaders/category-loader.ts` — Category YAML loading
- [x] `packages/core/src/loaders/tag-loader.ts` — Tag YAML loading
- [x] `packages/core/src/loaders/collection-loader.ts` — Collection loading
- [x] `packages/core/src/loaders/comparison-loader.ts` — Comparison loading
- [x] `packages/core/src/index.ts` — Public API barrel export
- [x] `packages/core/package.json`
- [x] `packages/core/tsconfig.json`

### 1.5 Package: `@ever-works/adapters`
- [x] `packages/adapters/src/types.ts` — DataAdapter interface, AdapterConfig
- [x] `packages/adapters/src/git-adapter.ts` — Git clone adapter
- [x] `packages/adapters/src/filesystem-adapter.ts` — Local filesystem adapter
- [x] `packages/adapters/src/create-adapter.ts` — Factory function
- [x] `packages/adapters/src/index.ts` — Barrel export
- [x] `packages/adapters/package.json`
- [x] `packages/adapters/tsconfig.json`

### 1.6 Package: `@ever-works/plugins`
- [x] `packages/plugins/src/types.ts` — Plugin, PluginHooks, PluginContext interfaces
- [x] `packages/plugins/src/runner.ts` — PluginRunner lifecycle execution
- [x] `packages/plugins/src/logger.ts` — Scoped plugin logger
- [x] `packages/plugins/src/define-plugins.ts` — Configuration helper with dependency resolution
- [x] `packages/plugins/src/index.ts` — Barrel export
- [x] `packages/plugins/package.json`
- [x] `packages/plugins/tsconfig.json`

### 1.7 Build Script
- [x] `apps/web/scripts/clone-content.ts` — Prebuild script to clone data repo
- [x] `.env.example` — Template environment variables

## Dependencies

- `yaml` — YAML parsing
- `typescript` — Type checking
- `astro` — Framework (for web app in Phase 3)
- `@astrojs/preact` — Preact integration (for Phase 2 components)
- `preact` — Interactive islands
- `tailwindcss` — CSS utility framework (for Phase 2)

## Success Criteria

1. `pnpm install` works without errors
2. `pnpm typecheck` passes for all packages
3. `packages/core` can parse sample YAML data into typed objects
4. `packages/adapters` can clone a git repo and read files
5. All TypeScript interfaces match the full template's data format
