import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration.
 * Tests the built static sites served by Astro preview.
 *
 * Projects:
 *   - chromium / mobile            → sample-basic on port 4323
 *   - visual                        → visual regression tests on port 4323
 *   - events-chromium / events-mobile → sample-events on port 4325
 *   - jobs-chromium / jobs-mobile   → sample-jobs on port 4324
 *   - re-chromium / re-mobile       → sample-real-estate on port 4326
 *   - git-chromium / git-mobile     → sample-git on port 4327
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
            testIgnore: ['**/events/**', '**/jobs/**', '**/real-estate/**', '**/git/**', '**/visual/**'],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:4323',
            },
        },
        {
            name: 'mobile',
            testDir: './tests',
            testIgnore: ['**/events/**', '**/jobs/**', '**/real-estate/**', '**/git/**', '**/visual/**'],
            use: {
                ...devices['iPhone 14'],
                baseURL: 'http://localhost:4323',
            },
        },

        // ── visual regression (sample-basic) ──────────────
        {
            name: 'visual',
            testDir: './tests/visual',
            use: {
                ...devices['Desktop Chrome'],
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

        // ── sample-jobs ───────────────────────────────────
        {
            name: 'jobs-chromium',
            testDir: './tests/jobs',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:4324',
            },
        },
        {
            name: 'jobs-mobile',
            testDir: './tests/jobs',
            use: {
                ...devices['iPhone 14'],
                baseURL: 'http://localhost:4324',
            },
        },

        // ── sample-real-estate ────────────────────────────
        {
            name: 're-chromium',
            testDir: './tests/real-estate',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:4326',
            },
        },
        {
            name: 're-mobile',
            testDir: './tests/real-estate',
            use: {
                ...devices['iPhone 14'],
                baseURL: 'http://localhost:4326',
            },
        },
        // ── sample-git ────────────────────────────────────
        {
            name: 'git-chromium',
            testDir: './tests/git',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: 'http://localhost:4327',
            },
        },
        {
            name: 'git-mobile',
            testDir: './tests/git',
            use: {
                ...devices['iPhone 14'],
                baseURL: 'http://localhost:4327',
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
        {
            command: 'pnpm --filter @ever-works/sample-jobs preview',
            port: 4324,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'pnpm --filter @ever-works/sample-real-estate preview',
            port: 4326,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'pnpm --filter @ever-works/sample-git preview',
            port: 4327,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
