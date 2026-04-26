import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
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
    test: {
        include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
        // Playwright Component Tests live under `src/__tests__/ct/` and use
        // `@playwright/experimental-ct-react` — they are run by `pnpm test:ct`,
        // not by Vitest. Excluding them here keeps the Vitest collector from
        // discovering and choking on `.ct.test.tsx` files. See
        // `docs/plans/q22-playwright-ct.md` Step 5.
        exclude: ['**/__tests__/ct/**', 'node_modules/**', 'dist/**'],
        environment: 'jsdom',
        setupFiles: [resolve(__dirname, 'src/__tests__/setup.ts')],
        pool: 'forks',
        maxWorkers: 1,
        testTimeout: 30_000,
        hookTimeout: 30_000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary'],
            include: ['src/**/*.{ts,tsx}'],
            // `src/preact/FilterBar.tsx`, `src/preact/LayoutSwitcher.tsx`,
            // and `src/preact/MobileMenu.tsx` are exercised by Playwright CT
            // (`packages/ui/src/__tests__/ct/{filter-bar,layout-switcher,
            // mobile-menu}.ct.test.tsx`) — their Vitest counterparts were
            // removed in iterations 105, 107, and 108 respectively because
            // of the Q22 / Q23 Worker-IPC crash on Windows + Node 24
            // (FilterBar, LayoutSwitcher) or preemptively to defuse the
            // same fingerprint risk (MobileMenu).
            // Once `playwright-coverage` is integrated (Q22 follow-up #3
            // in `docs/plans/q22-playwright-ct.md`) these exclusions can
            // drop and CT runs will contribute back to the V8 branch
            // report.
            exclude: [
                'src/**/__tests__/**',
                'src/**/*.test.{ts,tsx}',
                'src/preact/FilterBar.tsx',
                'src/preact/LayoutSwitcher.tsx',
                'src/preact/MobileMenu.tsx',
            ],
        },
    },
});
