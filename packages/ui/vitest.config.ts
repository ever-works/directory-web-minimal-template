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
            // Iteration 116 (Q22 follow-up #3 Phase 3) added 'json' so Vitest
            // writes `coverage/coverage-final.json` — the per-file Istanbul-shape
            // file that `packages/ui/scripts/coverage-merge.ts` consumes via
            // `mcr.add()` to combine Vitest + CT into one merged report.
            // 'text' (stdout summary) and 'json-summary' (the `coverage-summary.json`
            // aggregate) were already in place since iteration 95.
            reporter: ['text', 'json-summary', 'json'],
            include: ['src/**/*.{ts,tsx}'],
            // `src/preact/FilterBar.tsx`, `src/preact/LayoutSwitcher.tsx`,
            // and `src/preact/MobileMenu.tsx` are exercised by Playwright CT
            // (`packages/ui/src/__tests__/ct/{filter-bar,layout-switcher,
            // mobile-menu}.ct.test.tsx`) — their Vitest counterparts were
            // removed in iterations 105, 107, and 108 respectively because
            // of the Q22 / Q23 Worker-IPC crash on Windows + Node 24
            // (FilterBar, LayoutSwitcher) or preemptively to defuse the
            // same fingerprint risk (MobileMenu).
            //
            // Iteration 115 (Q22 follow-up #3 Phase 2): the three explicit
            // exclusions for FilterBar/LayoutSwitcher/MobileMenu were
            // dropped. They are now part of the Vitest `include` set and
            // will report 0% Vitest coverage (Vitest never executes them).
            // The CT runner captures their V8 coverage via
            // `monocart-reporter` (Phase 1, iteration 114) and writes
            // `coverage/ct/raw-v8.json` + `coverage/ct/raw/<id>.json`.
            //
            // Iteration 116 (Q22 follow-up #3 Phase 3): the `pnpm coverage`
            // command merges Vitest + CT into one report at
            // `coverage/merged/`. The per-file branch coverage for the
            // three CT components is restored there. Plain `pnpm --filter
            // @ever-works/ui test:coverage` (this config alone) STILL
            // reports the lower per-runner Vitest-only number — that's
            // the intended pre-merge state used as a Phase 2 exit-criterion
            // signal. See `docs/plans/q22-playwright-coverage.md` and
            // `.specify/features/q22-playwright-coverage.md` AC #5/#6.
            exclude: [
                'src/**/__tests__/**',
                'src/**/*.test.{ts,tsx}',
            ],
        },
    },
});
