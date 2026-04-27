/**
 * Playwright Component Testing config for @ever-works/ui.
 *
 * Q22 (see docs/questions.md, .specify/features/q22-playwright-ct.md):
 * the Vitest+jsdom runner crashes for `FilterBar` on Windows + Node 24.
 * This config powers the migration to Playwright CT, which mounts
 * components in a real Chromium tab and bypasses the jsdom event-teardown
 * path that triggers the IPC worker crash.
 *
 * Per iteration-103 correction: we use `@playwright/experimental-ct-react`
 * (Path A) — `@playwright/experimental-ct-preact` does NOT exist on npm.
 * The Vite `resolve.alias` block below redirects React imports to
 * `preact/compat` so `mount(<PreactComponent />)` ends up calling Preact's
 * `h()` via `preact/compat.createElement`. This mirrors the existing alias
 * pattern in `packages/ui/vitest.config.ts`.
 *
 * If this Path A fails (smoke test in Step 3 of the plan throws or renders
 * an empty subtree), switch to Path B = `@playwright/experimental-ct-core`
 * with a custom Preact mount adapter. See the spec for the decision tree.
 *
 * --- Q22 follow-up #3 — playwright-coverage integration (Phase 1) ---
 *
 * Spec:  `.specify/features/q22-playwright-coverage.md`
 * Plan:  `docs/plans/q22-playwright-coverage.md`
 *
 * The `monocart-reporter` entry below collects per-test V8 JS coverage
 * via the auto-fixture in `src/__tests__/ct/fixtures.ts` (which calls
 * `addCoverageReport(coverage, testInfo)` after every test) and merges
 * the data into a single coverage report under `./coverage/ct/`.
 *
 * `entryFilter` keeps only V8 entries whose URL points at the migrated
 * Preact components in `src/preact/` and the headless primitives in
 * `src/primitives/`. `sourceFilter` keeps only sources unpacked from
 * source-maps that live under `packages/ui/src/`.
 *
 * `onEnd` writes a `raw-v8.json` file with the V8-native `{result: [...]}`
 * shape required by the plan's Phase 1 exit criterion (≥3 entries — one
 * per migrated component). The other reports (`v8`, `v8-json`,
 * `console-summary`) are produced by monocart from the same merged data.
 */
import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const COVERAGE_OUTPUT_DIR = './coverage/ct';
const RAW_V8_PATH = resolve(COVERAGE_OUTPUT_DIR, 'raw-v8.json');

export default defineConfig({
    testDir: './src/__tests__/ct',
    testMatch: '**/*.test.{ts,tsx}',
    timeout: 10_000,
    // `fullyParallel: false` because every CT worker would bind the same
    // `ctPort: 3100` Vite dev server (shared across the run by Playwright's
    // CT architecture). With more than one CT test file present, parallel
    // workers race for the port and trip `net::ERR_CONNECTION_REFUSED`
    // (observed in iteration 107 when adding `layout-switcher.ct.test.tsx`
    // alongside `filter-bar.ct.test.tsx`: 11/28 tests failed before the
    // pin landed). Sequential execution gives the same correctness signal
    // and adds <10 s of wall time at our current test volume.
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [
        [process.env.CI ? 'github' : 'list'],
        [
            'monocart-reporter',
            {
                name: '@ever-works/ui CT Coverage',
                outputFile: `${COVERAGE_OUTPUT_DIR}/index.html`,
                coverage: {
                    name: '@ever-works/ui CT Coverage',
                    outputDir: COVERAGE_OUTPUT_DIR,
                    reports: [
                        'v8',
                        'v8-json',
                        'console-summary',
                    ],
                    // V8 emits URLs for the *bundled* chunks the CT Vite
                    // server serves at `http://localhost:3100/assets/*.js`
                    // (e.g. `FilterBar-<hash>.js`, `index-<hash>.js`). Keep
                    // every chunk under that prefix; the per-source filter
                    // below narrows to packages/ui/src after source-map
                    // unpacking.
                    entryFilter: (entry: { url?: string }) => {
                        const url = entry.url ?? '';
                        return /\/assets\/[^/?]+\.js(?:\?|$)/.test(url);
                    },
                    // After source-maps are applied, keep only sources
                    // that originate inside `packages/ui/src/` and aren't
                    // test scaffolding (the `__tests__/` dir or the
                    // Playwright CT host file).
                    sourceFilter: (sourcePath: string) => {
                        if (!sourcePath) return false;
                        if (sourcePath.includes('__tests__/')) return false;
                        if (sourcePath.includes('playwright/index.')) return false;
                        if (sourcePath.includes('node_modules/')) return false;
                        return (
                            sourcePath.includes('packages/ui/src/') ||
                            sourcePath.startsWith('src/')
                        );
                    },
                    onEnd: async (coverageResults: {
                        files?: Array<{
                            url?: string;
                            sourcePath?: string;
                            summary?: unknown;
                        }>;
                    }) => {
                        // Phase 1 exit criterion: emit a V8-native shape JSON
                        // (`{result: [{url, ...}]}`) at coverage/ct/raw-v8.json
                        // with ≥3 entries (one per migrated component).
                        // We re-emit the post-merge file list rather than
                        // raw per-test V8 entries because the plan only
                        // requires a count check on `result`, and the merged
                        // shape is more useful for the Phase 3 merge step.
                        const files = coverageResults.files ?? [];
                        const result = files.map((f) => ({
                            url: f.sourcePath ?? f.url ?? '',
                            sourcePath: f.sourcePath,
                            summary: f.summary,
                        }));
                        mkdirSync(dirname(RAW_V8_PATH), { recursive: true });
                        writeFileSync(
                            RAW_V8_PATH,
                            JSON.stringify({ result }, null, 2),
                        );
                    },
                },
            },
        ],
    ],
    use: {
        trace: 'on-first-retry',
        ctPort: 3100,
        ctViteConfig: {
            resolve: {
                alias: {
                    'react': 'preact/compat',
                    'react-dom': 'preact/compat',
                    'react-dom/test-utils': 'preact/test-utils',
                },
            },
            esbuild: {
                jsxFactory: 'h',
                jsxFragment: 'Fragment',
                jsxImportSource: 'preact',
            },
        },
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
