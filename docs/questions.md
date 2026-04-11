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

**Context**: The UI package includes 5 Preact interactive components (SearchInput, FilterBar, SortSelect, BackToTop, ThemeToggle) but the `apps/web` template pages don't use them. The `apps/web` template is intentionally a blank canvas, but should at least demonstrate interactive component wiring.

**Options**:
- **A) Keep web template blank, demo in sample-basic only** — AI agents wire them in per project `[DEFAULT]`
- B) Wire all interactive components into the web template — Pre-built interactive experience
- C) Wire search only, leave filters/sort for AI — Search is fundamental, rest is customizable

**Default choice**: **Keep web template blank, demo in sample-basic** — The web template's purpose is to be an intentionally blank canvas. The sample-basic should demonstrate all interactive components as a reference. AI agents can then copy the patterns.

**Action needed**: Integrate SearchInput, FilterBar, and SortSelect into `apps/sample-basic` pages to demonstrate proper usage.
