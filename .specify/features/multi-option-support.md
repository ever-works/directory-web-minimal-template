---
title: "Multi-Option Support — alternates beyond defaults for UI/CSS/search/etc."
status: OPEN
opened: iteration 218 (2026-04-30)
spec_version: 1.0
---

# Multi-Option Support

## Summary

Many architectural questions in `docs/questions.md` (Q1, Q2, Q4, Q5, Q9, Q10, Q18, Q20) chose a single
**default option** during the original brief execution (iters 1–161), even though the underlying
architecture (plugin/adapter pattern, Astro integrations, headless UI) supports multiple options
without core changes. The user direction in iteration 218 (2026-04-30) explicitly asks for
**multi-option support**: keep the default; document and (where reasonable) scaffold the alternates;
expose a config knob so users can opt into a different option without forking the template.

This spec is the umbrella deliverable that wires up that direction across the affected questions.
Each question gets its own phase with concrete acceptance criteria, leaving the existing default
unchanged and adding the alternates as opt-in.

## Goals

1. **Preserve every existing default.** No regression in the steady-state behavior shipped through
   iter 162 (Preact + Tailwind + config-file plugins + Pagefind + Astro built-in image + Docusaurus
   + isomorphic-git + 5-provider analytics).
2. **Document every alternate** with a concrete recipe under `docs/guides/multi-option/<topic>.md`.
   AI agents read these guides and apply the swap without spelunking the codebase.
3. **Add config knobs** where the alternate is selected at runtime/buildtime (auto-discovery,
   custom image service, alternative search plugin, opt-in `trackEvent`).
4. **Scaffold reference plugins** for the most common alternate paths (e.g. `plugin-search-fuse`,
   `plugin-consent`) so users can copy-paste a working alternate instead of starting blank.
5. **Update `docs/questions.md`** with multi-option follow-up blocks per affected question, so
   future readers see the answer without spelunking this spec.

## Non-Goals

- **Rip out any default.** R13 (do not remove, only improve) is in force.
- **Pre-install every alternate's npm package.** Listing `@astrojs/react`, `@astrojs/svelte`,
  `@astrojs/vue`, `@astrojs/solid-js` all as dependencies bloats the install for users who want
  Preact only. Alternates ship as **docs + recipes**; users `pnpm add` the integration when they
  switch.
- **Build every alternate's plugin to production quality.** Reference plugins (`plugin-search-fuse`,
  `plugin-consent`) ship as **proof-of-concept** packages with TypeScript types and a working
  implementation, but their roadmap (advanced features, edge-case handling, tests) is the user's
  if they adopt them.
- **Change the original brief's deliverables.** This is additive scope.

## Relation to existing rules

- **R6 (Plugin everything)** — alternates land as plugins/adapters/recipes, not as core changes.
- **R7 (Modular & replaceable)** — explicit alternates make the modularity claim verifiable.
- **R10 (AI-Optimized)** — the per-topic guides give AI agents a single canonical recipe to apply.
- **R11 (Documentation first)** — every alternate is documented before code lands.
- **R13 (Do not remove)** — defaults stay; alternates are additive.
- **R16 (Convention over configuration)** — defaults are good; alternates available via config.

## Phases

Each phase corresponds to one question and lands as an independent unit (iteration-scale work).
Phases can run in any order — they do not depend on each other.

### Phase 1 — Q1: UI Framework alternates (Preact default; React/Solid/Svelte/Vue opt-in)

**Default kept**: Preact via `@astrojs/preact`. Already in `apps/web/astro.config.ts`.

**Alternates documented** (opt-in via `pnpm add @astrojs/<framework>` + integration entry in
`astro.config.ts`):
- React (`@astrojs/react`)
- Solid.js (`@astrojs/solid-js`)
- Svelte (`@astrojs/svelte`)
- Vue (`@astrojs/vue`)

**Deliverable**: `docs/guides/multi-option/ui-framework.md` — recipe per alternate showing:
1. Install command.
2. Astro integration registration.
3. How to write islands in that framework (one short example).
4. How to keep Preact components co-existing (Astro supports multiple frameworks simultaneously).
5. Compatibility notes with the existing `@ever-works/ui/preact/*` exports (users can keep them
   as Preact-only or migrate them per-component).

**AC**:
- AC #1 — guide compiles into the Docusaurus build (`pnpm --filter @ever-works/docs build`).
- AC #2 — at least one alternate (React) verified by spinning up a scratch app that imports
  `@ever-works/ui` Preact components alongside a single React island; verified `pnpm typecheck`
  green and `pnpm build` produces a working static bundle.
- AC #3 — `apps/web/astro.config.ts` left unchanged; Preact remains the default integration.

### Phase 2 — Q2: CSS strategy alternates (Tailwind default; UnoCSS/CSS Modules/Vanilla opt-in)

**Default kept**: Tailwind CSS v4 via `@tailwindcss/vite`. Already in every sample app.

**Alternates documented** (the headless-UI architecture means components carry no CSS, so swapping
the CSS strategy is a downstream choice):
- UnoCSS (`unocss/vite` plugin; Tailwind preset for class-name parity)
- CSS Modules (Astro built-in support; per-component `*.module.css`)
- Vanilla CSS with custom properties + design tokens
- Pure shadcn-ui style (CSS variables in `:root`, component-level `cn()` helper retained)

**Deliverable**: `docs/guides/multi-option/css-strategy.md` — recipe per alternate showing:
1. Install / config diff vs the Tailwind default.
2. Equivalent class-naming examples on the canonical components (`Button`, `Badge`, `ItemCard`).
3. Tradeoff notes (bundle size, build speed, AI familiarity).

**AC**:
- AC #1 — guide compiles into Docusaurus build.
- AC #2 — UnoCSS swap verified end-to-end on a scratch copy of `apps/sample-basic`.
- AC #3 — Tailwind default unchanged across all 5 sample apps.

### Phase 3 — Q4: Plugin auto-discovery (config-file default; auto-discovery opt-in)

**Default kept**: `plugins.config.ts` with explicit `definePlugins([...])`.

**Alternate added**: `discoverPlugins(workspace?: string)` helper exported from
`@ever-works/plugins`. Scans the workspace for packages whose `package.json` has
`"keywords": ["ever-works-plugin"]` and an `ever-works-plugin` field in package.json declaring
the entry. Returns an array suitable for spreading into `definePlugins([...])`.

**Behavior**:
- Reads workspace package.json files (via pnpm workspace lookup or filesystem scan with a
  configurable root).
- Filters by `keywords` containing `ever-works-plugin`.
- Imports each plugin's entry dynamically and returns the resolved plugin definitions.
- Errors are non-fatal — a malformed plugin logs a warning and is skipped.

**Deliverable**:
- New export: `discoverPlugins` in `packages/plugins/src/discover.ts` + barrel export.
- Marker convention documented: each `@ever-works/plugin-*` adds
  `"keywords": ["ever-works-plugin"]` and an `"ever-works-plugin": "./dist/index.js"` field to
  its `package.json`. Built-in plugins get this marker as part of Phase 3 (one PR, additive).
- Recipe at `docs/guides/multi-option/plugin-discovery.md`.
- Unit tests (Vitest) under `packages/plugins/src/__tests__/discover.test.ts`.

**AC**:
- AC #1 — `discoverPlugins()` returns the same set as the manual config in
  `apps/sample-basic/src/lib/plugins.config.ts` when run from that workspace.
- AC #2 — explicit `definePlugins([...])` continues to work unchanged in every app.
- AC #3 — adding `keywords: ['ever-works-plugin']` to every built-in plugin's `package.json`
  does not break any existing test or build.

### Phase 4 — Q5: Alternative search backends (Pagefind default; Fuse.js / Algolia / Meilisearch opt-in)

**Default kept**: Pagefind via `@ever-works/plugin-search`. Already in every sample.

**Alternates added** (selected by replacing `plugin-search` in the `plugins.config.ts` array):
- **Fuse.js** — new `@ever-works/plugin-search-fuse` package as a reference implementation.
  Build-time index extraction; runtime fuzzy search via Fuse.js in a Preact island.
  No external service.
- **Algolia** (documented only) — recipe in `docs/guides/multi-option/search-backends.md` showing
  how to build a custom plugin that uploads the index to Algolia at build and queries via the
  `algoliasearch` SDK at runtime.
- **Meilisearch** (documented only) — same shape as Algolia; self-hosted backend.

**Deliverable**:
- New package: `packages/plugin-search-fuse/` with the same plugin lifecycle hooks as
  `plugin-search` but generating a JSON index for Fuse.js instead of running the Pagefind CLI.
- Recipe at `docs/guides/multi-option/search-backends.md`.
- Tests under `packages/plugin-search-fuse/src/__tests__/`.

**AC**:
- AC #1 — `plugin-search-fuse` typechecks, lints, tests green, builds clean.
- AC #2 — recipe shows a one-line swap in `plugins.config.ts` (replace `searchPlugin()` with
  `searchFusePlugin()`).
- AC #3 — Pagefind default unchanged in all 5 sample apps.

### Phase 5 — Q9: Image optimization alternates (Astro built-in default; CDN-backed opt-in)

**Default kept**: Astro's `astro:assets` `<Image>` component. Already supported across components.

**Alternate added**: Custom image service config block — Astro supports
`image.service: { entrypoint: '...' }` in `astro.config.ts`. Documented via:
- Cloudinary recipe (uses `@cloudinary/url-gen` to build CDN URLs at build time).
- Imgix recipe (uses URL transforms).
- Bunny.net / DigitalOcean Spaces recipe (generic CDN with URL prefix).

**Deliverable**:
- Recipe at `docs/guides/multi-option/image-services.md`.
- Reference snippet for each CDN.
- Note on tradeoffs (build-time optimization vs CDN runtime, cost, vendor lock-in).

**AC**:
- AC #1 — guide compiles into Docusaurus build.
- AC #2 — Cloudinary recipe verified end-to-end on a scratch sample-basic clone.
- AC #3 — Astro built-in default unchanged in all sample apps.

### Phase 6 — Q10: Starlight as docs-site alternate (Docusaurus implemented; Starlight opt-in)

**Default kept**: Docusaurus 3.x in `apps/docs/`. Already shipping.

**Alternate documented**: Starlight (Astro-native) recipe showing how to clone `apps/docs/` and
swap the framework. Tradeoffs documented (Docusaurus has versioning + blog out of the box;
Starlight has consistency with the rest of the Astro stack).

**Deliverable**: `docs/guides/multi-option/docs-framework.md` with the swap recipe.

**AC**:
- AC #1 — guide compiles into Docusaurus build.
- AC #2 — recipe verified by manually scaffolding a Starlight clone of `apps/docs/` in a scratch
  dir and confirming it builds with the same content.
- AC #3 — `apps/docs/` (Docusaurus) unchanged.

### Phase 7 — Q18: Alternative git adapters (isomorphic-git default; shell-git / GitHub-API opt-in)

**Default kept**: `GitAdapter` using `isomorphic-git` in `@ever-works/adapters`.

**Alternates added** (selected via the adapter pattern — users replace the adapter in their app
config):
- **Shell-git adapter**: re-uses the iter-44-era `execFileSync('git', [...])` approach. For users
  in CI environments where git is always available and `isomorphic-git`'s memory profile is too
  high.
- **GitHub-API adapter**: fetches files via the REST API (`octokit` or raw fetch). Useful when
  the data repo is small and avoiding any git operation simplifies serverless deployment.

**Deliverable**:
- Recipe at `docs/guides/multi-option/git-adapters.md` with full implementation snippets for
  both alternates.
- Optional: scaffold `packages/adapters/src/git-shell.ts` and `packages/adapters/src/git-api.ts`
  as reference implementations alongside the existing `git.ts` (isomorphic-git).
- Adapter selection documented via `apps/<app>/src/lib/content.ts` adapter import swap.

**AC**:
- AC #1 — guide compiles into Docusaurus build.
- AC #2 — at least one alternate (shell-git) verified by spinning up a scratch app that uses it.
- AC #3 — isomorphic-git default unchanged.

### Phase 8 — Q20: Analytics enhancements (event tracking + plugin-consent stub)

**Default kept**: Pageview-only tracking via `plugin-analytics` with 5 providers + custom escape
hatch. Already shipping.

**Alternates added**:
- **Q-A1 — Opt-in `trackEvent(name, props)` helper** (was deferred to v0.2 in the original spec).
  Add as opt-in via plugin option `enableEventTracking: true`. Default off. When enabled, exports
  a `trackEvent` function and emits the provider-specific call (Plausible's `plausible('event')`,
  Umami's `umami.track()`, etc.).
- **Q-A2 — `plugin-consent` reference package**. Lightweight cookie/consent banner with
  Astro+Preact integration. Default off; users opt in by adding it to `plugins.config.ts` ahead
  of `plugin-analytics`. Provides consent state to other plugins via a documented contract.

**Deliverable**:
- Code: `packages/plugin-analytics/src/track-event.ts` (gated by `enableEventTracking` option).
- New package: `packages/plugin-consent/` with the same scaffolding as other plugins.
- Recipe at `docs/guides/multi-option/analytics-enhancements.md`.
- Tests under both packages.

**AC**:
- AC #1 — `trackEvent` typechecks and tests green when `enableEventTracking: true`; no-op when
  not set.
- AC #2 — `plugin-consent` typechecks, lints, tests green, builds clean.
- AC #3 — pageview-only default behavior unchanged when the new options are not set.

## Risks

- **R1 (Medium)** — alternate scaffolds drift from defaults over time as the defaults evolve.
  Mitigation: each alternate's CI runs on the same commit as the default; any breaking divergence
  surfaces immediately.
- **R2 (Low)** — adding new packages bloats the workspace. Mitigation: per-phase CI validation
  ensures no install-time regression. Phases land independently so install-time impact is
  observable per-phase.
- **R3 (Medium)** — users may pick an alternate that does not have parity with the default
  (e.g. Fuse.js does not support stemming/stopwords as well as Pagefind). Mitigation: each
  alternate's recipe carries an explicit "Tradeoffs" section so users opt in informed.
- **R4 (Low)** — the multi-option-support cohort itself becomes a maintenance burden if every
  Astro/Vite/Vitest minor adds new alternates. Mitigation: cap the cohort at the 8 phases above;
  new alternates need a fresh question.

## Implementation order (recommended)

Phases are independent. Recommended sequencing (by ease/value):
1. **Phase 6 (Q10 Starlight docs alt)** — pure documentation, zero code, smallest surface.
2. **Phase 5 (Q9 Image services)** — pure documentation, no new packages.
3. **Phase 2 (Q2 CSS strategy)** — pure documentation; verify on existing samples.
4. **Phase 1 (Q1 UI framework)** — documentation + verification on a scratch React island.
5. **Phase 7 (Q18 Git adapters)** — small code (alt adapter files) + docs.
6. **Phase 3 (Q4 Plugin auto-discovery)** — adds an export to `@ever-works/plugins`; needs tests.
7. **Phase 4 (Q5 Search alternates)** — new package; medium-sized.
8. **Phase 8 (Q20 Analytics)** — new package + new export; largest surface.

Each phase gets its own iteration entry in `docs/log.md` when executed.

## Out of scope for this spec

- Implementing every documented alternate to production quality (the recipes ship as guides;
  the user adopts them and refines).
- Adding any *new* questions beyond Q1/Q2/Q4/Q5/Q9/Q10/Q18/Q20.
- Vertical-specific samples beyond the existing 5 (sample-basic/jobs/events/real-estate/git).
  Those are tracked under Q29 separately.

## Trace to questions.md

This spec is referenced by:
- Q1 § Multi-option follow-up (iter 218)
- Q2 § Multi-option follow-up (iter 218)
- Q4 § Multi-option follow-up (iter 218)
- Q5 § Multi-option follow-up (iter 218)
- Q9 § Multi-option follow-up (iter 218)
- Q10 § Multi-option follow-up (iter 218)
- Q18 § Multi-option follow-up (iter 218)
- Q20 § Multi-option follow-up (iter 218)

When any phase lands, the corresponding question's follow-up block flips from
**OPEN — phase queued** to **✅ DELIVERED — phase complete**.

## Status

OPEN — phases queued. The execution plan lives at
[`docs/plans/multi-option-support.md`](../../docs/plans/multi-option-support.md).
