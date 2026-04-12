import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration.
 * Tests the built static sites served by Astro preview.
 *
 * Projects:
 *   - chromium / mobile            → sample-basic on port 4323
 *   - events-chromium / events-mobile → sample-events on port 4325
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        trace: 'on-first-retry',
    },

    projects: [
        // ── sample-basic ──────────────────────────────────
        {
            name: 'chromium',
            testDir: './tests',
            testIgnore: ['**/events/**'],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:4323',
            },
        },
        {
            name: 'mobile',
            testDir: './tests',
            testIgnore: ['**/events/**'],
            use: {
                ...devices['iPhone 14'],
                baseURL: 'http://localhost:4323',
            },
        },

        // ── sample-events ─────────────────────────────────
        {
            name: 'events-chromium',
            testDir: './tests/events',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:4325',
            },
        },
        {
            name: 'events-mobile',
            testDir: './tests/events',
            use: {
                ...devices['iPhone 14'],
                baseURL: 'http://localhost:4325',
            },
        },
    ],

    webServer: [
        {
            command: 'pnpm --filter @ever-works/sample-basic preview',
            port: 4323,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'pnpm --filter @ever-works/sample-events preview',
            port: 4325,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
