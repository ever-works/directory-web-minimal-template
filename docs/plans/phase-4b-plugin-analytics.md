---
title: "Phase 4b: Plugin — Analytics"
sidebar_label: "Phase 4b: Analytics Plugin"
---

# Phase 4b: Analytics Plugin

> Introduce `@ever-works/plugin-analytics` — a privacy-friendly, multi-provider analytics plugin.

## Goal

Ship a first-class analytics plugin that covers the common directory-site providers (Plausible, Umami, Fathom, GA4, custom) without locking users in. Every decision should be reversible; removing the plugin from `definePlugins()` should leave the site analytics-free.

## Scope

See full contract in `.specify/features/plugin-analytics.md`.

## Tasks

### 4b.1 Package scaffold
- [ ] Create `packages/plugin-analytics/` with standard plugin structure
- [ ] `package.json` — name `@ever-works/plugin-analytics`, workspace deps on `@ever-works/core` + `@ever-works/plugins`
- [ ] `tsconfig.json`, `vitest.config.ts`, `eslint.config.js` (reuse shared configs)
- [ ] `README.md` — API reference + per-provider examples

### 4b.2 Types + config resolution
- [ ] `src/types.ts` — `AnalyticsPluginOptions`, provider discriminated union, `ResolvedAnalyticsConfig`
- [ ] `src/resolve-config.ts` — validation + defaults (DoNotTrack on, disableInDev on, placement=head)
- [ ] Tests: defaults, per-provider validation errors, multi-provider

### 4b.3 Provider renderers
- [ ] `src/renderers/plausible.ts` — `renderPlausibleScript(cfg): string`
- [ ] `src/renderers/umami.ts` — `renderUmamiScript(cfg): string`
- [ ] `src/renderers/fathom.ts` — `renderFathomScript(cfg): string`
- [ ] `src/renderers/ga4.ts` — `renderGa4Script(cfg): string`
- [ ] `src/renderers/custom.ts` — `renderCustomScript(cfg): string`
- [ ] Tests: escaping, attribute correctness, snapshot per provider

### 4b.4 Plugin factory
- [ ] `src/plugin.ts` — `analyticsPlugin(options)` implementing `onInit` + `onDataLoaded`
- [ ] `src/index.ts` — barrel exports (plugin, types, all renderer functions)
- [ ] Tests: lifecycle, data merge, error surfaces
- [ ] Barrel export test

### 4b.5 UI component
- [ ] Add `packages/ui/src/astro/AnalyticsScript.astro`
- [ ] Props: `config?: ResolvedAnalyticsConfig` (falls back to `Astro.locals.content._analytics`)
- [ ] Respects `disableInDev`, `respectDoNotTrack`
- [ ] Emits zero output when no providers
- [ ] Export from `packages/ui/src/astro/index.ts` barrel
- [ ] Unit test for component rendering (snapshot)

### 4b.6 Sample integration
- [ ] Wire `analyticsPlugin({ providers: [{ provider: 'custom', html: '<!-- demo -->' }] })` into `apps/sample-basic/src/plugins.config.ts` with a commented-out Plausible example
- [ ] Add `<AnalyticsScript />` to `apps/sample-basic/src/layouts/Layout.astro`
- [ ] Verify build output contains the analytics block in `dist/index.html`

### 4b.7 Docs + cross-links
- [ ] `docs/guides/analytics.md` — setup guide with per-provider examples
- [ ] Update `docs/index.md` — add guide + spec entries
- [ ] Update `README.md` — list plugin-analytics under built-in plugins
- [ ] Update `CLAUDE.md` — mention plugin in `packages/plugin-*` list
- [ ] Update `SKILLS.md` — AI recipe: "Add Plausible analytics to a generated site"
- [ ] Append iteration entry to `docs/log.md`

### 4b.8 Verification
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm test` — all previous tests still pass + ≥ 25 new tests
- [ ] `pnpm build` — all 8 apps build successfully
- [ ] `pnpm audit` — 0 vulnerabilities

## Implementation Order

Tasks are intentionally ordered so each step is independently verifiable:

1. 4b.1 → 4b.2 → 4b.3 → 4b.4 (pure package work, testable in isolation)
2. 4b.5 (UI component depends on plugin types only)
3. 4b.6 (integration — requires 4b.1–4b.5)
4. 4b.7 (docs — depends on nothing, can parallelize with 4b.6)
5. 4b.8 (final gate)

## Non-Goals for This Phase

- `trackEvent()` API (deferred to v0.2 — see Q-A1 in spec)
- Consent/cookie banner (separate `plugin-consent` domain — see Q-A2)
- Provider dashboard UI (out of scope)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Astro hydration mismatch on DoNotTrack guard | Emit as inline `<script>` with no client-side state; guard is pre-hydration |
| Raw HTML in `custom` provider opens XSS surface | Documented trust boundary; lint rule flags unescaped user input if we ever parameterize it |
| Multiple providers with conflicting `window.*` globals (e.g. GA4 `dataLayer`) | Each renderer emits an isolated `<script>` block; no cross-provider state |
| Provider script network failure breaks the page | All scripts load with `defer`/`async`; page is analytics-independent |

## Cross-Reference

- Spec: `.specify/features/plugin-analytics.md`
- Related: `plugin-seo` (similar shape), `plugin-rss` (similar integration pattern)
- Philosophy: Rule R6 (Plugin everything), R8 (AI-Optimized)
