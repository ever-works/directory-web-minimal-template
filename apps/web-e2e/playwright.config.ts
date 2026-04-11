import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration.
 * Tests the built static site served by Astro preview.
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:4323',
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile',
            use: { ...devices['iPhone 14'] },
        },
    ],

    webServer: {
        command: 'pnpm --filter @ever-works/sample-basic preview',
        port: 4323,
        reuseExistingServer: !process.env.CI,
    },
});
