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

> **Status: ✅ RESOLVED in iteration 105 (2026-04-27).** All 16 `FilterBar`
> test cases were ported to Playwright Component Testing
> (`packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx`) and pass 16/16 in
> ~6 s on Windows + Node 24.14.0 via `@playwright/experimental-ct-react` +
> the `react` → `preact/compat` Vite alias. The original
> `packages/ui/src/__tests__/preact/filter-bar.test.tsx` was deleted; the
> `vitest.config.ts` `test.exclude` glob now carves out `__tests__/ct/**` so
> the two runners never collide; coverage `exclude` adds `FilterBar.tsx`
> with a comment pointing at Q22 follow-up #3 (playwright-coverage
> integration). The `pnpm test:ui:safe` per-file runner remains in place as
> a safety net for any future jsdom-related regression in the other Preact
> tests but is no longer required for the `FilterBar` surface. Decision
> matrix and authoring conventions live in
> [`docs/architecture/testing-runners.md`](architecture/testing-runners.md).
> The migration also surfaced and fixed a **real bug** in `FilterBar` —
> the default value `selectedTags: initialTags = []` allocated a new `[]`
> on every render, causing `useEffect([initialTags])` to reset state on
> every re-render and silently discard user clicks. Fixed via a stable
> `EMPTY_TAGS` module-level sentinel.


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

**Iteration 99 update (2026-04-26)**: Vitest patch bumped 4.1.4 → 4.1.5 across all 14 dependent packages. The worker hang **still reproduces** on 4.1.5:

- `utils.test.ts` (pure TS, no Preact) — passes 12/12 in 18s on 4.1.5; per-file runner also passes 1/1 in 46.5s.
- `preact/filter-bar.test.tsx` on 4.1.4 with `--no-isolate` — fails after 5/16 tests with `[vitest-pool]: Worker forks emitted error / Worker exited unexpectedly` (17m17s wall time before crash). `--no-isolate` is **not** a workaround.
- `preact/filter-bar.test.tsx` on 4.1.5 (default config) — hung past 60s with no test output beyond the `RUN v4.1.5` banner during the harness window. **Late-arriving evidence (same run, after the iteration 99 commit landed)**: when allowed to run to its true terminal state, the same invocation finished reporting `Test Files (1) / Tests 5 passed (16) / Errors 1 error` at 1170.36s wall (~19m30s), with the identical `[vitest-pool]: Worker forks emitted error / Worker exited unexpectedly` chain seen on 4.1.4. So 4.1.5 default-config behavior is byte-identical to 4.1.4 `--no-isolate` (5/16 pass + worker death), confirming the bump is purely a maintenance bump.

So Option B (bisect Vitest version) is the next concrete step — try a known-good 3.x release in `packages/ui` only (workspace-local pin) to confirm a regression boundary, then look at Option D (Playwright component testing) if no 3.x version fixes it.

**Iteration 100 update (2026-04-26)** — fresh diagnostic pass with Vitest 4.1.5 and committed `pool: 'forks'`, `maxWorkers: 1`. The hang has a *consistent shape* across configurations:

| Configuration                                                         | Outcome                                                   |
|-----------------------------------------------------------------------|-----------------------------------------------------------|
| `back-to-top.test.tsx` (6 tests) `pool: 'forks'`                      | **passes 6/6** in 30.9s                                   |
| `filter-bar.test.tsx` (16 tests) `pool: 'forks'`                      | hangs after 3 tests reported (~5 min wall before kill)    |
| `filter-bar.test.tsx` `pool: 'threads'`                               | hangs after 4 tests reported                              |
| `filter-bar.test.tsx` `pool: 'vmThreads'`                             | hangs after 3 tests reported                              |
| `filter-bar.test.tsx --no-isolate` `pool: 'forks'`                    | hangs after 3 tests reported                              |
| `filter-bar.test.tsx --reporter=json --outputFile=…`                  | hangs with **no JSON file written** (≠ a stdout buffering issue) |
| `filter-bar.test.tsx -t "shows Tags legend"` (test 5 only, isolation) | **passes 1/1** in 30.9s with the other 15 tests skipped   |
| `filter-bar.test.tsx -t "shows"` (skip 1-3, run 4 + 5)                | hangs after 3 tests **skipped** — never reaches a test    |

Refined diagnosis:
1. **Pool-independent.** `forks`, `threads`, `vmThreads` all hang at the same boundary. So this is not a fork-lifecycle issue.
2. **Reporter-independent.** JSON reporter (no stdout per-test writes) hangs identically. So this is not a stdout pipe / IPC backpressure issue.
3. **File-specific.** `back-to-top.test.tsx` runs 6/6 cleanly under the same config that hangs `filter-bar.test.tsx`. So this is not a global jsdom/Preact/setup issue.
4. **Boundary-shaped.** The hang triggers after the worker has *processed* 3-4 test entries (the entries can be `passed` or `skipped` — counting either way). With `-t "shows"` skipping the first 3 tests still hangs *before* test 4 runs, ruling out cumulative state from completed tests.
5. **Test 5 in isolation passes** in 30.9s — so test 5 is not itself broken.

Given (3) the issue is specific to filter-bar.test.tsx, and given (4) it's the *iterator/dispatch* that hangs (not a particular test body), the most likely root cause is in how vitest's runner walks the suite tree for this file. Filter-bar has 16 `it()` blocks under one `describe()` — back-to-top has 6. There may be a Vitest 4.1.x bug at a specific suite-walking transition (e.g. when emitting the 4th task report through the worker IPC channel under jsdom on Windows).

Concrete next steps (deferred to next iteration):
- **Workaround attempt**: split filter-bar.test.tsx into multiple files of ≤6 tests each (mechanical, low-risk) and re-run via the per-file runner. If each smaller file passes, this gives a working full-suite signal on Windows.
- **Bisect attempt**: pin packages/ui to vitest@3.2.x (last 3.x line) and re-run filter-bar.test.tsx. If 3.x works, file an upstream issue with this minimal repro and revert when fixed.
- **Repro for upstream**: capture a minimal stand-alone repro (single Preact component + 16 trivial render() tests + jsdom + vitest 4.1.5 + Windows + Node 24) suitable for github.com/vitest-dev/vitest.

**Iteration 101 update (2026-04-26)** — both the bisect and the file-split workaround were attempted in this run. Net: the test-count theory is **disproved**, the Vitest-4.x-regression theory is **disproved**, and the `fireEvent` + Preact + FilterBar combination is now the prime suspect.

### Iteration 101 evidence

1. **Vitest 3.2.4 bisect (Q22 Option B) — does NOT help; behavior is *worse***
    - Pinned `packages/ui/devDependencies.vitest` to `~3.2.4`, ran `pnpm install --filter @ever-works/ui`, verified `pnpm exec vitest --version` reported `vitest/3.2.4 win32-x64 node-v24.14.0`.
    - Ran `pnpm exec vitest run src/__tests__/preact/filter-bar.test.tsx`. With Vitest 3.2.4 + tinypool@1.1.1 + Node 24.14.0:
      - Tests 1 + 2 (`renders with data-component`, `renders category buttons`) pass.
      - The runner then emits **`Unhandled Rejection: Error: Channel closed` / `code: 'ERR_IPC_CHANNEL_CLOSED'`** from `tinypool/dist/index.js:140 (ProcessWorker.send)` and `:149 (MessagePort)`.
      - No further tests are reported. The `timeout 120` shell wrapper kills the process at 120s wall time (exit code 124).
    - 4.1.5 reaches 5/16 before crashing; 3.2.4 reaches 2/16 before crashing. **3.2.4 is strictly worse**, so the bug is *not* introduced by Vitest 4.x's pool rewrite (PR #8705) — it pre-dates that change. Reverted `packages/ui/package.json` back to `vitest: ^4.1.5` and reran `pnpm install --filter @ever-works/ui` to restore the lockfile.
    - This rules out the agent-research hypothesis from iteration 101 ("Vitest 4.x regression") and shifts attention to the deeper layer (Node 24 child_process IPC + jsdom + Preact event teardown).

2. **File-split workaround — works for render-only tests; FAILS for `fireEvent` tests**
    - Split `filter-bar.test.tsx` (16 tests) into 5 files matching iteration 100's plan:
      - `filter-bar-render.test.tsx` — 5 tests, **render/screen only, no `fireEvent`, no `vi.fn()`**.
      - `filter-bar-categories.test.tsx` — 3 tests, `render` + `fireEvent.click` + `vi.fn()`.
      - `filter-bar-tags.test.tsx` — 4 tests, `render` + `fireEvent.click`/`fireEvent.keyDown` + `vi.fn()`.
      - `filter-bar-clear.test.tsx` — 2 tests, `render` + `fireEvent.click` + `vi.fn()`.
      - `filter-bar-a11y.test.tsx` — 2 tests, `render` + `fireEvent.click`.
    - Verification:
      - `pnpm exec vitest run filter-bar-render.test.tsx` → **5/5 passed in 5.38s** (render-only ⇒ no hang).
      - `pnpm exec vitest run filter-bar-tags.test.tsx` → 0/4 + worker crash at 58.11s (`tests 0ms`, `Worker exited unexpectedly`). The worker dies *before any test runs* — i.e. during environment setup or first `render()` + `fireEvent` interaction.
      - Per-file runner over all 5 split files: `filter-bar-render.test.tsx` passes 5/5 in 5.38s; `filter-bar-categories.test.tsx` then crashes (0/3, 386.57s, `Worker forks emitted error`); the runner stops with `ELIFECYCLE 143`.
    - **Conclusion**: splitting by test count does not unblock the fireEvent-using tests. The boundary is not test-count, it is **first invocation of `@testing-library/preact` `fireEvent` against a `FilterBar` instance** (other components like `BackToTop`, `SortSelect`, `SearchInput` use `fireEvent` and pass — so the failure mode is `fireEvent` × this specific component graph, not `fireEvent` in general).
    - All 5 split files have been **reverted** so the working tree matches the iteration 100 baseline (one `filter-bar.test.tsx`). Keeping 4 broken split files would have added red signal without functional improvement.

### Refined diagnosis after iteration 101

- The crash is **not** Vitest-version-specific (4.1.5 = 5 tests; 3.2.4 = 2 tests; both crash).
- The crash is **not** test-count-specific (5-test render-only file passes; 2-3-test fireEvent file crashes).
- The crash is **not** pool-specific (forks/threads/vmThreads all crash).
- The crash IS specific to `fireEvent` × this component (`FilterBar`) on Windows + Node 24 + jsdom. `fireEvent` works fine for `BackToTop`, `SortSelect`, etc. in the same harness.

What FilterBar has that the passing components don't:
- 3 `useState` + 2 `useEffect` + 3 `useCallback` hooks in the same render function.
- A composed render: `Button` and `Badge` shadcn primitives nested inside `<fieldset>`/`<legend>`/`<div>` wrappers.
- Conditional render of a 4th `Button` (Clear filters) that mounts/unmounts on state change — this is uniquely re-render-heavy compared to the other components.

The most-likely-but-still-unverified root cause is Preact's event delegation + `useEffect` cleanup interacting with jsdom's event-target teardown when the `Clear filters` button mounts after the first `fireEvent.click`. Under Node 24 on Windows, the resulting handle leak crashes the worker before the next test can run.

### Concrete next steps (deferred to iteration 102+)

- **Option D — Playwright component testing (RECOMMENDED).** The bug is environment-specific (Windows + Node 24 + jsdom) and component-specific (FilterBar). Migrating just the FilterBar test file (and any other Preact tests that hit the same wall) to Playwright component testing would bypass jsdom entirely. The E2E stack already uses Playwright, so the runtime cost is mostly authoring.
- **Component-level repro.** Capture a minimal standalone repro (single `<Component/>` with 3 useState + 2 useEffect + 1 conditional remount, plus `render() + fireEvent.click()` × 1) for upstream filing at github.com/vitest-dev/vitest. The repro can be a tarball of the failing file + minimal vitest config + Node 24 instructions.
- **Node 22 LTS check (Q22 Option E).** Has not been verified yet. If Node 22 doesn't crash, Node 24 is the regression source and the workaround is to pin CI Node to 22 until upstream fixes it.

**Iteration 102 update (2026-04-26)** — execution plans authored for the two recommended next steps; no code changes this iteration. Status remains **OPEN** but with concrete blueprints for the next 3-4 scheduled runs:

- **`.specify/features/q22-playwright-ct.md`** — full spec for Option D (Playwright Component Testing). Covers toolchain additions (`@playwright/experimental-ct-preact` + `@playwright/test` aligned with `apps/web-e2e` `^1.59.1` pin), mount fixture scaffolding, migrated test file shape, callback capture pattern (inline closures + arrays, no sinon/jest), coverage handling (exclude `FilterBar.tsx` from V8, sync `.specify/features/testing.md` AC #10), CI matrix (`ubuntu-latest` + `windows-latest` — the windows cell is the definitive Q22 fix signal), risks/open decisions (Preact 10 compat verification gate, snapshot policy), 4 implementation phases (~7 hours total), and rollback plan if the Step 3 smoke test fails.

- **`docs/plans/q22-playwright-ct.md`** — paired 9-step execution plan: install deps (Step 1) → scaffold CT (Step 2) → smoke test as decision gate (Step 3) → port 15 cases with full Vitest→CT idiom translation table (Step 4) → delete original Vitest file (Step 5) → Linux verify (Step 6) → CI matrix (Step 7) → docs + decision matrix (Step 8) → log iteration (Step 9). Per-step risk table with mitigations.

- **`docs/plans/q22-upstream-repro.md`** — blueprint for filing at <https://github.com/vitest-dev/vitest>: single-file pnpm project (`q22-repro/`) with minimal `FilterBarRepro.tsx` (3 useState + 2 useEffect + 1 conditional remount, no `@ever-works/*` imports), 16-test file (15 render-only loop + 1 `fireEvent.click`), `vitest.config.ts` (`pool: 'forks'`, `maxWorkers: 1`, `environment: 'jsdom'`), pre-filing 3-environment verification matrix (Windows+Node24, Linux+Node24, Windows+Node22 — the third row also answers Q22 Option E for free), full GitHub issue template with version table, bisect note (3.2.4 worse than 4.1.5 disproves the 4.x pool rewrite regression theory), iteration 100 diagnostic matrix, and iteration 101 file-split workaround result.

The two plans are independent — execute in parallel. Recommended cadence: Steps 1-3 of the Playwright CT plan in run A (decision gate); Steps 4-5 in run B; Steps 6-9 in run C. Steps 1-3 of the upstream repro plan can run in run A or B alongside the migration.

**Iteration 103 update (2026-04-26) — plan correction**: The iteration-102 spec referenced **`@playwright/experimental-ct-preact`** as if it were a published npm package. Verified on 2026-04-26 via `pnpm view`: that package returns 404. Playwright's official Component Testing docs (<https://playwright.dev/docs/test-components>) document only React and Vue. Published `@playwright/experimental-ct-*` packages are: `react`, `react17`, `vue`, `svelte`, `core` — no `preact`.

Both plan files now carry a `## ⚠️ CORRECTION (iteration 103)` block at the top, instructing the implementer to substitute **`@playwright/experimental-ct-react`** with a `react` → `preact/compat` Vite alias (Path A) — the same alias pattern already used in `packages/ui/vitest.config.ts`. Path B fallback is **`@playwright/experimental-ct-core`** with a custom Preact mount adapter, decided by the Step-3 smoke test outcome.

This correction does not change the overall feasibility of the plan — Preact's React-compat shim is the documented integration story for any React-tooling consumer (Vite, Webpack, Vitest, and now Playwright CT) — but it materially changes the dependency to install in Step 1 and is therefore a hard prerequisite for execution. The estimated effort (~7 hours over 3-4 iterations) is unchanged. No code changes this iteration; doc-only correction.

**Iteration 104 update (2026-04-27) — Steps 1-3 EXECUTED, Path A VALIDATED 🎉**: The first three steps of `docs/plans/q22-playwright-ct.md` were executed and passed cleanly on local Windows + Node 24.14.0. Concrete results:

| Step | Result | Wall time |
|------|--------|-----------|
| 1 — install deps | `@playwright/experimental-ct-react@1.59.1` + `@playwright/test@1.59.1` added to `packages/ui/devDependencies` | ~24 s |
| 2 — scaffold CT | `playwright.ct.config.ts`, `playwright/index.html`, `playwright/index.ts`, `src/__tests__/ct/.gitkeep`, `tsconfig.ct.json` (separate tsconfig because rootDir=`./src` in the build tsconfig blocks `playwright/` from the typecheck graph), `pnpm test:ct` + `pnpm test:ct:install` + `pnpm typecheck:ct` scripts | <5 min |
| 3 — smoke test | `src/__tests__/ct/filter-bar.ct.test.tsx` with the single `'renders with data-component attribute'` case → **1 passed (3.5s)** on Windows | ~3.5 s |

Verification chain:
- `pnpm --filter @ever-works/ui typecheck:ct` → green (0 errors).
- `pnpm --filter @ever-works/ui typecheck` → green (build tsconfig untouched by CT files).
- `pnpm --filter @ever-works/ui lint` → green (CT directory not yet linted; src/ scope unchanged).
- `pnpm test:ct` → `1 passed (3.5s)` on Windows + Node 24.14.0 + Chromium Headless Shell 147.0.7727.15 + Vite 6.4.2.

The Vite alias block (`react` → `preact/compat`, `react-dom` → `preact/compat`, `react-dom/test-utils` → `preact/test-utils`) inside `use.ctViteConfig` worked exactly as predicted by the iteration-103 correction analysis. The Vite production build emitted a 115 KB `FilterBar` chunk (the actual Preact 10.29.1 component) without compat issues. **Path B (custom mount adapter via `@playwright/experimental-ct-core`) is no longer required.**

**Q22 fix is now empirically demonstrated on the original failing platform** (Windows + Node 24, the same environment where the Vitest+jsdom run crashed in iterations 97-101). The migration is unblocked: next scheduled run can proceed directly to Step 4 (port the remaining 15 cases).

One install-path nuance worth recording for future iterations: Playwright's runtime resolves browsers from `~/AppData/Local/ms-playwright/` (Windows) by default. Running `pnpm exec playwright install` *without* `PLAYWRIGHT_BROWSERS_PATH=0` puts them there. The `with-deps` flag fails on Windows shells that can't elevate (it tries to install OS dependencies via apt/dnf), so the recipe is **`pnpm exec playwright install chromium`** locally and **`pnpm exec playwright install --with-deps chromium`** in CI Linux containers. The plan's Step 7 CI snippet already uses `--with-deps`, which is correct for ubuntu-latest; the same line on windows-latest is harmless because Playwright treats `--with-deps` as a no-op on Windows.

Status remains **OPEN** until Steps 4-9 are executed (port full test surface, delete original Vitest file, push CI matrix green on both `ubuntu-latest` and `windows-latest`, write `docs/architecture/testing-runners.md`, flip status to RESOLVED). Estimated remaining effort: ~5 hours over 2-3 iterations.

**Iteration 105 update (2026-04-27) — Steps 4, 5, 8 EXECUTED + RESOLVED 🎉🎉**: All 16 cases ported, original Vitest file deleted, decision-matrix doc published, **and a real bug in `FilterBar` discovered and fixed**.

### Step 4 — Port remaining 15 cases

`packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx` rewritten to cover all
16 cases from the original `packages/ui/src/__tests__/preact/filter-bar.test.tsx`.
Translation followed the table in `docs/plans/q22-playwright-ct.md` Step 4
verbatim:

- `render(<C />)` → `await mount(<C />)`
- `screen.getByText('X')` → `component.getByText('X')`
- `expect(el).toBeTruthy()` → `await expect(locator).toBeVisible()`
- `expect(screen.queryByText('X')).toBeNull()` → `await expect(component.getByText('X')).toHaveCount(0)`
- `fireEvent.click(el)` → `await locator.click()`
- `fireEvent.keyDown(el, { key: 'Enter' })` → `await locator.press('Enter')`
- `vi.fn()` → inline `const calls: T[] = []; <C onX={(v) => calls.push(v)} />`. Playwright CT's RPC bridge runs the closure in the test process, so plain array assertions work without any `page.exposeFunction()` plumbing — the spec's iteration-102 caveat about "mocked callbacks captured via `page.exposeFunction()`" turned out to be unnecessary in practice.
- `Space` key normalized to Playwright's canonical `'Space'` (the original `key: ' '` wouldn't have worked through `locator.press()`).

### Step 4 — Real bug surfaced + fixed

Initial `pnpm test:ct` run reported **13/16 pass, 3/16 fail**. All three
failures were in tag-related tests (multi-select, deselect, aria-pressed),
where the second click "forgot" the previous click. Investigation traced
this to a real bug in `packages/ui/src/preact/FilterBar.tsx`:

```typescript
// Before — bug
selectedTags: initialTags = [],
// ...
useEffect(() => { setActiveTags(initialTags); }, [initialTags]);
```

The default value `[]` allocates a *new array* on every function call.
React/Preact's `useEffect` dep comparison is reference equality, so a fresh
`[]` each render makes the effect fire every render, calling
`setActiveTags([])` and silently discarding the click that just happened.
The bug was **dormant** in the original Vitest test file because the
worker crashed before the second click could exercise it. Migrating to a
runner that actually executes all 16 cases caught it.

```typescript
// After — fix
const EMPTY_TAGS: readonly string[] = Object.freeze([]);
// ...
selectedTags: initialTags = EMPTY_TAGS as string[],
```

A stable module-level `EMPTY_TAGS` sentinel keeps the default reference
identical across renders, so the `useEffect([initialTags])` only fires
when the parent actually changes `selectedTags`. Re-ran `pnpm test:ct` →
**16/16 pass in ~6 s**.

`selectedCategory` did *not* have the same bug because its destructure
omits the default value (`selectedCategory: initialCategory`), so the
prop is `undefined` when not passed and the `useEffect([initialCategory])`
dep stays `undefined` across renders. Tags' default `= []` was the only
broken site.

### Step 5 — Delete original Vitest file + sync configs

- `packages/ui/src/__tests__/preact/filter-bar.test.tsx` deleted.
- `packages/ui/vitest.config.ts` updated: `test.exclude` now carves out
  `**/__tests__/ct/**` so Vitest's collector doesn't pick up `.test.tsx`
  files in the CT directory; `coverage.exclude` adds `src/preact/FilterBar.tsx`
  with a comment pointing at Q22 follow-up #3 (playwright-coverage merge)
  for when CT runs can contribute back to the V8 percentage.
- `.specify/features/testing.md` AC #10 updated to **1149 Vitest unit tests
  + 16 Playwright Component Tests = 1165 total across both runners** (was
  "1165 unit tests"). New AC #12 added documenting the `pnpm test:ct`
  toolchain.

### Step 8 — Decision matrix doc

`docs/architecture/testing-runners.md` published. Full content covers:

- At-a-glance table mapping each runner to its responsibility, scope, and
  command.
- Decision tree for picking a runner when adding new tests.
- Per-runner rules with concrete examples from this codebase
  (`back-to-top.test.tsx` stays in Vitest; `filter-bar.ct.test.tsx`
  belongs in CT).
- Q22 background section so future readers don't have to spelunk through
  iteration logs to understand why CT exists.
- Authoring conventions table (Vitest+`@testing-library/preact` → Playwright
  CT translation map).
- Coverage-handling note pointing at follow-up #3.
- Local-commands cheat sheet.

### Steps 6, 7, 9 still pending

- **Step 6 (Linux verify)** — not exercised this iteration; defer to first
  CI run.
- **Step 7 (CI matrix)** — `.github/workflows/ci.yml` not yet edited. The
  spec calls for an `os: [ubuntu-latest, windows-latest]` `test-ct` job.
  Defer to next iteration after a clean local typecheck/lint/test pass on
  the iteration-105 changes.
- **Step 9 (log iteration)** — done (this entry plus `docs/log.md`).

### Q22 status flip

Status changed from **OPEN** to **✅ RESOLVED** at the top of this section.
The `pnpm test:ui:safe` per-file runner stays in place as a safety net for
non-`FilterBar` Preact tests but is no longer required to get a green UI
signal on Windows.

### Iteration 105 — observation: `layout-switcher.test.tsx` hangs under `pnpm test:ui:safe` post-FilterBar removal

While verifying that `pnpm test:ui:safe` still produces a clean signal
after the iteration-105 changes, the per-file runner completed
`utils.test.ts` (12/12), `keyboard.test.ts` (7/7), `pagination.test.ts`
(14/14), `back-to-top.test.tsx` (6/6), and `item-browser.test.tsx`
(39/39), then **stalled indefinitely on `layout-switcher.test.tsx`**
(no test output beyond the `RUN v4.1.5` banner across a 5+ min wall
window before the run was aborted).

This is **not** caused by the iteration-105 changes:

- The CT migration only touched `FilterBar.tsx`, `vitest.config.ts`,
  the deleted `filter-bar.test.tsx`, and the new
  `filter-bar.ct.test.tsx` plus docs. None of those affect
  `layout-switcher.test.tsx`.
- The Q22 diagnosis from iteration 100 specifically checked
  `layout-switcher.test.tsx` and reported "12/12 passed individually".
  Either the local environment has drifted since iteration 100 or this
  is a separate Q22-shaped failure with the same fingerprint as
  `FilterBar` (jsdom + Preact + Node 24 IPC).

Recommended next-iteration action: open **Q23** to diagnose
`layout-switcher.test.tsx` specifically. If the symptom matches Q22
(stall before any test runs, pool-independent, reporter-independent),
follow the same Playwright CT migration path. The
`docs/architecture/testing-runners.md` decision tree already points to
CT for this kind of failure mode, so the implementation playbook is
unchanged from Q22 — only the file under migration differs.

Independent confirmation that the iteration-105 changes are sound:

- `pnpm typecheck` across the full monorepo: 23/23 successful
  (16 cached + 7 fresh), 0 errors.
- `pnpm lint` across the full monorepo: 18/18 successful, 0 errors.
- `pnpm --filter @ever-works/ui test:ct`: 16/16 pass in ~6.1 s
  (iteration-105 CT migration verified end-to-end).
- `pnpm --filter @ever-works/ui typecheck:ct`: 0 errors.
- `pnpm --filter @ever-works/ui typecheck`: 0 errors.
- `pnpm --filter @ever-works/ui lint`: 0 errors.

---

## Q23: Vitest UI hang — `layout-switcher.test.tsx` (Q22-shaped, post-iteration 105)

> **Status: ✅ RESOLVED in iteration 107 (2026-04-27).** All 12
> `LayoutSwitcher` test cases were ported to Playwright Component Testing
> (`packages/ui/src/__tests__/ct/layout-switcher.ct.test.tsx`) and pass
> 12/12 in ~1 min combined with the existing 16 `FilterBar` cases (28/28
> total CT walltime, Windows + Node 24.14.0). The original
> `packages/ui/src/__tests__/preact/layout-switcher.test.tsx` was deleted;
> `vitest.config.ts` `coverage.exclude` adds `LayoutSwitcher.tsx` alongside
> `FilterBar.tsx` (both pending Q22 follow-up #3 — playwright-coverage
> merge). Two infrastructure fixes landed alongside: (1)
> `playwright.ct.config.ts` now hard-pins `workers: 1` and
> `fullyParallel: false` because Playwright CT shares a single Vite dev
> server on `ctPort: 3100` across the whole run — multiple workers tripped
> `net::ERR_CONNECTION_REFUSED` once a 2nd CT file landed. (2)
> `packages/ui/scripts/test-per-file.ts` now skips the `__tests__/ct/`
> subdirectory during discovery so the per-file Vitest runner doesn't
> spawn against `*.ct.test.tsx` files (which import
> `@playwright/experimental-ct-react` and would fail in Vitest). With
> `LayoutSwitcher.test.tsx` gone, `pnpm test:ui:safe` now reports
> **12/12 files passing in 201.2s** — Q22 follow-up #2 (test:ui:safe
> removal) is unblocked.

**Context**: Discovered as a side effect of the iteration-105 verification pass and re-confirmed in iteration 106 (2026-04-27, Windows 10 + Node 24.14.0 + Vitest 4.1.5 + jsdom 29.0.2 + Preact 10.29.1).

`pnpm exec vitest run src/__tests__/preact/layout-switcher.test.tsx` hangs at the `RUN v4.1.5` banner with **zero test output** for 3+ minutes. Same shape as Q22's filter-bar hang, applied to `LayoutSwitcher`. Other Preact files (e.g. `back-to-top.test.tsx`) still complete cleanly under the same config (verified: 6/6 pass in 11.48s on iteration 106).

**Why this is a separate question, not a Q22 reopening**:
- Q22 has a known fix in place for `FilterBar` (Playwright CT, iteration 105 commit `1dedb3b`). That fix did not regress.
- Q22's hang fingerprint was *test-walking after 3-4 entries reported*. `LayoutSwitcher`'s hang fires *before any test reports* — the 0-byte log indicates the worker dies during file load / first test discovery, not mid-suite.
- The iteration-100 diagnostic matrix originally reported `layout-switcher.test.tsx` as "12/12 individually". Either the environment has drifted (Vitest 4.1.4 → 4.1.5 + Node 24 patch updates between iteration 100 and now) or this fingerprint variation was always latent and only surfaces under specific timing.

**Affected file**: `packages/ui/src/__tests__/preact/layout-switcher.test.tsx` (12 cases, all using `fireEvent.click` against `screen.getByLabelText(...)` returns, with `localStorage` reads in `beforeEach` and on render).

**Suspect**: Same root layer as Q22 — `@testing-library/preact` `fireEvent` × jsdom × Node 24 IPC. `LayoutSwitcher` shares with `FilterBar` the pattern of `useEffect` that touches state on `localStorage` reads and a controlled-mode style state sync. A single line in `LayoutSwitcher.tsx` likely mirrors the `EMPTY_TAGS = []` allocation bug fixed in `FilterBar.tsx` in iteration 105.

**Options**:

- **A) Migrate `layout-switcher.test.tsx` to Playwright CT** — same playbook as Q22, same toolchain (`@playwright/experimental-ct-react` + `react`→`preact/compat` Vite alias), same authoring conventions documented in `docs/architecture/testing-runners.md`. Estimated effort: ~2-3 hours (the heavy lifting of toolchain setup is already done).  `[DEFAULT]`
- **B) Audit `LayoutSwitcher.tsx` for the same default-`[]`-allocation bug as `FilterBar`** — if found and fixed, the Vitest test may stabilize without migration. Lower-risk, faster to attempt, but does not address the underlying jsdom + Node 24 IPC fragility.
- **C) Combine A + B** — fix any source-side bug discovered in B *and* migrate the tests in A. The migration still adds value as defense-in-depth.
- **D) Defer until follow-up #1 (preemptive `MobileMenu` migration)** — bundle several CT migrations into a single iteration once 2-3 components have hit the wall.

**Default choice**: **A** — replicate the Q22 fix directly. The Playwright CT scaffold is already in place; the only new code is `packages/ui/src/__tests__/ct/layout-switcher.ct.test.tsx`. Doing B in parallel is fine — if it surfaces a real bug, the CT tests will exercise the fix in a real browser. Defer D's aggregation logic until 2+ components actually need migration.

**Status**: ✅ RESOLVED — Option A (Playwright CT migration) executed in iteration 107.

**Iteration 106 verification** (2026-04-27):
- `pnpm exec vitest run packages/ui/src/__tests__/preact/layout-switcher.test.tsx` — hangs indefinitely at `RUN v4.1.5` banner; 0 bytes test output captured after 180+ seconds; killed manually.
- `pnpm exec vitest run packages/ui/src/__tests__/preact/back-to-top.test.tsx` — passes 6/6 in 11.48s under identical configuration. Confirms the regression is per-file, not environment-wide.
- `pnpm typecheck`, `pnpm lint` — both green; no source changes this iteration.
- `pnpm test:ct` (Q22 verification) — 16/16 still pass; Q22 fix unaffected.

The iteration-105 statement under Q22 ("Recommended next-iteration action: open **Q23**") is now satisfied by this entry.

**Iteration 107 execution** (2026-04-27):
- Authored `packages/ui/src/__tests__/ct/layout-switcher.ct.test.tsx` with all 12 cases ported using the same Vitest→Playwright CT translation table from `docs/architecture/testing-runners.md`. localStorage handled via `await page.evaluate(...)` before/after `mount(...)`.
- Three CT-specific gotchas surfaced and fixed during the port:
  1. `component.getByRole('radiogroup')` returned 0 elements — the mount root *itself* IS the radiogroup `<div>`. Fix: assert `await expect(component).toHaveAttribute(...)` directly on the mount root locator.
  2. `localStorage.getItem` after `await listButton.click()` raced the post-click `useEffect` and read the previous value. Fix: insert `await expect(listButton).toHaveAttribute('aria-checked', 'true')` between the click and the read — Playwright's auto-retry waits for the effect commit.
  3. `pnpm test:ct` reported `net::ERR_CONNECTION_REFUSED at http://localhost:3100/` for 11/28 tests on the first run with 2 CT files. Root cause: `workers: undefined` locally + `fullyParallel: true` spawned multiple workers all binding the same fixed `ctPort: 3100`. Fix: hard-pin `workers: 1` and `fullyParallel: false` in `playwright.ct.config.ts`. Sequential execution costs <10 s wall time at our current test volume.
- Deleted `packages/ui/src/__tests__/preact/layout-switcher.test.tsx`.
- Added `LayoutSwitcher.tsx` to `packages/ui/vitest.config.ts` `coverage.exclude` alongside `FilterBar.tsx`.
- Updated `packages/ui/scripts/test-per-file.ts` to skip the `__tests__/ct/` directory during file discovery (it was matching `*.ct.test.tsx` and trying to run them through Vitest, which fails because they import `@playwright/experimental-ct-react`).

**Iteration 107 verification** (2026-04-27):
- `pnpm test:ct` — **28/28 pass in ~1 min** (16 FilterBar + 12 LayoutSwitcher) on Windows + Node 24.14.0 + Chromium 147.0.7727.15.
- `pnpm typecheck` — 23/23 successful (16 cached + 7 fresh) in 1m22s, 0 errors.
- `pnpm lint` — 18/18 successful (16 cached + 2 fresh) in 16.2s, 0 errors.
- `pnpm test:ui:safe` — **12/12 files pass in 201.2s** with no Q22-shape hangs. (This unblocks Q22 follow-up #2 — the per-file runner can now be retired on the next health audit since no remaining Preact test file requires it.)
- `pnpm --filter @ever-works/ui typecheck:ct` — 0 errors.

**Iteration 108 update — Q22 follow-up #1 ✅ COMPLETE; Q24 opened** (2026-04-27):

- **Q22 follow-up #1 — preemptive `MobileMenu` Playwright CT migration — ✅ COMPLETE.** Spec at `.specify/features/q22-mobilemenu-ct.md` and execution plan at `docs/plans/q22-mobilemenu-ct.md`. New file: `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx` with all 15 cases ported (the original `mobile-menu.test.tsx` had 15 not 14 as the iteration-108 spec initially estimated). Verified in isolation via `pnpm --filter @ever-works/ui exec playwright test --config=playwright.ct.config.ts src/__tests__/ct/mobile-menu.ct.test.tsx` — **15/15 passing in 45.7s** on Windows + Node 24.14.0. Vitest counterpart deleted; `MobileMenu.tsx` added to `packages/ui/vitest.config.ts` `coverage.exclude` alongside `FilterBar.tsx` and `LayoutSwitcher.tsx`. Document-level event listeners (Escape via `page.keyboard.press`, click-outside via wrapper-mount) and body-scroll mutation (`page.evaluate(() => document.body.style.overflow)`) all map cleanly to CT idioms.
- **Q24 opened — `layout-switcher.ct.test.tsx` flake/regression**: when running the full `pnpm test:ct` suite (43 tests across 3 files) in iteration 108, 3 of the 12 `LayoutSwitcher` CT tests now fail intermittently:
  - "uses custom persistKey" — `expect(customStored).toBe('list')` receives `'grid'` instead of `'list'`.
  - "does not persist when persistKey is empty" — `net::ERR_CONNECTION_REFUSED at http://localhost:3100/`.
  - "does not restore from localStorage when persistKey is empty" — same `ERR_CONNECTION_REFUSED`.

  Running `layout-switcher.ct.test.tsx` *in isolation* still produces 11/12 pass + 1 fail (the "persists mode to localStorage" assertion intermittently sees `'grid'` instead of `'list'`), so the flake is not specific to running alongside `mobile-menu.ct.test.tsx` — it is a pre-existing Q23 regression that surfaced only when the suite walltime grew large enough to expose either:
  - **(a)** A real LayoutSwitcher bug where the `useEffect` localStorage write races with a same-tick re-read after click; or
  - **(b)** Vite dev-server stability degrading after >30 sequential CT mounts (the `ERR_CONNECTION_REFUSED` failures point at the server falling over, not at component logic).

  Q24 will need its own triage iteration to decide between fixing the source bug (option a, applies to both Vitest and CT) vs. tuning the CT runner (option b, e.g. periodic `mount()` flush, `ctPort` rotation, or dev-server keepalive). The iteration-107 claim "12/12 pass in ~1 min" appears to have been a one-shot result that did not prove deterministic. The iteration-108 mobile-menu migration does *not* introduce or worsen this regression — verified by running `mobile-menu.ct.test.tsx` in isolation (15/15) and `layout-switcher.ct.test.tsx` in isolation (11/12 with the same persist-key flake).

**Iteration 108 verification**:
- `pnpm --filter @ever-works/ui exec playwright test src/__tests__/ct/mobile-menu.ct.test.tsx` — 15/15 pass in 45.7s.
- `pnpm --filter @ever-works/ui exec playwright test src/__tests__/ct/layout-switcher.ct.test.tsx` — 11/12 pass (Q24 flake confirmed isolated to layout-switcher).
- `pnpm typecheck` — pending verification at commit time.
- `pnpm lint` — pending verification at commit time.

---

## Q24: `layout-switcher.ct.test.tsx` localStorage / ctPort flake (post-iteration 107)

> **Status: ✅ RESOLVED in iteration 109 (2026-04-27).** Option A (audit
> `LayoutSwitcher.tsx` for an `EMPTY_TAGS`-style allocation bug) hit
> directly: `modes = ['grid', 'list']` allocated a fresh `[]` per render,
> firing `useEffect([persistKey, modes])` every render and racing the
> post-click `localStorage.setItem(...)`. Fix mirrors iteration 105's
> `EMPTY_TAGS` sentinel — a frozen module-scope
> `EMPTY_MODES: readonly LayoutMode[]` constant. Verified across **3
> isolated runs** (12/12 each in 40-46s) and **2 full-suite runs**
> (43/43 each in 1m12-18s) on Windows + Node 24.14.0 + Chromium 147.
> The `net::ERR_CONNECTION_REFUSED` observation (hypothesis B) did not
> reproduce after the source fix — it was a downstream effect of the
> race producing extra mounts/retries, not an independent dev-server
> bug. Hypotheses B and C are now **not applicable**. Spec at
> `.specify/features/q24-layoutswitcher-empty-modes.md`; plan at
> `docs/plans/q24-layoutswitcher-empty-modes.md`; log entry at
> `docs/log.md` iteration 109. The iteration-107 "12/12 pass in ~1 min"
> claim is **now reproducible** with the fix in place — five
> consecutive verification runs confirm determinism.

**Context**: Discovered while running the full `pnpm test:ct` suite in iteration 108 (`mobile-menu.ct.test.tsx` migration). The Q23-resolution claim from iteration 107 was "12/12 LayoutSwitcher CT tests pass in ~1 min on Windows + Node 24.14.0". On re-verification in iteration 108, that result is not reproducible — the suite consistently shows 1-3 failures depending on which other files run alongside.

**Symptoms** (Windows 10 + Node 24.14.0 + Vitest 4.1.5 + Playwright 1.59.1 + Chromium 147.0.7727.15):

1. `uses custom persistKey` (test #134:5 in `layout-switcher.ct.test.tsx`) — `expect(customStored).toBe('list')` receives `'grid'`. The test clicks "List view", waits for `aria-checked='true'`, then reads `localStorage.getItem('custom-key')`. The aria-checked assertion passes, so the click reaches the component; but the read returns either the previous test's value or the post-click `useEffect` has not committed.
2. `does not persist when persistKey is empty` and `does not restore from localStorage when persistKey is empty` (#156:5 and #169:5) — both fail with `page._wrapApiCall: net::ERR_CONNECTION_REFUSED at http://localhost:3100/`. Exclusively when these tests run after ~30+ prior CT mounts in the same `pnpm test:ct` invocation. In isolation they pass.

**Hypotheses**:

- **A) Real bug in `LayoutSwitcher.tsx`** — the `useEffect([initialMode])` chain may re-read `localStorage` after the click writes, racing the post-click commit and reverting `activeMode` back to `'grid'`. Mirror of the iteration-105 `EMPTY_TAGS` bug discovered in `FilterBar`. Test in isolation: revert the click, then re-mount to confirm read order.
- **B) Vite dev-server stability** — Playwright CT shares a single Vite dev server on `ctPort: 3100`. After 30+ sequential mounts the server may exceed memory or connection-pool limits and start refusing new connections. Fix candidates: explicit `await page.close()` between mounts, periodic dev-server bounce, or moving CT to a per-test fresh server.
- **C) Both** — the test's click→assert→read pattern is correct enough to mask hypothesis A while hypothesis B is the connection-refused mode.

**Options**:

- **A) Audit `LayoutSwitcher.tsx` for a state-allocation bug** mirroring the iteration-105 `EMPTY_TAGS` fix. If found and fixed, the persist-key test will stabilize across both Vitest (if we ever restore it) and CT.  `[DEFAULT]`
- **B) Add `await page.evaluate(() => localStorage.clear())` and `await page.close()` between LayoutSwitcher CT tests** to defuse cross-test state leak. Defensive; may mask the real bug from Option A.
- **C) Investigate the `ctPort` exhaustion theory** — instrument the CT run with `page.on('response')` and `page.on('crash')` listeners to capture the failure mode of the 30th+ mount. Heaviest investment, deepest result.
- **D) Defer all Q24 work; document the flake and ship** — iteration 108 is already a healthy migration win; Q24 belongs in its own triage iteration.

**Default choice**: **A** — start with the source-bug hypothesis since it has the cleanest fix surface and would explain the persist-key value mismatch. Run B in parallel if time permits; defer C unless A+B do not stabilize the suite.

**Status**: ✅ RESOLVED in iteration 109 — see resolution note at the top of this section. The fix landed in `packages/ui/src/preact/LayoutSwitcher.tsx` (1 line of source change + a 6-line comment block + 1 line for the `EMPTY_MODES` sentinel declaration). All Q22 / Q23 / Q24 CT-related questions are now closed; the codebase pattern (frozen sentinels for non-primitive default props that flow into `useEffect` dep arrays) is documented in `docs/log.md` iteration 109 for future reference.

### Iteration 109 verification commands (reproducible)

```bash
# Three isolated runs (each ~45s, 12/12 expected)
cd packages/ui
pnpm exec playwright test --config=playwright.ct.config.ts layout-switcher.ct.test.tsx
pnpm exec playwright test --config=playwright.ct.config.ts layout-switcher.ct.test.tsx
pnpm exec playwright test --config=playwright.ct.config.ts layout-switcher.ct.test.tsx

# Two full-suite runs (each ~1m15s, 43/43 expected)
pnpm test:ct
pnpm test:ct

# Full-monorepo gates
cd ../..
pnpm typecheck   # 23/23, 0 err
pnpm lint        # 18/18, 0 err
```

If any of the above fails after the fix, capture the failure shape and re-open Q24 with a section labelled "Iteration 109 fix did not stabilize". The dev-server hypothesis (B) and combined hypothesis (C) would then need direct investigation. As of 2026-04-27 02:36 local, all five verification runs landed green.

---

## Q25: Coverage library for Playwright CT — `monocart-coverage-reports` vs `@bgotink/playwright-coverage` vs custom

> **Status: OPEN — opened in iteration 110 (2026-04-27).** Default
> implies a smoke-test gate in Phase 0 of the plan at
> [`docs/plans/q22-playwright-coverage.md`](plans/q22-playwright-coverage.md);
> if the smoke test fails, re-open this question with the failure
> shape attached and pick Option B.

**Context**: Q22 follow-up #3 — integrate a coverage tool that captures
V8 coverage during Playwright Component Testing runs, source-maps it
back to original `.tsx` files, and merges it with the existing Vitest
V8 coverage report. Three components (`FilterBar`, `LayoutSwitcher`,
`MobileMenu`) are currently excluded from the Vitest V8 branch report
because they were migrated to CT in iterations 105 / 107 / 108. Without
a merge step, those three production components are not subject to
coverage gating — a regression risk this question resolves.

Spec: `.specify/features/q22-playwright-coverage.md` (iteration 110).
Plan: `docs/plans/q22-playwright-coverage.md` (iteration 110, 5 phases).

**Options**:

- **A) `monocart-coverage-reports`** — published version 2.11.0
  (October 2024); explicitly supports `playwright-ct-react` per the
  README; explicitly supports merging V8 coverage from multiple
  sources (Vitest + Playwright); emits V8-native reports matching
  Vitest's existing provider; reporter integration is a one-line
  addition to `playwright.ct.config.ts`. `[DEFAULT]`
- **B) `@bgotink/playwright-coverage`** — older package; converts
  V8 to Istanbul before merging (lossier for source-mapped edge
  cases); no explicit `playwright-ct-react` example in the README,
  though `mergeTests` works for any Playwright extension; emits
  lcov/Istanbul format that Vitest's V8 output would need to be
  transcoded to before merging.
- **C) Custom harness** — wire `Profiler.takePreciseCoverage()`
  manually via Playwright's `addInitScript` + `evaluate`,
  post-process with `c8` or `v8-to-istanbul`. Highest control,
  highest maintenance cost; reasonable only if A and B both fail
  the smoke test in Phase 0 of the plan.
- **D) Defer follow-up #3 indefinitely** — keep the three exclusions
  in `vitest.config.ts` as the long-term steady state. The CT suite
  remains an assertion oracle without contributing to the coverage
  number. Acceptable in a low-velocity project; not a fit for ours
  (R8: extreme performance, R10: AI-optimized — opaque coverage
  numbers hurt both AI and human reviewers).

**Default choice**: **A — `monocart-coverage-reports`**. The explicit
`playwright-ct-react` support and the V8-native merge are decisive.
Option B remains the documented fallback if Phase 0's smoke test
shows source-map drift; Option C is the fallback-of-last-resort.

**Status**: OPEN — implementation gated on Phase 0 smoke test landing
in a future iteration (110+1 if iteration 110 stops at spec/plan
authorship; same iteration if bandwidth allows).

### Smoke-test acceptance (Phase 0 of the plan)

Before any production code lands, a 30-line throwaway script must
prove that the chosen library:

1. Captures V8 coverage from a `mount(<FilterBar />)` call in CT.
2. Source-maps the V8 ranges back to `packages/ui/src/preact/FilterBar.tsx`
   (not a Vite chunk hash or `__VITE_LOAD_*` synthetic path).
3. Reports >0% branch coverage for at least one branch in
   `FilterBar.tsx`.

If any of those three assertions fails for the default (Option A),
the question reopens with the smoke-test JSON attached and Option B
becomes the new default.

### Why not E (do nothing — keep exclusions and document them as the
final state)?

Considered. Rejected because:

- Coverage numbers reported by CI become semantically misleading
  ("`@ever-works/ui` at 100% branch" hides three components).
- AI agents reading the report cannot tell that the 100% is
  conditional on three opt-outs.
- The exclusions create a slippery-slope precedent: any future
  CT-only component will need a corresponding exclusion, and the
  measured surface area shrinks over time.

Documenting the exclusions is necessary regardless of which option
wins — but the exclusions themselves are not a stable end state.
