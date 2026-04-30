---
title: "Multi-Option Support — execution plan"
status: OPEN
spec: .specify/features/multi-option-support.md
opened: iteration 218 (2026-04-30)
---

# Multi-Option Support — execution plan

This plan operationalizes the multi-option-support spec at
`.specify/features/multi-option-support.md`
([view on GitHub](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/multi-option-support.md)).
Each phase below is iteration-scale (1–3 hours of work) and lands as an
independent unit. Phases do not depend on each other; they may run in any order.

## Cross-phase preconditions

Before any phase lands:
- `pnpm typecheck` — 23/23 PASS on the current main.
- `pnpm lint` — 18/18 PASS.
- `pnpm test` — 1122/1122 PASS.
- `pnpm audit:docs` — 9/9 PASS.

If any of these are red, fix that first before opening the phase.

After every phase lands:
- Re-run all four gates above.
- Update the phase's question follow-up block in `docs/questions.md` from
  **OPEN — phase queued** to **✅ DELIVERED — phase complete (iter <N>)**.
- Add a `## 2026-NN-NN — Iteration <N>: <topic> (Phase X of multi-option-support)`
  entry to `docs/log.md`.
- Update `.specify/project.md` `Current State` line to the new iteration number.

## Phase 1 — Q1: UI Framework alternates (~3 hours)

### Steps

1. Create `docs/guides/multi-option/ui-framework.md` with the recipe template:
   - Section per alternate (React, Solid, Svelte, Vue).
   - Each section: install command → integration registration → island example
     → coexistence note → tradeoffs.
2. Verify React alternate end-to-end:
   - In a scratch dir (`tmp/q1-react-verify/`, gitignored), copy
     `apps/sample-basic` to `apps/sample-basic-react-scratch`.
   - `pnpm add @astrojs/react react react-dom`.
   - Add `react()` to `astro.config.ts` `integrations: []`.
   - Add a single React island file: `src/components/HelloReact.tsx`
     (`'use client'` directive style; one button + state).
   - Use it from a page, alongside an existing Preact island.
   - Run `pnpm --filter @ever-works/sample-basic-react-scratch typecheck` →
     expect green.
   - Run `pnpm --filter @ever-works/sample-basic-react-scratch build` →
     expect static pages generated, with the React island bundled.
3. Capture verification output as a fenced block in the guide's "Verified on"
   section.
4. Delete the scratch dir; add to `.gitignore` if not already there.
5. Lint + typecheck the guide via `pnpm audit:docs` (Markdown-only changes
   are not linted by ESLint, but the link-drift class catches broken
   structural references).
6. Update Q1 follow-up block in `docs/questions.md` to ✅ DELIVERED.
7. Log iteration entry.

### Risks

- React 19 + Preact compat: existing samples use `react` → `preact/compat`
  alias for some tooling. Make the recipe explicit that adopters of the
  React alternate **remove** that alias or scope it to test configs only,
  to avoid double-shimming. Recipe carries a "Compat alias removal" note.

## Phase 2 — Q2: CSS strategy alternates (~2.5 hours)

### Steps

1. Create `docs/guides/multi-option/css-strategy.md`:
   - Section per alternate: UnoCSS, CSS Modules, Vanilla CSS + tokens,
     pure-shadcn (CSS variables only).
   - Each section: install diff → equivalent class examples on `Button`
     and `ItemCard` → tradeoffs.
2. Verify UnoCSS alternate:
   - Scratch copy of `apps/sample-basic`.
   - Install `unocss` + `@unocss/preset-wind` + `@unocss/preset-icons`.
   - Replace `@tailwindcss/vite` plugin with `unocss/vite`.
   - Update `src/styles/global.css` to import UnoCSS layers.
   - Verify a representative page renders identically (Lighthouse run not
     required; visual parity check via screenshot).
   - Capture verification output.
3. Add tradeoff matrix to the guide:
   | Strategy | Bundle size | Build speed | AI familiarity | Notes |
   | -------- | ----------- | ----------- | -------------- | ----- |
4. Update Q2 follow-up block.
5. Log iteration entry.

### Risks

- CSS Modules + Astro: Astro supports `*.module.css` natively but the
  headless-UI components in `packages/ui/` import CSS via `cn()` utility
  with class strings. Recipe must show how to wrap a Module-CSS class
  through `cn()`.

## Phase 3 — Q4: Plugin auto-discovery (~3 hours)

### Steps

1. Add `keywords: ['ever-works-plugin']` and an `ever-works-plugin` field to
   each built-in plugin's `package.json`:
   - `@ever-works/plugin-analytics`, `-breadcrumbs`, `-filters`,
     `-pagination`, `-related-items`, `-rss`, `-search`, `-seo`, `-sitemap`,
     `-sort`. (10 packages.)
   - The `ever-works-plugin` field points at the plugin's barrel entry
     (e.g. `"ever-works-plugin": "./dist/index.js"`).
2. Create `packages/plugins/src/discover.ts`:
   - Export `async function discoverPlugins(workspaceRoot?: string): Promise<PluginDefinition[]>`.
   - Resolve workspace root via the optional arg or `process.cwd()`.
   - Read `pnpm-workspace.yaml` (or fallback: scan `packages/`) to find
     candidate packages.
   - Filter by `keywords` containing `ever-works-plugin`.
   - Dynamically import the plugin entry; collect the exported plugin
     definition (assume named export `default` or `<name>Plugin()`).
   - Return the array.
   - Errors are non-fatal: log via `coreLogger.warn(...)` and skip.
3. Add `discoverPlugins` to `packages/plugins/src/index.ts` barrel export.
4. Tests:
   - `packages/plugins/src/__tests__/discover.test.ts`:
     - Discovers all 10 built-in plugins from a fixture workspace.
     - Returns empty array when no packages match.
     - Skips a malformed plugin and continues.
     - Logs a warning for the malformed plugin.
5. Recipe at `docs/guides/multi-option/plugin-discovery.md`:
   - When to use auto-discovery vs explicit config.
   - How to add the `keywords` marker to a custom plugin.
   - Trade-off note: auto-discovery is order-insensitive (the plugin
     order in the returned array is filesystem-dependent), so plugins
     that depend on each other's hooks may need explicit config.
6. Update Q4 follow-up block.
7. Log iteration entry.

### Risks

- Order sensitivity: `definePlugins([...])` runs hooks in array order;
  some plugins (e.g. `plugin-sitemap` after `plugin-search` Pagefind
  index) rely on order. Recipe must call this out.

## Phase 4 — Q5: Alternative search backends (~4 hours)

### Steps

1. Create `packages/plugin-search-fuse/`:
   - `package.json` (name: `@ever-works/plugin-search-fuse`, deps: `fuse.js`
     latest).
   - `src/types.ts` — `SearchFusePluginOptions` interface.
   - `src/build-index.ts` — extracts a JSON index of all items from the
     loaded ContentData (uses the same shape as Pagefind: id, title, body,
     url, ranks).
   - `src/plugin.ts` — factory `searchFusePlugin(options?)` with `onInit`
     (logs config), `onDataLoaded` (passthrough), `onAfterBuild` (writes
     `dist/search-index.json`).
   - `src/preact/SearchFuse.tsx` — Preact island that loads
     `/search-index.json` lazily on first focus and runs Fuse.js queries
     against it.
   - `src/index.ts` barrel.
2. Tests:
   - `__tests__/build-index.test.ts` (input ContentData → expected JSON
     shape).
   - `__tests__/plugin.test.ts` (lifecycle hooks fire in expected order;
     output written to expected path).
3. Recipe at `docs/guides/multi-option/search-backends.md`:
   - Pagefind (default; nothing to do).
   - Fuse.js (one-line swap to `searchFusePlugin()` in `plugins.config.ts`;
     replace `<SearchInput />` with `<SearchFuse />` in pages).
   - Algolia (custom plugin recipe; index upload via build hook; query
     via `algoliasearch` SDK).
   - Meilisearch (same shape as Algolia; self-hosted backend).
4. Tradeoff matrix:
   | Backend | Index size | Query latency | External service | Cost | Notes |
5. Update Q5 follow-up block.
6. Log iteration entry.

### Risks

- Index size: a 3200-item Fuse.js index is multi-megabyte; recipe must
  call out the size threshold (~100 items recommended; >500 use Pagefind
  or Algolia).
- API parity: `plugin-search-fuse` does not provide live indexing
  during dev (Pagefind doesn't either, but the workflow is different).
  Recipe documents the dev-loop story.

## Phase 5 — Q9: Image optimization alternates (~2 hours)

### Steps

1. Create `docs/guides/multi-option/image-services.md`:
   - Section: Astro built-in (default; nothing to do).
   - Section: Cloudinary recipe (custom image service via
     `image.service: { entrypoint: '...' }` in `astro.config.ts`).
   - Section: Imgix recipe.
   - Section: Bunny.net / generic CDN recipe.
2. For each CDN, provide a working `image-service.ts` snippet.
3. Verify Cloudinary recipe end-to-end on a scratch sample-basic clone
   with a free Cloudinary account.
4. Tradeoff matrix:
   | Strategy | Build-time cost | Runtime cost | Vendor lock-in | Notes |
5. Update Q9 follow-up block.
6. Log iteration entry.

### Risks

- Free-tier quotas: Cloudinary recipe must call out the free-tier limits
  so users don't accidentally bust their quota in production.

## Phase 6 — Q10: Starlight docs alternate (~2 hours)

### Steps

1. Create `docs/guides/multi-option/docs-framework.md`:
   - Default: Docusaurus (`apps/docs/`).
   - Alternate: Starlight (Astro-native).
2. Document the swap recipe:
   - `pnpm create astro@latest -- --template starlight apps/docs-starlight`
   - Migrate `docs/` Markdown content into Starlight's content collection
     structure.
   - Update `pnpm-workspace.yaml` if needed.
   - Configure deployment in `vercel.json` for the new app.
3. Tradeoff matrix:
   | Framework | Versioning | Blog | Search | Stack consistency | Bundle |
4. Verify Starlight recipe end-to-end on a scratch dir.
5. Update Q10 follow-up block.
6. Log iteration entry.

### Risks

- Content migration: Docusaurus uses `_category_.json` for sidebar order;
  Starlight uses frontmatter `sidebar`. Recipe must call out the
  per-file conversion.

## Phase 7 — Q18: Alternative git adapters (~3 hours)

### Steps

1. Add `packages/adapters/src/git-shell.ts`:
   - Re-implements the iter-44-era `execFileSync('git', [...])` adapter.
   - Same interface as `git.ts` (`GitAdapter` class with `clone`, `fetch`,
     `pull`, `resolveRef`).
   - Documented as opt-in: import `GitShellAdapter` instead of
     `GitAdapter` in app config.
2. Add `packages/adapters/src/git-api.ts`:
   - Fetches files via the GitHub REST API (`octokit`).
   - Same interface as `GitAdapter` for the read path; write/refresh
     uses ETag + conditional GET.
   - Documented as opt-in.
3. Tests:
   - `__tests__/git-shell.test.ts` — happy path with a fixture repo.
   - `__tests__/git-api.test.ts` — mocked octokit responses.
4. Update `packages/adapters/src/index.ts` barrel to export both
   alternates alongside the existing `GitAdapter`.
5. Recipe at `docs/guides/multi-option/git-adapters.md`:
   - When to use each (CI with git binary → shell; serverless small repo
     → API; default → isomorphic-git).
   - One-line swap in `apps/<app>/src/lib/content.ts`.
6. Tradeoff matrix:
   | Adapter | Binary dep | Memory | Speed | Repo size limit | Auth |
7. Update Q18 follow-up block.
8. Log iteration entry.

### Risks

- The shell adapter requires a `git` binary in the deployment environment;
  recipe must call this out for serverless platforms (Vercel default
  build images include git; some self-hosted alternatives do not).
- The API adapter has GitHub-API rate limits (5000/hr authenticated,
  60/hr unauthenticated); recipe must call this out.

## Phase 8 — Q20: Analytics enhancements (~4 hours)

### Steps

1. Add `packages/plugin-analytics/src/track-event.ts`:
   - Export `trackEvent(name: string, props?: Record<string, unknown>): void`.
   - Looks up the active provider from a module-level reference set by
     the plugin's `onInit` hook.
   - Provider switch: Plausible, Umami, Fathom, GA4, custom.
   - No-op when called with `enableEventTracking: false` (default).
2. Add `enableEventTracking?: boolean` option to
   `AnalyticsPluginOptions`. Default `false`.
3. Tests:
   - `__tests__/track-event.test.ts` — per-provider call shape.
   - `__tests__/plugin.test.ts` — verifies the option gates the export.
4. Create `packages/plugin-consent/`:
   - Same scaffolding as other plugins.
   - `src/preact/ConsentBanner.tsx` — minimal banner with Accept / Decline
     buttons.
   - `src/plugin.ts` — `consentPlugin()` factory.
   - Persists state in `localStorage` under `ever-works-consent`.
   - Exposes `useConsent()` hook for downstream plugins.
   - `plugin-analytics` reads `useConsent()` and gates initialization
     when consent is denied. (If `plugin-consent` is not installed, no
     gating; analytics initializes unconditionally.)
5. Recipe at `docs/guides/multi-option/analytics-enhancements.md`:
   - Pageview-only (default).
   - Pageview + events (opt-in via `enableEventTracking: true`).
   - Pageview + events + consent (add `consentPlugin()` ahead of
     `analyticsPlugin()` in `plugins.config.ts`).
6. Update Q20 follow-up block (specifically Q-A1 and Q-A2 sub-questions).
7. Log iteration entry.

### Risks

- GDPR / cookie law: `plugin-consent` is a reference implementation,
  not a turnkey legal solution. Recipe carries a disclaimer that users
  must vet the consent UX with their own counsel for compliance.

## Audit-script impact (cross-cutting)

Each phase lands changes that may affect the audit-docs runner:

- **Phase 3, 4, 7, 8** add new packages (`packages/plugin-search-fuse`,
  `packages/plugin-consent`). Each addition bumps `**N packages**` in
  `.specify/project.md` from 18 → 19 → 20 (depending on phase order).
  The audit script catches the count drift; the phase commit also
  updates project.md.
- **Phases 1, 2, 5, 6, 7** add files under `docs/guides/multi-option/`.
  No count claim affected; structural-link drift class catches any
  broken cross-doc references.
- **Spec count** stays at 35 (this spec was added in iter 218); each
  phase appends to the same spec rather than creating new specs.

## Verification checklist (per phase)

- [ ] `pnpm typecheck` 23/23 (or 24/24 etc. as packages are added) PASS.
- [ ] `pnpm lint` 18/18 (or higher) PASS.
- [ ] `pnpm test` all packages PASS.
- [ ] `pnpm audit:docs` 9/9 PASS.
- [ ] Question follow-up block flipped to ✅ DELIVERED.
- [ ] `docs/log.md` iteration entry added.
- [ ] `.specify/project.md` Current State header bumped.
- [ ] `docs/index.md` updated descriptor.

## Open sub-decisions resolved by default

- **Plugin marker convention** — `keywords: ['ever-works-plugin']` +
  `ever-works-plugin` field in package.json. Picked because it matches
  Vite/Vitest plugin marker conventions and is greppable.
- **Reference plugin scope** — `plugin-search-fuse` and `plugin-consent`
  ship as proof-of-concept packages with TS types and tests, but their
  feature roadmap is the user's once they adopt.
- **Recipe format** — every guide under `docs/guides/multi-option/`
  follows the same structure: Default, Alternates (one section per),
  Verified on, Tradeoffs.
- **Verification depth** — each phase verifies *one* alternate
  end-to-end; the rest are documented but not exercised. Trade-off:
  full verification of every alternate would 2-3x the implementation
  effort; reference-only documentation lets the cohort ship faster
  while still giving AI agents enough to apply the swap.

## Iteration mapping (suggested)

| Iter | Phase | Topic                          |
| ---- | ----- | ------------------------------ |
| N+0  | 6     | Q10 Starlight docs alt         |
| N+1  | 5     | Q9 Image services              |
| N+2  | 2     | Q2 CSS strategy                |
| N+3  | 1     | Q1 UI framework                |
| N+4  | 7     | Q18 Git adapters               |
| N+5  | 3     | Q4 Plugin auto-discovery       |
| N+6  | 4     | Q5 Search alternates           |
| N+7  | 8     | Q20 Analytics enhancements     |

(N is the next-iteration index, e.g. iter 218.)

If hourly cadence resumes, this gives ~8 iterations of feature work
before the multi-option-support cohort fully lands. Each iteration is
self-contained — pause/resume is cheap.

## Status

OPEN — phases queued. The first phase to execute is Phase 6
(Q10 Starlight docs alt) per the recommended sequencing above.
