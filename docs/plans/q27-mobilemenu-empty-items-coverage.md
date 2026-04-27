---
title: "Q27 — MobileMenu 3-branch outlier coverage closure"
sidebar_label: "Q27 — MobileMenu coverage"
---

# Q27 — `MobileMenu` 3-branch outlier coverage closure

> **Spec:** [`.specify/features/q27-mobilemenu-empty-items-coverage.md`](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q27-mobilemenu-empty-items-coverage.md)
> **Status:** PLANNED (iteration 123, 2026-04-27).
> **Iterations referenced:** 105 (Q22 / FilterBar CT migration), 108
> (MobileMenu CT migration), 119 (Phase 6b — Vitest+CT V8 merge live;
> 12-branch MobileMenu shortfall surfaced), 120 (focus-trap CT tests
> closed 9 of 12 branches; B1 attempt deferred), 121 (Phase 6c CI
> hard-gate enforced), 122 (Q22 follow-up #3 fully ✅; this question
> opened as a carry).

## Why

After iteration 120's two focus-trap CT tests landed,
`packages/ui/src/preact/MobileMenu.tsx` rose from 67.57% (25/37) →
91.89% (34/37) branches. The remaining 3-branch shortfall lives
entirely in the focus-trap `useEffect` (lines 69-95):

| Branch | Location | Trigger condition |
|--------|----------|-------------------|
| B1 | line 79 `if (focusable.length === 0) return;` | Empty panel + Tab keydown |
| B2 | line 82 `if (e.shiftKey && ...)` short-circuit | Forward Tab from first nav link |
| B3 | line 85 `else if (!e.shiftKey && ...)` short-circuit | Forward Tab from a non-boundary nav link |

(Branch indices are illustrative; V8 reports short-circuit operands
as separate branches and the exact V8 IDs are visible per-byte in
`coverage/merged/coverage-report.json`.)

The aggregate merged coverage is **98.72% (232/235) branches**, the
per-file gate (≥80%) PASSES for all three migrated components, and
CI's `coverage-gate` job is green — this work lifts a *ceiling* number,
it does not unblock anything. Schedule accordingly.

## Steps

### Step 0 — Smoke-test Option A.1 (synthetic Tab dispatch)

Before authoring the full B1 test, verify monocart-coverage-reports
attributes a `dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))`
keydown to V8 coverage on the focus-trap handler.

In a scratch CT file (e.g. `packages/ui/src/__tests__/ct/scratch-q27.ct.test.tsx`,
gitignored under the existing `packages/ui/.gitignore` `scratch/` rule
once the file is moved into a `scratch/` subdir, OR cleaned up at end
of phase per Q25/Q26 convention):

```ts
test('SMOKE: synthetic Tab dispatch reaches handleTab', async ({ mount, page }) => {
  const component = await mount(<MobileMenu items={[]} />);
  await component.getByLabel('Open menu').click();
  await expect(component.locator('[data-part="panel"]')).toBeVisible();
  const beforeFocus = await page.evaluate(() => document.activeElement?.tagName ?? '');
  const wasPrevented = await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(wasPrevented).toBe(false);
  const afterFocus = await page.evaluate(() => document.activeElement?.tagName ?? '');
  expect(afterFocus).toBe(beforeFocus); // empty panel → focus unchanged
});
```

Run:

```bash
cd packages/ui
pnpm exec playwright test --config=playwright.ct.config.ts \
  src/__tests__/ct/scratch-q27.ct.test.tsx
```

Expected: 1/1 pass. Then run `pnpm coverage` and inspect
`coverage/merged/coverage-report.json` for
`packages/ui/src/preact/MobileMenu.tsx`. If the `focusable.length === 0`
early-return is now reported as covered (per-byte `count > 0` on the
`return` keyword's V8 range), Option A.1 is viable — proceed to Step 1.

If the branch is STILL uncovered, fall back to Option A.3:

- Add `/* v8 ignore next */` (or the monocart-equivalent — verify in
  monocart-coverage-reports@^2.12.9 docs/source first; check
  `node_modules/monocart-coverage-reports/lib/converter/` for
  ignore-pragma support) directly above line 79 in `MobileMenu.tsx`.
- Document the chosen pragma syntax in a code comment AND in the
  iteration log.
- Re-run `pnpm coverage` and verify B1 drops out of the denominator
  (per-file branches becomes 36/36 = 100% if B1 was the only ignore;
  or stays at the current 34 numerator with a 36 denominator,
  resolving to 94.44% if B2/B3 also need to be exercised separately).

Delete the scratch CT file at end of Step 0 (per Q25 / Q26 convention,
the scratch dir is transient).

### Step 1 — Land the empty-items B1 test

Replace the inline-deferral comment (lines 254-264 of
`packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`) with the smoke-
verified test from Step 0:

```diff
-    // NOTE: a third test for "Tab when panel has no focusable elements"
-    // (which would exercise `if (focusable.length === 0) return;` on line
-    // 79 of MobileMenu.tsx) is intentionally omitted. Mounting
-    // `<MobileMenu items={[]} />` and clicking the toggle reproduces a
-    // click-outside / focus-attribution edge case in the CT host page
-    // where the panel becomes `hidden` post-mount, breaking the test
-    // setup (verified iteration 120). The focus-trap forward/backward
-    // wrap tests above already exercise the main 12-branch shortfall;
-    // the early-return path is a 1-branch outlier deferred to a future
-    // iteration that adds an `aria-hidden` panel-visibility guard or
-    // dedicated empty-items rendering.
-});
+    // ─── Focus trap empty-items branch (Q27 — iteration N).
+    // Synthesizes the Tab keydown via `page.evaluate` to bypass the
+    // CT host-page focus-attribution race that blocked iteration 120's
+    // natural `page.keyboard.press('Tab')` attempt. See
+    // `.specify/features/q27-mobilemenu-empty-items-coverage.md`
+    // Option A.1 for the full diagnostic chain.
+    test('focus trap: empty items - Tab does nothing (focusable.length === 0)', async ({
+        mount,
+        page,
+    }) => {
+        const component = await mount(<MobileMenu items={[]} />);
+        await component.getByLabel('Open menu').click();
+        await expect(component.locator('[data-part="panel"]')).toBeVisible();
+        // Synthesize Tab via dispatchEvent: bypasses host-page focus
+        // tracking, exercises handleTab's `focusable.length === 0`
+        // early-return branch.
+        const wasPrevented = await page.evaluate(() => {
+            const event = new KeyboardEvent('keydown', {
+                key: 'Tab',
+                bubbles: true,
+                cancelable: true,
+            });
+            document.dispatchEvent(event);
+            return event.defaultPrevented;
+        });
+        // Empty panel → handleTab returns early → defaultPrevented stays false.
+        expect(wasPrevented).toBe(false);
+        await expect(component.locator('[data-part="panel"]')).toBeVisible();
+    });
+});
```

If Step 0's smoke-test fell back to Option A.3, this step becomes
"add the v8-ignore pragma to `MobileMenu.tsx` line 79" instead, and
the inline-deferral comment is replaced with a 2-line cross-reference
to Q27 + the spec.

### Step 2 — Land the non-boundary Tab B2/B3 test

Append (after Step 1's test) to `mobile-menu.ct.test.tsx`:

```ts
test('focus trap: Tab on middle nav link does not preventDefault', async ({
    mount,
    page,
}) => {
    const component = await mount(<MobileMenu items={items} />);
    await component.getByLabel('Open menu').click();
    await expect(component.locator('[data-part="panel"]')).toBeVisible();
    // Focus the MIDDLE nav link (Categories — index 1 of 3). Forward Tab
    // from a non-boundary link must NOT trigger preventDefault — the
    // outer `if (e.shiftKey && ...)` short-circuits FALSE, the inner
    // `else if (!e.shiftKey && document.activeElement === last)` also
    // short-circuits FALSE, and control falls through to the browser's
    // native Tab behavior.
    const middleLink = component.getByText('Categories');
    await middleLink.focus();
    await expect(middleLink).toBeFocused();
    // Use synthetic dispatch (same as B1) so we can read defaultPrevented
    // — natural page.keyboard.press('Tab') would move focus and we'd
    // lose the cancellation signal.
    const wasPrevented = await page.evaluate(() => {
        const event = new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(event);
        return event.defaultPrevented;
    });
    // Non-boundary Tab → focus-trap does NOT preventDefault.
    expect(wasPrevented).toBe(false);
    // Panel still visible (Tab does not close the menu).
    await expect(component.locator('[data-part="panel"]')).toBeVisible();
});
```

The synthetic-dispatch convention is reused for the same reason as B1 —
asserting on `defaultPrevented` is the cleanest signal that the
focus-trap chose the fall-through path. The visible panel + unchanged
focus state are belt-and-suspenders assertions.

### Step 3 — Verify

```bash
# Run the new tests in isolation
cd packages/ui
pnpm exec playwright test --config=playwright.ct.config.ts \
  mobile-menu.ct.test.tsx
# Expected: 18/18 (or 19/19 if both B1 and B2/B3 land — 17 existing
# + 1 if A.3 fallback used + 1 for non-boundary, OR + 2 if A.1 holds)

# Run the full CT suite twice
pnpm test:ct
pnpm test:ct
# Expected: 47/47 (or 46/46) twice consecutively, no flakes

# Full coverage merge
cd ../..
pnpm coverage
# Expected:
#   - Aggregate branches ≥99.4% (≥234/235)
#   - MobileMenu.tsx ≥97% branches (37/37 or 36/36)
#   - All three GATE_TARGETS ≥80% (gate green, exit code 0)

# Full-monorepo gates
pnpm typecheck   # 23/23, 0 err
pnpm lint        # 18/18, 0 err
```

If Step 3 reports a regression (any flake, lower branches, gate fail),
roll back via `git checkout -- packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`
(and `packages/ui/src/preact/MobileMenu.tsx` if A.3 fired) and capture
the failure shape in a new section of `docs/questions.md` Q27 labelled
"Iteration N attempt did not stabilize". The fix can be revisited.

### Step 4 — Documentation updates

- `docs/questions.md` Q27 — status: `OPEN — Option A.1 chosen [DEFAULT]`
  → `✅ RESOLVED in iteration N` with the verification numbers inline.
  Append a "Iteration N execution" subsection mirroring the Q24
  pattern.
- `docs/log.md` — new "## 2026-04-27 — Iteration N" section near the
  top documenting:
  - Source/test diff (lines added/removed in `mobile-menu.ct.test.tsx`,
    optional pragma in `MobileMenu.tsx`).
  - Verification commands and outputs.
  - Per-branch closure breakdown (B1 / B2 / B3 each linked to the
    test that exercises it).
  - Whether Option A.1 held or A.3 fallback fired.
- `docs/index.md` — iteration descriptor bumped N → N+0; existing
  iteration 122 entry preserved as the next history block.
- `.specify/project.md` — Current State header bumped 122 → N;
  V8 coverage line updated with the new merged numbers.
- `.specify/features/q27-mobilemenu-empty-items-coverage.md` — front-
  matter status `SPECIFIED (iteration 123)` →
  `✅ RESOLVED (iteration N)` with the final per-file numbers.
- `docs/plans/q27-mobilemenu-empty-items-coverage.md` — append an
  "Outcome (iteration N)" subsection mirroring the Q22 follow-up #3
  Phase 6c/6d outcome blocks.

## File list (touched)

| File                                                                          | Action  |
|-------------------------------------------------------------------------------|---------|
| `packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`                         | EDIT (replace deferral comment with B1 + B2/B3 tests; + ~50 LOC) |
| `packages/ui/src/preact/MobileMenu.tsx`                                       | EDIT (only if Option A.3 fallback fires — single comment line) |
| `.specify/features/q27-mobilemenu-empty-items-coverage.md`                    | CREATE  (this iteration's spec; iteration 123) |
| `docs/plans/q27-mobilemenu-empty-items-coverage.md`                           | CREATE  (this file)                          |
| `docs/questions.md`                                                            | EDIT    (Q27 added in iteration 123; status flipped on execution iteration) |
| `docs/log.md`                                                                  | EDIT    (iteration 123 entry now; execution-iteration entry later) |
| `docs/index.md`                                                                | EDIT    (iteration descriptor + new spec/plan rows)               |
| `.specify/project.md`                                                          | EDIT    (Current State header bumped on each touch)               |

## Phase sequencing (likely iterations)

| Phase | Iteration | Effort | Risk |
|-------|-----------|--------|------|
| Spec + plan authorship (this) | 123 | ~30 min | Low (doc-only) |
| Step 0 (Option A.1 smoke test) | 124+ | ~20 min | Low (scratch dir, easy rollback) |
| Steps 1-2 (land B1 + B2/B3 tests) | 124-125+ | ~45 min | Low-Medium (CT runtime variance) |
| Step 3 (full verification) | same as 1-2 | ~10 min | Low |
| Step 4 (doc updates) | same as 1-2 | ~15 min | Low |

Total estimated effort to close: **1.5-2 hours across 1-2 future
iterations**. Single-iteration execution is feasible if Step 0's
smoke test passes and the autonomous CT runtime stays stable on the
hourly cron cadence.

## Rollback

Each step is independently reversible:

- Step 0 scratch file: delete the file.
- Step 1 test: `git checkout -- packages/ui/src/__tests__/ct/mobile-menu.ct.test.tsx`.
- Step 2 test: same as Step 1 (both edits land in the same file).
- Option A.3 fallback (if it fired): `git checkout -- packages/ui/src/preact/MobileMenu.tsx`.

If `pnpm coverage` reports a regression below the Phase 6c gate after
the new tests land (which would be highly surprising — these tests
ADD coverage, they don't remove any), roll back and reopen the
question with the failure trace.

## Cross-reference

- Spec: `.specify/features/q27-mobilemenu-empty-items-coverage.md` (this iteration)
- Parent Q22 follow-up #3 spec: `.specify/features/q22-playwright-coverage.md` (✅ RESOLVED iter 121)
- Parent Q22 follow-up #3 plan: `docs/plans/q22-playwright-coverage.md` (Phases 0-6d ✅ DONE)
- Q26 spec: see `docs/questions.md` Q26 (✅ RESOLVED iter 121)
- Iteration 119 commit `746ecd6` — Phase 6b adoption (12-branch MobileMenu shortfall first surfaced).
- Iteration 120 commit `93380e4` — focus-trap CT tests (closed 9 of 12 branches; B1 deferred).
- Iteration 121 commit `71cba78` — Phase 6c CI hard-gate enforced.
- Iteration 122 commit `d0ea027` — Q22 saga close (B1 carried as future opportunity).
