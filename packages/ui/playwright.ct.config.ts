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
 */
import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
    testDir: './src/__tests__/ct',
    testMatch: '**/*.test.{ts,tsx}',
    timeout: 10_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'list',
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
