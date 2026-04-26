---
title: "Q22 follow-up #1 — Preemptive MobileMenu CT migration"
sidebar_label: "Q22 follow-up #1 — MobileMenu CT"
---

# Q22 follow-up #1 — Preemptive MobileMenu CT migration

> **Spec:** [`.specify/features/q22-mobilemenu-ct.md`](../../.specify/features/q22-mobilemenu-ct.md)
> **Status:** PLANNED (iteration 108, 2026-04-27). Pending implementation in
> the same iteration.
> **Iterations referenced:** 105 (Q22 / `FilterBar`), 107 (Q23 / `LayoutSwitcher`).

## Why

The Q22 / Q23 fingerprint (jsdom + Preact + Node 24 IPC worker crash) has
already taken down two `@ever-works/ui` Preact tests. `MobileMenu` shares the
same risk profile:

| Risk attribute                         | `FilterBar` | `LayoutSwitcher` | `MobileMenu` |
|----------------------------------------|-------------|------------------|--------------|
| Multiple `useEffect`                   | ✅          | ✅               | ✅ (4)        |
| `useEffect` with `localStorage`        | ❌          | ✅               | ❌            |
| `useEffect` with `document` listeners  | ❌          | ❌               | ✅ (3)        |
| Conditional remount (state-driven)     | ❌          | ❌               | ✅ (panel)    |
| Body / global DOM mutation             | ❌          | ❌               | ✅ (overflow) |
| Focus management                       | ❌          | ❌               | ✅            |
| Original Vitest test status            | broken      | broken           | passing      |

`MobileMenu` is the **most interaction-heavy** Preact component still living
in Vitest. If a Q22-shape regression hits, this is the most likely next
victim. Preemptive migration:

- Defuses the regression risk before it surfaces.
- Validates the Q22 playbook against a richer surface (document listeners,
  scroll lock, focus return, conditional remount).
- Continues the deprecation arc for `pnpm test:ui:safe` (Q22 follow-up #2,
  unblocked iteration 107). With `MobileMenu` migrated, only render-only and
  state-only Preact tests remain — none of them have document-level listeners,
  the apparent root signature of the Q22 fingerprint.

## Steps

### Step 1 — Author the CT test file

Path: `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`.

Translation table (from
[`docs/architecture/testing-runners.md`](../architecture/testing-runners.md)
plus the `MobileMenu`-specific deviations D1–D5 in the spec):

| Vitest pattern                                                | Playwright CT pattern                                            |
|---------------------------------------------------------------|------------------------------------------------------------------|
| `render(<MobileMenu />)`                                       | `await mount(<MobileMenu />)` (returns `Locator`)                |
| `screen.getByLabelText('Open menu')`                          | `component.getByLabel('Open menu')`                              |
| `screen.getByText('Home')`                                    | `component.getByText('Home')`                                    |
| `container.querySelector('[data-component="mobile-menu"]')`   | mount-root `await expect(component).toHaveAttribute(...)`        |
| `container.querySelector('[data-part="panel"]')` is null       | `await expect(component.locator('[data-part="panel"]')).toHaveCount(0)` |
| `container.querySelector('[data-part="panel"]')` is truthy     | `await expect(component.locator('[data-part="panel"]')).toBeVisible()` |
| `fireEvent.click(el)`                                          | `await locator.click()`                                          |
| `fireEvent.keyDown(document, { key: 'Escape' })`               | `await page.keyboard.press('Escape')`                            |
| `fireEvent.keyDown(document, { key: 'Tab' })`                  | `await page.keyboard.press('Tab')`                               |
| `document.body.style.overflow === 'hidden'`                    | `await page.evaluate(() => document.body.style.overflow)` then assert |
| `getByTestId('outside')` (wrapped mount)                       | mount the same wrapper; `component.getByTestId('outside')`       |
| `expect(button.getAttribute('aria-expanded')).toBe('false')`   | `await expect(button).toHaveAttribute('aria-expanded', 'false')` |

The 14 cases (verbatim from `mobile-menu.test.tsx`):

1. renders with data-component attribute
2. renders toggle button
3. menu is closed by default
4. opens menu on button click
5. renders all nav links when open
6. closes menu on second toggle click
7. closes menu on Escape key
8. does not close menu on non-Escape key
9. locks body scroll when open
10. unlocks body scroll when closed
11. sets aria-expanded on toggle button
12. has correct nav link hrefs
13. has mobile navigation aria-label on panel
14. closes menu on click outside
   _(plus a 15th one in the file — "does not close menu when clicking inside" — actually 15 cases total, will recount in Step 1.)_

Re-count cases at authoring time. The original file is short enough that
manual counting is reliable. Use whatever the file actually contains.

### Step 2 — Vitest config: coverage.exclude

Edit `packages/ui/vitest.config.ts`:

```diff
 exclude: [
     'src/**/__tests__/**',
     'src/**/*.test.{ts,tsx}',
     'src/preact/FilterBar.tsx',
     'src/preact/LayoutSwitcher.tsx',
+    'src/preact/MobileMenu.tsx',
 ],
```

The comment above the array (already in place since iteration 107) generalises
to N exclusions; the comment text itself does **not** need to be amended each
time a new component migrates. Leave the comment alone unless its content
becomes stale.

### Step 3 — Delete the Vitest test file

`rm packages/ui/src/__tests__/preact/mobile-menu.test.tsx`. The CT file is the
canonical source of test semantics for `MobileMenu` from this iteration onward.

### Step 4 — Run the verification matrix

```bash
# CT: must report 42 passed (16 + 12 + 14)
pnpm --filter @ever-works/ui test:ct

# Per-file UI runner: must report 11/11 files passing (was 12/12)
pnpm test:ui:safe

# Full-monorepo gates:
pnpm typecheck     # 23/23 successful
pnpm lint          # 18/18 successful

# CT-specific typecheck:
pnpm --filter @ever-works/ui typecheck:ct
```

If any of the above fails, **do not** commit. Diagnose, fix, re-run. Possible
failure modes:

- **`page.keyboard.press('Escape')` does not reach the document listener.**
  Diagnose with `page.evaluate(() => document.activeElement?.tagName)`. If
  focus is on `<body>` and the listener is on `document`, the keydown should
  bubble. If not, fall back to
  `page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))`.
- **Click-outside test wrapper fails.** Make sure the wrapper itself does NOT
  have `pointer-events: none` from any global CSS (the CT host page has minimal
  CSS, so this is unlikely). The `outside` div has no styling, so a real
  click should reach `document`.
- **Focus-return assertion flakes.** If `await expect(toggleButton).toBeFocused()`
  fails intermittently, drop the assertion (cf. R1 in the spec) and document
  the deviation in the iteration log.

### Step 5 — Documentation updates

#### `.specify/features/testing.md`

- AC #10 — update the test count line to reflect the new
  Vitest-cases-after-removal + 42 CT cases. Re-count Vitest cases locally first.
- AC #12 — extend the "migrated to CT" list from 2 components to 3.

#### `docs/architecture/testing-runners.md`

- Add `MobileMenu` to the "Currently migrated" list.
- Mention the document-level listener pattern in the "When CT > Vitest"
  guidance (this is the first migrated component with that pattern).
- No changes to the decision tree — the existing "real-browser interaction"
  branch already covers this.

#### `docs/questions.md`

- Q22 follow-up list — mark **#1 (preemptive `MobileMenu` migration) as ✅
  COMPLETE in iteration 108**.

#### `docs/log.md`

- Add a new "## 2026-04-27 — Iteration 108" section near the top.
- Headline: `pnpm test:ct` reports 42 passed (was 28). MobileMenu CT
  migrated. Q22 follow-up #1 closed.
- Files-changed table.
- Status-flips list.
- Remaining follow-ups list (#2, #3, CI matrix observation).

#### `docs/index.md`

- Update the iteration-107 descriptor block at the top to a summary of
  iteration 108 (full CT count, follow-up #1 closed).
- Add `[plans/q22-mobilemenu-ct.md]` and
  `[features/q22-mobilemenu-ct.md]` rows to the Plans / Spec Kit sections.

#### `CLAUDE.md`

No edits expected — the high-level commands and architecture are unchanged.

#### `AGENTS.md`

No edits expected — the rules R1–R15 are unaffected by a CT migration.

### Step 6 — CI verification (observation only)

Same posture as the iteration-105 CI matrix: the next push to the default
branch will run the existing `test-ct` job on `os: [ubuntu-latest, windows-latest]`
and pick up the new `mobile-menu.ct.test.tsx` automatically. No workflow
edits needed. If `windows-latest` goes red on a `MobileMenu` test, file a
follow-up question.

## Rollback

If Step 4 fails irrecoverably:

1. Revert the deletion of `packages/ui/src/__tests__/preact/mobile-menu.test.tsx`
   (it should still be in `git stash` or local history).
2. Drop `'src/preact/MobileMenu.tsx'` from `vitest.config.ts` `coverage.exclude`.
3. Drop the new `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx` file.
4. Open a new question (Q24) describing the failure mode and the diagnostic
   data captured.
5. Document the rollback in `docs/log.md` for the iteration.

This rollback is fully local and does not require a force-push or amended
commit. Total file count touched: 4. The CT runner remains 28-case green.

## Out of scope (re-stated)

- Restoring `MobileMenu` to V8 coverage (deferred to follow-up #3).
- Refactoring `MobileMenu.tsx`. If a real bug is discovered (cf. iteration 105
  `EMPTY_TAGS`), fix it in-line; do **not** start with a refactor.
- Adding new tests beyond the 14/15 the original file ships. The migration is
  scope-faithful by default. New coverage is a separate iteration's work.

## File list (touched)

| File                                                                          | Action  |
|-------------------------------------------------------------------------------|---------|
| `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`                        | CREATE  |
| `packages/ui/src/__tests__/preact/mobile-menu.test.tsx`                       | DELETE  |
| `packages/ui/vitest.config.ts`                                                | EDIT    |
| `.specify/features/q22-mobilemenu-ct.md`                                      | CREATE  (this iteration's spec) |
| `.specify/features/testing.md`                                                | EDIT    (AC #10, AC #12)        |
| `docs/plans/q22-mobilemenu-ct.md`                                             | CREATE  (this file)             |
| `docs/architecture/testing-runners.md`                                        | EDIT    (migrated-list)         |
| `docs/questions.md`                                                           | EDIT    (Q22 follow-up #1 status)|
| `docs/log.md`                                                                 | EDIT    (iteration 108 entry)    |
| `docs/index.md`                                                               | EDIT    (iteration descriptor + new spec/plan rows) |

## Cross-reference

- Spec: `.specify/features/q22-mobilemenu-ct.md` (this iteration)
- Q22 spec: `.specify/features/q22-playwright-ct.md`
- Q22 plan: `docs/plans/q22-playwright-ct.md`
- Decision matrix: `docs/architecture/testing-runners.md`
- Prior CT migrations:
  - `packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx` (iteration 105)
  - `packages/ui/src/__tests__/ct/layout-switcher.ct.test.tsx` (iteration 107)
