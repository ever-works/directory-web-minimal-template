# Feature: Q24 — `LayoutSwitcher` `EMPTY_MODES` allocation fix

> **Status: SPECIFIED (iteration 109, 2026-04-27).** Same fix shape as the
> iteration-105 `FilterBar` `EMPTY_TAGS` fix that resolved the equivalent
> Q22 click-toggle race. Pending implementation in this iteration.

## Description

`packages/ui/src/preact/LayoutSwitcher.tsx` declares its `modes` prop with a
default array literal (`modes = ['grid', 'list']`). The default array is
allocated **fresh** on every component render. The component then reads
`modes` inside a `useEffect` whose dependency array includes `modes`:

```tsx
export default function LayoutSwitcher({
    modes = ['grid', 'list'],   // ← fresh array reference per render
    selected: initialSelected = 'grid',
    onChange,
    persistKey = STORAGE_KEY,
    ...
}: LayoutSwitcherProps) {
    const [active, setActive] = useState<LayoutMode>(initialSelected);

    // Read persisted value after mount to avoid SSR/hydration mismatch
    useEffect(() => {
        if (persistKey) {
            const stored = localStorage.getItem(persistKey);
            if (stored && modes.includes(stored as LayoutMode)) {
                setActive(stored as LayoutMode);
            }
        }
    }, [persistKey, modes]);   // ← ❌ `modes` reference flips every render
    ...
```

Preact's `useEffect` dep comparison is reference equality
(`Object.is`). A fresh `[]` per render makes the effect fire **every** render,
not just on actual `modes` changes. After the user clicks "List view":

1. `handleClick('list')` → `setActive('list')` → `onChange?.('list')`.
2. Component re-renders with `active = 'list'`.
3. The `[persistKey, modes]` effect fires (modes is a new array reference).
4. The effect reads `localStorage.getItem(persistKey)` — value depends on
   timing of the *other* effect (the writer): if the writer has already
   committed, the read sees `'list'`; if not, it sees the prior value
   (e.g. `'grid'` on a fresh test, or whatever previous test wrote).
5. If the read happens before the write committed, the read can call
   `setActive('grid')`, **reverting the click**.

This is the exact mirror of the iteration-105 `EMPTY_TAGS` bug discovered
in `FilterBar.tsx`, where `selectedTags = []` allocated a fresh `[]` per
render and the `useEffect([initialTags])` reset state continuously.

## Why this surfaced in iteration 108, not iteration 107

Iteration 107 reported "12/12 LayoutSwitcher CT tests pass in ~1 min" —
that result is **not deterministic**. Iteration 108 ran the full
3-file CT suite (FilterBar + LayoutSwitcher + MobileMenu, 43 tests) and
saw 1-3 LayoutSwitcher failures per run, depending on which other files
ran alongside. The bug was always present; it only manifested visibly
when:

- The CT walltime grew long enough that the dev-server and test
  harness hit timing edges.
- Other tests' localStorage writes leaked across the page reload (the
  "uses custom persistKey" test reads `localStorage.getItem('custom-key')`,
  which a prior "persists mode to localStorage" test set to `'list'` —
  if that prior write is still visible, the read can flip-flop with
  the post-click write).

The actual root cause is the unstable `modes` reference, not the harness
timing. The harness timing only made the race observable.

## User Stories

- As a **developer**, I want `LayoutSwitcher`'s persisted-mode contract
  (default `'grid'`, click changes the mode, mode survives reload) to be
  deterministic regardless of how many other CT tests ran first.
- As an **AI agent**, I want the `EMPTY_TAGS` fix pattern from
  `FilterBar` carried over to `LayoutSwitcher` so the codebase is
  consistent — same bug class, same fix shape.
- As a **maintainer**, I want CI's `pnpm test:ct` cell to be a stable
  green/red signal, not a flaky 1/12 false negative.

## Acceptance Criteria

1. **AC #1 — Stable `EMPTY_MODES` sentinel.** A frozen, module-scope
   `EMPTY_MODES: readonly LayoutMode[]` constant replaces the inline
   `['grid', 'list']` default. The default is the SAME 2-mode array as
   today (`'grid', 'list'`) — no behavior change for callers, only
   reference stability.
2. **AC #2 — Effect deps narrowed.** The
   `useEffect([persistKey, modes])` dep array no longer fires every
   render. Verified by reading the source diff: the `modes` reference
   is now stable for the default-prop case, and callers passing their
   own `modes` array are responsible for memoising it (this is the
   standard Preact/React contract for non-primitive deps).
3. **AC #3 — `pnpm test:ct` LayoutSwitcher cases stable.** Running
   `pnpm --filter @ever-works/ui exec playwright test --config=playwright.ct.config.ts layout-switcher.ct.test.tsx`
   **three times consecutively** reports 12/12 pass each run on
   Windows + Node 24.14.0. No 1-3 flaky failures.
4. **AC #4 — Full `pnpm test:ct` suite stable.** `pnpm --filter @ever-works/ui test:ct`
   reports **43 passed** (16 FilterBar + 12 LayoutSwitcher + 15
   MobileMenu) in **at least 2 of 2** consecutive runs.
5. **AC #5 — Typecheck and lint pass.** `pnpm typecheck` reports 23/23
   successful, 0 errors. `pnpm lint` reports 18/18 successful, 0 errors.
6. **AC #6 — Q24 status flips.** `docs/questions.md` Q24 status changes
   from `OPEN — diagnosed in iteration 108` to
   `✅ RESOLVED in iteration 109`. The iteration-107 "12/12 pass" claim
   is amended in the same edit.
7. **AC #7 — Iteration log entry.** `docs/log.md` gets a new
   "## 2026-04-27 — Iteration 109" section near the top documenting
   the source-diff, verification commands, and the EMPTY_TAGS / EMPTY_MODES
   parallel.

## The fix

```diff
+ // Module-scope frozen sentinel. The default `modes` prop must be a
+ // STABLE reference across renders — `useEffect([persistKey, modes])`
+ // below uses reference equality. Fresh `['grid', 'list']` per render
+ // would fire that effect every render and race the post-click
+ // `localStorage.setItem(...)`. Same pattern as `EMPTY_TAGS` in
+ // `FilterBar.tsx` (iteration 105 / Q22 fix). See `docs/questions.md`
+ // Q24 for the full diagnostic chain.
+ const EMPTY_MODES: readonly LayoutMode[] = Object.freeze(['grid', 'list']);
+
  export default function LayoutSwitcher({
-     modes = ['grid', 'list'],
+     modes = EMPTY_MODES as LayoutMode[],
      selected: initialSelected = 'grid',
      onChange,
      persistKey = STORAGE_KEY,
      class: className,
  }: LayoutSwitcherProps) {
```

The `as LayoutMode[]` cast is necessary because `LayoutSwitcherProps['modes']`
is typed `LayoutMode[]` (mutable). The frozen array is reference-stable but
typed as readonly; the cast preserves the public API while the
`Object.freeze` enforces immutability at runtime. Callers attempting to
mutate the default would throw in strict mode — but no caller mutates
the default in practice (the prop is consumed read-only).

## `initialSelected` and `persistKey` are NOT affected

- `initialSelected` defaults to `'grid'` — a primitive string, naturally
  stable.
- `persistKey` defaults to `STORAGE_KEY` — a module-scope constant,
  already stable.

Only `modes` allocates a fresh non-primitive default per render, which
is why this is a 1-line source change plus a 5-line comment.

## Out of scope

- **Refactoring `LayoutSwitcher.tsx` further** — focus mode, theming,
  keyboard navigation, etc. None of these are tied to the bug.
- **Auditing `MobileMenu.tsx` for the same pattern.** `MobileMenu`'s
  `items = []` default does NOT feed into a `useEffect` dep array — it
  only renders. So the same allocation pattern exists but is
  harmless. Out of scope for Q24; can be tightened in a future hygiene
  iteration without affecting any tests.
- **Vite dev-server stability investigation** (Q24 hypothesis B / C).
  Once Option A (this fix) lands, re-evaluate whether the
  `net::ERR_CONNECTION_REFUSED` observation from iteration 108 still
  reproduces. If it does, open a follow-up; if it doesn't, mark the
  hypothesis "B" branch as not-applicable.
- **Restoring `LayoutSwitcher.tsx` to V8 coverage.** Still depends on
  Q22 follow-up #3 (`playwright-coverage` integration).

## Risks

- **R1 — Caller-provided `modes` array still unstable.** If a caller
  passes `modes={['grid', 'list', 'compact']}` inline at the call site,
  the same `useEffect` fires every render. This is the standard Preact
  contract for non-primitive deps and is documented in JSDoc. The fix
  scope is bounded to the **default**; callers must memoise their own
  arrays (same as for any non-primitive prop dep).
  Mitigation: add a one-line JSDoc note on the `modes` prop pointing
  at this contract.
- **R2 — Q24 hypothesis B (`ctPort` exhaustion) might still reproduce
  after the fix.** If 1-3 failures persist after Option A, hypothesis
  B is the next investigation. Mitigation: re-run the full CT suite
  3+ times after the fix; if any fails, capture the exact failure
  shape and update Q24 to "Option A applied; hypothesis B remains
  open".
- **R3 — Object.freeze may break callers that mutate the default.**
  No caller mutates the default in practice (verified: grep'd
  `apps/web` and `apps/sample-*` for `modes={...}` assignments —
  all are read-only consumers). If a future caller mutates the
  frozen default, the cast `as LayoutMode[]` will silently allow
  the assignment to type-check, then throw at runtime. Failure
  is loud and fast — not silent corruption.

## Dependencies

- No new npm dependencies.
- No CI changes.
- No environment variables.

## References

- `docs/questions.md` Q22 / Q23 / Q24 — diagnostic chain.
- `docs/log.md` iteration 105 — the original `EMPTY_TAGS` fix in
  `FilterBar.tsx`.
- `packages/ui/src/preact/FilterBar.tsx` — production code with the
  `EMPTY_TAGS` pattern, the model for this fix.
- `packages/ui/src/__tests__/ct/layout-switcher.ct.test.tsx` — the
  test file that flakes today.

## AGENTS.md cross-check (R1–R15)

- **R1 (TypeScript only):** edit is in `.tsx`; no JS/Python.
- **R2/R3/R4:** N/A (no DB, auth, payments).
- **R5 (ISR by default):** N/A.
- **R6 (Plugin everything):** N/A — `LayoutSwitcher` is a UI component.
- **R7 (Git-first data):** N/A.
- **R8 (Extreme performance):** the fix REMOVES per-render effect
  reruns. Net win for runtime performance.
- **R9 (Modular & replaceable):** the fix is internal to
  `LayoutSwitcher.tsx`; public prop API unchanged.
- **R10 (AI-optimized):** the fix lands with a 5-line JSDoc-style
  comment block explaining the WHY, citing Q24 and the FilterBar
  parallel.
- **R11 (Convention over configuration):** zero new env vars or build
  flags.
- **R12 (Monorepo structure):** edit lives in
  `packages/ui/src/preact/LayoutSwitcher.tsx`.
- **R13 (Exhaustive documentation):** spec + log entry +
  Q24 status flip + iteration descriptor in `docs/index.md`.
- **R14 (Convention):** the new `EMPTY_MODES` sentinel mirrors the
  existing `EMPTY_TAGS` sentinel in `FilterBar.tsx` exactly.
- **R15 (Replace, don't remove):** the inline `['grid', 'list']`
  default is REPLACED with a stable reference, not removed. Public
  behavior unchanged.
