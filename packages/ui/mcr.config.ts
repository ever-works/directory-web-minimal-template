/**
 * Monocart Coverage Reports config — Vitest side.
 *
 * Spec: `.specify/features/q22-playwright-coverage.md`
 * Plan: `docs/plans/q22-playwright-coverage.md` (Phase 6b)
 * Question: `docs/questions.md` Q26
 *
 * Why this file exists
 * --------------------
 * `vitest-monocart-coverage` (Q26 ✅ adopted, iteration 119) is a custom
 * Vitest coverage provider that wraps `@vitest/coverage-v8`. It loads its
 * monocart-side options from a sibling `mcr.config.ts` (this file).
 * Vitest-side options (`include`, `exclude`) stay in `vitest.config.ts`.
 *
 * Why `'raw'` is the only output here
 * -----------------------------------
 * Per-runner coverage from Vitest is NOT the merged report. The merged
 * full-surface report comes from `packages/ui/scripts/coverage-merge.ts`,
 * which consumes raw V8 entries from BOTH `./coverage/raw/` (this file
 * tells `vitest-monocart-coverage` to write them here) and
 * `./coverage/ct/raw/` (Playwright CT raw entries — see
 * `playwright.ct.config.ts` `coverage.reports`). The merge step picks
 * the human-facing report formats (lcov, codecov, v8 HTML, etc.) for
 * `./coverage/merged/`. Keeping per-runner output as raw V8 only is
 * what makes the merge a single-format `inputDir` operation rather than
 * an Istanbul/V8 mixing problem (the original Q26 hard limitation).
 *
 * Source filter
 * -------------
 * Mirrors the per-runner sourceFilter from `playwright.ct.config.ts`
 * so both runners' raw V8 streams cover the same `packages/ui/src/`
 * surface.
 */
export default {
    name: 'Ever Works UI — Vitest Coverage',
    // Top-level `outputDir: './coverage'` + `reports: ['raw']` writes raw
    // V8 entries to `./coverage/raw/coverage-<id>.json` — matching the
    // Playwright CT layout in `playwright.ct.config.ts` (where
    // `outputDir: COVERAGE_OUTPUT_DIR` ('./coverage/ct') + `reports:
    // ['v8', 'v8-json', 'console-summary', 'raw']` writes to
    // `./coverage/ct/raw/<id>.json`).
    //
    // The earlier per-report-tuple form `[['raw', { outputDir:
    // './coverage/raw' }]]` (Phase 6a smoke test, iteration 117) was
    // ambiguous: monocart-coverage-reports treats per-report `outputDir`
    // as RELATIVE to the global default (`./coverage-reports`), so the
    // output landed at `./coverage-reports/coverage/raw/` rather than
    // `./coverage/raw/`. Iteration 119 normalized to top-level outputDir
    // for layout symmetry with CT.
    outputDir: './coverage',
    reports: ['raw'],
    sourceFilter: (sourcePath: string): boolean => {
        if (!sourcePath) return false;
        if (sourcePath.includes('node_modules/')) return false;
        if (sourcePath.includes('__tests__/')) return false;
        return (
            sourcePath.includes('packages/ui/src/') ||
            sourcePath.startsWith('src/')
        );
    },
    // cleanCache wipes `./coverage` at the start of each run. Safe here
    // because Vitest runs BEFORE Playwright CT in `pnpm coverage`, and CT
    // writes to `./coverage/ct/` which is recreated after the Vitest
    // sub-step. A user running `pnpm test:coverage` standalone will lose
    // the CT outputs from a previous run; that's acceptable since the
    // merged report is canonical.
    cleanCache: true,
};
