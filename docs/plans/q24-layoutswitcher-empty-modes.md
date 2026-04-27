---
title: "Q24 — LayoutSwitcher EMPTY_MODES allocation fix"
sidebar_label: "Q24 — EMPTY_MODES fix"
---

# Q24 — LayoutSwitcher `EMPTY_MODES` allocation fix

> **Spec:** [`.specify/features/q24-layoutswitcher-empty-modes.md`](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q24-layoutswitcher-empty-modes.md)
> **Status:** ✅ DONE (iteration 109, 2026-04-27). Specified and
> executed in the same iteration. 1-line source change + 6-line
> comment block + 1-line `EMPTY_MODES` sentinel declaration in
> `packages/ui/src/preact/LayoutSwitcher.tsx`. Verified across 3
> isolated runs (12/12 each in 40-46s) and 2 full-suite runs
> (43/43 each in 1m12-18s). Status flip belatedly landed iter 144.
> **Iterations referenced:** 105 (Q22 / `EMPTY_TAGS` fix in `FilterBar`), 107
> (Q23 / `LayoutSwitcher` initial CT migration), 108 (Q24 opened),
> 109 (Q24 fix executed).

## Why

`LayoutSwitcher.tsx` has the same per-render array allocation bug that
`FilterBar.tsx` had pre-iteration-105:

```tsx
modes = ['grid', 'list'],   // ← fresh `[]` every render
...
useEffect(() => { ... }, [persistKey, modes]);  // ← fires every render
```

In iteration 108 this surfaced as 1-3 LayoutSwitcher CT failures per full
`pnpm test:ct` run. Iteration 107's "12/12 pass in ~1 min" claim was a
one-shot result that did not prove deterministic.

The fix mirrors `EMPTY_TAGS` in `FilterBar.tsx` — a frozen,
module-scope sentinel keeps the default reference stable across renders,
so `useEffect([persistKey, modes])` only fires when the parent actually
changes `modes`.

## Steps

### Step 1 — Apply the fix

Edit `packages/ui/src/preact/LayoutSwitcher.tsx`:

```diff
+ // Module-scope frozen sentinel. The default `modes` prop must be a
+ // STABLE reference across renders — `useEffect([persistKey, modes])`
+ // below uses reference equality. Fresh `['grid', 'list']` per render
+ // would fire that effect every render and race the post-click
+ // `localStorage.setItem(...)`. Same pattern as `EMPTY_TAGS` in
+ // `FilterBar.tsx` (iteration 105 / Q22 fix). See `docs/questions.md`
+ // Q24 for the full diagnostic chain.
+ const EMPTY_MODES: readonly LayoutMode[] = Object.freeze(['grid', 'list']);

  export default function LayoutSwitcher({
-     modes = ['grid', 'list'],
+     modes = EMPTY_MODES as LayoutMode[],
      selected: initialSelected = 'grid',
      onChange,
      persistKey = STORAGE_KEY,
      class: className,
  }: LayoutSwitcherProps) {
```

The cast `as LayoutMode[]` is necessary because the prop is typed
`LayoutMode[]` (mutable). The frozen array is reference-stable but typed
as readonly; the cast preserves the public API while `Object.freeze`
enforces immutability at runtime.

### Step 2 — Verify CT stability

Run the LayoutSwitcher CT file in isolation **three times**:

```bash
cd packages/ui
for i in 1 2 3; do
  pnpm exec playwright test --config=playwright.ct.config.ts \
    layout-switcher.ct.test.tsx
done
```

Expected: **12/12 pass each run**, ~1 min each. If any run fails, capture
the failure shape, do NOT commit, and proceed to step 5 (rollback).

### Step 3 — Verify full suite

```bash
pnpm --filter @ever-works/ui test:ct
```

Expected: **43/43 pass** in 2 of 2 consecutive runs (covers iteration
108's flake fingerprint where 1-3 LayoutSwitcher tests failed
intermittently).

### Step 4 — Verify gates

```bash
pnpm typecheck    # 23/23 successful
pnpm lint         # 18/18 successful
```

### Step 5 — Rollback (only if Step 2 or 3 fails)

```bash
git checkout -- packages/ui/src/preact/LayoutSwitcher.tsx
```

Then update `docs/questions.md` Q24 status to
`OPTION A APPLIED; HYPOTHESIS B REMAINS OPEN` and capture the failure
shape in a new section. The fix can be revisited in a follow-up
iteration after deeper investigation (hypothesis B/C in Q24).

### Step 6 — Documentation updates

- `docs/questions.md` — Q24 status: `OPEN` → `✅ RESOLVED in iteration 109`.
  Amend the iteration-107 "12/12 pass" claim inline.
- `docs/log.md` — new "## 2026-04-27 — Iteration 109" section near the top
  documenting the fix, verification commands, and the
  `EMPTY_TAGS` / `EMPTY_MODES` parallel.
- `docs/index.md` — update the iteration-108 descriptor block at the top to
  the iteration-109 summary.
- `.specify/features/testing.md` AC #11 (or wherever Q24 is mentioned) —
  no edit needed; the test count is unchanged. The CT runner is now
  deterministic, which is itself a win.

## File list (touched)

| File                                                                          | Action  |
|-------------------------------------------------------------------------------|---------|
| `packages/ui/src/preact/LayoutSwitcher.tsx`                                   | EDIT    |
| `.specify/features/q24-layoutswitcher-empty-modes.md`                          | CREATE  (this iteration's spec) |
| `docs/plans/q24-layoutswitcher-empty-modes.md`                                 | CREATE  (this file)             |
| `docs/questions.md`                                                            | EDIT    (Q24 status flip)        |
| `docs/log.md`                                                                  | EDIT    (iteration 109 entry)    |
| `docs/index.md`                                                                | EDIT    (iteration descriptor + new spec/plan rows) |

## Cross-reference

- Spec: `.specify/features/q24-layoutswitcher-empty-modes.md` (this iteration)
- Q22 spec: `.specify/features/q22-playwright-ct.md`
- Q22 plan: `docs/plans/q22-playwright-ct.md`
- Iteration 105 commit `1dedb3b` — `EMPTY_TAGS` fix in `FilterBar.tsx`
- Iteration 108 commit `3c9a25e` — Q24 opened during MobileMenu CT migration
