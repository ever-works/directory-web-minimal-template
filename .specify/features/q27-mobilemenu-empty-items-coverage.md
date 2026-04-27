# Feature: Q27 — `MobileMenu` 3-branch outlier coverage closure

> **Status: ✅ RESOLVED (iteration 124, 2026-04-27).** Three CT tests
> + one v8-ignore pragma closed the entire 3-branch outlier plus the
> defensive race-guard. Final per-file MobileMenu: **100% branches
> (35/35)**. Final per-package aggregate: **100% branches (233/233)**,
> functions 100%, lines 99.76%, statements 99.72% across 19 files.
> Default Option A.1 (synthetic Tab dispatch via `page.evaluate`)
> worked for B1 / B2 / B3; Option A.3 (`/* v8 ignore next */` pragma)
> closed an additional defensive race-guard branch that was not in
> the original 3-branch list but surfaced during execution. See the
> Q27 entry in `docs/questions.md` for the full execution trail and
> `docs/log.md` iteration 124 for verification numbers.

## Description

After iteration 120 added two focus-trap CT tests (Tab-from-last and
Shift+Tab-from-first), `packages/ui/src/preact/MobileMenu.tsx` rose
from **67.57% (25/37) → 91.89% (34/37) branches** in the merged V8+CT
report. The 3 remaining uncovered branches all live in the focus-trap
`useEffect` (lines 69-95 of `MobileMenu.tsx`):

```tsx
useEffect(() => {
  if (!isOpen) return;
  const menuEl = menuRef.current;
  if (!menuEl) return;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusable = menuEl.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;          // ← B1: TRUE branch uncovered
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    // ← B2 + B3: implicit fall-through (Tab in middle of menu, not at
    //   either boundary) — both `if`/`else if` clauses FALSE
  };

  document.addEventListener('keydown', handleTab);
  return () => {
    document.removeEventListener('keydown', handleTab);
  };
}, [isOpen]);
```

The 3 outlier branches:

1. **B1 — `if (focusable.length === 0) return;` TRUE branch.** Fires when
   the panel renders but contains no focusable elements (e.g.
   `<MobileMenu items={[]} />`). The iteration 120 attempt to reach
   this branch via `<MobileMenu items={[]} />` reproduced an
   unrelated CT-host-page focus-attribution edge case where the panel
   becomes `hidden` post-mount; the test was deferred with an inline
   comment in `mobile-menu.ct.test.tsx` (lines 254-264).
2. **B2 — `if (e.shiftKey && ...)` short-circuit FALSE on the
   `e.shiftKey` term.** This branch is taken when a forward Tab fires
   while focus is on the FIRST nav link (not the last). The
   `e.shiftKey` term is `false`, the `&&` short-circuits, the outer
   `if` is `false`, control falls into the `else if`.
3. **B3 — `else if (!e.shiftKey && ...)` short-circuit FALSE on the
   activeElement term.** This branch is taken when a forward Tab fires
   while focus is on the FIRST nav link: `!e.shiftKey === true`, but
   `document.activeElement === last` is `false`, the `&&`
   short-circuits, both `if` clauses are `false`, control falls
   through and the browser's native Tab behavior runs.

(Branch numbering is illustrative — the V8 instrumentation reports
short-circuit operands as separate branches; the exact branch IDs
are visible in `coverage/merged/coverage-report.json`'s per-byte
ranges.)

## Why this is not blocking

- Aggregate merged coverage is **98.72% branches (232/235)** — well
  above any reasonable industry gate.
- `MobileMenu.tsx` per-file is **91.89% (34/37)** — well above the
  Phase 6c hard-fail gate threshold of 80%.
- The merge pipeline + CI gate (`packages/ui/scripts/coverage-merge.ts`
  + `.github/workflows/ci.yml` `coverage-gate` job) protects against
  regression below 80% per file. The remaining 3-branch shortfall is a
  *ceiling* opportunity, not a *floor* risk.
- All three uncovered branches are defensive paths that exercise
  correctly in production (focus trap with empty panel, forward Tab
  from first, forward Tab in the middle of the menu) — the absence of
  CT coverage does not imply the code is broken.

This question is therefore opened as a *quality* improvement, not a
*correctness* gate. Closing it lifts the per-file MobileMenu number to
~100% and the aggregate to ~99.6%, but every iteration ahead of it can
ship without it.

## User Stories

- As a **maintainer**, I want every branch in the focus-trap `useEffect`
  exercised by a deterministic CT test so that future refactors of
  `MobileMenu.tsx` do not silently regress accessibility behavior.
- As an **AI agent**, I want the merged coverage report to read
  ~100% per-file for `MobileMenu.tsx` so that "100% covered" is
  semantically true (no asterisks for "except for the 3 defensive
  branches we couldn't reach").
- As a **reviewer**, I want the iteration 120 inline-deferral comment
  in `mobile-menu.ct.test.tsx` (lines 254-264) replaced with an actual
  test (and the comment removed) so the test file does not carry a
  permanent "TODO" marker.

## Acceptance Criteria

1. **AC #1 — B1 covered or formally excluded.** Either (a) a CT test
   covers the `focusable.length === 0` early-return branch via one of
   the proposed mechanisms (Option A.1 / A.2 / A.3 below), OR (b) a
   `/* v8 ignore next */` directive (or monocart-equivalent — verify
   the syntax against monocart-coverage-reports@^2.12.9 docs before
   landing) is added on line 79 with a JSDoc-style comment explaining
   why the branch is unreachable from the CT host page. Either path
   satisfies AC #1; the spec defaults to (a).
2. **AC #2 — B2 + B3 covered.** A new CT test for "Tab in middle of
   menu (not at boundaries) does not preventDefault" exercises both
   the `e.shiftKey` short-circuit FALSE path AND the
   `document.activeElement === last` FALSE path. The test:
   - Mounts `<MobileMenu items={items} />` with the existing 3-item
     fixture (Home / Categories / Tags).
   - Opens the menu via toggle click.
   - Focuses the MIDDLE nav link (Categories — index 1 in a 3-link
     list).
   - Presses `Tab` (no Shift modifier).
   - Asserts that focus moves naturally to the next focusable element
     in document order (NOT wrapped to first; NOT held on Categories).
     Acceptable assertions: focus is no longer on Categories, OR focus
     is on whatever the browser's natural next-Tab target is (likely
     `Tags` if the panel still has focusable children after Categories,
     or an element outside the panel — the test should NOT assert on
     the exact target since that depends on host-page DOM, only that
     `preventDefault` was NOT called).

   Implementation hint: the safest assertion is to verify the panel
   stays open AND focus moves OFF Categories. We do not need to assert
   the precise target.

3. **AC #3 — Merged coverage rises to ~100% MobileMenu / ~99.6%
   aggregate.** After both tests land:
   - `packages/ui/src/preact/MobileMenu.tsx` reports **≥97% branches**
     in `coverage/merged/coverage-report.json` (37/37 if both AC #1
     and AC #2 land via real tests; 36/37 if AC #1 lands via
     v8-ignore directive — the directive removes B1 from the
     denominator).
   - Aggregate merged report reports **≥99.4% branches** across the
     same 19 files as iteration 121 (≥234/235 if both land via tests;
     ≥234/234 if AC #1 lands via v8-ignore).
4. **AC #4 — Phase 6c gate stays green.** Running `pnpm coverage`
   end-to-end exits with code 0; the per-file gate
   (`coverage-merge.ts` `GATE_TARGETS` allow-list, `GATE_THRESHOLD =
   80`) reports all three migrated components ≥80% (FilterBar 100%,
   LayoutSwitcher 100%, MobileMenu ≥97%). No threshold lift required.
5. **AC #5 — CT suite stays deterministic.** Running
   `pnpm --filter @ever-works/ui test:ct` reports **45+N passed**
   (where N is the number of new tests added: 1 for AC #2 alone, 2 if
   AC #1 also lands via real test) in **2 of 2 consecutive runs** on
   Windows + Node 24.x + Chromium 147+. No new flakes; the CT-flake
   watch (carried from iteration 111, currently 1/3) is not affected.
6. **AC #6 — Inline deferral comment removed.** The note at lines
   254-264 of `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`
   ("a third test for ... is intentionally omitted ...") is replaced
   by the new test(s) plus a one-line citation pointing at this spec
   so a future reader can find the closure decision.
7. **AC #7 — Typecheck and lint clean.** `pnpm typecheck` reports
   23/23 successful, 0 errors. `pnpm lint` reports 18/18 successful,
   0 errors.
8. **AC #8 — Q27 status flips.** `docs/questions.md` Q27 status
   changes from `OPEN — Option X chosen` to `✅ RESOLVED in iteration
   N` with the verification numbers inline.
9. **AC #9 — Iteration log entry.** `docs/log.md` gets a new section
   documenting the source/test diff, verification numbers, and the
   per-file delta (B1 / B2 / B3 closure breakdown).

## Options for B1 (the empty-items branch)

The iteration 120 attempt to mount `<MobileMenu items={[]} />` and
press Tab failed with the panel becoming `hidden` post-mount. Three
candidate mechanisms to close B1, each with tradeoffs:

### Option A.1 — Synthetic Tab dispatch via `page.evaluate` (NO source change)

Mount `<MobileMenu items={[]} />`, click toggle to set `isOpen=true`,
wait for the panel to render, then dispatch a synthetic `keydown`
event directly via `page.evaluate`:

```ts
test('focus trap: empty items - Tab does nothing (focusable.length === 0)', async ({ mount, page }) => {
  const component = await mount(<MobileMenu items={[]} />);
  await component.getByLabel('Open menu').click();
  await expect(component.locator('[data-part="panel"]')).toBeVisible();
  // Dispatch the Tab keydown directly to document — this exercises the
  // focus-trap useEffect handler without going through the host page's
  // focus-tracking machinery (which interferes with empty-panel cases).
  const wasPrevented = await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return event.defaultPrevented;
  });
  // focusable.length === 0 → handler returns early → defaultPrevented stays false
  expect(wasPrevented).toBe(false);
  // Panel still visible (no close-on-Tab behavior in MobileMenu).
  await expect(component.locator('[data-part="panel"]')).toBeVisible();
});
```

**Pros**: zero source changes; bypasses the host-page focus-attribution
race that blocked iteration 120's natural-`page.keyboard.press('Tab')`
attempt; same `KeyboardEvent` shape that the production focus-trap
listens for.

**Cons**: `event.defaultPrevented` indirectly verifies the early return
(the handler's *only* observable behavior when `focusable.length === 0`
is "did nothing"); a future rewrite of `handleTab` that adds a side
effect for the empty case would not regress this test. Mitigation: also
assert the panel stays open AND focus state is unchanged
(`document.activeElement === <toggle button>` before and after).

**Risk**: if monocart's V8 instrumentation requires the keydown to
travel through the browser's native event loop (not just
`dispatchEvent`), the branch may not register as covered. Mitigation:
verify via a smoke run before landing — if the merged report still
shows `focusable.length === 0` as uncovered, fall back to A.2 or A.3.

`[DEFAULT]`

### Option A.2 — Render with a non-anchor child that has no focusable elements

Sidesteps the iteration 120 race by NOT triggering the click-outside
listener. Mount the panel directly via a controlled-state wrapper:

```tsx
function ControlledMobileMenu() {
  return <MobileMenu items={[]} />;
  // ... + a way to force isOpen=true without a click ...
}
```

But `MobileMenu`'s `isOpen` is internal state with no controlled API.
This option requires either (a) lifting `isOpen` into a prop
(behavior-changing API surface — out of scope for a coverage fix), OR
(b) using `page.evaluate` to call `__preact_state.setIsOpen(true)`
directly (fragile, internal-API coupling).

**Verdict**: rejected. Option A.1 reaches the same branch with no
source change.

### Option A.3 — Add a v8-ignore directive on the early-return line

```tsx
// v8 ignore next — empty-items focus-trap early return is unreachable from CT host
if (focusable.length === 0) return;
```

Verify the syntax against monocart-coverage-reports docs first;
candidates include `/* v8 ignore next */`, `/* c8 ignore next */`,
or `// istanbul ignore next` (monocart inherits Istanbul-compat
directives via the Istanbul fallback adapter, but our pipeline now
runs pure V8 — verify support).

**Pros**: zero new tests, zero new dispatch surface to maintain.

**Cons**: removes the branch from the denominator entirely (so
"covered" becomes meaningless for that line); future regressions to
the early-return condition (e.g. someone changes `=== 0` to `< 0` and
the early return never fires) would not be caught.

**Verdict**: contingency. Use only if Option A.1 fails its smoke test.

## Options for B2 + B3 (non-boundary Tab)

Only one realistic option, which is also the cleanest. See AC #2 for
the test shape. There is no source-side fix for B2/B3 — they are
genuine fall-through branches that need a real Tab event from the
middle of the focusable list to exercise.

## Defaults

| Branch | Default option | Fallback |
|--------|---------------|----------|
| B1 (empty-items early return) | **A.1** — synthetic Tab dispatch via `page.evaluate` | A.3 — v8-ignore directive (only if A.1 smoke fails) |
| B2 + B3 (non-boundary Tab) | **AC #2** — natural test with focus on middle nav link | none — there is no other path |

## Out of scope

- **Refactoring `MobileMenu.tsx` focus trap.** The handler structure
  (`if (e.shiftKey && ...) { ... } else if (!e.shiftKey && ...) { ... }`)
  is correct and idiomatic; no rewrite needed. Splitting into named
  helpers would not change the branch shape.
- **Adding a controlled-state API to MobileMenu** (`isOpen` /
  `onOpenChange` props). Out of scope for a coverage fix.
- **Auditing other components for similar branch outliers.** The merge
  pipeline reports the gap at file granularity; if `FilterBar` or
  `LayoutSwitcher` ever drops below 100% (they're at 100% as of
  iteration 121), open separate questions.
- **CT-flake watch (Q26 candidate carry from iteration 111).** Tracked
  separately. This question does not change the watch count.

## Risks

- **R1 — Option A.1's `dispatchEvent` may not register V8 coverage.**
  Mitigation: smoke-test in a single CT file before landing the full
  spec implementation. If the merged report still shows the branch
  uncovered after the test passes, fall back to Option A.3.
- **R2 — A future refactor of `handleTab` could break the synthetic
  dispatch test silently** (e.g. switching from a `document` listener
  to a `menuEl` listener — `dispatchEvent` on document would no longer
  trigger). Mitigation: the test asserts on `event.defaultPrevented`
  AND panel-stays-open, and the production focus-trap behavior is
  also asserted by the existing Tab-from-last and Shift+Tab-from-first
  tests. Cross-coverage from the natural tests catches the listener-
  target regression even if the synthetic test passes by mistake.
- **R3 — Coverage-merge gate threshold lift not needed.** The Phase 6c
  hard gate is `≥80%` per file. MobileMenu at 91.89% already passes;
  this fix lifts it to ~97-100%. No `GATE_THRESHOLD` edit required;
  if a future iteration wants to formalize "100% per migrated
  component", that is a separate Q.
- **R4 — Q27 spec-only authorship may bit-rot.** If 6+ months pass
  before implementation, re-verify monocart-coverage-reports' v8-ignore
  directive support and Playwright's `page.evaluate` keyboard-event
  semantics. The B1/B2/B3 branch shape itself is stable (no plans to
  refactor MobileMenu's focus trap).

## Dependencies

- No new npm dependencies.
- No CI workflow changes.
- No environment variable changes.
- No source-side changes if Option A.1 holds (default path); a single
  source-side comment line if Option A.3 fallback is needed.

## References

- `packages/ui/src/preact/MobileMenu.tsx` (lines 69-95) — the
  focus-trap `useEffect` whose 3 branches this spec closes.
- `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx` (lines
  217-264) — existing iteration 120 focus-trap tests + the
  inline-deferral comment to be replaced.
- `packages/ui/scripts/coverage-merge.ts` — per-file gate enforcement
  (Phase 6c, iteration 121).
- `.specify/features/q22-playwright-coverage.md` — parent Q22
  follow-up #3 spec (✅ RESOLVED iteration 121).
- `docs/plans/q22-playwright-coverage.md` — parent execution plan
  (Phases 0-6d ✅ DONE).
- `docs/log.md` iteration 120 — focus-trap test addition (B1
  attempt deferred).
- `docs/log.md` iteration 121 — CI gate hard-fail flip (Phase 6c).
- `docs/log.md` iteration 122 — Q22 saga close + iteration 122
  "Next Steps" section (where the MobileMenu 3-branch outlier was
  first carried as a future opportunity).

## AGENTS.md cross-check (R1–R15)

- **R1 (TypeScript only):** new test in `.tsx`; if Option A.3
  fallback fires, comment in `.tsx`. No JS/Python.
- **R2/R3/R4:** N/A (no DB, auth, payments).
- **R5 (ISR by default):** N/A — test/coverage layer.
- **R6 (Plugin everything):** N/A — `MobileMenu` is a UI component
  in `@ever-works/ui` (core), not a plugin.
- **R7 (Git-first data):** N/A.
- **R8 (Extreme performance):** new test runs in <2s on Windows +
  Chromium; no production-code change in the default path. Net-zero
  performance impact.
- **R9 (Modular & replaceable):** test is co-located with existing
  CT tests in `packages/ui/src/__tests__/ct/`; no public API change.
- **R10 (AI-optimized):** the spec documents WHY each branch is
  uncovered, what each option's tradeoffs are, and which fallback
  fires under which condition — future AI agents reading this can
  execute without re-deriving the diagnostic chain.
- **R11 (Convention over configuration):** zero new env vars or
  build flags.
- **R12 (Monorepo structure):** all edits in
  `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx` (and
  optionally `packages/ui/src/preact/MobileMenu.tsx` if A.3 fires).
- **R13 (Exhaustive documentation):** spec + plan + log entry +
  Q27 status flip + iteration descriptor in `docs/index.md` are all
  scheduled for the implementation iteration.
- **R14 (Convention):** new test mirrors the iteration 120 focus-trap
  test conventions exactly (same fixture import, same describe block,
  same `mount()` + `getByLabel('Open menu').click()` setup, same
  inline `// ─── Focus trap ...` section header).
- **R15 (Replace, don't remove):** the inline-deferral comment block
  (lines 254-264 of `mobile-menu.ct.test.tsx`) is REPLACED by the
  new tests + a 1-line back-reference. Not deleted.
