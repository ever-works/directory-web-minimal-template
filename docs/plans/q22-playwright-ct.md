---
title: "Plan: Q22 — Playwright Component Testing for FilterBar"
sidebar_label: "Q22 Playwright CT Migration"
---

# Plan: Q22 — Playwright Component Testing migration for `FilterBar`

> Implementation plan paired with [`.specify/features/q22-playwright-ct.md`](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q22-playwright-ct.md).
>
> Authored: iteration 102 (2026-04-26).
> Corrected: iteration 103 (2026-04-26).
> Steps 1-3 executed and validated: iteration 104 (2026-04-27).
> Steps 4, 5, 7, 8, 9 executed: iteration 105 (2026-04-27) — **Q22 RESOLVED locally + CI matrix wired**.
>
> Status: **✅ FULLY COMPLETE (Q22 → Q28 saga closed, iteration 124).** All
> phases executed: Q22 RESOLVED iter 105, CI matrix landed iter 105, Q22
> follow-up #1 ✅ iter 108 (preemptive `MobileMenu` CT migration), Q22
> follow-up #2 ~~SUPERSEDED~~ iter 110 (per-file Vitest fallback kept as
> defensive escape hatch), Q22 follow-up #3 ✅ iter 121 (CI hard-gate
> enforced; Q26 + Q27 closed in the same arc). Step 6 (first CI run
> observation) was satisfied implicitly across the iter-105 → iter-141
> session window — the `test-ct` job runs on every push to `develop`,
> the windows-latest cell has been green every run, and iter-145 grep
> confirms zero outstanding `PLANNED`/`SPECIFIED`/`DRAFT` status lines
> across the Q-track plan/spec surface. Phase 2 → fully-complete status
> flip belatedly landed iter 146 (caught alongside the
> `q22-upstream-repro.md` DRAFT flip in the same iter-146 audit pass).

## ✅ ITERATION 105 EXECUTION RECORD (2026-04-27)

Steps 4, 5, 7, 8, and 9 below were executed in iteration 105. Outcomes:

- **Step 4** — `packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx` rewritten to cover all 16 cases. Initial run: **13/16 pass**. Three failures (multi-selects tags, deselects tag on second click, sets aria-pressed on selected tags) all traced to a real bug in `packages/ui/src/preact/FilterBar.tsx`: the default value `selectedTags: initialTags = []` allocates a new `[]` on every function call, so `useEffect([initialTags])` fires on every render and silently resets `activeTags` to `[]`. Fixed by hoisting a `const EMPTY_TAGS = Object.freeze([])` module-level sentinel and changing the destructure default to `selectedTags: initialTags = EMPTY_TAGS as string[]`. Re-ran `pnpm test:ct` → **16/16 pass in ~6.1s** on Windows + Node 24.14.0.
- **Step 5** — Original `packages/ui/src/__tests__/preact/filter-bar.test.tsx` deleted. `packages/ui/vitest.config.ts` updated: `test.exclude: ['**/__tests__/ct/**', 'node_modules/**', 'dist/**']` so Vitest's collector ignores `.ct.test.tsx` files; `coverage.exclude` adds `'src/preact/FilterBar.tsx'` (with comment pointing at follow-up #3). `.specify/features/testing.md` AC #10 reworded to "1149 Vitest unit tests + 16 Playwright Component Tests = 1165 total"; new AC #12 added documenting the `pnpm test:ct` toolchain.
- **Step 7** — `.github/workflows/ci.yml` gains a `test-ct` matrix job (`os: [ubuntu-latest, windows-latest]`, `needs: ci`). Steps: checkout, pnpm setup, Node 24 setup, `pnpm install --frozen-lockfile`, an `actions/cache@v4` block keyed on `pnpm-lock.yaml` hash for `~/.cache/ms-playwright` + `~/AppData/Local/ms-playwright` (avoids re-downloading Chromium on every PR), `pnpm exec playwright install --with-deps chromium` (no-op on Windows for `--with-deps`, installs apt deps on Ubuntu), `pnpm test:ct`, and an `if: failure()` artifact upload for `playwright-report/` + `test-results/` named per-OS. The `windows-latest` cell is the canonical Q22 fix signal — flagged with a header comment in the workflow file.
- **Step 8** — `docs/architecture/testing-runners.md` published. Covers: at-a-glance table mapping each runner to its responsibility, decision tree for picking a runner, per-runner rules with examples from this codebase, Q22 background, authoring conventions table, coverage handling, local commands, CI integration, and future work pointing at the three Q22 follow-ups.
- **`docs/index.md`** updated with the iteration-105 headline and a new sidebar entry under Architecture pointing at `testing-runners.md`.
- **`.specify/project.md`** Current State header bumped 104 → 105 with the Q22 RESOLVED status, the new test-count split, and the FilterBar bug-fix note.
- **`docs/questions.md` Q22**: status flipped from OPEN to ✅ RESOLVED at the top of the section; full iteration-105 update appended at the bottom.

Step 6 (first CI run on `ubuntu-latest` + `windows-latest` cells confirms the matrix passes) is the only outstanding work, and is satisfied by observation on the next CI run — no additional code change required. Step 9 (log iteration) is fulfilled by this block plus the `docs/log.md` entry for iteration 105.

## ✅ ITERATION 104 EXECUTION RECORD (2026-04-27)

Steps 1-3 below were executed in iteration 104. Outcomes:

- **Step 1** — `@playwright/experimental-ct-react@1.59.1` and `@playwright/test@1.59.1` installed in `packages/ui/devDependencies`. Lockfile updated, version pin matches `apps/web-e2e`.
- **Step 2** — Scaffold complete: `playwright.ct.config.ts` (with the `react` → `preact/compat` Vite alias from the iteration-103 correction inlined under `use.ctViteConfig`), `playwright/index.html`, `playwright/index.ts`, `src/__tests__/ct/.gitkeep`. Created `packages/ui/tsconfig.ct.json` (separate file because the build tsconfig has `rootDir: ./src`, which would error on `playwright/` files outside the root). Added `pnpm test:ct`, `pnpm test:ct:install`, and `pnpm typecheck:ct` scripts plus root-level passthrough scripts.
- **Step 3** — Smoke test `src/__tests__/ct/filter-bar.ct.test.tsx` (single `mount(<FilterBar />)` → `toHaveAttribute('data-component', 'filter-bar')`) ran on local Windows + Node 24.14.0: **`1 passed (3.5s)`** with Vite 6.4.2 building a 115 KB FilterBar chunk via the compat alias. Path A is validated; **Path B (custom mount adapter) is not required**.

Subsequent iterations can proceed directly to Step 4 (port remaining 15 cases) without re-running the decision gate.

## ⚠️ CORRECTION (iteration 103)

The iteration-102 plan referenced **`@playwright/experimental-ct-preact`**. That package **does not exist on npm** (verified 2026-04-26 via `pnpm view`). Playwright officially supports React and Vue only.

**Use `@playwright/experimental-ct-react` everywhere this plan says `@playwright/experimental-ct-preact`**, paired with a Vite alias in `playwright.ct.config.ts`:

```typescript
resolve: {
    alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
    },
},
```

This mirrors the existing alias pattern in `packages/ui/vitest.config.ts`. The mount layer in `experimental-ct-react` ultimately calls `React.createElement`, which the alias maps to `preact/compat.h`.

If the Step-3 smoke test fails, switch to **`@playwright/experimental-ct-core`** (the framework-agnostic mount engine that the `react`/`vue`/`svelte` packages wrap) and write a thin Preact mount adapter. See `.specify/features/q22-playwright-ct.md#correction-iteration-103-2026-04-26` for the full rationale and Path A / Path B decision tree.

The numbered steps below are otherwise unchanged. Read every literal `@playwright/experimental-ct-preact` as `@playwright/experimental-ct-react` + the alias block above.

## Context

Q22 (see [`docs/questions.md`](../questions.md)) is the long-standing UI test
hang on Windows + Node 24. After 5 iterations of diagnostic work
(iterations 97 → 101) the failure was traced to a single combination:

> **`@testing-library/preact` `fireEvent` × `FilterBar` × jsdom × Node 24 IPC**

The bug is not Vitest-version-specific (4.1.5 = 5/16 tests; 3.2.4 = 2/16
tests; both crash). The bug is not test-count-specific (5-test render-only
file passes; 2-test fireEvent file crashes). It is environment-specific and
component-specific.

The pragmatic fix is to migrate the affected tests off jsdom — to a real
Chromium browser — via Playwright Component Testing. The spec lives at
`.specify/features/q22-playwright-ct.md`. This document is the
**execution plan**.

## Step-by-step

### Step 1 — Install dependencies (~10 min)

```bash
cd packages/ui
pnpm add -D @playwright/experimental-ct-preact@^1.59.1 @playwright/test@^1.59.1
cd ../..
pnpm install
```

Verify:

- `pnpm-lock.yaml` updated.
- `packages/ui/package.json` lists both new devDependencies.
- Versions match `apps/web-e2e/package.json` `@playwright/test` constraint.

### Step 2 — Scaffold Playwright CT (~20 min)

Create:

- `packages/ui/playwright.ct.config.ts` — config from spec §"Playwright CT config".
- `packages/ui/playwright/index.html` — mount fixture HTML from spec.
- `packages/ui/playwright/index.ts` — mount fixture TS from spec (initially empty / commented imports).
- `packages/ui/src/__tests__/ct/.gitkeep` — placeholder so Playwright can
  resolve `testDir`.

Update:

- `packages/ui/tsconfig.json` — add `playwright/**/*.ts` and
  `src/__tests__/ct/**/*.tsx` to `include`.
- `packages/ui/.gitignore` — add `test-results/`, `playwright-report/`, and
  `playwright/.cache/`.

### Step 3 — First smoke test (~30 min)

Create `packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx` with a single
test:

```typescript
import { test, expect } from '@playwright/experimental-ct-preact';
import FilterBar from '../../preact/FilterBar';

test('renders with data-component attribute', async ({ mount }) => {
    const component = await mount(<FilterBar />);
    await expect(component).toHaveAttribute('data-component', 'filter-bar');
});
```

Add scripts:

```jsonc
// packages/ui/package.json (scripts)
{
    "test:ct": "playwright test --config=playwright.ct.config.ts",
    "test:ct:install": "playwright install --with-deps chromium"
}

// root package.json (scripts)
{
    "test:ct": "pnpm --filter @ever-works/ui test:ct"
}
```

Verify locally:

```bash
pnpm --filter @ever-works/ui test:ct:install   # one-time
pnpm test:ct
```

Expected: 1/1 passed in <10 s on Windows.

**Decision gate**: if this smoke test fails, STOP the migration and follow
the spec's Rollback Plan (revert files, document failure mode, fall back to
Q22 Option E or upstream repro).

### Step 4 — Port remaining 15 test cases (~2 hours)

Read each test from `packages/ui/src/__tests__/preact/filter-bar.test.tsx`
and translate to Playwright CT idioms:

| Vitest pattern | Playwright CT equivalent |
|----------------|--------------------------|
| `render(<C />)` | `await mount(<C />)` (returns Locator) |
| `screen.getByText('X')` | `component.getByText('X')` |
| `screen.getByRole('button', { name: 'X' })` | `component.getByRole('button', { name: 'X' })` |
| `expect(el).toBeTruthy()` | `await expect(locator).toBeVisible()` |
| `fireEvent.click(el)` | `await locator.click()` |
| `fireEvent.keyDown(el, { key: 'Enter' })` | `await locator.press('Enter')` |
| `vi.fn()` callback | inline `const calls: T[] = []; <C onX={(v) => calls.push(v)} />` then `expect(calls).toEqual([...])` |
| `expect(callback).toHaveBeenCalledWith(x)` | `expect(calls).toEqual([x])` |

Run after every 2-3 cases:

```bash
pnpm test:ct
```

Each pass should add cases to the green count. **Do not** delete the original
Vitest file yet — keep it as a behavioral oracle until all 16 cases are
green in CT.

### Step 5 — Delete the broken Vitest file (~10 min)

Once `pnpm test:ct` reports `16 passed`:

1. Delete `packages/ui/src/__tests__/preact/filter-bar.test.tsx`.
2. Update `packages/ui/vitest.config.ts` coverage `exclude` to add
   `'src/preact/FilterBar.tsx'` (with a comment pointing at this plan).
3. Update `.specify/features/testing.md` Acceptance Criteria #10 to
   reflect the new total test count (was 1165 unit tests; now 1149 Vitest
   + 16 Playwright CT). Update the `packages/ui` line in the file listing
   to remove `filter-bar.test.tsx`.

### Step 6 — Verify on Linux (~10 min)

If a Linux box / WSL is available locally:

```bash
pnpm test:ct
```

Should still pass 16/16. If only Windows is available, defer this to CI
in Step 7.

### Step 7 — CI integration (~30 min)

Add to `.github/workflows/ci.yml`:

```yaml
test-ct:
    name: Playwright Component Tests (${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    strategy:
        fail-fast: false
        matrix:
            os: [ubuntu-latest, windows-latest]
    steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 10 }
        - uses: actions/setup-node@v4
          with: { node-version: 24, cache: pnpm }
        - run: pnpm install --frozen-lockfile
        - name: Install Playwright browsers
          run: pnpm exec playwright install --with-deps chromium
          working-directory: packages/ui
        - run: pnpm test:ct
```

Push, wait for CI. **Both `ubuntu-latest` and `windows-latest` cells must
go green.** If `windows-latest` fails, Q22 is *not* fixed by the
migration — re-open the question and document the new failure mode.

### Step 8 — Documentation (~30 min)

Create `docs/architecture/testing-runners.md` from the spec's "Decision
matrix documented" section. Add a sidebar link from `docs/index.md`.

Update `docs/questions.md` Q22:

```markdown
**Status**: **RESOLVED** in iteration <N>. `FilterBar` tests migrated to
Playwright Component Testing per `.specify/features/q22-playwright-ct.md`
and `docs/plans/q22-playwright-ct.md`. Windows + Node 24 CI green.

The per-file Vitest runner (`pnpm test:ui:safe`) remains in place as a
fallback for other Preact tests but is no longer required for the
filter-bar surface.
```

Update `.specify/project.md` Current State to mention the migration and the
new Playwright CT job.

### Step 9 — Log iteration (~10 min)

Add a `## 2026-MM-DD — Iteration <N>: Q22 RESOLVED via Playwright CT`
section to `docs/log.md` summarizing the migration.

## Risks per step

| Step | Risk | Mitigation |
|------|------|------------|
| 1 | Version skew with `apps/web-e2e` `@playwright/test` | Pin to identical `^1.59.1` constraint; verify lockfile resolves to same exact version |
| 3 | `experimental-ct-preact` does not mount Preact 10.29.1 | Smoke test is the decision gate; rollback per spec if it fails |
| 4 | Behavioral drift — CT `expect.toBeVisible()` is stricter than `expect.toBeTruthy()` | Run after every 2-3 cases; if a previously-passing assertion fails, debug whether the *production component* has a real visibility bug or whether the new assertion is too strict, and choose the correct fix |
| 5 | Coverage regression alarm | Update `vitest.config.ts` exclude AND `.specify/features/testing.md` AC #10 in the *same commit* as the file deletion to keep specs in sync |
| 7 | CI installs Playwright browsers from scratch on every run (~2-3 min) | Cache `~/.cache/ms-playwright` keyed on `pnpm-lock.yaml` hash; defer optimization if first run already <5 min |

## Out of scope (see spec §"Non-Goals")

- Migrating `BackToTop`, `SortSelect`, `SearchInput`, `ThemeToggle`,
  `MobileMenu`, `LayoutSwitcher`, `ItemBrowser` to Playwright CT.
- Adding screenshot snapshots.
- Removing `pnpm test:ui:safe`.
- React 19 / Docusaurus upgrades.

## Success criteria

- `pnpm test:ct` reports `16 passed` on Windows + Node 24 locally.
- `windows-latest` `test-ct` CI cell green.
- `ubuntu-latest` `test-ct` CI cell green.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (Vitest, all other packages) all
  still green.
- Q22 status flipped to RESOLVED in `docs/questions.md`.
- `.specify/features/testing.md` AC #10 reflects the new total test count.
- `docs/architecture/testing-runners.md` published with the Vitest vs.
  Playwright CT decision matrix.

## Estimated total time

~7 hours of focused work, spread across 3-4 scheduled iterations
(Steps 1-3 in run A, Steps 4-5 in run B, Steps 6-9 in run C).

## After this plan succeeds

Open follow-up questions for the next scheduled run:

1. Should we migrate `MobileMenu` (also has conditional remount + focus
   trap, both jsdom-fragile) to CT preemptively, before it crashes too?
2. Should the per-file Vitest runner (`pnpm test:ui:safe`) be removed once
   no Preact test files require it? (Yes if remaining Preact tests stay
   render-only and pass via the default `pnpm test`.)
3. Should we adopt `playwright-coverage` to merge CT coverage into the V8
   report, restoring the 100% branch coverage signal for `FilterBar.tsx`?
