# Feature: Q22 follow-up #1 — Preemptive `MobileMenu` Playwright CT migration

> **Status: ✅ COMPLETE (iteration 108, 2026-04-27).** Specified and
> executed in the same iteration. All 15 cases ported to Playwright CT
> in `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx` and pass
> 15/15 in 45.7s on Windows + Node 24.14.0. The original
> `packages/ui/src/__tests__/preact/mobile-menu.test.tsx` was deleted
> and `MobileMenu.tsx` was added to `vitest.config.ts`
> `coverage.exclude` (subsequently dropped iter 115 / Phase 2 of Q22
> follow-up #3 once the `pnpm coverage` merge landed). The MobileMenu
> CT case count grew 15 → 17 in iteration 120 (focus-trap forward /
> backward wrap CT tests) and 17 → 20 in iteration 124 (Q27 — empty-
> panel + synthetic-Tab-from-last + non-boundary Tab tests closing
> the 3-branch outlier). The playbook here was the same as Q22
> (`FilterBar`, iteration 105) and Q23 (`LayoutSwitcher`, iteration
> 107); this spec documented the `MobileMenu`-specific deviations
> (D1-D5 — Escape key, click-outside wrapper, body scroll lock,
> aria-expanded etc.). Status flip belatedly landed iteration 144 —
> the iter-138 spec inventory pass + iter-141 cross-repo grep audit
> caught and resolved this drift class for adjacent surfaces but
> missed the spec's own front-matter line.

## Description

Move the 14-case Vitest+jsdom test file
`packages/ui/src/__tests__/preact/mobile-menu.test.tsx` to Playwright Component
Testing, mirroring the iteration-105 `FilterBar` and iteration-107
`LayoutSwitcher` migrations. **`MobileMenu` is not currently broken** under
`pnpm test:ui:safe` (12/12 files pass per iteration 107) — this is a
**preemptive** migration to:

1. Defuse the same Q22 / Q23 fingerprint risk (jsdom + Preact + Node 24 IPC)
   for a component whose internals (multiple document-level event listeners,
   conditional remount of the panel subtree, body-scroll mutation, focus trap
   with refs) sit squarely in the same risk class as `FilterBar`/`LayoutSwitcher`.
2. Continue retiring the `pnpm test:ui:safe` per-file workaround. With
   `MobileMenu` migrated, only 11 Vitest UI test files remain — all of them
   are **render-only** or **state-only** (no `document`-level listeners,
   no scroll lock, no focus trap), so the chance of another Q22-shape hang
   drops materially.
3. Validate the Q22 / Q23 playbook against a richer interaction surface
   (Escape key, click-outside, focus return, body scroll mutation) before
   building the CI-cell story for `playwright-coverage` (follow-up #3).

## User Stories

- As a **developer on Windows**, I want `MobileMenu` interaction tests to
  remain green even if Node 24 IPC or jsdom drift introduces another Q22-shape
  hang. The CT runner is unaffected by the fingerprint.
- As an **AI agent**, I want a third worked example of the Q22 playbook
  applied to a different interaction profile, so the
  `docs/architecture/testing-runners.md` decision tree generalises.
- As a **maintainer**, I want `MobileMenu` covered by a real-browser test that
  exercises the actual `document` event loop (keydown, click outside, focus
  return) instead of jsdom's approximation.

## Acceptance Criteria

1. **AC #1 — Test file ported.** Create
   `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx` with all 14 cases
   from the original `preact/mobile-menu.test.tsx`. Use the same translation
   table documented in `docs/architecture/testing-runners.md` and the
   inline preamble of `layout-switcher.ct.test.tsx`.
2. **AC #2 — All 14 cases pass.** `pnpm --filter @ever-works/ui test:ct`
   reports **`42 passed`** total (16 `FilterBar` + 12 `LayoutSwitcher` + 14
   `MobileMenu`) on Windows + Node 24.14.0. Wall-time budget: <90s for the
   full CT run (it's currently <60s for 28 cases).
3. **AC #3 — Vitest file deleted.**
   `packages/ui/src/__tests__/preact/mobile-menu.test.tsx` is removed.
4. **AC #4 — Coverage exclusion added.**
   `packages/ui/vitest.config.ts` `coverage.exclude` adds
   `'src/preact/MobileMenu.tsx'` alongside `'src/preact/FilterBar.tsx'` and
   `'src/preact/LayoutSwitcher.tsx'`, with the same comment pattern pointing
   at Q22 follow-up #3.
5. **AC #5 — `pnpm test:ui:safe` still 11/11 green.** With `mobile-menu.test.tsx`
   gone, the per-file Vitest runner reports **11/11 files passing** (was 12/12)
   and walltime drops slightly. No new Q22-shape hangs introduced.
6. **AC #6 — Typecheck and lint pass.** `pnpm typecheck` reports 23/23
   successful, 0 errors. `pnpm lint` reports 18/18 successful, 0 errors.
7. **AC #7 — Specs updated.**
   - `.specify/features/testing.md` AC #10 updated to
     **"1135 Vitest unit tests + 42 Playwright Component Tests = 1177 total"**.
     (Vitest count drops by 14 cases when `mobile-menu.test.tsx` is removed,
     CT count grows by 14 — net same. Re-verify the Vitest count locally
     before committing the number.)
   - `.specify/features/testing.md` AC #12 acknowledges the third migrated
     component.
   - `docs/architecture/testing-runners.md` lists `MobileMenu` alongside
     `FilterBar`/`LayoutSwitcher` in the "Migrated to CT" section.
8. **AC #8 — Q22 follow-up #1 status flips.** `docs/questions.md` Q22 follow-up
   list marks **#1 (preemptive `MobileMenu` migration) as ✅ COMPLETE**. The
   `Remaining Q22 / Q23 follow-ups` block in `docs/log.md` reflects the new
   status.

## `MobileMenu`-specific translation deviations

These are the differences from the `FilterBar` / `LayoutSwitcher` translations
documented in `docs/architecture/testing-runners.md`. The playbook is otherwise
identical.

### D1 — `document.addEventListener('keydown')` (Escape, Tab/focus trap)

The original Vitest test fires `fireEvent.keyDown(document, { key: 'Escape' })`.
In Playwright CT the equivalent is `await page.keyboard.press('Escape')` — the
real browser dispatches a keydown to the focused element and bubbles it to
`document`. No special handling needed; the `MobileMenu`'s
`document.addEventListener('keydown')` listener fires identically in jsdom and
real Chromium.

The "does not close on non-Escape key" test similarly maps to
`await page.keyboard.press('Tab')` (which under the focus trap will cycle focus,
then *not* close the menu).

### D2 — `document.addEventListener('click')` (click outside)

Original Vitest mounts a wrapper:

```tsx
render(
  <div>
    <div data-testid="outside">Outside</div>
    <MobileMenu items={items} />
  </div>
);
fireEvent.click(screen.getByTestId('outside'));
```

CT equivalent: mount the same wrapper. The mount root becomes the wrapper
`<div>`, so the assertion "renders with `data-component='mobile-menu'`" must
search descendants:

```tsx
const component = await mount(
  <div>
    <div data-testid="outside">Outside</div>
    <MobileMenu items={items} />
  </div>
);
await expect(component.locator('[data-component="mobile-menu"]')).toBeVisible();
await component.getByTestId('outside').click();
```

For the **other 13 tests** that mount only `<MobileMenu />`, the mount root
**IS** the `data-component="mobile-menu"` div (same pattern as `LayoutSwitcher`'s
radiogroup root). Use `await expect(component).toHaveAttribute('data-component', 'mobile-menu')`
in those cases.

### D3 — `document.body.style.overflow` (scroll lock)

Original Vitest reads `document.body.style.overflow`. CT equivalent uses
`page.evaluate`:

```tsx
const overflow = await page.evaluate(() => document.body.style.overflow);
expect(overflow).toBe('hidden');
```

The CT `beforeEach` does **not** need to reset `document.body.style.overflow`
to `''` because each Playwright test gets a fresh browser context — the
host page is reloaded between tests by the CT harness. This is the same
context-isolation behavior that lets us drop `localStorage.clear()` in
`layout-switcher.ct.test.tsx`.

### D4 — Focus return after close

`close()` calls `buttonRef.current?.focus()` — the toggle button regains focus
after the panel closes. CT can assert this with
`await expect(component.getByLabel('Open menu')).toBeFocused()`. jsdom's focus
implementation is best-effort and the original Vitest tests do **not** assert
on it; the CT migration is a chance to add this assertion as a small coverage
win without scope creep. **Keep the migration scope-faithful for now** — if
focus-return turns out to be brittle in a follow-up iteration, the new
assertion can be removed without regressing existing AC.

### D5 — Conditional panel remount

The panel `<div data-part="panel">` is conditionally rendered based on
`isOpen`. The Vitest tests use `container.querySelector('[data-part="panel"]')`
and assert `toBeNull()` / `toBeTruthy()`. CT equivalent:

```tsx
await expect(component.locator('[data-part="panel"]')).toHaveCount(0); // closed
await expect(component.locator('[data-part="panel"]')).toBeVisible();   // open
```

This is a small idiomatic difference; the test semantics are identical.

## Out of scope

- **Restoring `MobileMenu` to V8 coverage.** Belongs to Q22 follow-up #3
  (`playwright-coverage` integration). The Vitest exclusion added in AC #4 is
  the temporary coverage gap that #3 will close.
- **Adding `MobileMenu` to a CI cell beyond what `pnpm test:ct` already covers.**
  The `.github/workflows/ci.yml` `test-ct` matrix job (added in iteration 105)
  already runs every `*.ct.test.tsx` file; no workflow edits are required for
  this migration.
- **Refactoring `MobileMenu.tsx`.** No production source changes are part of
  this migration. If the CT run surfaces a real bug (cf. iteration 105's
  `EMPTY_TAGS` discovery for `FilterBar`), document it inline in the
  iteration log and fix it in the same commit, but do **not** start with a
  refactor.

## Risks

- **R1 — Focus-return assertion brittleness.** Real-browser focus management
  is more deterministic than jsdom's, but timing-sensitive. Mitigation:
  Playwright's `await expect(locator).toBeFocused()` auto-retries until the
  default 5s timeout; this should absorb any post-`setIsOpen(false)` paint
  delay. Fallback: drop the assertion if it flakes 2+ times in a row, with a
  follow-up question.
- **R2 — Click-outside test wrapper changes mount-root semantics.** The
  wrapper-mounted test cannot share the "mount root IS the component"
  pattern. Mitigation: keep that one test as the special case (already
  documented in D2), and use `component.locator(...)` for the other tests
  that don't need a wrapper.
- **R3 — Scroll lock test reads `document.body.style.overflow` directly.**
  In CT, the test body is the real `<body>` of the host page. The
  `MobileMenu`'s effect mutates this body. After the test completes, the next
  test gets a fresh page and `body.style.overflow` is `''` again — no leak.
  The original Vitest `beforeEach` reset is unnecessary in CT.
- **R4 — Test count discrepancy.** The Vitest count drops by 14 (mobile-menu
  cases) while the CT count grows by 14. Net total is unchanged at 1177 if
  Vitest currently reports 1149 + 14 (= 1163 cases on the 12 files counted
  in iteration 107). Re-verify the exact number with
  `pnpm --filter @ever-works/ui test --run` before committing AC #7's
  number.

## Dependencies

- `@playwright/experimental-ct-react` (already installed, iteration 104)
- `playwright.ct.config.ts` (already configured, iteration 107)
- `packages/ui/scripts/test-per-file.ts` `__tests__/ct/` skip (already in
  place since iteration 107) — no edits needed.
- No new npm dependencies.

## References

- `docs/plans/q22-playwright-ct.md` — original Q22 plan (Step 4 — port
  remaining cases — generalised to all CT migrations)
- `docs/architecture/testing-runners.md` — decision matrix and translation
  conventions
- `docs/questions.md` Q22 / Q23 — the two prior CT migrations
- `docs/log.md` iterations 105 / 107 — execution patterns
- `packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx` — first CT test (16
  cases)
- `packages/ui/src/__tests__/ct/layout-switcher.ct.test.tsx` — second CT test
  (12 cases)
- `packages/ui/src/__tests__/preact/mobile-menu.test.tsx` — file under
  migration (14 cases — counted manually iteration 108)

## AGENTS.md cross-check (R1–R15)

- **R1 (TypeScript only):** new test file is `.tsx`; no JS/Python.
- **R2 (No DB), R3 (No auth), R4 (No payments):** N/A — test-only change.
- **R5 (ISR by default):** N/A — test-only change.
- **R6 (Plugin everything):** N/A — `MobileMenu` is a UI component, not a
  plugin candidate.
- **R7 (Git-first data):** N/A.
- **R8 (Extreme performance):** CT walltime budget <90s for 42 cases (AC #2)
  is in line with the iteration-107 baseline of ~60s for 28 cases.
- **R9 (Modular & replaceable):** the test runs against the public
  `default` export of `MobileMenu`; no internals coupling.
- **R10 (AI-optimized):** the new test file gets the same inline preamble
  block as `layout-switcher.ct.test.tsx`, documenting the translation table
  and the MobileMenu-specific deviations (D1–D5).
- **R11 (Convention over configuration):** zero new env vars or build flags.
- **R12 (Monorepo structure):** test lives in `packages/ui/src/__tests__/ct/`,
  matching the existing CT directory.
- **R13 (Exhaustive documentation):** this spec + plan + log entry +
  questions.md update + index.md update + testing.md AC update.
- **R14 (Convention):** uses the same `test.describe`/`test()` block
  structure as the prior 2 CT files; same `import` statements; same
  serialization pattern for callback props (none needed for `MobileMenu`).
- **R15 (Replace, don't remove):** the Vitest file is **deleted** because
  the CT file replaces it functionally — this is a *replace* not a *remove*.
  All 14 test semantics are preserved in the CT file.
