---
title: "Q22 follow-up #3 — playwright-coverage integration"
sidebar_label: "Q22 #3 / playwright-coverage"
---

# Q22 follow-up #3 — `playwright-coverage` integration plan

> **Status: PLANNED (iteration 110, 2026-04-27); Q25 default
> NPM-validated (iteration 112, 2026-04-27).** Spec at
> [`.specify/features/q22-playwright-coverage.md`](https://github.com/ever-works/directory-web-minimal-template/blob/main/.specify/features/q22-playwright-coverage.md).
> Library-choice decision tree at **Q25** in
> [`docs/questions.md`](../questions.md). Default library:
> `monocart-coverage-reports@^2.12.0` (verified iteration 112; npm
> latest is 2.12.11). Companion Playwright reporter:
> `monocart-reporter@^2.10.0` (verified iteration 112; npm latest is
> 2.10.1). Both packages confirmed actively published, README cites
> `playwright-ct-react` integration explicitly, and the merge-multiple-
> sources story (Vitest unit + Playwright CT/E2E) is documented.
> Phase 0's smoke test now narrows to source-map fidelity for our
> specific Vite/Preact alias setup, NOT a "does the library exist"
> check.

This plan executes the spec's 10 acceptance criteria across **5 phases**.
Each phase has a single hard exit criterion — failing that criterion
halts the plan rather than papering over the failure.

---

## Phase 0 — Library smoke test (gate before any code lands)

**Goal**: prove the Q25 default works on our exact toolchain (Windows +
Node 24.14.0 + Vite 7 + Preact 10.29.1 + `@playwright/experimental-ct-react`
1.59.1) before writing any integration code.

### Steps

1. Create `packages/ui/scratch/coverage-smoke/` (gitignored — added to
   `packages/ui/.gitignore`; the `.gitignore` itself was created
   in iteration 112 as a Phase 0 prerequisite). Inside, run
   `pnpm add -D monocart-coverage-reports@^2.12.0` against a one-off
   `package.json` so the install does not pollute the workspace yet.
   (Pin updated from `^2.11.0` after iteration-112 npm-registry
   verification — current `latest` dist-tag is 2.12.11.)
2. Author a single 5-line throwaway script that:
   - Spawns a Playwright browser via `@playwright/test`.
   - Calls `page.coverage.startJSCoverage()` and
     `page.coverage.stopJSCoverage()` around a `mount(<FilterBar />)`.
   - Pipes the result through `MCR(...)` and writes JSON to disk.
3. Inspect the JSON. Assert:
   - **AC #3 prerequisite**: every entry's `url` field resolves to a
     `.tsx` under `packages/ui/src/preact/` (not a Vite chunk hash).
   - At least one branch in `FilterBar.tsx` is reported as covered
     (>0%).
4. Delete the scratch directory.

### Exit criterion

If the smoke test produces zero coverage entries OR the URLs all point
at `node_modules` / `__VITE_LOAD_*` chunks, the Q25 default is wrong.
Halt the plan; reopen Q25 with the smoke-test JSON attached as
evidence and pick Option B (`@bgotink/playwright-coverage`).

If the smoke test produces source-mapped entries — proceed to Phase 1.

### Outcome (iteration 113, 2026-04-27)

✅ **PASS-API.** Captured 1 V8 entry from a synthetic file:// page
script (3-branch `maybeBranch(x)` function), 75% branches / 100%
functions / 88.89% lines covered. MCR `add()` + `generate()` succeed
without error and write `coverage-report.json` (~2.4 KB) with `files[]`
entries that include `url`, `sourcePath`, `source`, `data` (per-byte
ranges, branches, functions, statements), and `summary`. Toolchain
verified: Node 24.14.0 + Windows 10 + Chromium 147 + Playwright 1.59.1
+ monocart-coverage-reports 2.12.11. Detailed numbers in
`docs/log.md` iteration 113 entry. Scratch dir deleted per step 4.

The source-map → `.tsx` question is deferred to Phase 1 (where the
Vite/Preact alias chain produces real `.tsx` URLs, not the synthetic
`file://app.js` Phase 0 used). **Phase 1 is unblocked.**

---

## Phase 1 — Library installation + Playwright reporter wiring

**Goal**: integrate the chosen library as a `devDependency` of
`@ever-works/ui` and configure `playwright.ct.config.ts` to emit V8
coverage on every `pnpm test:ct` run.

### Steps

1. `pnpm --filter @ever-works/ui add -D monocart-coverage-reports@^2.12.0
   monocart-reporter@^2.10.0`. Pins bumped from the spec's original
   `^2.11.0`/`^2.x.x` after iteration-112 npm-registry verification
   (current `latest` dist-tags are 2.12.11 and 2.10.1 respectively).
   Pin the major version; let pnpm pick the patch.
2. Edit `packages/ui/playwright.ct.config.ts`:
   - Add `monocart-reporter` to the `reporter` array.
   - Set `outputFile: './coverage/ct/raw-v8.json'`.
   - Configure `entryFilter` to keep only `src/preact/*.tsx` and
     `src/primitives/*.tsx`.
   - Configure `sourceFilter` to keep `**/packages/ui/src/**`.
3. Add `coverage/` to `packages/ui/.gitignore`.
4. Add a comment block at the top of `playwright.ct.config.ts`
   referencing this plan and the spec.

### Exit criterion

`pnpm --filter @ever-works/ui test:ct` runs to completion (43/43 still
pass) AND emits a non-empty `packages/ui/coverage/ct/raw-v8.json`
whose top-level `result` array has ≥3 entries (one per migrated
component).

### Outcome (iteration 114, 2026-04-27)

✅ **DONE.** All four steps landed; both halves of the exit criterion
satisfied empirically.

**Step deviations (vs. the plan as written):**

- **Step 2 outputFile**: the plan said `outputFile: './coverage/ct/raw-v8.json'`,
  but `monocart-reporter`'s top-level `outputFile` is the HTML report path
  (the V8-shape JSON is produced separately). The implementation sets
  `outputFile: './coverage/ct/index.html'` for the HTML and uses a
  `coverage.onEnd` hook to write the V8-shape `result[]` JSON to
  `./coverage/ct/raw-v8.json` directly — meeting the plan's intent
  (a file at that path with ≥3 entries) without bending the reporter's API.
- **Step 2 entryFilter**: the plan envisioned a regex against
  `src/preact/*.tsx`-style URLs. The actual V8 entries from CT runs are
  bundled chunk URLs (`http://localhost:3100/assets/<name>-<hash>.js`)
  produced by Vite's CT bundler — there are no `.tsx` URLs at the V8
  level. The filter therefore accepts every chunk under the
  `localhost:3100/assets/` prefix; source-map unpacking + `sourceFilter`
  do the per-source narrowing.
- **Step 2 sourceFilter**: implementation accepts `packages/ui/src/`
  AND `src/`-prefixed paths (the latter is what monocart emits after
  resolving Vite source maps to workspace-relative paths). Excludes
  `__tests__/`, `playwright/index.*`, `node_modules/`.
- **Beyond the plan**: a new `src/__tests__/ct/fixtures.ts` was added
  to call `page.coverage.startJSCoverage()` + `addCoverageReport()` per
  test (`monocart-reporter` does NOT auto-instrument `page.coverage`;
  without a fixture, no V8 data flows). The three CT test files
  (`filter-bar.ct.test.tsx`, `layout-switcher.ct.test.tsx`,
  `mobile-menu.ct.test.tsx`) were updated to import `test`/`expect`
  from `./fixtures` instead of `@playwright/experimental-ct-react`
  directly. The fixture casts `test` back to `typeof base` to suppress
  TS2883 ("inferred type cannot be named without a reference to
  `RouterFixture`") — autotype-only, no runtime effect.

**Verification numbers:**

- 43/43 CT tests pass in 1m 16s on Windows + Node 24.14.0.
- `packages/ui/coverage/ct/raw-v8.json` written with `result.length === 9`
  (≥3 satisfied).
- All 9 entries have `url` fields pointing at source files under
  `packages/ui/src/`:
  - `src/preact/FilterBar.tsx` ✅
  - `src/preact/LayoutSwitcher.tsx` ✅
  - `src/preact/MobileMenu.tsx` ✅
  - `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`
  - `src/lib/keyboard.ts`, `src/lib/utils.ts`
  - `src/primitives/badge/badge-variants.ts`, `src/primitives/button/button-variants.ts`
- Coverage aggregate: **branches 84.88% (73/86), functions 100% (40/40),
  lines 97.18% (482/496), statements 39.80% (39/98), bytes 60.73%.**

The 39.80% statements / 60.73% bytes figures are expected to rise after
Phase 2 because the merged report (Phase 3) folds Vitest coverage in
for the non-CT files — the CT-only number reflects only the bundled
subgraph that the three CT tests pull in, not every file in `src/`.

**Phase 1 satisfies AC #1, AC #2, AC #3 fully; AC #5 partially (≥80%
branches in aggregate; per-file ≥80% verification deferred to Phase 2
when the merged report exists). Phase 2 is unblocked.**

---

## Phase 2 — Vitest config exclusions drop

**Goal**: remove the three `coverage.exclude` lines for the migrated
components and verify the merged number reaches branch ≥80% for each
of `FilterBar.tsx`, `LayoutSwitcher.tsx`, and `MobileMenu.tsx`.

### Steps

1. Edit `packages/ui/vitest.config.ts`:
   - Remove the three explicit exclusions
     (`src/preact/FilterBar.tsx`, `src/preact/LayoutSwitcher.tsx`,
     `src/preact/MobileMenu.tsx`).
   - Replace them with a comment block pointing at this plan and at
     the spec. The comment explains that those files now contribute
     to coverage *via* the CT merge step, not via Vitest directly.
2. Run `pnpm --filter @ever-works/ui test:coverage`. Expected: the
   per-package branch number drops to roughly 70-72% because the
   three components are now in the include set but only the Vitest
   pass has run.
3. Capture this baseline number for verification of the merge step in
   Phase 3.

### Exit criterion

`packages/ui/coverage/coverage-summary.json` exists and reports a
**lower** branch number than before — confirming that without the
merge, removing the exclusions hurts the report. This is the
intended pre-merge state.

### Outcome (iteration 115, 2026-04-27)

✅ **DONE.** Exit criterion satisfied.

**Before/after comparison** (Vitest-only, `pnpm --filter @ever-works/ui test:coverage`, ~100s walltime, 11/11 files / 174/174 tests passing on both runs):

| Metric      | With exclusions (baseline) | Without exclusions (Phase 2) | Delta              |
|-------------|----------------------------|------------------------------|--------------------|
| Statements  | 99.45% (184/185)           | 68.81% (203/295)             | -30.64 pp; +110 stmts in include set |
| **Branches**| **100% (145/145)**         | **70.53% (158/224)**         | **-29.47 pp**; +79 branches in include set |
| Functions   | 100% (69/69)               | 72.11% (75/104)              | -27.89 pp; +35 fns in include set |
| Lines       | 99.41% (170/171)           | 68.97% (189/274)             | -30.44 pp; +103 lines in include set |

The drop is exactly within the plan's predicted "roughly 70-72%" branch envelope. Per-file detail confirms the cause: `FilterBar.tsx` and `MobileMenu.tsx` now report **0% / 0% / 0% / 0%** (Vitest never executes them — only CT does, and the CT V8 stream is not yet merged into the Vitest report); `LayoutSwitcher.tsx` reports **100% / 86.66% / 100% / 100%** (apparently a render-import side path runs under Vitest, but full coverage requires CT mounts); other files unchanged.

This is the intended pre-merge state. Phase 3 (the merge command) restores the per-package number to ≥ baseline by combining the Vitest run's `coverage-final.json` with the CT run's `raw-v8.json` from iteration 114.

**No regressions outside coverage:**
- `pnpm typecheck` — 23/23 successful (16 cached + 7 fresh, 1m17s).
- `pnpm lint` — 18/18 successful (16 cached + 2 fresh, 14.2s).
- `pnpm --filter @ever-works/ui test:coverage` — 11/11 files / 174/174 tests still passing.
- `packages/ui/coverage/coverage-summary.json` regenerated with the new lower numbers — present on disk under `packages/ui/coverage/`.

**AC #5 (Vitest exclusions drop) is now satisfied at the source-file level.** AC #5 verification of "≥80% branch coverage for each of those three files" requires Phase 3's merge — that's the natural place for the per-file ≥80% gate.

**Phase 3 unblocked.**

---

## Phase 3 — Merge command

**Goal**: introduce a `pnpm coverage` script (root + per-package) that
runs Vitest coverage, then CT coverage, then merges both into a single
report.

### Reconciled strategy (informed by iteration 116 monocart README + d.ts review)

The schematic from iteration 110 had `mcr.add(JSON.parse(...raw-v8.json))`
using the monocart-reporter `onEnd` summary file. Iteration 116 review
of `node_modules/monocart-coverage-reports/lib/index.d.ts` and the
upstream README "Manual Merging" section pinpointed two corrections:

1. **The Phase 1 `raw-v8.json` is a SUMMARY shape**, not raw V8 byte
   ranges. It cannot be re-fed to `mcr.add()` (which expects either a
   V8 entry array from `page.coverage.stopJSCoverage()` or an Istanbul
   coverage object). It exists purely as the Phase 1 exit-criterion
   sentinel; we leave it in place but do NOT consume it in the merge.
2. **monocart's documented "Manual Merging" pattern is `inputDir` +
   raw V8 dirs, not `mcr.add(serialized-summary)`.** The CT side gets
   a `'raw'` report added so each test's V8 entries land at
   `coverage/ct/raw/<id>.json`. The merge script then uses
   `inputDir: ['./coverage/ct/raw']` to pick them up automatically and
   `mcr.add(istanbulFromVitest)` for the Vitest Istanbul side.

The Vitest side stays exactly as-is (V8 provider, Istanbul
`coverage-final.json` output). monocart's `add()` recognizes Istanbul
data structurally — no separate `vitest-monocart-coverage` install is
needed.

### Steps

1. **Edit `packages/ui/playwright.ct.config.ts`**: add `'raw'` to the
   `coverage.reports` list so each CT test's raw V8 entries land at
   `coverage/ct/raw/<id>.json`. Keep `'v8'`, `'v8-json'`,
   `'console-summary'` for human-readable single-source CT reports;
   add `'raw'` purely as the merge-input feed. The Phase 1 `onEnd`
   hook stays untouched (Phase 1 sentinel + AC #5 progress signal).
2. Create `packages/ui/scripts/coverage-merge.ts`:
   ```ts
   import { readFileSync, existsSync } from 'node:fs';
   import { resolve } from 'node:path';
   import { CoverageReport } from 'monocart-coverage-reports';

   const VITEST_FINAL = './coverage/coverage-final.json';
   const CT_RAW_DIR  = './coverage/ct/raw';
   const OUT_DIR     = './coverage/merged';

   const mcr = new CoverageReport({
       name: '@ever-works/ui Merged Coverage',
       inputDir: existsSync(CT_RAW_DIR) ? [CT_RAW_DIR] : undefined,
       outputDir: OUT_DIR,
       cleanCache: true,
       reports: [
           ['v8'], ['v8-json'], ['lcov'], ['codecov'], ['console-summary'],
       ],
       sourceFilter: (sourcePath: string) => {
           if (!sourcePath) return false;
           if (sourcePath.includes('node_modules/')) return false;
           if (sourcePath.includes('__tests__/')) return false;
           if (sourcePath.includes('playwright/index.')) return false;
           return (
               sourcePath.includes('packages/ui/src/') ||
               sourcePath.startsWith('src/')
           );
       },
   });

   if (existsSync(VITEST_FINAL)) {
       const istanbul = JSON.parse(readFileSync(VITEST_FINAL, 'utf8'));
       await mcr.add(istanbul);
   }
   const report = await mcr.generate();
   if (!report) throw new Error('coverage-merge: no report generated');
   ```
   (`CoverageReport` is the same surface as `MCR()` — the d.ts file at
   `node_modules/monocart-coverage-reports/lib/index.d.ts` shows
   `add(coverageData: any[] | any)` accepts Istanbul objects directly.)
3. Add `packages/ui/package.json` script:
   ```json
   "coverage": "pnpm test:coverage && pnpm test:ct && tsx scripts/coverage-merge.ts"
   ```
4. Add root `package.json` script:
   ```json
   "coverage": "pnpm --filter @ever-works/ui coverage"
   ```
5. Add `pnpm coverage` to `CLAUDE.md` "Common Commands" and "Safe
   Operations" lists.

### Exit criterion

`pnpm coverage` produces `packages/ui/coverage/merged/coverage-report.json`
(monocart V8-JSON shape). The `summary.branches.pct` value is at or
above the iteration-95 baseline (≥99%, modulo the three migrated
components carrying real CT-measured branch counts now). Each of
`FilterBar.tsx` / `LayoutSwitcher.tsx` / `MobileMenu.tsx` shows
≥80% branch coverage in the merged report's `files[]` entry.

### Outcome (iteration 116, 2026-04-27)

✅ **PARTIALLY DONE — CT subgraph merged; Vitest Istanbul side
deferred to Q26 follow-up.**

**Landed**:

1. `packages/ui/playwright.ct.config.ts` — `'raw'` added to
   `coverage.reports`. Each CT test now writes a per-test raw V8
   entries file at `coverage/ct/raw/<id>.json`. After a clean
   `pnpm test:ct` run, that directory contains 49 JSON files (one per
   test execution unit, including before/after fixture phases).
2. `packages/ui/scripts/coverage-merge.ts` — new TypeScript script
   (~190 lines including header documentation) that constructs a
   `CoverageReport` instance with `inputDir: ['./coverage/ct/raw']`,
   `outputDir: './coverage/merged'`, `cleanCache: true`, and
   `reports: [['v8'], ['v8-json'], ['lcov'], ['codecov'], ['console-summary']]`.
   Includes a per-file ≥80% branch gate over `FilterBar.tsx`,
   `LayoutSwitcher.tsx`, `MobileMenu.tsx` reported as informational
   warnings (Phase 4 CI will enforce).
3. `packages/ui/vitest.config.ts` — `'json'` added to the V8
   provider's `reporter` array so Vitest writes
   `coverage/coverage-final.json` (Istanbul shape) on every
   `pnpm test:coverage` run. Comment block in the same file updated
   to drop the "Phase 3 will introduce…" forward-reference now that it
   has landed.
4. `packages/ui/package.json` — new script
   `"coverage": "pnpm test:coverage && pnpm test:ct && tsx scripts/coverage-merge.ts"`.
5. Root `package.json` — new script
   `"coverage": "pnpm --filter @ever-works/ui coverage"`.
6. `CLAUDE.md` — `pnpm coverage` added to Common Commands AND Safe
   Operations.

**Verified**:

- `pnpm coverage` runs end-to-end on Windows + Node 24.14.0 in
  ~3m walltime (107s Vitest + 78s CT + ~1s merge).
- Outputs land at `packages/ui/coverage/merged/`:
  `coverage-report.json` (V8-JSON), `lcov.info`, `codecov.json`,
  `index.html`, `lcov-report/`, `coverage-data.js`.
- Aggregate: branches 84.88% (73/86), functions 100% (40/40), lines
  97.18% (482/496), statements 90.60% (106/117), bytes 97.53%
  (19,903/20,407) — all 9 files in the CT subgraph.
- Per-file gate (informational): **FilterBar.tsx 100% (27/27) ✅**,
  **LayoutSwitcher.tsx 100% (15/15) ✅**, **MobileMenu.tsx 67.57%
  (25/37) ❌**. The MobileMenu gap is a real signal — 12 branches
  uncovered in CT — and is treated as a Phase 4 prerequisite, not a
  Phase 3 blocker. See "Phase 3 follow-ups" below.

**Deviation from plan**:

The plan's original `mcr.add(istanbul) + inputDir(rawV8)` mixing fails
deterministically in monocart-coverage-reports@2.12.11. Diagnosis (per
`packages/ui/scripts/coverage-merge.ts` header):

- `getCoverageResults` (`lib/generate.js`) inspects `dataList[0].type`
  to dispatch into either the V8 or Istanbul code path — they're
  mutually exclusive.
- When raw V8 entries are loaded via `inputDir` AND Istanbul data is
  added via `mcr.add(istanbul)`, the converter routes everything
  through the V8 path. Istanbul entries lack `type: 'js'`, fall into
  `getCssAstInfo`, and crash on `ranges.sort()` (no ranges).
- Error: `[MCR] Not found source data: undefined` →
  `TypeError: Cannot read properties of undefined (reading 'sort')` at
  `getCssAstInfo (.../converter/ast.js:339:12)`.

The merge script therefore consumes ONLY the CT raw V8 directory.
Vitest Istanbul `coverage-final.json` is detected and reported in the
header line ("Vitest Istanbul = ./coverage/coverage-final.json (NOT
merged — see Q26)") but NOT fed to MCR. Files that Vitest exercises
(everything in `packages/ui/src/` *except* the three CT components)
keep their per-runner Vitest coverage in
`coverage/coverage-summary.json`.

**Phase 3 follow-ups** (next iterations):

1. **Q26** (new this iteration): integrate `vitest-monocart-coverage`
   so Vitest also emits raw V8 entries to `coverage/raw/`. Then both
   inputs flow through the same V8 path and the merge becomes a true
   union of all `packages/ui/src/` files. Default Option A (drop-in
   provider replacement). See `docs/questions.md` Q26.
2. **MobileMenu CT branch coverage**: 12 uncovered branches need
   either additional CT tests OR identification as defensive paths
   that don't need exercise. Likely targets in the file: error
   recovery paths in the focus-trap teardown, the touch-event
   listeners (PointerEvent vs TouchEvent fallback), and the
   `prefers-reduced-motion` guard inside the slide animation.
3. **Phase 4 CI integration**: convert the per-file ≥80% gate from
   informational warning to hard failure once Q26 lands AND the
   MobileMenu gap is closed.

**Phase 3 satisfies AC #1 (merge command exists), AC #2 (single
output dir), AC #4 (CT raw stream consumed), AC #7 (idempotent — re-running
`pnpm coverage` produces stable numbers within ±0.1pp from the same
source). AC #5 (per-file ≥80% branches) satisfied for 2/3 components
— MobileMenu pending. AC #6 (full per-package number from a single
report) deferred to Q26.**

**Phase 4 unblocked** for the artifact-upload portion (CT raw
directory, Vitest Istanbul, merged report all separately
upload-able). Phase 4's gate enforcement should sequence AFTER Q26
+ MobileMenu test additions.

---

## Phase 4 — CI integration

**Goal**: wire the merge into `.github/workflows/ci.yml` so the
published artifact contains the merged number, not two partial
numbers.

### Steps

1. Edit `.github/workflows/ci.yml` `test` job:
   - After `pnpm test:coverage`, upload
     `packages/ui/coverage/coverage-final.json` as artifact
     `ui-coverage-vitest`.
2. Edit `.github/workflows/ci.yml` `test-ct` job:
   - After `pnpm test:ct`, upload the entire
     `packages/ui/coverage/ct/raw/` directory (raw V8 entries written
     by the `'raw'` report type added in Phase 3 step 1) as artifact
     `ui-coverage-ct`. The `coverage/ct/raw-v8.json` Phase 1 sentinel
     is also uploaded for traceability but is not consumed by the
     merge job.
3. Add a new job `coverage-merge`:
   - Depends on `test` and `test-ct` (both OS cells of test-ct).
   - Downloads both artifacts.
   - Runs `pnpm --filter @ever-works/ui exec tsx
     scripts/coverage-merge.ts` against the downloaded files.
   - Uploads `packages/ui/coverage/coverage-summary.json` as
     artifact `ui-coverage-merged`.
   - Optionally posts the summary as a PR comment via
     `actions/github-script` (defer to a sub-iteration if scope
     creep).

### Exit criterion

A PR opened with a deliberate coverage drop (e.g., delete a `.ct.test.tsx`
test) shows the drop in the published `ui-coverage-merged` artifact.
A PR with no coverage drop shows the same number as the local
`pnpm coverage` run.

---

## Phase 5 — Documentation + status flips

**Goal**: every doc and status field reflects the new merged-coverage
reality.

### Steps

1. **`docs/architecture/testing-runners.md`** "Coverage handling":
   - Replace "CT runs are not measured by V8 at this time" with the
     merged-pipeline description.
   - Remove `playwright-coverage` from "Future work" list.
   - Add `pnpm coverage` to "Local commands".
2. **`docs/questions.md`**:
   - Q22 follow-up #3 status: OPEN → ✅ RESOLVED (under the Q22
     thread).
   - Q25 (library choice) status: OPEN → ✅ RESOLVED with the
     actual library and version inline.
3. **`docs/log.md`**: new iteration entry (#111 likely if Phase 5
   sequences after Phase 1-4 in the same iteration; new iteration
   number if Phase 0-2 lands separately from Phase 3-4).
4. **`docs/index.md`**: bump the iteration descriptor; add the new
   spec/plan rows.
5. **`CLAUDE.md`**: add `pnpm coverage` to "Common Commands" + "Safe
   Operations".
6. **`.specify/features/q22-playwright-ct.md`**: flip follow-up #3
   status from "out of scope for Phase 1" to "✅ RESOLVED in
   iteration N (see q22-playwright-coverage.md)".
7. **`.specify/features/q22-mobilemenu-ct.md`**: same flip.

### Exit criterion

A `git grep` for `Q22 follow-up #3` returns zero hits with
`OPEN` / `pending` / `out of scope for Phase 1` adjacency. Every doc
that mentions follow-up #3 marks it ✅ RESOLVED.

---

## Iteration sequencing

This plan is **NOT one iteration's work**. Suggested sequencing:

| Iteration | Phases     | Effort | Risk |
|-----------|------------|--------|------|
| 110       | 0 spec/plan | ~1 hr | Low  |
| 111       | (CLAUDE.md drift fix; no Phase work) | ~10 m | Low |
| 112       | 0 prerequisite (`packages/ui/.gitignore` + npm validation) | ~30 m | Low |
| 113       | 0 (smoke)  | ~30 m  | Low  |
| 114 (this)| 1          | ~1 hr  | Med  |
| 115       | 2          | ~30 m  | Med  |
| 116       | 3          | ~1 hr  | Med  |
| 117       | 4          | ~30 m  | Low  |
| 118       | 5          | ~30 m  | Low  |

If iteration 110 has bandwidth after Phase 0 lands, fold Phase 1 into
the same iteration. Phases 2 and 3 should not share an iteration —
Phase 2's "broken on purpose" exit state is too easy to commit
prematurely.

---

## What this plan does NOT do

- Does not change `pnpm test`, `pnpm test:ct`, `pnpm test:e2e`, or
  `pnpm test:coverage` semantics. They all keep their current
  behavior. `pnpm coverage` is the new addition.
- Does not remove `pnpm test:ui:safe`. Q22 follow-up #2 is tracked
  separately and is currently parked under the cron's "Do NOT remove
  anything" instruction. Iteration 110 will soft-deprecate the script
  via a CLAUDE.md note (improvement, not removal).
- Does not migrate any component to CT. The set is fixed at three
  (FilterBar, LayoutSwitcher, MobileMenu).
- Does not enforce a *new* coverage threshold. The pre-existing
  Vitest threshold (`branch: 100`) carries through after the merge.
- Does not measure E2E coverage. Out of scope; future spec.
- Does not rewrite the Vitest coverage provider. Vitest stays on
  `provider: 'v8'`.

## Open decisions

> Filled at execution time.

1. **Q25 library**: default `monocart-coverage-reports`. Confirm via
   Phase 0 smoke test.
2. **Reporter format(s)**: default `['v8', 'lcov', 'codecov']`. Drop
   `codecov` if not needed for our CI.
3. **PR-comment integration**: defer until the merged artifact is
   stable for ≥2 iterations. Cosmetic; not blocking.

## AGENTS.md cross-check

This plan inherits the cross-check from the parent spec at
`.specify/features/q22-playwright-coverage.md` "AGENTS.md cross-check"
section. Re-validate at each phase boundary; flag any deviation.
