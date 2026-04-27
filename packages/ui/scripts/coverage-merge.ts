/**
 * Phase 3 + 6b (Q22 follow-up #3) coverage merge script.
 *
 * Spec: `.specify/features/q22-playwright-coverage.md`
 * Plan: `docs/plans/q22-playwright-coverage.md` (Phases 3 + 6b)
 * Question: `docs/questions.md` Q26 (✅ RESOLVED, iteration 119)
 *
 * What it does
 * ------------
 * Merges raw V8 coverage entries from BOTH runners into a single merged
 * coverage report at `./coverage/merged/`:
 *
 *   - `./coverage/raw/*.json`     — Vitest-side raw V8 entries written
 *                                   by `vitest-monocart-coverage` (Q26
 *                                   ✅ adopted iteration 119; provider
 *                                   = 'custom', mcr.config.ts: reports
 *                                   = [['raw', { outputDir: './coverage/raw' }]]).
 *   - `./coverage/ct/raw/*.json`  — Playwright CT raw V8 entries written
 *                                   by monocart-reporter's `'raw'` report
 *                                   (Phase 1, iteration 114).
 *
 * Both inputs flow through MCR's V8 path because they share the same raw
 * V8 entry shape. The Q26 hard limitation that previously blocked
 * Vitest+CT mixing (Istanbul vs raw V8 dispatch in `getCoverageResults`)
 * is dismantled by Q26's drop-in custom provider.
 *
 * Q26 background (kept for archeology — closed iteration 119)
 * -----------------------------------------------------------
 * Iteration 116's first attempt at the merge used `mcr.add(istanbul) +
 * inputDir(rawV8)`. monocart-coverage-reports@2.12.11 dispatches in
 * `getCoverageResults` (lib/generate.js) on `dataList[0].type` — the V8
 * and Istanbul paths are mutually exclusive. Mixing produced
 * `[MCR] Not found source data: undefined` →
 * `TypeError: Cannot read properties of undefined (reading 'sort') at
 * getCssAstInfo`. iteration 117 npm-validated `vitest-monocart-coverage`
 * + smoke-tested it; iteration 119 (this file's last edit) adopted it
 * for real and removed the Istanbul branch from this script.
 *
 * Outputs
 * -------
 *   - `./coverage/merged/index.html` — visual V8 HTML report.
 *   - `./coverage/merged/coverage-report.json` — V8-JSON shape with
 *     full per-byte data + per-file summary.
 *   - `./coverage/merged/lcov.info` — LCOV format.
 *   - `./coverage/merged/codecov.json` — Codecov format.
 *   - stdout console-summary table from monocart.
 *
 * Exit-criterion handling
 * -----------------------
 * The plan's exit criterion is "≥80% branch coverage for each of
 * `FilterBar.tsx`, `LayoutSwitcher.tsx`, `MobileMenu.tsx`". The script
 * checks each and prints a per-file gate report. Per-file failures are
 * logged with ❌ but do NOT cause a non-zero exit — they're treated as
 * informational signals. Phase 6c CI integration converts these to a
 * hard failure once MobileMenu's 12 uncovered branches are closed.
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { CoverageReport } from 'monocart-coverage-reports';

const VITEST_RAW_DIR = './coverage/raw';
const CT_RAW_DIR = './coverage/ct/raw';
const OUT_DIR = './coverage/merged';

function pluralize(n: number, singular: string, plural?: string): string {
    return `${n} ${n === 1 ? singular : plural ?? `${singular}s`}`;
}

function describeRawDir(dir: string): string {
    if (!existsSync(dir)) return 'absent';
    const entries = readdirSync(dir).filter((f) => f.endsWith('.json'));
    return `${pluralize(entries.length, 'raw V8 file')}`;
}

async function main(): Promise<void> {
    const hasVitestRaw = existsSync(VITEST_RAW_DIR);
    const hasCt = existsSync(CT_RAW_DIR);

    console.log(`coverage-merge: Vitest raw V8 = ${describeRawDir(VITEST_RAW_DIR)}`);
    console.log(`coverage-merge: CT raw V8     = ${describeRawDir(CT_RAW_DIR)}`);

    if (!hasVitestRaw && !hasCt) {
        console.error(
            'coverage-merge: BOTH `./coverage/raw/` and `./coverage/ct/raw/` are absent — run `pnpm test:coverage` and `pnpm test:ct` first.',
        );
        process.exit(1);
    }
    if (!hasVitestRaw) {
        console.warn(
            'coverage-merge: ./coverage/raw/ is absent — run `pnpm test:coverage` first. Continuing with CT-only inputs.',
        );
    }
    if (!hasCt) {
        console.warn(
            'coverage-merge: ./coverage/ct/raw/ is absent — run `pnpm test:ct` first. Continuing with Vitest-only inputs.',
        );
    }

    const inputDir: string[] = [];
    if (hasVitestRaw) inputDir.push(VITEST_RAW_DIR);
    if (hasCt) inputDir.push(CT_RAW_DIR);

    const mcr = new CoverageReport({
        name: '@ever-works/ui Merged Coverage (Vitest + CT)',
        inputDir,
        outputDir: OUT_DIR,
        cleanCache: true,
        reports: [
            ['v8'],
            ['v8-json'],
            ['lcov'],
            ['codecov'],
            ['console-summary'],
        ],
        // Mirror the per-runner sourceFilter from `playwright.ct.config.ts`
        // and `mcr.config.ts` so the merged report keeps only files in
        // `packages/ui/src/` (after source-map unpacking) and excludes
        // test scaffolding.
        sourceFilter: (sourcePath: string): boolean => {
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

    const report = await mcr.generate();
    if (!report) {
        console.error('coverage-merge: no report generated.');
        process.exit(1);
    }

    const { summary, files } = report;
    console.log(`\ncoverage-merge: ✅ merged report generated.`);
    console.log(`  Output:    ${resolve(OUT_DIR)}`);
    console.log(`  Files:     ${files.length}`);
    console.log(
        `  Branches:  ${Number(summary.branches.pct).toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`,
    );
    console.log(
        `  Functions: ${Number(summary.functions.pct).toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`,
    );
    console.log(
        `  Lines:     ${Number(summary.lines.pct).toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`,
    );
    console.log(
        `  Statements: ${Number(summary.statements.pct).toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`,
    );

    // Per-file ≥80% branch check for the three CT-migrated components.
    // This is the Phase 3 exit-criterion AC #5 (per-file gate).
    // Reported informationally in this iteration; Phase 6c CI will enforce.
    const targets = [
        'src/preact/FilterBar.tsx',
        'src/preact/LayoutSwitcher.tsx',
        'src/preact/MobileMenu.tsx',
    ];
    console.log(`\ncoverage-merge: per-file gate (≥80% branches, informational):`);
    let belowGate = 0;
    for (const target of targets) {
        const file = files.find((f) =>
            (f.sourcePath ?? '').replace(/\\/g, '/').endsWith(target),
        );
        if (!file) {
            console.warn(`  ⚠️  ${target}: NOT FOUND in merged files[]`);
            belowGate++;
            continue;
        }
        const pct = Number(file.summary.branches.pct);
        const ok = pct >= 80;
        const symbol = ok ? '✅' : '❌';
        console.log(
            `  ${symbol} ${target}: ${pct.toFixed(2)}% branches (${file.summary.branches.covered}/${file.summary.branches.total})`,
        );
        if (!ok) belowGate++;
    }

    if (belowGate > 0) {
        console.warn(
            `\ncoverage-merge: ⚠️  ${pluralize(belowGate, 'target')} below the 80% branch gate.`,
        );
        console.warn(
            '  Gate is informational this iteration; Phase 6c CI will enforce.',
        );
        console.warn(
            '  See `docs/plans/q22-playwright-coverage.md` Phase 6c for CI gate.',
        );
    } else {
        console.log(`\ncoverage-merge: ✅ Phase 3 per-file gate satisfied.`);
    }
}

main().catch((err) => {
    console.error('coverage-merge: failed with error:');
    console.error(err);
    process.exit(1);
});
