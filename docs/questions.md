---
title: "Open Questions"
sidebar_label: "Questions"
---

# Open Questions

> Questions that need answers. Each has a `[DEFAULT]` choice that we proceed with unless overridden.
> Owner reviews these and provides final decisions.

---

## Q1: UI Framework for Interactive Islands

**Context**: Astro supports multiple UI frameworks for interactive islands. We need one for components that require client-side interactivity (search, filters, modals).

**Options**:
- **A) Preact** — Lightweight (3KB), React-compatible API, perfect for islands `[DEFAULT]`
- B) React — Full React, heavier but largest ecosystem
- C) Solid.js — Very performant, smaller ecosystem
- D) Svelte — Compile-time, great DX, different paradigm
- E) Vue — Popular, good DX

**Default choice**: **Preact** — smallest bundle size while maintaining React-compatible API. AI agents familiar with React can write Preact components immediately. Aligns with R6 (Extreme Performance).

---

## Q2: CSS Strategy

**Context**: Components are headless/unstyled by default. AI applies styling. What CSS approach should the template support?

**Options**:
- **A) Tailwind CSS** — Utility-first, AI-friendly, most common `[DEFAULT]`
- B) Vanilla CSS with CSS Modules — Zero runtime, maximum control
- C) UnoCSS — Tailwind-compatible, faster build
- D) No CSS framework — pure CSS variables + custom properties

**Default choice**: **Tailwind CSS** — most AI agents are trained on Tailwind. It's the most common choice for AI-generated UIs. Ship Tailwind as default, but the component architecture allows any CSS approach.

---

## Q3: Content Cloning Strategy

**Context**: The data repo needs to be cloned at build time. The full template uses `isomorphic-git`. For a static-only build, we have options.

**Options**:
- **A) Simple git clone via child process** — Use `git clone` shell command in a prebuild script `[DEFAULT]`
- B) isomorphic-git — Pure JS, no git binary needed, used by full template
- C) GitHub API — Fetch files via REST API, no clone needed
- D) degit — Lightweight repo cloning without git history

**Default choice**: **Simple git clone** — Simplest approach. Static build happens in CI where git is always available. No need for isomorphic-git complexity since we don't do runtime sync. Falls back to `degit` if git unavailable.

**Status**: SUPERSEDED by Q18 — GitAdapter now uses `isomorphic-git` (pure JS). See Q18 for details.

---

## Q4: Plugin Registration Mechanism

**Context**: How do plugins register themselves and get discovered?

**Options**:
- **A) Configuration file** — `plugins.config.ts` lists active plugins `[DEFAULT]`
- B) Convention-based — Auto-discover from `packages/plugin-*` directories
- C) Package.json keywords — Plugins declare themselves via package.json fields
- D) Runtime registry — Plugins register at import time

**Default choice**: **Configuration file** — Explicit, predictable, AI-friendly. A single `plugins.config.ts` makes it clear what's active. Aligns with R8 (AI-Optimized).

---

## Q5: Search Implementation

**Context**: Directory sites need search. What approach for static sites?

**Options**:
- **A) Pagefind** — Build-time search index, zero JS until interaction, static-first `[DEFAULT]`
- B) Fuse.js — Client-side fuzzy search, loads all data
- C) Lunr.js — Client-side inverted index
- D) Algolia/Meilisearch — External service (requires API key)

**Default choice**: **Pagefind** — Purpose-built for static sites. Generates search index at build time. Tiny JS payload. No external services needed. Perfect fit for R5 (Static Output) and R6 (Extreme Performance).

---

## Q6: Monorepo Package Granularity

**Context**: How granular should packages be? One big `core` package or many small ones?

**Options**:
- **A) Moderate granularity** — `core` (types + data), `ui` (components), `plugins` (plugin system), `adapters` (data adapters) `[DEFAULT]`
- B) Fine granularity — Each concern is its own package (types, data, content-reader, yaml-parser, etc.)
- C) Minimal — One `core` package with everything, `ui` for components

**Default choice**: **Moderate granularity** — Enough separation for clarity and replaceability without excessive package management overhead. Aligns with R7 (Modular & Replaceable) while staying practical.

---

## Q7: Sample Implementation Approach

**Context**: `apps/sample-basic/` should be a reference implementation built by AI from the template. How should this work?

**Options**:
- **A) Copy + customize** — Copy `apps/web/` structure, AI fills in pages and styling `[DEFAULT]`
- B) Extend — Import from `apps/web/` and override/extend
- C) Standalone — Completely separate Astro app that imports only packages

**Default choice**: **Copy + customize** — Most realistic demonstration of how users will use the template. Shows the full AI workflow: start from template, customize everything.

---

## Q8: Comparison Feature Scope

**Context**: The full template has item comparisons. How much should the minimal template include?

**Options**:
- **A) Data types + basic rendering component** — Read comparison YAML, render as simple component `[DEFAULT]`
- B) Full comparison system — Side-by-side views, dimension scoring, verdicts
- C) Skip entirely — Too advanced for minimal template

**Default choice**: **Data types + basic rendering component** — Include the TypeScript types and a headless comparison component that reads comparison data. AI can style and enhance it.

---

## Q9: Image Optimization Strategy

**Context**: Static sites need image optimization. Astro has built-in `<Image>` component.

**Options**:
- **A) Astro built-in Image** — Use `astro:assets` for optimization at build time `[DEFAULT]`
- B) External CDN — Cloudinary, Imgix via URL transforms
- C) No optimization — Just use `<img>` tags

**Default choice**: **Astro built-in Image** — Ships with Astro, zero config, optimizes at build time. Aligns with R6 and R10 (Use Existing Libraries).

---

## Q10: Docs Site Framework

**Context**: `apps/docs/` needs a documentation framework. The full template uses Docusaurus.

**Options**:
- A) Starlight (Astro) — Astro-native docs framework, consistent with main app
- **B) Docusaurus** — Same as full template, React-based, proven ecosystem `[IMPLEMENTED]`
- C) VitePress — Vue-based, fast
- D) Plain Astro — Build custom docs pages

**Implemented choice**: **Docusaurus** — Matches the full template's docs framework, providing consistency across the Ever Works ecosystem. Proven ecosystem with search, versioning, and blog support. Already implemented and working.

---

## Q11: Interactive Component Integration in Web Template

**Context**: The UI package includes 8 Preact interactive components (SearchInput, FilterBar, SortSelect, BackToTop, ThemeToggle, LayoutSwitcher, ItemBrowser, MobileMenu) but the `apps/web` template pages don't use them. The `apps/web` template is intentionally a blank canvas, but should at least demonstrate interactive component wiring.

**Options**:
- **A) Keep web template blank, demo in sample-basic only** — AI agents wire them in per project `[DEFAULT]`
- B) Wire all interactive components into the web template — Pre-built interactive experience
- C) Wire search only, leave filters/sort for AI — Search is fundamental, rest is customizable

**Default choice**: **Keep web template blank, demo in sample-basic** — The web template's purpose is to be an intentionally blank canvas. The sample-basic should demonstrate all interactive components as a reference. AI agents can then copy the patterns.

**Action needed**: Integrate SearchInput, FilterBar, and SortSelect into `apps/sample-basic` pages to demonstrate proper usage.

**Status**: DONE — All 8 interactive components are integrated in `apps/sample-basic`.

---

## Q12: SiteConfig Customization Depth

**Context**: The reference Next.js template has rich SiteConfig with `custom_header`, `custom_footer`, `custom_hero`, `homepage` settings (hero_title, hero_description, search_enabled, default_view, default_sort), and `header` settings. The minimal template's SiteConfig is thin — only `categories_enabled` and `tags_enabled` in settings.

**Options**:
- **A) Extend SiteConfig to support custom nav, hero, and homepage settings** — Makes every directory customizable without code changes `[DEFAULT]`
- B) Keep SiteConfig minimal, let AI add fields as needed — Less code to maintain
- C) Add only custom_header/custom_footer — Navigation is the highest-priority gap

**Default choice**: **Extend SiteConfig** — Custom navigation items (`custom_header`, `custom_footer`) and homepage settings (`hero_title`, `hero_description`, `search_enabled`) are essential for any directory. The `[key: string]: unknown` pass-through already allows arbitrary fields, but explicit typing improves the AI developer experience.

**Status**: DONE — Added `NavLinkItem`, `HomepageConfig` interfaces and `custom_header`, `custom_footer`, `homepage` fields to SiteConfig. Also extended SettingsConfig with `collections_enabled`, `comparisons_enabled`, `featured_enabled`.

---

## Q13: Featured Items Display

**Context**: ItemData has `featured?: boolean` but there are no UI components to visually highlight featured items. The reference template has `FeaturedBadge`, `FeaturedItemsSection`, and a full featured item workflow.

**Options**:
- **A) Add FeaturedBadge component and featured section to headless UI** — Simple badge + optional grid section `[DEFAULT]`
- B) Make featured a plugin (plugin-featured) — More modular but heavier
- C) Leave for AI to implement per-project — Simplest template

**Default choice**: **Add FeaturedBadge and FeaturedSection to `@ever-works/ui`** — Small addition with high value. AI can style the badge. The template already filters by `featured` status.

**Status**: DONE — Created `FeaturedBadge.astro` and `FeaturedSection.astro` in `packages/ui/src/astro/`.

---

## Q14: Layout Variants (Grid/List/Masonry)

**Context**: The reference template has 4 layout modes (Cards, Classic, Grid, Masonry) with a view toggle. The minimal template only has `ItemGrid` and `ItemList`.

**Options**:
- **A) Add a LayoutSwitcher Preact component and at least 3 layout options** `[DEFAULT]`
- B) Keep just grid and list — sufficient for minimal template
- C) Add as a plugin (plugin-layouts) — Most modular

**Default choice**: **Add LayoutSwitcher** — Multiple listing layouts are expected in directory sites. A Preact island LayoutSwitcher + CSS-only layout variants keeps it lightweight.

**Status**: DONE — Created `LayoutSwitcher.tsx` in `packages/ui/src/preact/`. Supports grid, list, compact modes with localStorage persistence.

---

## Q15: Item Detail Decomposition

**Context**: The minimal template has a monolithic `ItemDetail.astro` component. The reference template decomposes item detail into: content renderer, metadata display, CTA button, share button, similar items section, and more.

**Options**:
- **A) Decompose into sub-components** — ItemContent, ItemMetadata, ItemCTA, ShareButton, SimilarItems `[DEFAULT]`
- B) Keep monolithic — Simpler, AI can restructure
- C) Only split content rendering and metadata — Minimal decomposition

**Default choice**: **Decompose into sub-components** — Individual sub-components let AI customize each part independently. Each becomes a separate Astro component in `packages/ui/src/astro/`.

**Status**: DONE — Created ItemContent, ItemMetadata, ItemCTA, ShareButton, SimilarItems in `packages/ui/src/astro/`.

---

## Q16: Item Markdown Content Rendering

**Context**: ItemData has `markdown?: string` but no visible component renders it on the detail page. The sample-git data has markdown content for most items.

**Options**:
- **A) Add ItemContent component with built-in Astro markdown rendering** `[DEFAULT]`
- B) Use a plugin for markdown rendering
- C) Leave for AI — each project may want different markdown styling

**Default choice**: **Add ItemContent component** — Use Astro's built-in `set:html` with a markdown-to-HTML library (already available via the content pipeline). Essential for rich item descriptions.

**Status**: DONE — Created `ItemContent.astro` in `packages/ui/src/astro/`. Uses Astro's `set:html` directive for trusted HTML content rendering.

---

## Q17: ISR as Default Output Mode

**Context**: The template originally used `output: 'static'` (Rule R5). Adding content sync and ISR requires `output: 'hybrid'` with `@astrojs/vercel`. Should ISR be the default or opt-in?

**Options**:
- **A) ISR enabled by default** — `output: 'hybrid'`, users opt out with `ENABLE_ISR=false` `[DEFAULT]`
- B) Static by default — Users opt in with `ENABLE_ISR=true`

**Default choice**: **ISR enabled by default** — ISR is the expected behavior for directory sites that pull content from external repos. Pages are still pre-rendered at build time; ISR just enables on-demand regeneration when content changes. Pure static fallback via `ENABLE_ISR=false`.

**Status**: DONE — Rule R5 updated to "ISR by Default, Static Opt-Out". Astro config uses `output: 'static'` with Vercel adapter for ISR; `ENABLE_ISR=false` disables the adapter.

---

## Q18: Git Implementation — isomorphic-git vs Shell Commands

**Context**: The current GitAdapter uses `execFileSync('git', [...])` for cloning. Adding refresh/fetch/pull support requires more git operations. `isomorphic-git` is a pure JS git implementation used by the full Next.js template.

**Options**:
- **A) isomorphic-git** — Pure JS, no git binary dependency, proven in full template `[DEFAULT]`
- B) Shell git commands — Simpler, but requires git binary in deployment environment
- C) GitHub API — REST API for file fetching, no git at all

**Default choice**: **isomorphic-git** — Pure JavaScript, works in any Node.js environment including serverless. Already proven in the full Next.js template. Supports clone, fetch, pull, resolveRef for change detection. No system dependency on git binary.

**Status**: DONE — GitAdapter rewritten to use isomorphic-git. Pure JS clone, fetch, pull operations. No system `git` binary required.

---

## Q19: Code Quality Improvements — Iteration 44 Audit

**Context**: A comprehensive code quality audit (iteration 44) identified several areas for improvement. These are tracked here for future work.

**High priority items:**
- A) **~~UI package has zero tests~~** — DONE (iteration 51). Added 42 unit tests across 3 test files: `utils.test.ts` (12 tests for `cn()`), `sort-items.test.ts` (12 tests for `sortItemsByOption()`), `variants.test.ts` (18 tests for badge/button CVA variants).
- B) **~~Duplicated `sortItems` logic~~** — DONE (iteration 51). Extracted `sortItemsByOption<T>()` to `@ever-works/ui/lib/sort-items`. Generic over `Sortable` interface. All 5 sample apps + UI ItemBrowser now import from the shared utility. 7 duplicate implementations removed.
- C) **~~Double type assertion in BreadcrumbNav~~** — DONE (iteration 52). Added optional `_breadcrumbs` field to `ContentData` interface. Updated all 5 sample BreadcrumbNav components to use `data._breadcrumbs` directly instead of `(data as unknown as Record<string, unknown>)._breadcrumbs`. Removed type assertion from `plugin-breadcrumbs` plugin.ts.
- D) **~~`ItemData` index signature weakens type safety~~** — DONE (iteration 52). Added explicit `meta?: Record<string, unknown>` field to `ItemData`. Index signature kept for backward compatibility with YAML data spread. Sample apps (events, real-estate) already use `item.meta` pattern.
- E) **~~`LayoutSwitcher` component never used~~** — DONE (iteration 53). Added `LayoutSwitcher` to all 4 non-git sample apps (`sample-basic`, `sample-jobs`, `sample-events`, `sample-real-estate`). Each app imports `LayoutSwitcher` from `@ever-works/ui/preact/LayoutSwitcher`, adds grid/list toggle with separate `persistKey`, and dynamically switches between grid and list CSS layouts. `sample-git` excluded intentionally (custom layout tuned for 3,200+ items).

**Medium priority items:**
- F) **~~Unused public exports~~** — INTENTIONAL (iteration 54). Audited all 11 listed exports: `FilesystemAdapter`, `GitAdapter` (used internally in `@ever-works/adapters` by `create-adapter.ts` and tests), `createPluginLogger` (used by `@ever-works/plugins` runner), `generateBreadcrumbs` (used by `@ever-works/plugin-breadcrumbs` plugin.ts and tests), `filterItems`, `parseFiltersFromUrl`, `serializeFiltersToUrl` (used internally in `@ever-works/plugin-filters`), `sortItems` (used by `@ever-works/plugin-sort` plugin.ts), `loadComparison`, `loadItem`, `loadPage` (used by `@ever-works/core` content-reader and tests). All exports are part of the designed public API for package consumers (AI agents building on the template). They are used internally and tested; they are NOT imported by sample apps because sample apps use higher-level abstractions (`getContent()`, `definePlugins()`). Keeping them exported is correct for a template library.
- G) **~~Missing plugin.ts tests~~** — DONE (iteration 52). Added plugin lifecycle tests for `plugin-breadcrumbs` (12 tests), `plugin-filters` (10 tests), `plugin-sort` (13 tests), `plugin-pagination` (14 tests). Total: 49 new lifecycle tests.
- H) **~~Console.warn in core loaders~~** — DONE (iteration 53). Created `packages/core/src/logger.ts` with `CoreLogger` interface (`info`, `warn`, `error`, `debug` methods) and `coreLogger` singleton. All 24 `console.warn` calls across 7 loader files replaced with `coreLogger.warn()`. Logger auto-prefixes `[core]`, supports variadic args, and has optional verbose mode for `debug()`. 10 unit tests in `logger.test.ts`. Exported via `@ever-works/core` barrel.
- I) **~~Sample apps don't use Astro UI components~~** — BY DESIGN (iteration 54). The `@ever-works/ui/astro/` components are headless (unstyled) building blocks. The sample apps are AI-generated finished products with fully styled inline implementations — this is intentional to demonstrate the end-to-end customization workflow. `apps/web` (the blank canvas template) uses the headless components because it IS the template. Sample apps import Preact interactive components (`SearchInput`, `FilterBar`, `SortSelect`, `LayoutSwitcher`, `ThemeToggle`, `BackToTop`, `MobileMenu`) from `@ever-works/ui/preact/` but style their own page layouts.
- J) **~~sample-git ItemBrowser diverges~~** — DONE (iteration 53). Added comprehensive "Architecture: ItemBrowser Divergence" section to `apps/sample-git/README.md` documenting why sample-git's ItemBrowser (~450 lines) differs from other samples (~230 lines): lazy loading for 3,200+ items (1.6MB → 5KB initial payload), pagination, custom collapsible category/tag UI. Includes comparison table and data flow diagram.

**Status**: ALL ITEMS RESOLVED (iterations 51-54). A-E (code improvements), F (public API exports intentional), G (plugin tests), H (structured logger), I (sample apps by design), J (sample-git docs).

---

## Q20: Analytics Plugin Design Decisions (iteration 65)

**Context**: `@ever-works/plugin-analytics` was specified in iteration 65 (`.specify/features/plugin-analytics.md`). Several sub-decisions are tracked here so they surface at the top-level questions list rather than only inside the spec.

**Q-A1: Event tracking API in v0.1?**
- A) **Pageview-only** — single responsibility, ship fast `[DEFAULT]`
- B) Add `trackEvent(name, props)` helper — more powerful but larger surface

Default choice: **Pageview-only**. Events deferred to v0.2 once real-world usage clarifies the API shape.

**Q-A2: Bundle a consent banner?**
- A) **No — belongs in separate `plugin-consent`** `[DEFAULT]`
- B) Yes — tightly couple consent to analytics

Default choice: **No**. Consent and analytics are different domains; coupling them forces users of custom consent solutions to fight the plugin.

**Q-A3: Where does `<AnalyticsScript />` live?**
- A) **`@ever-works/ui/astro/AnalyticsScript.astro`** — consistent with other Astro components `[DEFAULT]`
- B) Inside the plugin package — keeps the feature self-contained

Default choice: **`@ever-works/ui`**. All Astro components live in one place; plugin package stays pure TS (easier to test, no Astro peer dep).

**Q-A4: Which providers in v0.1?**
- A) **Plausible + Umami + Fathom + GA4 + custom escape hatch** `[DEFAULT]`
- B) Add Simple Analytics, Matomo, PostHog upfront

Default choice: **The 5 listed**. Users needing others use the `custom` provider with raw HTML. Additional providers can be added as individual PRs once there's demand.

**Status**: OPEN — defaults in effect. Decisions will be re-evaluated during implementation phase (see `docs/plans/phase-4b-plugin-analytics.md`).

---

## Q21: Vite 7.3.2 Module Runner Timeout on Windows

**Context**: `astro check` and `astro build` timeout for `sample-events` (and potentially other apps) on Windows when Vite's module runner resolves deep workspace package chains. The `ssr.noExternal: [/^@ever-works\//]` config forces Vite to bundle all workspace packages, which triggers a 60s transport timeout in the module runner. TypeScript `tsc --noEmit` passes fine. Other sample apps (basic, jobs, git) work.

**Options**:
- **A) Wait for Vite 7.4+ fix** — This appears to be a Vite bug on Windows with deep dependency graphs. Monitor Vite releases. `[DEFAULT]`
- B) Increase Vite timeout — Not configurable via Astro config; would need a Vite plugin or patch
- C) Remove `ssr.noExternal` — Would break module resolution for workspace packages
- D) Pre-bundle workspace packages — Add a build step to compile packages to dist/ before running astro check

**Default choice**: **Wait for Vite fix**. The timeout only affects `astro check` locally; CI may not hit it. TypeScript checking via `tsc --noEmit` works and catches the same errors. Workaround: use `tsc --noEmit` instead of `astro check` for sample-events typecheck.

**Status**: OPEN — monitoring Vite releases.

---

## Q22: Vitest UI full-suite hang on Windows (Worker forks emitted error)

**Context**: Discovered in iteration 97 (2026-04-26). Running `vitest run` for `packages/ui` (which has Preact + jsdom tests) hangs after the first ~4 test files complete with the error:

```
Error: [vitest-pool]: Worker forks emitted error.
Caused by: Error: Worker exited unexpectedly
```

The vitest config already uses `pool: 'forks'` and `maxWorkers: 1` (sequential single-fork). Reproduces with both Vitest 4.1.4 and 4.1.5, so it is **not** introduced by the patch bump in this iteration. Each test file passes individually when run in isolation:
- `back-to-top.test.tsx` — 6/6
- `filter-bar.test.tsx` — 16/16
- `item-browser.test.tsx` — 39/39
- `layout-switcher.test.tsx` — 12/12
- `mobile-menu.test.tsx` — 15/15
- `search-input.test.tsx` — 10/10
- `sort-select.test.tsx` — 7/7
- `theme-toggle.test.tsx` — 15/15
- `ui-components.test.tsx` — 34/34

Other packages (core, adapters, sync, plugin-*, plugin-analytics, plugin-search, plugin-related-items) run their suites cleanly via turbo cache replay. Only the UI package combined run fails.

**Options**:
- **A) Workaround: split UI test runs by file in CI / pre-commit** — Run each `*.test.tsx` file as a separate vitest invocation; pass if all pass `[DEFAULT]`
- B) Investigate worker-exit root cause — Likely jsdom or Preact teardown leaking handles between fork lifecycles. Could require GC tuning, isolated execution, or stable `globalThis` patching
- C) Switch UI tests to `pool: 'threads'` — May avoid fork lifecycle issues but loses isolation
- D) Migrate UI tests to Playwright component testing — Heavier but more reliable on Windows; matches our existing E2E stack
- E) Pin Node.js — Verify whether the regression is bound to a specific Node major; current local runs use Node 24.14.0

**Default choice**: **A** — implement a `pnpm test:ui:safe` script that runs each UI test file individually and aggregates pass/fail. Keeps individual file verification as the canonical signal until upstream is debugged.

**Status**: INFRASTRUCTURE ADDED in iteration 98, but ROOT CAUSE STILL OPEN. Default A wiring:
- `packages/ui/scripts/test-per-file.ts` — TypeScript runner that discovers `src/__tests__/**/*.test.{ts,tsx}` and spawns a fresh `vitest run <file>` for each one (via `node node_modules/vitest/vitest.mjs` to avoid Windows path-with-spaces shell quoting issues).
- `packages/ui` package script: `test:safe` → `tsx scripts/test-per-file.ts`.
- Root package script: `test:ui:safe` → `pnpm --filter @ever-works/ui test:safe`.
- New devDependency in `packages/ui`: `tsx ^4.21.0`.
- CLAUDE.md updated under "Common Commands" and "Safe Operations" with the new `pnpm test:ui:safe` entry.

**Important new evidence (iteration 98)**: While verifying the runner, individual `*.test.tsx` files in `packages/ui/src/__tests__/preact/` are *also* hanging after partial test execution — not only between files. Specifically:
- `filter-bar.test.tsx`: completes 4/16 tests, then the worker hangs indefinitely (verified with `pool: 'forks'`, `pool: 'threads'`, fresh `node_modules/.vite` cache, and Vitest 4.1.4 on Node 24.14.0). All 4 completed tests pass.
- The originally-claimed iteration 97 result "filter-bar individual = 16/16" could not be reproduced today; either the local environment has drifted or that earlier number was based on different conditions.

This means **Option A by itself does not actually unblock UI testing on Windows**. The per-file runner still helps for files that complete cleanly (utils, sort-items, variants, keyboard, pagination, back-to-top, search-input have all completed in past runs), and it gives clearer per-file failure isolation, but the underlying hang inside Preact + jsdom test files needs Option B (root-cause investigation) — likely:
1. A jsdom teardown handle leak after the 4th render (suspect: `useEffect` cleanups not flushing under `pool: 'forks'` on Windows).
2. A Vitest 4.1.x worker IPC bug when stdout buffering crosses some threshold on Windows shells.

**Status**: OPEN — infrastructure landed, but the worker hang is deeper than initially scoped. Tracked for next iteration: try `--no-isolate`, downgrade to Vitest 3.x to bisect, and capture a `--inspect-brk` trace of the hung worker.
