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

## Phase 6 — Q26: Vitest coverage provider migration to `vitest-monocart-coverage`

> **Added iteration 117 (2026-04-27)** as the natural sequel to Phase 3.
> Q26 in `docs/questions.md` opened iteration 116 as a Phase 3 finding
> (monocart-coverage-reports@2.12.11 cannot mix raw V8 + Istanbul in a
> single MCR instance — `getCoverageResults` dispatches mutually-
> exclusive code paths on `dataList[0].type`). Q26 default Option A:
> drop in `vitest-monocart-coverage` so Vitest also emits raw V8, then
> the merge script consumes both raw V8 dirs through one V8 path.
> **Iteration 117 npm-registry validation** confirmed
> `vitest-monocart-coverage@4.0.2` is alive, MIT, same-maintainer
> (`cenfun`) as monocart-coverage-reports, README integration matches
> the plan exactly, dep tree is compatible with our Vitest 4.1.5
> setup. Pin: `^4.0.0` (the 4.x line is the only line that tracks
> Vitest 4).

**Goal**: replace `provider: 'v8'` in `packages/ui/vitest.config.ts`
with `provider: 'custom'` + `customProviderModule:
'vitest-monocart-coverage'`, so Vitest writes raw V8 entries to
`coverage/raw/<id>.json`. The Phase 3 merge script then drops the
Istanbul-loading branch and consumes only `inputDir: ['./coverage/raw',
'./coverage/ct/raw']` — both flow as raw V8 through MCR's V8 path; no
Istanbul mixing; no `getCoverageResults` crash.

**Iteration sequencing** (mirrors Phases 0-3 sequence with smaller
per-iteration risk):

| Sub-phase | Effort | Risk | Iteration |
|-----------|--------|------|-----------|
| 6a — Smoke test in `packages/ui/scratch/q26-vitest-monocart/` (Phase 0-style: prove `vitest-monocart-coverage` writes raw V8 entries that source-map back to `.tsx` files under our Vite + Preact alias chain) | ~30 min | Low | **117 ✅ DONE** |
| 6b — Adopt `vitest-monocart-coverage` in real `vitest.config.ts`; add `mcr.config.ts`; update merge script to drop Istanbul branch; verify per-package merged number on full include set | ~1 hr | Med | **119 ✅ DONE** |
| 6c — Phase 4 CI gate enforcement (per-file ≥80% branch threshold, hard fail) | ~30 min | Low | 120 |
| 6d — Phase 5 (existing) doc + status flips | ~30 min | Low | 121 |

### Phase 6a — Smoke test (gate before any code lands)

**Steps** (mirror iteration-113 Phase 0):

1. Create `packages/ui/scratch/q26-smoke/` (gitignored — covered by
   the iteration-112 `packages/ui/.gitignore` `scratch/` rule).
2. Inside, run `pnpm add -D vitest-monocart-coverage@^4.0.0
   monocart-coverage-reports@^2.12.9 vitest@^4.1.5` against a one-off
   `package.json` so the install does not pollute the workspace.
3. Author a single throwaway `vitest.config.ts` and a 5-line test that
   exercises one `.tsx` source file (e.g., a trivial `function add(a,
   b) { return a + b; }` with two test cases). Apply the same Vite +
   Preact alias chain (`react` → `preact/compat`) from the real
   `vitest.config.ts`.
4. Configure `provider: 'custom'`, `customProviderModule:
   'vitest-monocart-coverage'`, `reports: [['raw', { outputDir:
   './coverage/raw' }]]` in an `mcr.config.ts` sibling.
5. Run `vitest run --coverage` and inspect `coverage/raw/<id>.json`.
   Assert:
   - At least 1 raw V8 entry is written.
   - The entry's `url` field resolves to a `.tsx` source path (not a
     Vite chunk hash, not `node_modules`, not `__VITE_*`).
   - A second MCR pass via `new CoverageReport({ inputDir:
     ['./coverage/raw'] }).generate()` produces a coverage report with
     `>0%` lines covered for the trivial `.tsx` file.
6. Delete the scratch directory.

**Exit criterion** (mirror Phase 0):

If raw V8 entries are written and source-map back to `.tsx` files,
proceed to Phase 6b. If they all point at `node_modules` /
`__VITE_LOAD_*` chunks / file hashes, halt the plan; reopen Q26 and
escalate to Option B (custom Istanbul→V8 converter, ~50-100 LOC).

### Outcome (iteration 117, 2026-04-27)

✅ **PASSED.** Smoke test executed end-to-end on Windows + Node 24.14.0
+ Vitest 4.1.5 + vitest-monocart-coverage 4.0.2 + monocart-coverage-
reports 2.12.11. Scratch dir created at
`packages/ui/scratch/q26-vitest-monocart/`, deps installed via `pnpm
add -D --ignore-workspace`, scratch dir deleted at end of phase.

**Smoke-test results** (`maybeBranch(x)` 3-branch function with
intentional 2-of-3 branch exercise — same shape as iteration-113 Phase 0):

- 2/2 Vitest tests pass in 1.93s (Vitest run completed cleanly).
- Provider banner: `Coverage enabled with monocart` (custom provider
  loaded successfully).
- `[MCR] Loaded: mcr.config.ts` — config file convention works (separate
  from `vitest.config.ts`, per the upstream README).
- Console-summary report:
  - Bytes: 97.80% (802/820)
  - Statements: 91.67% (11/12)
  - **Branches: 75.00% (3/4)** ✅ — exactly the deliberate 2-of-3
    branch exercise.
  - Functions: 100.00% (3/3)
  - Lines: 94.44% (17/18)
- Output files written to `coverage/`:
  - `coverage/raw/coverage-<id>.json` — **raw V8 in identical shape to
    Playwright CT's `coverage/ct/raw/<id>.json`** (`{id, type: "v8",
    data: [{url, type: "js", scriptOffset, functions: [...]}]}`).
    Confirms the Phase 6b merge can simply use
    `inputDir: ['./coverage/raw', './coverage/ct/raw']` with no
    Istanbul mixing.
  - `coverage/raw/source-<hash>.json` — source files for source-map
    resolution.
  - `coverage/coverage-report.json` — full v8 report; per-file
    `src/sample.ts` shows `branches: {total: 4, covered: 3, pct: 75}`
    with deliberate uncovered range. Source-map worked: `url:
    "src/sample.ts"` (workspace-relative, NOT a chunk hash).

**Why this matters for Phase 6b:**

1. ✅ Source-map fidelity: Vitest's V8 output through monocart resolves
   back to `.ts`/`.tsx` source paths (the Q26 reopen condition does
   not trigger).
2. ✅ Format parity with CT: both runners emit the same raw V8 shape,
   so `inputDir: [vitestRaw, ctRaw]` is the trivial merge.
3. ✅ Library compatibility: vitest-monocart-coverage 4.0.x works with
   our pinned vitest@^4.1.5 (the package's runtime peer dep is
   `@vitest/coverage-v8@^4.1.2`; resolves to our 4.1.5 cleanly).
4. ✅ Configuration convention: separate `mcr.config.ts` is the
   documented integration pattern; vitest.config.ts only carries
   `provider: 'custom'` + `customProviderModule:
   'vitest-monocart-coverage'`.

**One deprecation warning to fix in Phase 6b**: `Importing from
"vitest/coverage" is deprecated since Vitest 4.1. Please use
"vitest/node" instead.` — emitted from `vitest-monocart-coverage`
internals. Tracked upstream; we cannot fix from our side. Will
file an upstream issue at the same maintainer's GitHub if it persists
beyond `vitest-monocart-coverage@4.0.2`. Does NOT block Phase 6b
adoption (warning only, runs cleanly).

**Phase 6b is unblocked.** The Q26 reopen condition (smoke-test failure
→ Option B custom converter) does not trigger.

### Phase 6b — Real adoption ✅ DONE iteration 119

> **Iteration 119 (2026-04-27)** executed all five steps end-to-end
> on Windows 10 + Node 24.14.1 + pnpm 10.33.0. The merged report now
> covers the full `packages/ui/src/` include set: **94.89% branches
> (223/235), 100% functions (104/104), 98.63% lines (1227/1244),
> 96.62% statements (343/355)** across 19 files. The per-file gate
> reports `FilterBar.tsx 100%` ✅, `LayoutSwitcher.tsx 100%` ✅,
> `MobileMenu.tsx 67.57%` ❌ — the 12 uncovered MobileMenu branches
> (`235 - 223 = 12`) are exactly the known gap acknowledged in the
> exit criterion below. Q26 ✅ RESOLVED.
>
> **One config delta vs. the original step 3 layout**: monocart-
> coverage-reports treats per-report `outputDir` as RELATIVE to its
> default global root (`./coverage-reports`), so the originally-planned
> `[['raw', { outputDir: './coverage/raw' }]]` placed output at
> `./coverage-reports/coverage/raw/` instead of `./coverage/raw/`. The
> deployed config uses top-level `outputDir: './coverage'` + `reports:
> ['raw']` for symmetry with Playwright CT's `playwright.ct.config.ts`
> (top-level `outputDir: COVERAGE_OUTPUT_DIR` + raw report). Output
> verified at `packages/ui/coverage/raw/coverage-<id>.json` (40 files
> per Vitest run, matching the 11 test files × ~2-4 fork pools
> envelope). See the iteration-119 log entry for the full delta.
>
> **Lockfile expansion**: 7 new top-level entries (the predicted 5 +
> 2 transitive moves: `astral-regex` and `whatwg-encoding` whose floors
> drift). All ≤ minor-version churn within `2.x` / `4.x` / `8.x` —
> within the iteration-117 prep envelope.

**Steps**:

1. `pnpm --filter @ever-works/ui add -D
   vitest-monocart-coverage@^4.0.0`. Verify the lockfile diff: 5 new
   top-level entries (`vitest-monocart-coverage`,
   `@vitest/coverage-v8`, `@vitest/coverage-istanbul`,
   `istanbul-lib-instrument`, `test-exclude`). The
   `monocart-coverage-reports` floor bumps from `^2.12.0` to `^2.12.9`
   (transitive of Q26 dep) — bump our explicit pin in
   `packages/ui/package.json` to `^2.12.9` to keep them aligned.
2. Edit `packages/ui/vitest.config.ts`:
   - Change `coverage.provider: 'v8'` to `coverage.provider: 'custom'`.
   - Add `coverage.customProviderModule: 'vitest-monocart-coverage'`.
   - Drop `coverage.reporter: ['text', 'json-summary', 'json']` (the
     reporter list moves to `mcr.config.ts`'s `reports:` array, which
     is monocart-shaped, not Vitest-shaped).
   - Keep `coverage.include` and `coverage.exclude` (`vitest-monocart-
     coverage` honors them as test-file-coverage filters).
3. Create `packages/ui/mcr.config.ts`:
   ```ts
   export default {
     name: 'Ever Works UI — Vitest Coverage',
     reports: [['raw', { outputDir: './coverage/raw' }]],
     sourceFilter: (sourcePath: string) =>
       sourcePath.includes('packages/ui/src/') ||
       sourcePath.startsWith('src/'),
     cleanCache: true,
   };
   ```
   Header comment block: cite this plan + Q26 + spec; explain why
   `'raw'` is the only output (the merged report is what Phase 3's
   `coverage-merge.ts` produces, not this per-runner stream).
4. Edit `packages/ui/scripts/coverage-merge.ts`:
   - Remove the `mcr.add(istanbul)` branch and its surrounding
     comment block.
   - Update `inputDir: ['./coverage/ct/raw']` to `inputDir:
     ['./coverage/raw', './coverage/ct/raw']`.
   - Remove the iteration-116 "Vitest Istanbul = ./coverage/coverage-
     final.json (NOT merged — see Q26)" stdout line.
   - Update header comment block: Q26 closed; both inputs now flow as
     raw V8 through one path.
5. Re-run `pnpm coverage`. Verify:
   - `coverage/raw/<id>.json` files appear (Vitest-side raw V8).
   - `coverage/ct/raw/<id>.json` files still appear (CT-side raw V8 —
     unchanged from Phase 1).
   - `coverage/merged/coverage-report.json` includes ALL files in
     `packages/ui/src/` (not just the CT subgraph) at expected
     coverage levels.
   - The per-file ≥80% branch gate (informational this iteration; hard
     gate in 6c) reports the same numbers as the per-runner reports
     for the three CT-migrated components.

**Exit criterion**:

`pnpm coverage` completes successfully. Merged report's
`coverage-summary.json` reports `>=99% branches` on the full
`packages/ui/src/` include set (matching the pre-Phase-2 baseline of
100% under Vitest-only when the three CT components were excluded).
The MobileMenu 67.57%-branch gap is the only remaining hard-failure
candidate; tracked separately under Q22 follow-up #3 sub-iteration.

### Phase 6c — Phase 4 CI gate enforcement

This is what Phase 4 (the existing one above) called "convert the
per-file ≥80% gate from informational warning to hard failure."
Sequenced AFTER 6b because the gate is meaningful only on the merged
full-surface number.

**Steps**:

1. In `packages/ui/scripts/coverage-merge.ts`, change the per-file
   gate's `process.exitCode = 0` block to `process.exitCode = 1` when
   any of the three components reports `<80%` branches. Keep the
   stdout messaging.
2. Add the corresponding step to `.github/workflows/ui-coverage.yml`
   (created in Phase 4 step 1 above).
3. Open a tracking sub-issue for MobileMenu's 12 uncovered branches —
   focus-trap teardown, pointer-vs-touch fallback, `prefers-reduced-
   motion` guards. New CT tests authored under Q22 follow-up #3
   sub-iteration; not blocked by Phase 6c, but if it lands first,
   merge will fail (intentional) until the new CT tests close the gap
   or the threshold is temporarily lowered with a tracking comment.

**Exit criterion**: a PR that drops a CT test below 80% branches
exits non-zero from `pnpm coverage`. A PR that does not drop coverage
exits zero.

### Phase 6d — Phase 5 doc + status flips

Identical to the existing Phase 5 below, with one extra line item:

8. **`docs/questions.md` Q26**: status `CONFIRMED — Option A` →
   `✅ RESOLVED — Option A adopted, source-maps verified`. Mirror
   the iteration-114 Q25 resolution wording.
9. **`docs/log.md`**: new iteration entry for Phase 6d. Cross-link
   to all three Phase 6 sub-iterations.

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
| 114       | 1          | ~1 hr  | Med  |
| 115       | 2          | ~30 m  | Med  |
| 116       | 3 (CT-only merge; Q26 surfaced) | ~1 hr | Med |
| 117 (this)| 6 plan + Q26 npm validation (no code) | ~30 m | Low |
| 118       | 6a (Q26 smoke test)         | ~30 m | Low |
| 119       | 6b (Q26 real adoption: provider swap + merge-script simplification) | ~1 hr | Med |
| 120       | 6c / 4 (CI gate enforcement) | ~30 m | Low |
| 121       | 6d / 5 (status flips, full-surface AC #5/#6 verification) | ~30 m | Low |

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
- ~~Does not rewrite the Vitest coverage provider. Vitest stays on
  `provider: 'v8'`.~~ **AMENDED iteration 117**: Phase 6 (Q26)
  introduces a Vitest provider swap to `vitest-monocart-coverage`
  (a custom provider that wraps `@vitest/coverage-v8` and writes raw
  V8 entries to `coverage/raw/`). The runtime V8-engine path is
  preserved — `vitest-monocart-coverage` declares
  `@vitest/coverage-v8: ^4.1.2` as a runtime dep, so the same V8
  collector that powered iteration-99-through-116 is still in
  effect. What changes is the per-test report format (raw V8 instead
  of Istanbul rollup), enabling the Phase 3 merge to consume both
  inputs through MCR's V8 path and avoid the iteration-116
  mutually-exclusive-dispatch crash.

## Open decisions

> Filled at execution time.

1. **Q25 library**: default `monocart-coverage-reports`. Confirm via
   Phase 0 smoke test. ✅ **CONFIRMED iteration 113** —
   `monocart-coverage-reports@^2.12.0` adopted; npm-validated
   2026-04-27.
2. **Reporter format(s)**: default `['v8', 'lcov', 'codecov']`. Drop
   `codecov` if not needed for our CI. **Updated iteration 116**:
   Phase 3 settled on `[['v8'], ['v8-json'], ['lcov'], ['codecov'],
   ['console-summary']]` — both `lcov` (for CI codecov-style
   uploads) and `codecov` (for direct Codecov ingestion) kept,
   because they cost almost nothing extra to emit and either may be
   useful in the Phase 4 CI artifact-upload step.
3. **PR-comment integration**: defer until the merged artifact is
   stable for ≥2 iterations. Cosmetic; not blocking.
4. **Q26 library** (added iteration 117): default
   `vitest-monocart-coverage@^4.0.0`. ✅ **NPM-VALIDATED iteration
   117**, smoke-test gated on Phase 6a.
5. **`mcr.config.ts` location** (added iteration 117): Phase 6b will
   create `packages/ui/mcr.config.ts` (per the README's listed
   alternatives `mcr.config.{js,cjs,mjs,ts,json}`). TS chosen for
   workspace consistency (R6 in AGENTS.md: TypeScript only).

## AGENTS.md cross-check

This plan inherits the cross-check from the parent spec at
`.specify/features/q22-playwright-coverage.md` "AGENTS.md cross-check"
section. Re-validate at each phase boundary; flag any deviation.
