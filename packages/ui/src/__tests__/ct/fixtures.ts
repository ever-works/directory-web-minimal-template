/**
 * Auto-coverage fixture for `@ever-works/ui` Playwright Component Tests.
 *
 * Wraps the `@playwright/experimental-ct-react` `test` with an automatic
 * fixture that starts and stops V8 JS coverage around every CT test and
 * pipes the per-test V8 coverage list into `monocart-reporter` via
 * `addCoverageReport()`. Monocart's global aggregator then merges the
 * per-test data into a single coverage report under
 * `packages/ui/coverage/ct/`.
 *
 * Plan: `docs/plans/q22-playwright-coverage.md` Phase 1 step 2.
 * Spec: `.specify/features/q22-playwright-coverage.md` AC #2 / AC #3.
 *
 * Why a custom fixture (not just a reporter):
 *   The `monocart-reporter` Playwright reporter does not auto-instrument
 *   `page.coverage.*`; it only exposes `addCoverageReport()` for a fixture
 *   or test body to call. Without this fixture, `coverage/ct/raw-v8.json`
 *   would be empty and Phase 1's exit criterion (≥3 V8 entries — one per
 *   migrated component) would fail.
 *
 * Compatibility:
 *   `page.coverage` is Chromium-only. The CT config currently runs only
 *   the `chromium` project, so the `browserName === 'chromium'` guard is
 *   defensive — it lets a future Firefox/WebKit project skip coverage
 *   instead of crashing on `page.coverage.startJSCoverage`.
 */
import { test as base, expect } from '@playwright/experimental-ct-react';
import { addCoverageReport } from 'monocart-reporter';

// We cast to `typeof base` so that consumers of `fixtures.ts` see the same
// public surface as `@playwright/experimental-ct-react`. The added fixture
// is a `{ autoCoverage: void }` auto-fixture that runs implicitly and is
// never accessed by name in test bodies — exposing it in the type would
// also force every consumer to depend on `RouterFixture` from
// `@playwright/experimental-ct-core` (TS2883), which is an unstable
// internal export.
const extended = base.extend<{ autoCoverage: void }>({
    autoCoverage: [
        async ({ page, browserName }, use, testInfo) => {
            if (browserName !== 'chromium') {
                await use();
                return;
            }
            await page.coverage.startJSCoverage({
                resetOnNavigation: false,
            });
            await use();
            const coverage = await page.coverage.stopJSCoverage();
            await addCoverageReport(coverage, testInfo);
        },
        { scope: 'test', auto: true },
    ],
});

export const test: typeof base = extended as typeof base;
export { expect };
