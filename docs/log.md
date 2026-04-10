# Change Log

> Tracks all documentation and specification changes.

## 2026-04-10 — Initial Setup

- Created monorepo scaffold: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.npmrc`
- Created `CLAUDE.md` with project overview, rules, and commands
- Created `AGENTS.md` with mandatory rules (R1-R11), working process, data contracts
- Created `docs/` structure with index, log, questions, architecture, plans, specs
- Created `.specify/` structure with spec-kit specifications
- Defined 6-phase implementation plan
- Documented architecture: data layer, plugin system, adapter system, component system
- Added open questions with default choices in `docs/questions.md`
- Created all core packages with type definitions:
  - `@ever-works/core` — Full TypeScript types for Item, Category, Tag, Collection, Comparison, Config, ContentData
  - `@ever-works/plugins` — Plugin interface, hooks, context, definePlugins with dependency resolution
  - `@ever-works/adapters` — DataAdapter interface, AdapterConfig
  - `@ever-works/ui` — All component prop type definitions (16 static + 5 interactive)
  - `@ever-works/tsconfig` — Shared base and astro TypeScript configs
  - `@ever-works/eslint-config` — ESLint 9 flat config with TypeScript strict rules
- Created all app stubs:
  - `apps/web` — Astro 5 static site with config, env types, clone script
  - `apps/web-e2e` — Playwright test setup with initial test
  - `apps/docs` — Starlight documentation site config
  - `apps/sample-basic` — Reference implementation stub (Phase 5)
- Created guides: creating-a-plugin, creating-an-adapter, building-from-template
- Created `.specify/` feature specs: data-layer, plugin-system, ui-components, web-app
- Created `.env.example` with all environment variables
- Created `README.md` with project overview and quick start
- Created `.github/workflows/ci.yml` for CI pipeline
- Created `.editorconfig` for consistent formatting
- **Total files created: 76**
- **Status: Phase 1 planning/specs COMPLETE. Ready for Phase 1 implementation.**

### Next Steps (for next scheduled run)
1. ~~Implement `@ever-works/core` content loaders~~ DONE
2. ~~Implement `@ever-works/adapters`~~ DONE
3. ~~Create minimal Astro pages~~ DONE
4. ~~Run `pnpm install` and verify `pnpm typecheck` passes~~ DONE

## 2026-04-11 — Phase 1-3 Implementation

### @ever-works/core — Data Loaders (Phase 1)
- Implemented `packages/core/src/loaders/config-loader.ts` — loads `config.yml` with sensible defaults
- Implemented `packages/core/src/loaders/category-loader.ts` — loads from `categories.yml` or `categories/categories.yml`
- Implemented `packages/core/src/loaders/tag-loader.ts` — loads `tags.yml`, filters inactive
- Implemented `packages/core/src/loaders/collection-loader.ts` — loads `collections.yml`, filters inactive
- Implemented `packages/core/src/loaders/item-loader.ts` — traverses `data/` subdirs, parses YAML, filters to approved only
- Implemented `packages/core/src/loaders/comparison-loader.ts` — loads `.yml` + `.md` pairs from `comparisons/`
- Implemented `packages/core/src/content-reader.ts` — orchestrates all loaders, computes category/tag counts
- Implemented `packages/core/src/loaders/index.ts` — barrel export
- Updated `packages/core/src/index.ts` — exports all loaders and content reader
- Added `yaml` and `@ever-works/adapters` as dependencies, `@types/node` as devDependency

### @ever-works/adapters — Data Source Adapters (Phase 1)
- Implemented `packages/adapters/src/filesystem-adapter.ts` — reads from local filesystem with path validation
- Implemented `packages/adapters/src/git-adapter.ts` — shallow clones git repo, delegates reads to FilesystemAdapter
- Implemented `packages/adapters/src/create-adapter.ts` — factory with env var resolution (DATA_REPOSITORY, CONTENT_PATH, GH_TOKEN)
- Updated `packages/adapters/src/index.ts` — exports all implementations
- Added `@types/node` as devDependency

### @ever-works/plugins — Plugin Runner (Phase 1)
- Implemented `packages/plugins/src/logger.ts` — scoped plugin logger with `[plugin:<id>]` prefix
- Implemented `packages/plugins/src/runner.ts` — PluginRunner class with lifecycle hook execution (init, dataLoaded, beforeBuild, afterBuild)
- Updated `packages/plugins/src/index.ts` — exports runner and logger

### @ever-works/ui — Headless Components (Phase 2)
- Created 17 Astro components in `packages/ui/src/astro/`:
  - ItemCard, ItemGrid, ItemList, ItemDetail
  - CategoryList, CategoryBadge, TagList, TagBadge
  - CollectionCard, Breadcrumbs, Pagination
  - SiteHeader, SiteFooter, Hero, EmptyState
  - ComparisonTable, SEO
- Created 5 Preact interactive components in `packages/ui/src/preact/`:
  - SearchInput (debounced, with clear), FilterBar (category + tag toggle)
  - SortSelect (configurable options), BackToTop (scroll threshold)
  - ThemeToggle (dark/light with localStorage persistence)
- All components are headless/unstyled with `data-component` and `data-part` attributes

### apps/web — Astro Web App (Phase 3)
- Created `apps/web/src/lib/content.ts` — cached content loading utility
- Created `apps/web/src/layouts/BaseLayout.astro` — root HTML layout with header, nav, footer
- Created `apps/web/src/styles/global.css` — Tailwind CSS v4 import
- Created 8 page routes:
  - `pages/index.astro` — Home with hero, category nav, item grid
  - `pages/item/[slug].astro` — Item detail with breadcrumbs, related items
  - `pages/category/[slug].astro` — Category listing with filtered items
  - `pages/tag/[slug].astro` — Tag listing with filtered items
  - `pages/categories.astro` — All categories index
  - `pages/tags.astro` — All tags index
  - `pages/comparison/[slug].astro` — Comparison detail with dimensions table
  - `pages/404.astro` — Not found page
- Updated `astro.config.ts` — switched from `@astrojs/tailwind` (v3) to `@tailwindcss/vite` (v4)
- Updated `package.json` — replaced `@astrojs/tailwind` with `@tailwindcss/vite`

### Build Verification
- `pnpm install` — succeeds with all workspace dependencies resolved
- `pnpm --filter @ever-works/adapters typecheck` — passes (0 errors)
- `pnpm --filter @ever-works/core typecheck` — passes (0 errors)
- `pnpm --filter @ever-works/plugins typecheck` — passes (0 errors)
- `pnpm --filter @ever-works/ui typecheck` — passes (0 errors)
- `astro build` with sample content — succeeds, generates 7 static pages in 2.76s

### Summary
- **Total new files created: ~35 implementation files**
- **Phase 1 (Foundation): COMPLETE** — types, loaders, adapters, plugins all implemented
- **Phase 2 (Components): COMPLETE** — 22 headless UI components (17 Astro + 5 Preact)
- **Phase 3 (Web App): COMPLETE** — Astro web app with all core pages and content loading
- **Status: Phases 1-3 IMPLEMENTED. Ready for Phase 4 (plugins) and Phase 5 (sample).**

### Next Steps (for next scheduled run)
1. ~~Implement built-in plugins: search (Pagefind), filters, SEO~~ DONE
2. Create the `sample-basic` implementation using AI agents
3. Set up the docs site (Starlight/Docusaurus)
4. Clean up and verify E2E tests
5. Update CI/CD workflow for deployment

## 2026-04-11 — Phase 4 Implementation (Built-in Plugins)

### Detailed Specs
- Created `.specify/features/plugins-phase4.md` — detailed specification for all 6 plugins
  with factory function signatures, options interfaces, exports, hook usage, and file structure

### @ever-works/plugin-seo (packages/plugin-seo)
- `src/types.ts` — SeoPluginOptions, PageMeta, MetaTag (key/value/content), JsonLdType, JsonLdInput (discriminated union: WebSiteInput | ItemListInput | ProductInput)
- `src/meta.ts` — `generateMetaTags()` pure utility: produces standard HTML, Open Graph, and Twitter Card meta tags
- `src/json-ld.ts` — `generateJsonLd()` pure utility: generates Schema.org JSON-LD for WebSite, ItemList, Product
- `src/plugin.ts` �� `seoPlugin()` factory with `onInit` (validates options) and `onDataLoaded` (passthrough — SEO computed at render time)
- `src/index.ts` — barrel export of all public API

### @ever-works/plugin-pagination (packages/plugin-pagination)
- `src/types.ts` — PaginationPluginOptions, PaginateOptions, PaginationResult<T>, PagePathEntry
- `src/paginate.ts` — `paginate<T>()` (array slice with full metadata) and `generatePagePaths()` (Astro getStaticPaths entries)
- `src/plugin.ts` — `paginationPlugin()` factory with `onInit` (merges with site config pagination)
- `src/index.ts` — barrel export

### @ever-works/plugin-filters (packages/plugin-filters)
- `src/types.ts` — FiltersPluginOptions, FilterType, ParamNames, ActiveFilters, DEFAULT_PARAM_NAMES
- `src/filter-items.ts` — `filterItems()` pure utility: OR within category/tag groups, AND between groups, case-insensitive search
- `src/url-sync.ts` — `parseFiltersFromUrl()` and `serializeFiltersToUrl()` for URL param sync
- `src/plugin.ts` — `filtersPlugin()` factory with `onInit` (log enabled filters)
- `src/index.ts` — barrel export

### @ever-works/plugin-search (packages/plugin-search)
- `src/types.ts` — SearchPluginOptions, ResolvedSearchConfig
- `src/plugin.ts` — `searchPlugin()` factory with `onInit` (log config) and `onAfterBuild` (runs Pagefind CLI on dist/)
- `src/index.ts` — barrel export

### @ever-works/plugin-sort (packages/plugin-sort)
- `src/types.ts` — SortField, SortDirection, SortPluginOptions, ResolvedSortConfig
- `src/sort-items.ts` — `sortItems()` pure utility: name (locale-aware), updated_at (date), featured (featured-first)
- `src/plugin.ts` — `sortPlugin()` factory with `onInit` (log config) and `onDataLoaded` (applies default sort)
- `src/index.ts` — barrel export

### @ever-works/plugin-sitemap (packages/plugin-sitemap)
- `src/types.ts` — SitemapPluginOptions, ChangeFrequency, ResolvedSitemapConfig
- `src/plugin.ts` — `sitemapPlugin()` factory wrapping Astro's @astrojs/sitemap with defaults
- `src/index.ts` — barrel export

### Web App Integration
- Created `apps/web/src/lib/plugins.config.ts` — registers all 6 plugins via `definePlugins()`
- Updated `apps/web/src/lib/content.ts` — integrates PluginRunner pipeline (onInit, onDataLoaded)
- Updated `apps/web/src/layouts/BaseLayout.astro` — uses SEO plugin for meta tag generation
- Updated `apps/web/src/pages/index.astro` — uses pagination + JSON-LD structured data
- Updated `apps/web/src/pages/item/[slug].astro` — uses Product JSON-LD structured data
- Created `apps/web/src/pages/page/[page].astro` — paginated listing with getStaticPaths
- Fixed `apps/web/scripts/clone-content.ts` — cross-platform content dir detection
- Added `@astrojs/check` devDependency for proper Astro type checking
- Added all 6 plugin packages as dependencies in `apps/web/package.json`

### Build Verification
- `pnpm typecheck` — ALL 11 tasks pass (0 errors, 0 warnings, 0 hints)
- `astro build` — succeeds, generates 8 static pages in 2.88s (was 7, added paginated page)
- Sitemap generated at `dist/sitemap-index.xml`

### Summary
- **Total new plugin files: ~30 TypeScript files across 6 packages**
- **Phase 4 (Built-in Plugins): COMPLETE** — all 6 plugins implemented, tested, and wired in
- **Status: Phases 1-4 IMPLEMENTED. Ready for Phase 5 (sample) and Phase 6 (deployment).**

### Next Steps (for next scheduled run)
1. Create `sample-basic` implementation using AI agents (Phase 5)
2. Create SKILLS.md for AI agent guidance
3. Set up docs site content (Starlight)
4. Expand E2E tests
5. Update CI/CD workflow for Vercel deployment
