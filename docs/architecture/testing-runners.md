---
title: "Testing Runners — Vitest, Playwright Component Testing, Playwright E2E"
sidebar_label: "Testing Runners"
---

# Testing Runners

This template uses three test runners. Each one has a narrow, well-defined
responsibility, and there is exactly one right answer for where any given new
test should live. The matrix below is the canonical place for that decision —
when adding tests, consult this doc first.

> **Why three?** Different layers of the stack break in different ways. Pure
> TypeScript needs only a fast Node-based runner; Preact components benefit
> from a real browser when the failure mode is jsdom-specific (Q22); full pages
> need an end-to-end harness against the built site. Trying to consolidate
> everything into one runner would either slow down the fast tests or weaken
> the realism of the slow tests.

## At a glance

| Runner               | What it tests                                               | Where it lives                                | Command           |
|----------------------|-------------------------------------------------------------|-----------------------------------------------|-------------------|
| **Vitest**           | Pure TS / Node logic, plugin lifecycle, data loaders, schemas, render-only Preact assertions, hooks-only utilities | `packages/*/src/__tests__/**/*.test.{ts,tsx}` (excluding `__tests__/ct/`) | `pnpm test`       |
| **Playwright CT**    | Single Preact component mounted in real Chromium — for any test that uses `fireEvent` / `userEvent`, conditional remounts, focus management, event delegation, media queries, scroll/resize, or anything that has historically tripped jsdom | `packages/ui/src/__tests__/ct/**/*.test.tsx`     | `pnpm test:ct`    |
| **Playwright E2E**   | Full built sample apps — multi-page flows, real navigation, full-stack data loading, plugin output, sitemap/RSS/robots.txt artifacts | `apps/web-e2e/tests/**/*.spec.ts`                | `pnpm test:e2e`   |

## Decision tree

```
new test
   │
   ├─ pure TS / Node logic, no DOM? ────────────────────────────────► Vitest
   │
   ├─ Preact component, render-only, no events / no remounts? ─────► Vitest (jsdom)
   │
   ├─ Preact component with `fireEvent` / `userEvent`,
   │   conditional remount, focus, scroll, viewport, animation,
   │   or anything that has ever crashed jsdom on Windows? ───────► Playwright CT
   │
   └─ multi-page flow, full sample app, sitemap/RSS/robots? ───────► Playwright E2E
```

## Rules

### Vitest is the default

Vitest is the **fast path**. Every test that *can* run in Vitest *should*. It
is the only runner with V8 coverage wired up, the only one in the Turborepo
cache, and the only one whose `pnpm test` walltime is bounded in seconds-not-
minutes per package.

Use it for:

- Pure TypeScript: every test in `packages/core`, `packages/plugins`,
  `packages/adapters`, `packages/sync`, `packages/astro-integration`, and every
  `plugin-*` package.
- `packages/ui` *non-Preact* tests: `lib/utils`, `lib/keyboard`, the `cn`
  helper, plugin pipeline, sort algorithms, etc.
- `packages/ui` Preact components that are **render-only** in their assertion
  pattern: e.g. `back-to-top.test.tsx` (visibility toggle on scroll, but the
  scroll is dispatched as a single event with no chained re-renders),
  `sort-select.test.tsx` (single onChange + assertion), etc.

### Playwright Component Testing (CT) for Preact components that crash jsdom

Playwright CT is the **interactive path**. It boots a real Chromium browser,
mounts a single Preact component into a Playwright page via the official
`@playwright/experimental-ct-react` package and a `react` → `preact/compat`
Vite alias, and exercises it with real DOM events. Use it whenever the test
needs:

- `fireEvent` / `userEvent` chains that mutate state across multiple
  re-renders. (This is the failure mode that drove Q22 — see below.)
- Conditional mount/unmount of children based on state. The classic case is
  `FilterBar`'s `Clear filters` button, which only renders after a user
  interaction. jsdom's event-target teardown crashes the worker on Windows +
  Node 24 when this pattern is exercised in a test.
- Focus management: `focus()`, `blur()`, focus rings, focus traps,
  `aria-activedescendant`. Real browser focus behavior diverges from jsdom in
  small but assertion-breaking ways.
- Viewport / media queries: `matchMedia`, `ResizeObserver`,
  `IntersectionObserver`. jsdom's polyfills are partial.
- Scroll / resize listeners: `window.scrollTo`, `scroll` events. jsdom does
  not paint, so `scrollTop` / `getBoundingClientRect` lie.
- Event delegation through `<span role="button">` or other non-native button
  patterns. Real browsers honor `tabIndex` + `keydown` + `click` event order;
  jsdom implements them but without the same Microsoft-quirk timing.

CT tests live in `packages/ui/src/__tests__/ct/` and are matched by
`playwright.ct.config.ts` (`testMatch: '**/*.test.{ts,tsx}'`). Vitest's
`include` glob excludes `__tests__/ct/**` so the two runners never collide.

The CT toolchain is configured to:

- Use `@playwright/experimental-ct-react` (Preact has no first-party CT
  package — verified 2026-04-26 via `pnpm view`).
- Alias `react` / `react-dom` / `react-dom/test-utils` to `preact/compat` /
  `preact/test-utils` inside `use.ctViteConfig.resolve.alias`. This mirrors
  the long-standing pattern in `packages/ui/vitest.config.ts` and is what
  makes the React mount layer end up calling `preact/compat.h`.
- Type-check via a separate `packages/ui/tsconfig.ct.json` because the build
  tsconfig has `rootDir: ./src` and would refuse `playwright/` files outside
  that root.

### Playwright E2E for full sample apps

Playwright E2E (in `apps/web-e2e`) tests the **shipped product**: a built
sample app served from disk, navigated as a real user would. Use it when:

- The behavior involves more than one page (link follows, breadcrumb
  navigation, list → detail).
- The behavior involves the build output (sitemap.xml, robots.txt, RSS feed,
  Pagefind index, JSON-LD blob in the head).
- The behavior involves a plugin's *side effect on the rendered DOM* across
  pages, not just its in-memory output (for which use Vitest).
- A regression would be invisible from a single mounted component, e.g.
  "every detail page must include a `BreadcrumbList` JSON-LD".

E2E does not replace CT. CT is faster (no full build, single component) and
produces clearer failure messages when an interaction breaks. Always reach for
CT first for component behavior; promote to E2E only when the assertion
spans pages or build artifacts.

## Q22 background — why we have CT in the first place

Q22 (documented in `docs/questions.md#q22`, iterations 97–105) is the
long-standing **`@testing-library/preact` `fireEvent` × `FilterBar` × jsdom ×
Node 24 IPC** crash on Windows. After 5 diagnostic iterations, the failure was
characterized as:

- **Pool-independent**: `forks`, `threads`, `vmThreads` all crash at the same
  boundary.
- **Reporter-independent**: JSON reporter (no per-test stdout writes) crashes
  identically.
- **File-specific**: `back-to-top.test.tsx` runs cleanly under the same config
  that crashes `filter-bar.test.tsx`.
- **Component-specific**: among Preact tests, only `FilterBar` crashes — the
  uniquely re-render-heavy combination of 3 `useState` + 2 `useEffect` + 3
  `useCallback` + a conditionally-mounted `Clear filters` button is what
  pushes jsdom + tinypool + Node 24 IPC over the edge.
- **Vitest-version-independent**: Vitest 3.2.4 is *worse* than 4.1.5 (2/16
  before crash vs. 5/16 before crash), so the bug pre-dates the 4.x pool
  rewrite.

The pragmatic fix was to migrate the affected test surface off jsdom into
Playwright CT. Iteration 105 completed that migration: 16/16 tests pass on
local Windows + Node 24.14.0 in ~6 s walltime. The original
`packages/ui/src/__tests__/preact/filter-bar.test.tsx` was deleted; the new
file is `packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx`.

The CT migration also surfaced a **real bug** in `FilterBar` that the
Vitest+jsdom suite would have caught had it run: the default value
`selectedTags: initialTags = []` allocated a fresh `[]` on every render, so
the `useEffect([initialTags])` reset loop continually wiped user clicks. The
fix is a stable `EMPTY_TAGS` sentinel module-level constant. Without the CT
migration, this bug would have remained dormant under the worker crash.

## Adding a new test — checklist

1. Where does it belong? Walk the decision tree above. If unclear, default to
   Vitest and only escalate to CT if the assertion needs real-browser DOM
   semantics or if a Vitest run reveals jsdom flakiness.
2. Vitest tests: file name `<thing>.test.{ts,tsx}` under
   `packages/<pkg>/src/__tests__/`. They run automatically with `pnpm test`.
3. CT tests: file name `<thing>.test.tsx` under
   `packages/ui/src/__tests__/ct/`. Make sure the file is **not** picked up by
   Vitest (the `include` glob is `src/**/__tests__/**/*.test.{ts,tsx}` and
   `exclude` carves out `**/__tests__/ct/**`). Run with `pnpm test:ct`.
4. E2E tests: file name `<flow>.spec.ts` under `apps/web-e2e/tests/`. They
   require a built app — see `apps/web-e2e/README.md` for the per-project
   setup.
5. Update the relevant spec (`.specify/features/testing.md` AC #10) if the
   total test count changes.

## Coverage handling

V8 coverage is reported by Vitest only. CT runs are **not** measured by V8 at
this time. The current arrangement:

- `packages/ui/vitest.config.ts` excludes `src/preact/FilterBar.tsx` from the
  coverage `include` set so the missing CT-only coverage does not show as a
  regression in the per-package branch report. Other components remain at
  100% branch via Vitest.
- A follow-up (Q22 follow-up #3 in `docs/plans/q22-playwright-ct.md`) tracks
  integrating `playwright-coverage` to merge the two reports. Until then, the
  CT suite functions as an *assertion oracle* but does not contribute to the
  V8 percentage.

## Local commands

```bash
# Vitest — every Vitest suite across the monorepo (Turborepo task)
pnpm test

# Vitest — single package
pnpm --filter @ever-works/ui test

# Vitest — per-file fallback for the @ever-works/ui package, used historically
# as a workaround for Q22 before the CT migration. Still useful for isolating
# a single failing Vitest file.
pnpm test:ui:safe

# Playwright CT — entire @ever-works/ui CT suite
pnpm test:ct

# Playwright CT — install browsers (one-time, per machine)
pnpm test:ct:install

# Playwright CT — type-check only (no execution)
pnpm --filter @ever-works/ui typecheck:ct

# Playwright E2E — full multi-app suite
pnpm test:e2e
```

## CI integration

- **Vitest** runs in the main CI job (`.github/workflows/ci.yml`, `test` step)
  via `pnpm test`. Coverage is uploaded by `test:coverage` on a separate
  schedule.
- **Playwright CT** runs in a dedicated `test-ct` matrix job
  (`os: [ubuntu-latest, windows-latest]`). The `windows-latest` cell is the
  definitive Q22 fix signal — if it ever goes red on a `FilterBar` test, the
  migration has regressed.
- **Playwright E2E** runs in the `e2e` job(s) per sample app, gated on the
  app's build succeeding.

## Authoring conventions for CT tests

Translation table from Vitest+`@testing-library/preact` idioms to Playwright
CT idioms (the same table is repeated in `docs/plans/q22-playwright-ct.md`
Step 4 for traceability):

| Vitest pattern                              | Playwright CT equivalent                                      |
|---------------------------------------------|---------------------------------------------------------------|
| `render(<C />)`                             | `await mount(<C />)` (returns a `Locator`)                    |
| `screen.getByText('X')`                     | `component.getByText('X')`                                    |
| `screen.getByRole('button', { name })`      | `component.getByRole('button', { name })`                     |
| `expect(el).toBeTruthy()`                   | `await expect(locator).toBeVisible()`                         |
| `expect(screen.queryByText('X')).toBeNull()`| `await expect(component.getByText('X')).toHaveCount(0)`       |
| `fireEvent.click(el)`                       | `await locator.click()`                                       |
| `fireEvent.keyDown(el, { key: 'Enter' })`   | `await locator.press('Enter')` (focus is automatic)           |
| `vi.fn()` callback                          | inline `const calls: T[] = []; <C onX={(v) => calls.push(v)}/>` then `expect(calls).toEqual([...])` — the closure executes in the test process via Playwright CT's RPC bridge |

## Future work

- **`playwright-coverage` integration** (Q22 follow-up #3) — merge CT V8
  coverage into the per-package report so `FilterBar.tsx` returns to the
  branch-coverage roll.
- **Preemptive CT migration of `MobileMenu`** (Q22 follow-up #1) — also has
  conditional remount + focus trap, both jsdom-fragile. Not yet failing, but
  the same risk profile as `FilterBar`.
- **Removal of `pnpm test:ui:safe`** (Q22 follow-up #2) — once no remaining
  Preact test files require it. As of iteration 105, the only file that
  required it (`filter-bar.test.tsx`) is gone, so this can be evaluated
  on the next health audit.
