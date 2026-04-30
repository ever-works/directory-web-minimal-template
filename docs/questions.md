---
title: "Open Questions"
sidebar_label: "Questions"
---

# Open Questions

> Questions that need answers. Each has a `[DEFAULT]` choice that we proceed with unless overridden.
> Owner reviews these and provides final decisions.

## Triage (iter 218 — 2026-04-30)

The questions in this file are split into two sections:

1. **Active Questions** — questions where the agent is **not 100% sure** about
   the right answer. Owner review is the resolution step. These come first so
   they are easy to find.
2. **Other Questions** — questions where the agent has made a confident
   default choice (some `[DEFAULT]`-still-active, some ✅ RESOLVED). Owner
   review is *optional*; the default is in effect and the codebase ships
   accordingly. These are kept in the file as a historical record (per AGENTS.md
   R13: improve, do not remove) and so future readers can trace decisions.

**Multi-option follow-up annotation (added iter 218)**: many questions chose
a single default option even though the architecture (plugin/adapter pattern,
Astro integrations, headless UI) supports multiple options. Per the iter-218
user direction, those questions are now annotated with a
`### Multi-option follow-up (iter 218)` block listing **what alternates the
template will support** alongside the default, and pointing at the umbrella
spec at `.specify/features/multi-option-support.md`
([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/multi-option-support.md))
and plan [`docs/plans/multi-option-support.md`](plans/multi-option-support.md)
that schedule the work. Each phase ships independently; the existing default
stays in effect for users who do not opt in.

---

## Active Questions

Owner review needed. The agent is not confident enough to proceed unilaterally
on these, so the default-in-effect is documented but flagged for explicit
direction.

- **[Q29: Cron-cadence saturation](#q29-cron-cadence-saturation--should-the-hourly-schedule-wind-down-or-pivot-iteration-162)** —
  user **partially** answered in iter 218 by pivoting to feature work
  (multi-option-support cohort, Option B-prime). The remaining open
  sub-question is which **vertical-specific samples** (sample-saas,
  sample-podcasts, sample-books) to scaffold next, if any. Default: keep
  the existing 5 samples; do not add new verticals until the user
  requests one explicitly. See the question body below for the original
  Option A/B/C/D framing and the iter-218 user-pivot annotation.

(Q21 was previously a candidate for this section but is moved to *Other
Questions* — the answer "wait for upstream Vite fix; use `tsc --noEmit`
locally" is unambiguous and the agent is confident in it. The question
remains OPEN as a tracking record but does not need owner review.)

> If you are reading this section and see only Q29 (or none at all),
> that is by design — most questions in this file have confident
> defaults. Active Questions is the surface area where owner review
> moves the project forward.

---

## Other Questions

The remainder of this file. All questions are kept verbatim per R13;
status flags (`✅ RESOLVED`, `OPEN — default in effect`, `SUPERSEDED`)
indicate the current state. Multi-option follow-up blocks (added iter
217) appear directly after the original resolution where applicable.

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

### Multi-option follow-up (iter 218)

**Status**: OPEN — phase queued (Phase 1 of multi-option-support).

**Answer**: Default stays Preact (already shipping). The template will additionally
**document** how to swap in or co-mount each alternate UI framework — Astro
supports multiple frameworks in the same project, so adopting React/Solid/Svelte/Vue
is a config change, not a fork:

- **React** — `pnpm add @astrojs/react react react-dom`; add `react()` to
  `astro.config.ts` `integrations: []`.
- **Solid.js** — `pnpm add @astrojs/solid-js solid-js`; add `solidJs()`.
- **Svelte** — `pnpm add @astrojs/svelte svelte`; add `svelte()`.
- **Vue** — `pnpm add @astrojs/vue vue`; add `vue()`.

**Configuration mechanism**: Astro's `integrations` array in `astro.config.ts`.
The default Preact integration stays; users append (or replace with) any of
the four alternates. No core change required — `@ever-works/ui/preact/*` exports
remain Preact; users co-mount React/Solid/Svelte/Vue islands alongside, or
migrate per-component if they prefer.

**Why we don't pre-install all four**: pre-installing every Astro integration
would 5x the install size for users who want Preact only. Alternates ship as
**recipes** under `docs/guides/multi-option/ui-framework.md` (queued); users
`pnpm add` the integration when they switch.

**Tracking**: `.specify/features/multi-option-support.md` § Phase 1; deliverable
is `docs/guides/multi-option/ui-framework.md` plus end-to-end React verification
on a scratch sample-basic clone.

---

## Q2: CSS Strategy

**Context**: Components are headless/unstyled by default. AI applies styling. What CSS approach should the template support?

**Options**:
- **A) Tailwind CSS** — Utility-first, AI-friendly, most common `[DEFAULT]`
- B) Vanilla CSS with CSS Modules — Zero runtime, maximum control
- C) UnoCSS — Tailwind-compatible, faster build
- D) No CSS framework — pure CSS variables + custom properties

**Default choice**: **Tailwind CSS** — most AI agents are trained on Tailwind. It's the most common choice for AI-generated UIs. Ship Tailwind as default, but the component architecture allows any CSS approach.

### Multi-option follow-up (iter 218)

**Status**: OPEN — phase queued (Phase 2 of multi-option-support).

**Answer**: Default stays Tailwind CSS v4 via `@tailwindcss/vite` (already
shipping). The headless-UI architecture means components carry no CSS, so
swapping the CSS strategy is a downstream choice that does not touch
`packages/ui/`. The template will **document** four alternates:

- **UnoCSS** — `unocss/vite` with `presetWind()` for Tailwind class-name parity.
- **CSS Modules** — Astro built-in support; per-component `*.module.css` with
  `cn()` helper retained.
- **Vanilla CSS + custom properties** — design tokens in `:root`, no
  utility framework.
- **Pure shadcn-ui style** — CSS variables in `:root`, component-level
  `cn()` retained.

**Configuration mechanism**: Vite plugin in `astro.config.ts` (`@tailwindcss/vite`
vs `unocss/vite`) plus `src/styles/global.css` content. No core code change.

**Tracking**: `.specify/features/multi-option-support.md` § Phase 2; deliverable
is `docs/guides/multi-option/css-strategy.md` with a tradeoff matrix
(bundle size, build speed, AI familiarity) and end-to-end UnoCSS
verification on a scratch sample-basic clone.

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

### Multi-option follow-up (iter 218)

**Status**: OPEN — phase queued (Phase 3 of multi-option-support).

**Answer**: Default stays the explicit `plugins.config.ts` with `definePlugins([...])`
(already shipping in every sample app). The template will **add** an opt-in
`discoverPlugins(workspaceRoot?: string)` helper that auto-discovers any package
declaring itself as an Ever Works plugin via:

- `keywords: ['ever-works-plugin']` in its `package.json`, **and**
- `"ever-works-plugin": "./dist/index.js"` field pointing at the entry.

**Configuration mechanism**: users opt in by replacing
`definePlugins([...explicitArray])` with
`definePlugins(await discoverPlugins())` (or spreading both: `definePlugins([
  ...await discoverPlugins(), userPlugin() ])`).

**Why we keep the explicit config as default**: order sensitivity. Some plugins
depend on hook order (e.g. `plugin-sitemap` runs after `plugin-search` Pagefind
indexing); auto-discovery returns plugins in filesystem order, which is not
guaranteed. The recipe documents this tradeoff.

**What's NOT being added**:
- **Option C (package.json keywords without explicit marker)** — would catch
  unrelated plugins in workspaces that mix Ever Works with other ecosystems.
  Marker keyword scopes the discovery.
- **Option D (runtime registry via import side effects)** — opaque; AI
  agents cannot tell from `plugins.config.ts` alone what's registered.

**Tracking**: `.specify/features/multi-option-support.md` § Phase 3;
deliverables are `packages/plugins/src/discover.ts`, the `keywords` marker
on all 10 built-in plugins, unit tests, and `docs/guides/multi-option/plugin-discovery.md`.

---

## Q5: Search Implementation

**Context**: Directory sites need search. What approach for static sites?

**Options**:
- **A) Pagefind** — Build-time search index, zero JS until interaction, static-first `[DEFAULT]`
- B) Fuse.js — Client-side fuzzy search, loads all data
- C) Lunr.js — Client-side inverted index
- D) Algolia/Meilisearch — External service (requires API key)

**Default choice**: **Pagefind** — Purpose-built for static sites. Generates search index at build time. Tiny JS payload. No external services needed. Perfect fit for R5 (Static Output) and R6 (Extreme Performance).

### Multi-option follow-up (iter 218)

**Status**: OPEN — phase queued (Phase 4 of multi-option-support).

**Answer**: Default stays Pagefind via `@ever-works/plugin-search` (already
shipping). The plugin architecture already supports swapping search backends —
users replace `searchPlugin()` in `plugins.config.ts` with any drop-in
plugin that exposes the same hook contract. The template will **scaffold one
reference alternate package and document two more**:

- **`@ever-works/plugin-search-fuse`** (new package, scaffold) — runtime
  fuzzy search via Fuse.js. Build-time index extraction; runtime queries
  in a Preact island. Suitable for ≤500-item directories (multi-MB index
  for larger sets).
- **Algolia** (documented only) — recipe showing how to write a custom
  plugin that uploads the index at build via the Algolia ingest API and
  queries via `algoliasearch` at runtime.
- **Meilisearch** (documented only) — same shape as Algolia; self-hosted
  backend.

**Configuration mechanism**: `plugins.config.ts` — replace `searchPlugin()` with
`searchFusePlugin()` (or your custom plugin). The accompanying `<SearchInput />`
island in `packages/ui/preact/` stays Pagefind-specific; alternate plugins
ship their own `<SearchFuse />` / `<SearchAlgolia />` island components.

**Tracking**: `.specify/features/multi-option-support.md` § Phase 4;
deliverables are `packages/plugin-search-fuse/` (full package + tests) plus
`docs/guides/multi-option/search-backends.md` with a tradeoff matrix
(index size, query latency, external service, cost).

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

### Multi-option follow-up (iter 218)

**Status**: OPEN — phase queued (Phase 5 of multi-option-support).

**Answer**: Default stays Astro's built-in `<Image>` from `astro:assets`
(already supported across components). The template will **document** how
to swap in a CDN-backed image service via Astro's documented
`image.service: { entrypoint: '...' }` config:

- **Cloudinary** — custom image service that builds CDN URLs at build time.
- **Imgix** — URL-transform-based service.
- **Bunny.net / DigitalOcean Spaces** — generic CDN with URL prefix.

**Configuration mechanism**: `astro.config.ts` — `image: { service:
{ entrypoint: './src/image-services/cloudinary.ts' } }`. Default behavior
is preserved when this option is not set.

**Tracking**: `.specify/features/multi-option-support.md` § Phase 5;
deliverable is `docs/guides/multi-option/image-services.md` with one
working `image-service.ts` snippet per CDN and a tradeoff matrix
(build-time cost, runtime cost, vendor lock-in).

---

## Q10: Docs Site Framework

**Context**: `apps/docs/` needs a documentation framework. The full template uses Docusaurus.

**Options**:
- A) Starlight (Astro) — Astro-native docs framework, consistent with main app
- **B) Docusaurus** — Same as full template, React-based, proven ecosystem `[IMPLEMENTED]`
- C) VitePress — Vue-based, fast
- D) Plain Astro — Build custom docs pages

**Implemented choice**: **Docusaurus** — Matches the full template's docs framework, providing consistency across the Ever Works ecosystem. Proven ecosystem with search, versioning, and blog support. Already implemented and working.

### Multi-option follow-up (iter 218)

**Status**: ✅ DELIVERED — Phase 6 complete (iter 219, 2026-04-30). Recipe
shipped at `docs/guides/multi-option/docs-framework.md`; end-to-end
scratch verification (npx create-astro@latest --template starlight + pnpm
install --ignore-workspace + npx astro check + npx astro build) ran green
on the cron host (Windows 10 + Node 24.14.x + pnpm 10.33.0; `@astrojs/starlight ^0.38.4`,
`astro 6.2.0`; 0 errors / 0 warnings / 0 hints from `astro check`; 4 pages
built in 6.96s with Pagefind search index).

**Answer**: Default stays Docusaurus 3.x in `apps/docs/` (already shipping).
The template will **document** the swap to Starlight (Astro-native) for
users who prefer a single-stack project:

- **Docusaurus** (default) — best for versioning, blog, mature plugin
  ecosystem, React-based.
- **Starlight** (alternate) — best for stack consistency with the rest of
  the Astro template, smaller bundle, native Astro integration. Tradeoff:
  versioning requires more manual setup.

**Configuration mechanism**: this is a docs-app-level swap, not a runtime
config. Users replace `apps/docs/` with a Starlight-scaffolded app; the
recipe documents the per-file content migration (Docusaurus
`_category_.json` → Starlight frontmatter `sidebar`).

**Tracking**: `.specify/features/multi-option-support.md` § Phase 6;
deliverable shipped at `docs/guides/multi-option/docs-framework.md` with
tradeoff matrix and verified-on output. Recipe documents the create-astro
scaffold (with a note on the `pnpm dlx` `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND`
fingerprint and `npx --yes create-astro@latest` fallback observed during
verification), workspace wire-up at `@ever-works/docs-starlight`, three
content-migration strategies (symlink / build-hook copy / move), sidebar
metadata conversion (`_category_.json` → frontmatter `sidebar.order` or
`autogenerate.directory`), Vercel deployment plumbing, and audit-script
hooks (the `pnpm audit:docs` runner ignores `apps/docs/` and
`apps/docs-starlight/` content; adopters add per-app `lint`/`typecheck`
Turbo tasks).

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

### Multi-option follow-up (iter 218)

**Status**: OPEN — phase queued (Phase 7 of multi-option-support).

**Answer**: Default stays `isomorphic-git` `GitAdapter` in
`packages/adapters/src/git.ts` (already shipping). The adapter pattern
already supports swapping; the template will **scaffold two reference
alternate adapters** alongside the default:

- **Shell-git adapter** (`packages/adapters/src/git-shell.ts`) — re-uses
  `execFileSync('git', [...])`. For users in CI environments where git
  is always available and `isomorphic-git`'s memory profile is too high.
- **GitHub-API adapter** (`packages/adapters/src/git-api.ts`) — fetches
  files via REST API (`octokit`). Useful when the data repo is small
  and avoiding any git operation simplifies serverless deployment.
  Subject to GitHub-API rate limits (5000/hr authenticated).

**Configuration mechanism**: import the alternate adapter in
`apps/<app>/src/lib/content.ts` instead of the default. The barrel export
of `@ever-works/adapters` exposes all three (`GitAdapter`, `GitShellAdapter`,
`GitApiAdapter`); users pick at app config time.

**Tracking**: `.specify/features/multi-option-support.md` § Phase 7;
deliverables are `git-shell.ts`, `git-api.ts`, their tests, and
`docs/guides/multi-option/git-adapters.md` with a tradeoff matrix
(binary dep, memory, speed, repo size limit, auth).

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

### Multi-option follow-up (iter 218)

**Status**: OPEN — phase queued (Phase 8 of multi-option-support).

**Answer per sub-question**:

- **Q-A1 (event tracking)**: default stays pageview-only (already shipping).
  The template will **add** an opt-in `trackEvent(name, props)` helper to
  `@ever-works/plugin-analytics`, gated by an `enableEventTracking: true`
  plugin option (default `false`). When enabled, the helper dispatches the
  provider-specific call (Plausible's `plausible('event')`, Umami's
  `umami.track()`, Fathom's `fathom.trackEvent()`, GA4's `gtag('event', ...)`,
  or the custom escape hatch). When not enabled, the export is a no-op.

- **Q-A2 (consent banner)**: default stays "no consent banner bundled with
  analytics" (already shipping). The template will **scaffold a separate
  `@ever-works/plugin-consent` package** as a reference implementation:
  a Preact-based cookie banner, persisted state in `localStorage`, and a
  documented contract that `plugin-analytics` reads (when both are
  installed) to gate provider initialization on consent. If
  `plugin-consent` is not installed, analytics initializes
  unconditionally — preserving the default.

- **Q-A3 (AnalyticsScript location)**: no change — stays in
  `@ever-works/ui/astro/AnalyticsScript.astro` (already shipping).

- **Q-A4 (provider list)**: no change — Plausible + Umami + Fathom + GA4 +
  custom escape hatch is sufficient. Adding more providers is a
  per-PR decision driven by user demand, not part of this multi-option
  cohort.

**Configuration mechanism**:

```ts
// plugins.config.ts — opt in to events
analyticsPlugin({
  provider: 'plausible',
  domain: 'example.com',
  enableEventTracking: true, // <-- new option, default false
});

// plugins.config.ts — opt in to consent gate
import { consentPlugin } from '@ever-works/plugin-consent';
import { analyticsPlugin } from '@ever-works/plugin-analytics';

definePlugins([
  consentPlugin(),     // must be ordered before analytics
  analyticsPlugin({ provider: 'plausible', domain: 'example.com' }),
]);
```

**Tracking**: `.specify/features/multi-option-support.md` § Phase 8;
deliverables are `packages/plugin-analytics/src/track-event.ts`, the new
`packages/plugin-consent/` package, and
`docs/guides/multi-option/analytics-enhancements.md`.

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
>
> **All three Q22 follow-ups now ✅ CLOSED** (as of iteration 121,
> 2026-04-27):
>
> 1. **#1 — preemptive `MobileMenu` CT migration** ✅ COMPLETE iteration
>    108 (15 cases ported; the same `EMPTY_MODES`-style allocation bug
>    surfaced separately for `LayoutSwitcher` and was fixed in iteration
>    109 / Q24).
> 2. **#2 — `pnpm test:ui:safe` removal** ~~SUPERSEDED~~ iteration 110:
>    plain `pnpm --filter @ever-works/ui test` runs all 11 Vitest files
>    (174 tests) in ~98 s without re-introducing the IPC hang; the
>    per-file runner is preserved as a defensive fallback per
>    AGENTS.md R15 ("Replace, don't remove").
> 3. **#3 — `playwright-coverage` integration** ✅ COMPLETE iteration
>    121 (phases 0/1/2/3/6a/6b/6c/6d across iterations 113-121). Final
>    merged per-package coverage: branches 98.72% (232/235), functions
>    100% (104/104), lines 99.60% (1239/1244), statements 99.15%
>    (352/355) across 19 files. Per-file gate green for FilterBar
>    100%, LayoutSwitcher 100%, MobileMenu 91.89% (Phase 6c CI hard-
>    fail enforced via `packages/ui/scripts/coverage-merge.ts` exit
>    code + `.github/workflows/ci.yml` `coverage-gate` job). See
>    `.specify/features/q22-playwright-coverage.md` for the full
>    spec → resolved trail and `docs/architecture/testing-runners.md`
>    Coverage handling section for the steady-state pipeline.


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

> **Status: ✅ RESOLVED — Option A (`monocart-coverage-reports@^2.12.0`).**
> Phase 0 smoke test passed on Windows + Node 24.14.0 + Chromium 147 +
> Playwright 1.59.1 in iteration 113; library wired into
> `playwright.ct.config.ts` in iteration 114 (Phase 1); merge command
> in iteration 116 (Phase 3); full-merge story closed by Q26 +
> `vitest-monocart-coverage` adoption in iteration 119. The reopen
> condition (Phase 0 smoke-test failure → Option B) never triggered.
> Q22 follow-up #3 ✅ RESOLVED in iteration 121.
>
> **Iteration 112 npm-registry verification** (Apr 27, 2026):
> - `monocart-coverage-reports@2.12.11` is the current `latest` dist-tag
>   (above the spec's `^2.11.0` floor — pinning carries through).
>   Maintainer: `cenfun`. Homepage: https://github.com/cenfun/monocart-coverage-reports.
> - The README explicitly lists `playwright-ct-react` as an
>   integration example (https://github.com/cenfun/playwright-ct-react)
>   alongside `playwright-ct-vue`. Confirms AC #2 / AC #3 prerequisite.
> - The README documents an "Automatic Merging" + "Manual Merging"
>   flow that explicitly cites the Vitest-unit + Playwright-E2E
>   merge story (`mcr.add(coverage)` API). Confirms AC #4
>   prerequisite.
> - `monocart-reporter@2.10.1` is the current `latest` dist-tag
>   (above the spec's `^2.x.x` floor). It is the Playwright reporter
>   shim referenced by Phase 1 step 2.
> - Reporter formats include `v8`, `v8-json`, `lcov`, `lcovonly`,
>   `json-summary`, `codecov`, `console-summary`, `html`, `html-spa`
>   — all Phase 3 outputs available out-of-the-box.
> - `sourceFilter` and `entryFilter` syntax confirmed (string-pattern
>   OR object-of-pattern-to-bool). Matches Phase 1 step 2.
>
> **Conclusion**: Option A's preconditions hold on the published
> 2.12.11. Phase 0's smoke test is now an *empirical* check on
> source-map fidelity for our specific Vite/Preact alias setup, not
> a "does the library exist" check. Default A remains; the smoke
> test still runs in a future iteration to verify behavior end-to-end.

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

### Phase 0 outcome (iteration 113, 2026-04-27)

Phase 0 of the execution plan ran end-to-end on Windows 10 + Node 24.14.0 + Chromium 147 + Playwright 1.59.1 + monocart-coverage-reports 2.12.11. Outcome: **PASS-API** (library works on the target toolchain; source-map gate against the Vite/Preact alias deferred to Phase 1's reporter integration where it surfaces naturally).

Detailed evidence captured in `docs/log.md` iteration 113 entry. Summary:

- 1 V8 coverage entry captured (target: ≥1 — pass).
- MCR `add()` + `generate()` both succeed without error (target: no exceptions — pass).
- Per-file branch / function / statement / line / byte stats all populated and reasonable for the synthetic 3-branch test code: branches 75% (3/4), statements 85.71%, lines 88.89%, functions 100%, bytes 95% (target: per-file `summary` populated — pass).
- Output report `files[]` carries `url`, `sourcePath`, `source`, `data`, `summary` — every field referenced by the plan's Phase 1 step 2 `entryFilter` / `sourceFilter` config and AC #3 prerequisite (target: schema match — pass).

The smoke-test acceptance condition #1 (V8 capture) and #3 (>0% branch coverage on at least one branch) are met. Condition #2 (source-map back to a `.tsx` file) was deliberately deferred — Phase 0 used a hand-written `app.js` to keep the gate scoped to the library API itself; the `.tsx` source-map question is a Vite/Preact-alias question that Phase 1's reporter integration is the natural place to test.

**Q25 status updated**: from `OPEN` with `[DEFAULT]` annotation on Option A to **CONFIRMED — Option A** (monocart-coverage-reports 2.x). Phase 1 may proceed.

The Q25 reopen condition (smoke-test failure → switch to Option B = `@bgotink/playwright-coverage`) does not trigger. Option B remains documented as a contingency if Phase 1's source-map verification fails.

### Phase 1 outcome (iteration 114, 2026-04-27)

Phase 1 of the execution plan ran end-to-end. Outcome: ✅ **DONE.** The `react`→`preact/compat` alias chain produces source-maps that resolve back to real `.tsx` files (not chunk hashes), closing the last open Q25 question. Q25 status now: ✅ **RESOLVED — Option A adopted, source-maps verified.**

Empirical evidence:

- `pnpm --filter @ever-works/ui test:ct` → 43/43 pass in 1m 16s, no flakes.
- `packages/ui/coverage/ct/raw-v8.json` written with **9 V8 entries** (≥3 required by plan); each `url` field is a workspace-relative source path under `packages/ui/src/`, including all three migrated components (`src/preact/FilterBar.tsx`, `src/preact/LayoutSwitcher.tsx`, `src/preact/MobileMenu.tsx`).
- MCR aggregate stats: branches 84.88% (73/86), functions 100% (40/40), lines 97.18% (482/496), statements 39.80% (39/98), bytes 60.73% (10,432 / 17,178). The lower statements/bytes figures are expected for the CT-only subgraph and will rise after Phase 3's merge with Vitest coverage.
- One implementation deviation worth recording: the V8 entries Chromium reports are bundled chunk URLs (`http://localhost:3100/assets/<name>-<hash>.js`), NOT source files. The plan's `entryFilter` regex (which expected `.tsx` URLs) was therefore too narrow on a literal reading. Implementation accepts every chunk under the `assets/` prefix and lets `sourceFilter` do the per-source narrowing post-source-map. This is consistent with the spec's AC #3 prerequisite ("every `url` resolves to a `.tsx` under `packages/ui/src/`") — but read as "every entry in the *post-merge* file list", not "every V8 entry the browser sees".

**Q25 closes here.** Option B (`@bgotink/playwright-coverage`) is no longer a contingency — Phase 2-5 build directly on the Phase 1 artifacts.

The Phase 1 outcome notes (including the fixture addition and the entryFilter rewrite) are documented at the plan: [`docs/plans/q22-playwright-coverage.md`](plans/q22-playwright-coverage.md) "Phase 1 / Outcome (iteration 114, 2026-04-27)".

---

## Q26: Vitest → monocart V8 raw stream for full V8+CT merge (Q22 follow-up #3 Phase 3 finding)

> **Status: ✅ RESOLVED — Option A adopted; full V8+Vitest merge live; Phase 6c CI hard-gate enforced; Q22 follow-up #3 closed** (iteration 121, 2026-04-27). `vitest-monocart-coverage@^4.0.0` is a real `@ever-works/ui` devDependency; `packages/ui/vitest.config.ts` runs `provider: 'custom'` + `customProviderModule: 'vitest-monocart-coverage'`; `packages/ui/mcr.config.ts` writes raw V8 to `./coverage/raw/`; `packages/ui/scripts/coverage-merge.ts` consumes both `./coverage/raw/` (Vitest, 40 files) and `./coverage/ct/raw/` (CT, 49 files) through MCR's V8 path; the merge script `process.exit(1)`s when any allow-listed file drops below 80% branches; `.github/workflows/ci.yml` `coverage-gate` job inherits the merge exit code and uploads the merged HTML report as a 14-day artifact. Final merged coverage (iteration 121): **branches 98.72% (232/235), functions 100% (104/104), lines 99.60% (1239/1244), statements 99.15% (352/355)** across 19 files. Per-file gate: FilterBar 100% ✅, LayoutSwitcher 100% ✅, MobileMenu 91.89% (34/37) ✅ — all above the 80%-branch threshold. The 3-branch shortfall is `MobileMenu.tsx`'s `if (focusable.length === 0) return;` early-return + 2 fall-through branches (deferred — see iteration 120 entry in `docs/log.md` for the CT-host-page focus-attribution edge case that blocks the `<MobileMenu items={[]} />` test).
>
> **Status: CONFIRMED — Option A; Phase 6a SMOKE PASSED** (iteration
> 117, 2026-04-27). Originally opened iteration 116 (2026-04-27) as a
> direct outcome of executing Phase 3 of the `playwright-coverage`
> integration plan (`docs/plans/q22-playwright-coverage.md`). Phase 3
> landed as a CT-only merge (`packages/ui/scripts/coverage-merge.ts`
> writes to `coverage/merged/`). The plan's original ambition (a single
> MCR instance combining Vitest Istanbul + CT raw V8) is blocked by a
> hard limitation in monocart-coverage-reports@2.12.11. Q26 chooses how
> to close the gap. **Iteration 117 NPM-registry validation +
> Phase 6a smoke test BOTH executed**: `vitest-monocart-coverage@4.0.2`
> is alive on npm, MIT-licensed, by the same maintainer (`cenfun`) as
> `monocart-coverage-reports`. The README's documented integration path
> matches Q26's plan exactly. Pin tightened to `^4.0.0` (the only major
> that tracks Vitest 4). The Phase 6a smoke test (scratch dir at
> `packages/ui/scratch/q26-vitest-monocart/`, deleted at end of phase)
> ran a 2-test/3-branch Vitest + provider end-to-end and produced raw
> V8 entries in `coverage/raw/<id>.json` with the **same shape** as
> Playwright CT's `coverage/ct/raw/<id>.json` — confirming the Phase
> 6b merge can use a trivial `inputDir: [vitestRaw, ctRaw]` setup.
> Per-file source-map worked (URL = `src/sample.ts` workspace-relative,
> NOT a chunk hash). Branches 75% (3/4 — exactly the deliberate
> uncovered branch), Functions 100%, Lines 94.44%. **Phase 6b is
> unblocked.** See "Iteration 117 update" block below for the full
> breakdown.

**Context**: monocart-coverage-reports' `getCoverageResults`
(`lib/generate.js`) inspects `dataList[0].type` to dispatch into either
the V8 path (`convertV8List` → `convertCoverages` → `getJsAstInfo` /
`getCssAstInfo`) or the Istanbul path (`mergeIstanbulCoverage` →
`saveIstanbulReports`). Both paths are mutually exclusive — when raw
V8 entries are loaded via `inputDir` AND Istanbul data is added via
`mcr.add(istanbul)`, the converter routes everything through the V8
path, hits Istanbul entries that lack `type: 'js'`, falls into
`getCssAstInfo`, and crashes on `ranges.sort()` (no ranges). The
empirical reproduction is documented in
`packages/ui/scripts/coverage-merge.ts` header comment.

**Options**:

- **A) `vitest-monocart-coverage`** — drop-in Vitest coverage provider
  that emits raw V8 entries (instead of Istanbul `coverage-final.json`)
  to a configured outputDir. The merge script then consumes both raw V8
  dirs (`coverage/raw/` from Vitest and `coverage/ct/raw/` from CT) via
  `inputDir: [...]`. Both flow through the same V8 path; no mixing.
  `[DEFAULT]`
- B) **Custom Istanbul→V8 converter** — pre-process Vitest's
  `coverage-final.json` into raw V8 shape, then add via `mcr.add()`. A
  small adapter (~50-100 LOC) that handles the structural translation
  for Istanbul's `statementMap` / `branchMap` / `fnMap` to V8's
  `functions[]` with byte ranges. High risk: has to handle every
  Istanbul shape variant; maintenance burden.
- C) **Two-stage report (status quo)** — accept that the merged
  report is CT-scoped only. Document that the per-runner Vitest report
  (`coverage/coverage-summary.json` at 100% for Vitest-executed files)
  is the source of truth for non-CT files. Don't try to combine.
- D) **Switch the entire `@ever-works/ui` coverage stack to monocart**
  (replace Vitest's V8 provider with `vitest-monocart-coverage`,
  retire `@vitest/coverage-v8`). Same as A but more aggressive.
- E) **Defer indefinitely** — the per-runner reports are sufficient
  for AC #5; merge is a "nice to have" for a single rolled-up number.

**Default choice**: **A — `vitest-monocart-coverage`**. Rationale:

1. Single dep change at the Vitest layer; no source-format conversion
   logic in our codebase.
2. Documented integration path in the monocart README's "Vitest" entry
   under "Integration Examples".
3. Keeps the merge script simple (`inputDir: [vitest, ct]` with no
   `mcr.add(istanbul)` call).
4. Vitest's V8 provider already collects V8 internally; this just
   exposes the raw format instead of the Istanbul rollup.
5. Aligns with the existing CT-side architecture (monocart
   end-to-end), reducing toolchain divergence.

**Risks**:

- R1 (Low): `vitest-monocart-coverage` may not be at parity with
  `@vitest/coverage-v8`'s V8 provider on every coverage detail (e.g.,
  source-map handling for `.tsx` under Vite + Preact alias). Mitigation:
  smoke-test in a scratch dir before adopting in `vitest.config.ts`,
  exactly like Q25 Phase 0 did for monocart-reporter. Hold the existing
  Vitest provider in place until parity is verified.
- R2 (Low): adding a second dep increases install time and lockfile
  churn. Acceptable given the value (single rolled-up number).
- R3 (Medium): `vitest-monocart-coverage` lock-step with monocart
  versions may force coupled upgrades. Mitigation: pin to a verified
  major and bump deliberately.

**Out of scope for Q26**: writing additional MobileMenu CT tests to
close the 67.57% branch gap. That's a separate spec (the current Phase
3 merge surfaced the gap as an informational signal — Phase 4 CI
enforcement is what makes it a hard gate). Tracked under the same
Q22 follow-up #3 thread but as a separate sub-iteration.

**Next steps if Option A holds**:

1. Smoke-test `vitest-monocart-coverage` in a scratch dir against the
   existing `vitest.config.ts` (Vite + Preact alias chain). Verify
   raw V8 entries land at `coverage/raw/` and resolve back to `.tsx`
   sources via source-maps. ~30 min.
2. If smoke passes, update `packages/ui/vitest.config.ts` to use
   `vitest-monocart-coverage` provider (replaces `@vitest/coverage-v8`).
3. Update `packages/ui/scripts/coverage-merge.ts` to drop the Q26
   limitation comment block and simplify to a pure
   `inputDir: ['./coverage/raw', './coverage/ct/raw']` setup. Remove
   the Istanbul-loading branch.
4. Re-run `pnpm coverage` and verify the merged report includes ALL
   `packages/ui/src/` files (not just the CT subgraph) at the expected
   coverage levels.
5. Phase 3's per-file ≥80% branch gate naturally re-applies, this time
   over the full include set.

If Option A fails (Phase 0-style smoke), open the Q26 reopen condition
and pick Option B (custom converter) as the contingency.

### Iteration 117 update (2026-04-27) — npm-registry validation

**Same playbook as iteration 112 for Q25**: before any `pnpm add` lands,
verify the chosen package is alive on the registry, the API matches the
plan, and there are no blocking dep conflicts.

- **Package**: `vitest-monocart-coverage`
  ([npm](https://www.npmjs.com/package/vitest-monocart-coverage),
  [github](https://github.com/cenfun/vitest-monocart-coverage))
- **`latest` dist-tag (2026-04-27)**: `4.0.2`
  (npm `_npmVersion` 11.5.2, gitHead `fe4860a`, Node 24.14.1 publish env)
- **License**: MIT
- **Maintainer**: `cenfun` (`cenfun@qq.com`) — **same maintainer** as
  `monocart-coverage-reports` and `monocart-reporter`. Three packages
  evolve in lock-step under one author, mitigating R3 (lock-step
  upgrades) since the maintainer must keep them mutually compatible.
- **Stated runtime deps** (from registry meta):
  - `@vitest/coverage-istanbul: ^4.1.2`
  - `@vitest/coverage-v8: ^4.1.2`
  - `istanbul-lib-instrument: ^6.0.3`
  - `monocart-coverage-reports: ^2.12.9`
  - `test-exclude: ^8.0.0`
- **Compatibility with our toolchain**:
  - We have `vitest@^4.1.5` in `packages/ui/package.json` ✅ (>=4.1.2 ok).
  - We have `monocart-coverage-reports@^2.12.0` ✅ (the dep floor of
    `^2.12.9` is **higher** than our current pin — adopting Q26 will
    bump our `monocart-coverage-reports` floor from `^2.12.0` to
    `^2.12.9`. Acceptable: that's a minor-version bump within the
    same `2.x` line we already use, and the iteration-112 verified
    `2.12.11` `latest` already satisfies `^2.12.9`).
  - We do NOT currently have `@vitest/coverage-v8` or
    `@vitest/coverage-istanbul` listed explicitly — Vitest 4 ships
    them as auto-resolved peer-deps when `provider: 'v8'` /
    `'istanbul'` is set. Adoption of Q26 swaps `provider: 'v8'` for
    `provider: 'custom'` + `customProviderModule: 'vitest-monocart-coverage'`,
    at which point `vitest-monocart-coverage` itself pulls
    `@vitest/coverage-v8: ^4.1.2` transitively, so the runtime
    behavior is preserved (it wraps the V8 provider rather than
    replacing it). No explicit `@vitest/coverage-v8` entry needed
    in our `package.json` — it lands via the Q26 dep tree.
- **README integration confirmed (line-by-line check against plan)**:
  ```ts
  // vitest.config.ts (per README)
  test: {
    coverage: {
      enabled: true,
      include: ['src/**'],
      provider: 'custom',
      customProviderModule: 'vitest-monocart-coverage'
    }
  }
  ```
  Plus an `mcr.config.ts` (or `.js`/`.cjs`/`.mjs`/`.json`) sibling file
  for the monocart-side options (reports, outputDir, sourceFilter,
  entryFilter, onEnd, etc.). The README explicitly documents
  `reports: ['v8']` and points to the parent
  [`monocart-coverage-reports`](https://github.com/cenfun/monocart-coverage-reports)
  doc for the full reporter list — **`'raw'` is supported there**
  (already in use in `packages/ui/playwright.ct.config.ts` since
  iteration 116). So the integration shape is exactly:
  ```ts
  // packages/ui/mcr.config.ts (Phase 6 step 2 will add this)
  export default {
    name: 'Ever Works UI — Vitest Coverage',
    reports: [['raw', { outputDir: './coverage/raw' }]],
    sourceFilter: (sourcePath) =>
      sourcePath.includes('packages/ui/src/') ||
      sourcePath.startsWith('src/'),
    cleanCache: true,
  };
  ```
  This satisfies the Q26 next-steps step 2 ("update `vitest.config.ts`
  to use `vitest-monocart-coverage` provider") and step 3 ("simplify
  the merge script to `inputDir: ['./coverage/raw', './coverage/ct/raw']`").
- **R6 (Vitest source-map fidelity for `.tsx` under Vite + Preact
  alias)**: this is the equivalent of the iteration-113 Phase 0
  smoke-test for the Vitest layer. Cannot be answered from registry
  metadata alone; gated on a fresh smoke test (Phase 6 step 1).
- **R3 (lock-step versions)**: the same-maintainer property reduces
  the cost of coupled upgrades. Concrete plan: pin
  `vitest-monocart-coverage@^4.0.0` (verified iteration 117) so we
  ride the same major as Vitest 4. When Vitest 5 lands, expect a
  coordinated `vitest-monocart-coverage@5.x.x` release; bump both
  together.
- **Lockfile churn estimate (R2)**: 5 new top-level entries
  (`vitest-monocart-coverage`, `@vitest/coverage-v8` —
  already present transitively, `@vitest/coverage-istanbul`,
  `istanbul-lib-instrument`, `test-exclude`). Modest;
  comparable to the iteration-114 monocart-reporter add.

**Q26 status update**: from `OPEN [DEFAULT Option A]` to **CONFIRMED —
Option A** (`vitest-monocart-coverage@^4.0.0`). Default holds; npm
existence + integration shape + dep compat all verified. Phase 6
(Vitest provider migration) may proceed to its smoke-test gate.

**Pin update**: from `vitest-monocart-coverage` (no version stated) to
**`^4.0.0`** in the plan and spec. The 4.x line is the only line that
supports Vitest 4 (the older `1.x`/`2.x`/`3.x` lines tracked Vitest
1/2/3 respectively).

---

## Q27: `MobileMenu` 3-branch outlier coverage closure (iteration 123)

> **Status: ✅ RESOLVED in iteration 124 (2026-04-27) — Option A.1
> + Option A.3 combined.** Three new CT tests landed in
> `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx` using synthetic
> `KeyboardEvent('keydown', { key: 'Tab' })` dispatch via
> `page.evaluate` (Option A.1):
>
> 1. **B1 — empty panel Tab** — covers `if (focusable.length === 0)
>    return;` on line 79. Used `toBeAttached()` instead of
>    `toBeVisible()` to bypass the iter-120 CT-host-page race where
>    `<MobileMenu items={[]} />` ends up CSS-hidden but DOM-attached
>    (the listener is still registered).
> 2. **B2 — synthetic Tab on last nav link** — covers `else if
>    (!e.shiftKey && document.activeElement === last)` ENTRY on
>    line 85. The iter-120 natural-keyboard variant did NOT cover
>    this branch under V8 measurement because `page.keyboard.press`
>    moves focus before the document handler evaluates the condition;
>    synthetic dispatch keeps focus stable.
> 3. **B3 — Tab on middle nav link (non-boundary)** — covers the
>    FALSE arm of both short-circuits. Middle link → neither boundary
>    check is true → no `preventDefault`.
>
> One additional defensive race-guard branch surfaced during execution:
> `if (!menuEl) return;` on line 72 (only triggers when `menuRef.current`
> is null AT the moment `isOpen` flips true — a Preact ref-attachment
> race that does not happen in production). Closed via Option A.3:
> added `/* v8 ignore next */` pragma above the line. Verified the
> pragma syntax works with monocart-coverage-reports@^2.12.9 — the
> branch drops out of the V8 denominator (35 → 35 covered / 35 total
> for MobileMenu, was 36/37).
>
> **Final per-package merged coverage on `@ever-works/ui`**:
> branches **100% (233/233)**, functions 100% (104/104), lines 99.76%
> (1240/1243), statements 99.72% (352/353), aggregate across 19 files.
> Per-file gate: FilterBar 100% ✅, LayoutSwitcher 100% ✅,
> **MobileMenu 100% (35/35)** ✅. Mobile-menu.ct case count: 17 → 20.
> CI hard-gate (Phase 6c, `coverage-merge.ts process.exit(1)`) remains
> green.
>
> Spec at `.specify/features/q27-mobilemenu-empty-items-coverage.md`;
> plan at `docs/plans/q27-mobilemenu-empty-items-coverage.md`. The
> plan's Step 0 smoke-test was integrated into the final iteration
> (smoke-test → real test → coverage verify all in one pass) rather
> than gated as a separate iteration since the smoke result was a
> faster signal than the full `pnpm coverage` cycle.

**Context**: After iteration 122 closed the Q22→Q26 saga, the
"MobileMenu 3-branch outlier" was carried as a future opportunity in
iteration 122's "Next Steps" section of `docs/log.md`. The 3 branches
all live in the focus-trap `useEffect` of
`packages/ui/src/preact/MobileMenu.tsx` (lines 69-95):

- **B1** — `if (focusable.length === 0) return;` (line 79) early-return
  TRUE branch. Iteration 120 attempted to reach this via
  `<MobileMenu items={[]} />` + `page.keyboard.press('Tab')` but the
  CT host page reproduced a focus-attribution edge case where the
  panel becomes `hidden` post-mount.
- **B2** — `if (e.shiftKey && document.activeElement === first)`
  short-circuit FALSE on the `e.shiftKey` term. Fires when forward
  Tab is pressed from anywhere not the last nav link.
- **B3** — `else if (!e.shiftKey && document.activeElement === last)`
  short-circuit FALSE on the `document.activeElement === last`
  term. Fires when forward Tab is pressed from a non-boundary link.

(Branch IDs are illustrative — V8 instrumentation reports
short-circuit operands as separate branches; exact V8 byte ranges
are visible in `coverage/merged/coverage-report.json`.)

**Options for B1 (the empty-items branch)**:

- **A.1) Synthetic Tab dispatch via `page.evaluate`** — mount
  `<MobileMenu items={[]} />`, click toggle, then dispatch a
  `KeyboardEvent('keydown', { key: 'Tab' })` directly via
  `document.dispatchEvent(...)`. Asserts `event.defaultPrevented ===
  false`. Bypasses the host-page focus-attribution race. Zero source
  changes. `[DEFAULT]`
- **A.2) Lift `isOpen` into a controlled prop** — adds API surface to
  bypass the click step entirely. Behavior-changing public API; out
  of scope for a coverage fix. **Rejected.**
- **A.3) `/* v8 ignore next */` directive on line 79** — verify the
  exact pragma syntax against `monocart-coverage-reports@^2.12.9`
  before landing. Removes the branch from the denominator entirely;
  trades coverage for simplicity. **Contingency only** if A.1's
  smoke test fails.

**Options for B2 + B3 (non-boundary Tab)**:

- **AC #2** — single CT test that focuses the MIDDLE nav link
  (Categories — index 1 of 3 in the existing fixture), dispatches a
  synthetic Tab keydown, asserts `event.defaultPrevented === false`
  and the panel stays open. No alternative — these are genuine
  fall-through branches that need a real Tab from a non-boundary
  position to exercise.

**Default choice**: **A.1 + AC #2**. Zero source changes (assuming
A.1 holds its smoke test); two new CT tests appended to the
existing focus-trap section of `mobile-menu.ct.test.tsx`. Total
estimated effort: 1.5-2 hours across 1-2 future iterations.

**Why this is OPEN, not deferred**: the iteration 120 inline-deferral
comment in `mobile-menu.ct.test.tsx` (lines 254-264) is a permanent
"TODO" marker that this question retires. Closing Q27 also lifts
the per-file MobileMenu number to ~100%, making the merged
coverage report semantically accurate (no asterisks for "except
for the 3 defensive branches we couldn't reach").

**Status**: ✅ RESOLVED in iteration 124 — Option A.1 (synthetic Tab
dispatch via `page.evaluate`) closed B1/B2/B3 via three new CT tests;
Option A.3 (`/* v8 ignore next */` pragma — the syntax verified
working with `monocart-coverage-reports@^2.12.9`) closed an
additional defensive `menuRef` race-guard branch (line 72 of
`MobileMenu.tsx`) that surfaced during execution and was not in the
original 3-branch list. Final per-file MobileMenu: **100% branches
(35/35)**. Final per-package aggregate: **100% (233/233)**.
Mobile-menu.ct case count: 17 → 20. Spec at
`.specify/features/q27-mobilemenu-empty-items-coverage.md`; plan at
`docs/plans/q27-mobilemenu-empty-items-coverage.md`; execution log at
`docs/log.md` iteration 124. (Status flip belatedly landed iteration
129 — iter-125 health-check pass missed this surface.)

---

## Q28: ESLint 9 → 10 major-version upgrade (iteration 129; ✅ RESOLVED iteration 130)

> **Status: ✅ RESOLVED in iteration 130 — Option A executed in a single
> autonomous tick.** `packages/eslint-config/package.json`
> `peerDependencies.eslint` flipped `^9.0.0` → `^10.0.0`; `pnpm install`
> resolved `eslint@9.39.4 → eslint@10.2.1` plus a coordinated transitive
> bump (`@eslint/core@0.17.0 → 1.2.1`, `@eslint/config-array@0.21.2 →
> 0.23.5`, `@eslint/config-helpers@0.4.2 → 0.5.5`,
> `@eslint/object-schema@2.1.7 → 3.0.5`, `@eslint/plugin-kit@0.4.1 →
> 0.7.1`, `eslint-scope@8.4.0 → 9.1.2`, `espree@10.4.0 → 11.2.0`,
> `eslint-visitor-keys@4.2.1 → 5.0.1`); legacy
> `@eslint/eslintrc@3.3.5` and the standalone `@eslint/js@9.39.4` /
> `eslint-visitor-keys@4.2.1` top-level entries dropped (ESLint 10
> consolidates these into core or doesn't ship them anymore). Net
> lockfile churn: **+14 / -19 packages, -38 lines** (consolidation).
> `pnpm lint` 18/18 successful in 50.7s on the post-bump lockfile (1
> cached + 17 fresh; cache busted by lockfile change as expected); the
> only output is **4 pre-existing `no-console` warnings** (2 in
> `packages/core/src/logger.ts:40,53` and 2 in
> `packages/plugins/src/logger.ts:22,35`), all already present at the
> iter-128 baseline (the rule allows only `console.warn/error`; both
> logger modules intentionally use other levels). **Zero new ESLint 10
> violations.** `pnpm typecheck` 23/23 in 2m12.8s (full fresh) and
> `pnpm test` 16/16 packages / **1122/1122 Vitest tests** pass in
> 2m52.5s (full fresh). `pnpm test:ct` (48 cases) and `pnpm coverage`
> (merged 100% aggregate) intentionally skipped per plan Step 4 —
> ESLint is static analysis only, cannot affect runtime; CT exercises
> the same workspace dep graph that Vitest already proves green; the
> defense-in-depth was not needed. `engines.node` bump (optional per
> AC #6) skipped to keep churn minimal — `>=22.12.0` already covers
> ESLint 10's `>=22.13.0` floor via semver caret resolution. The
> "manual changelog review required" deferral marker carried in iters
> 123/125/126/127/128 is now retired; future audits will not surface
> this item.

**Context**: Iterations 123/125/126/127/128 all flagged ESLint 9 → 10
as the single out-of-scope drift item in the otherwise-current dep
matrix. Pin `eslint: ^9.0.0` in `packages/eslint-config/package.json`
peerDependencies (and corresponding workspace consumers via
`@ever-works/eslint-config` re-export) vs. npm `latest` `10.2.1`. Each
audit deferred as "major-version bump requires manual review of the
changelog (config-format breaks, plugin compat, etc.) — not a fit for
the cron cadence." This question pre-investigates the changelog so
the upgrade lands as a tracked, scoped iteration.

**Pre-investigation findings (iteration 129)**:

1. **Flat config**: ✅ already in place. `packages/eslint-config/index.mjs`
   exports a `Linter.Config[]` array with two entries (TS file rules +
   ignores). Every workspace consumer imports it and re-exports it
   verbatim (`apps/web/eslint.config.js`, `packages/ui/eslint.config.js`,
   etc. — 17 `eslint.config.js` files in total, each a 3-line shim).
   Flat config is the **only** supported format in ESLint 10 (eslintrc
   was removed in ESLint 9 and stays gone). No format change required.
2. **Node.js floor**: ✅ already met. ESLint 10 requires Node v20.19.0+ /
   v22.13.0+ / v24+. Local toolchain runs Node v24.14.0; CI's
   `actions/setup-node@v4` step uses Node 24. The repo's `package.json`
   `engines.node` field is `>=22.12.0` — that pin covers v22.13.0+
   forwards via semver. (Optional follow-up: bump engines.node to
   `>=22.13.0` to match the ESLint 10 floor verbatim. Not strictly
   required since v22.12.0 + v22.13.0 differ by a single patch and the
   project never shipped on v22.12.0 — but harmless and explicit.)
3. **`@typescript-eslint` peer-range**: ✅ already covered. Pinned
   `^8.59.0` in `packages/eslint-config/package.json`; the
   typescript-eslint v8 line declares
   `eslint: ^8.57.0 || ^9.0.0 || ^10.0.0` in its peerDependencies —
   so the existing pin transparently supports ESLint 10 with no
   version bump.
4. **Removed APIs**: zero usages in our source. The deprecated
   `context.getCwd()` / `context.getFilename()` /
   `context.getPhysicalFilename()` / `context.getSourceCode()` methods
   removed in ESLint 10 are eslint-plugin internals — not user code.
   Our codebase contains no custom ESLint plugins; the only plugin we
   consume is `@typescript-eslint/eslint-plugin`, which uses the
   property forms (`context.cwd`, `context.filename`, etc.) on its
   v8 line. Verified by grep across `packages/` + `apps/` source
   trees (no matches).
5. **`eslint-env` comments**: zero usages in our source (`grep -rn
   "eslint-env" packages apps` returns zero matches in source dirs).
   ESLint 10 turns `eslint-env` comments from "ignored" into "errors";
   our project never relied on them.
6. **`globalThis` shadowing**: zero usages in our source. ESLint 10's
   `no-shadow-restricted-names` rule now reports `globalThis` by
   default; if we were shadowing it (we aren't), the rule would flag it.
7. **`eslint:recommended` opt-in changes**: not applicable. Our config
   does NOT extend `eslint:recommended` — it specifies an explicit
   rule set (`@typescript-eslint/no-explicit-any`,
   `@typescript-eslint/no-unused-vars`, `prefer-const`, `no-var`,
   `eqeqeq`, `no-console`). The three rules newly added to
   `eslint:recommended` in ESLint 10 (`no-unassigned-vars`,
   `no-useless-assignment`, `preserve-caught-error`) do not affect us
   unless we opt them in explicitly.
8. **Other rule changes** (`radix` no-string-options, `func-names`
   schema, `no-invalid-regexp` `allowConstructorFlags` duplicates,
   `RuleTester` valid-case schema): zero usages in our config. Our
   rule list is small (6 rules total) and none of these are in it.
9. **Other API changes** (`Program` AST node range, `nodeType`
   removed, fixer methods string-only, `stylish` formatter
   `styleText`): all internal-API; no impact on user code.

**Net assessment**: the upgrade surface is **a single one-line pin
bump** (`eslint: ^9.0.0` → `eslint: ^10.0.0`) in
`packages/eslint-config/package.json` peerDependencies, plus a
`pnpm install` + `pnpm lint` verification round. Optionally bump
`package.json` `engines.node` from `>=22.12.0` → `>=22.13.0` to match
ESLint 10's floor verbatim. The dread baked into iters 123-128's "ESLint
10 major bump is a manual-review item, not autonomous" deferral was a
reasonable precaution before the changelog was investigated; in
practice the migration is bounded.

**Options**:

- **A) Single-iteration in-place bump** — change one line in
  `packages/eslint-config/package.json` (`peerDependencies.eslint`
  `^9.0.0` → `^10.0.0`), run `pnpm install` (lockfile picks up
  ESLint 10.x), run `pnpm lint` end-to-end across the 18-package
  matrix. Optionally bump `engines.node` to `>=22.13.0` in the same
  iteration. Total estimated effort: 30-45 min. `[DEFAULT]`
- **B) Two-iteration phased bump** — iter N adds ESLint 10 to the
  peer-range as `^9.0.0 || ^10.0.0` (allowing both 9 and 10 to
  resolve), iter N+1 narrows to `^10.0.0` after a soak period. More
  conservative; useful only if the project had downstream consumers
  pinned at ESLint 9. Our project does not — the eslint-config is a
  workspace package consumed only by sibling packages. **Rejected**
  as over-engineering.
- **C) Defer indefinitely** — keep the `^9.0.0` pin until ESLint
  10's first patch release (10.0.x → 10.1.x) ships, on the theory
  that x.0.0 majors carry hidden papercuts. Conservative; costs
  nothing immediately but accumulates drift. **Rejected** because
  ESLint 10.0.0 already shipped through several patch/minor
  releases (visible at `latest` 10.2.1 in iter 123's audit), so
  the soak period is implicitly behind us.
- **D) Switch to a different linter entirely** — e.g. Biome
  (`biome lint`). Out of scope for a routine-maintenance audit;
  would need its own Q with a much larger spec surface. **Rejected**.

**Default choice**: **A — single-iteration in-place bump**. Pre-
investigation rules out every named breaking change. The upgrade is
a peer-range pin bump + lockfile refresh + lint smoke test; if
`pnpm lint` reports zero new violations across the 18-package
matrix, the upgrade is done.

**Risks**:

- **R1 (Low)** — a brand-new ESLint 10.x rule (or a hidden behavior
  change in an existing rule that the changelog under-documents) flags
  a real issue in our source. Mitigation: `pnpm lint` runs end-to-end
  pre-commit; any new violation surfaces immediately and is fixed
  inline (or flagged with a follow-up Q if it's load-bearing).
- **R2 (Low)** — a transitive dep of ESLint 10 (e.g. `@eslint/js`,
  `@eslint/eslintrc`, `eslint-scope`) ships with a peer-range that
  excludes our existing toolchain version. Mitigation: `pnpm install`
  surfaces peer-range mismatches as warnings; a hard break would fail
  the install. Iter-128 already verified `pnpm install` works on the
  current lockfile.
- **R3 (Medium)** — ESLint 10's stricter glob-pattern handling
  (POSIX character classes via the new minimatch) reinterprets one of
  our `ignores` patterns. Our patterns are all simple
  (`**/dist/**`, `**/node_modules/**`, `**/.astro/**`,
  `**/.turbo/**`); none use character classes. Mitigation: same as
  R1 — `pnpm lint` smoke catches any reinterpretation.

**Out of scope for Q28**:

- Custom rule authorship in `@ever-works/eslint-config` (the rule set
  is intentionally minimal — 6 rules + ignores).
- Migrating to Biome (Option D).
- Adding `eslint:recommended` to the rule set.
- Adopting `@stylistic/eslint-plugin` (the formatting rules removed
  from ESLint core in v8 / v9).

**Why this is OPEN, not deferred**: every iteration since 123 has
flagged ESLint 9→10 as the single out-of-scope drift item. The
deferral is now a stale "we haven't looked yet" marker — iteration 129
looks. After Q28 lands, the deferral disappears.

**Status**: ✅ RESOLVED in iteration 130 — Option A executed (single-
iteration in-place peer-range bump). Spec at
`.specify/features/q28-eslint-10-upgrade.md` (front-matter status
flipped iter 130); plan at `docs/plans/q28-eslint-10-upgrade.md`
(Outcome subsection appended iter 130). Final lockfile state:
`eslint@10.2.1`, `@eslint/core@1.2.1`, `eslint-scope@9.1.2`,
`espree@11.2.0`. Zero new ESLint 10 lint violations across the
18-package matrix. Total walltime including doc updates: ~7 min
(install ~92s + typecheck ~133s + test ~173s + lint ~51s + ~5 min
doc edits) — well under the 30-45 min plan estimate because the
test-suite-fresh costs amortized across one verification pass.

---

## Q29: Cron-cadence saturation — should the hourly schedule wind down or pivot? (iteration 162)

**Context**: At iteration 162 (2026-04-28), every primary deliverable
called out in the original scheduled-task brief is implemented and
green:

- ✅ Astro 6 static template (`apps/web`) with item / category / tag /
  comparison / collection / paginated-listing / 404 / robots / RSS /
  Atom / sitemap pages.
- ✅ 18-package monorepo: `core`, `ui`, `plugins`, `adapters`,
  `astro-integration`, `sync`, `eslint-config`, `tsconfig`, plus 10
  feature plugins (`plugin-search`, `plugin-filters`,
  `plugin-pagination`, `plugin-seo`, `plugin-sitemap`, `plugin-sort`,
  `plugin-breadcrumbs`, `plugin-rss`, `plugin-analytics`,
  `plugin-related-items`).
- ✅ 5 sample apps end-to-end: `sample-basic` (UI components dir,
  12 items), `sample-jobs` (8 jobs), `sample-events`,
  `sample-real-estate`, `sample-git` (3200+ items via isomorphic-git
  adapter).
- ✅ Full doc surface: `AGENTS.md` (15 R-rules), `CLAUDE.md`
  (17 Critical Rules), `SKILLS.md`, 34 `.specify/` feature specs,
  9 `docs/guides/`, 20 `docs/plans/`, full `docs/architecture/`
  topology, `docs/log.md` (162 iterations), `docs/questions.md`
  (28 questions Q1-Q28 closed, Q29 this one).
- ✅ All 28 prior questions ✅ RESOLVED.
- ✅ Test surface: 23/23 turborepo typecheck, 18/18 lint, 16/16
  unit-test packages with 1122/1122 Vitest cases, 48/48 Playwright CT
  cases, 27 Playwright E2E cases, V8+CT coverage merge at 100%
  branches on `@ever-works/ui`.
- ✅ CI: GitHub Actions PR-blocking on lint + typecheck + test +
  `pnpm audit:docs`; Vercel deploy workflow on `main`.

The last ~30 iterations (132 → 161) have not added any new code-path
or user-facing feature — they have all been **doc-quality drift fixes
and audit-class codifications** (status-flip drifts, dependency caret
deltas inside the existing 27-package audit matrix, value-count
re-baselines, and meta-audits codifying the audit-script that codifies
the checklist that audits the previous audits). The codify-then-execute
meta-pattern that delivered real value through iter ~132 has saturated:
each new "drift instance" surfaced now is itself a side-effect of the
audit-script becoming larger, not a real signal about the codebase.

**Question**: at hourly cadence, what should the next 30+ iterations
focus on?

**Options**:

- **A) Wind down the hourly cron to weekly (or pause until a real
  triggering event)** `[DEFAULT]` — the project is at a natural
  steady-state. A weekly cadence is enough to catch genuine drift
  (npm outdated bumps, security advisories, upstream Astro/Vite/Vitest
  releases) without manufacturing meta-meta-audits to fill the hour.
  When a real new feature requirement arrives (vertical-specific
  template, new plugin, new sample), the cron can be re-cranked back
  to hourly for that feature's spec → plan → implement cadence.
  Concretely: the user changes the schedule outside this repo; this Q
  documents that the hourly cadence has out-paced incoming work.
- **B) Pivot focus to feature additions** — the original brief
  mentions "future vertical-specific templates (real estate, SaaS,
  etc.)". Real-estate already exists as `sample-real-estate`, but a
  full SaaS vertical, a podcast-directory vertical, a books-directory
  vertical, or a "starter" component theme could be drafted as new
  spec → plan → implement cohorts. This would require user direction
  on which verticals to build (and stops the audit-loop because real
  feature work pre-empts meta-audits).
- **C) Continue the current audit-loop pattern** — keep adding new
  audit classes (9th, 10th, 11th…) and codifying every drift instance.
  Each iteration produces a small, auditable commit and keeps the
  green-bar dashboard green, but produces no user-facing value. This
  is the de-facto trajectory of iters 132-161. **Not recommended**
  because the audit machinery is now larger than the production code
  it audits, and most "drift" surfaced is internal to that machinery.
- **D) Trim and archive accumulated maintenance overhead** — move
  iterations 1-100 from `docs/log.md` (currently ~840 KB / ~10 982
  lines) to `docs/log-archive/2026-04-iter-1-100.md`, prune Q1-Q28's
  resolved-only sections in `docs/questions.md` to one-line
  ✅ RESOLVED bookmarks (with full text retained in
  `docs/questions-archive/`), and consolidate the `.specify/features/`
  audit-* triplet into a single `audit-docs.md` spec. Real "improve,
  don't remove" work that lowers active-doc surface area without
  losing history. Pre-condition: update the audit-script whitelists
  for `docs/log.md` and `docs/questions.md` to also accept the
  archive paths.

**Default choice**: **A — wind down to weekly cron**. The brief said
"Proceed as far as you can go" and the agent has reached the as-far-
as-it-can-go boundary on the *original* brief. New scope is a user
decision, not an audit-script decision.

**Why this is OPEN, not deferred**: the audit-loop has measurable
overhead (each iteration commits ~100-200 lines of meta-prose and
churns `package.json`/`pnpm-lock.yaml`) but the codebase is not
actually changing. Flagging this explicitly so the user can decide
between A, B, C, D rather than letting the agent invent a 9th, 10th,
… audit class autonomously.

**Status**: OPEN — partially answered iter 218 (see annotation below).

### Iter-217 user-pivot annotation

The user instructed the agent in iter 218 (2026-04-30) to:

> "go over [questions.md] and make sure that for all questions where there
> is a benefit to implement few options instead of one, we implement few
> with some configuration for option that user will select (optional) and
> some reasonable / best default … create more tasks to work on that …
> triage … 'Active Questions' [vs] 'Other Questions'."

This is effectively **Option B-prime** of Q29's options A/B/C/D —
"Pivot focus to feature additions" with concrete user direction:
the next ~8 iterations of feature work go to the **multi-option-support
cohort** (umbrella spec `.specify/features/multi-option-support.md`,
plan `docs/plans/multi-option-support.md`). This pre-empts Option A
(wind down to weekly) and Option C (continue audit-loop) — the
agent will not invent new audit classes nor wind down further; it
will execute the multi-option phases on the next runs.

**What remains OPEN under Q29 after this pivot**: the *vertical-specific
samples* sub-question. The original brief mentions "future
vertical-specific templates (real estate, SaaS, etc.)" — the existing
5 samples (basic / jobs / events / real-estate / git) cover real-estate;
SaaS, podcasts, books, and other verticals were never explicitly
scoped. The agent's default until told otherwise is **do not add new
verticals**. Owner direction would unlock another ~5-10 iterations of
sample-app scaffolding work; without it, the agent stays inside the
8-phase multi-option cohort and then re-evaluates.

**Q29 status update**: from `OPEN — awaiting user decision` to
**OPEN (partial answer)** — Option B-prime in effect for the
multi-option cohort; vertical-samples sub-question still needs owner
direction. Until Q29 fully closes, this question stays in the
**Active Questions** section of this file.

The audit-script behavior described in the original Status note still
applies between multi-option-cohort phases (no new audit-class inventions;
light-touch verification ticks during pure-cron-tick runs; per-phase
landing comes with its own `docs/log.md` entry per the plan).

