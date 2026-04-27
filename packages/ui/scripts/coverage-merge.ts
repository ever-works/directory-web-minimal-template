/**
 * Phase 3 (Q22 follow-up #3) coverage merge script.
 *
 * Spec: `.specify/features/q22-playwright-coverage.md`
 * Plan: `docs/plans/q22-playwright-coverage.md` (Phase 3)
 *
 * What it does
 * ------------
 * Merges Playwright Component Test (CT) raw V8 coverage entries from
 * `./coverage/ct/raw/*.json` (written by monocart-reporter's `'raw'`
 * report type — see `playwright.ct.config.ts`) into a single merged
 * coverage report at `./coverage/merged/`.
 *
 * The Vitest Istanbul report at `./coverage/coverage-final.json` is
 * intentionally NOT merged in this iteration — see "Why CT-only" below.
 * The per-runner Vitest output remains the source of truth for files
 * Vitest exercises (everything in `packages/ui/src/` *except* the three
 * CT-migrated components: `FilterBar.tsx`, `LayoutSwitcher.tsx`,
 * `MobileMenu.tsx`).
 *
 * Why CT-only (iteration 116 finding)
 * -----------------------------------
 * The original Phase 3 plan envisioned `mcr.add(istanbul) + inputDir(rawV8)`
 * mixing in a single MCR instance. Iteration 116 implementation surfaced
 * a hard limitation in monocart-coverage-reports@2.12.11:
 *
 *   - `getCoverageResults` (lib/generate.js) inspects `dataList[0].type`
 *     to choose either the V8 path or the Istanbul path; both paths are
 *     mutually exclusive.
 *   - When V8 raw entries are present (via `inputDir`) AND Istanbul
 *     entries are added (via `mcr.add(istanbul)`), the converter routes
 *     all entries through `convertV8List` → `convertCoverages`, which
 *     dispatches on `item.type === 'js'` and otherwise falls into
 *     `getCssAstInfo`. Istanbul entries lack `type: 'js'`, so they hit
 *     `getCssAstInfo` and crash on `ranges.sort()` because there are no
 *     ranges.
 *
 * The error reproduces deterministically as:
 *   `[MCR] Not found source data: undefined`
 *   `TypeError: Cannot read properties of undefined (reading 'sort')`
 *   `at getCssAstInfo (.../converter/ast.js:339:12)`
 *
 * Resolution path: install `vitest-monocart-coverage` so Vitest also
 * emits raw V8 entries (instead of Istanbul). Then both inputs flow
 * through the same V8 path. Tracked as Q26 in `docs/questions.md` —
 * deferred to a follow-up iteration to keep Phase 3 scope contained.
 *
 * Until then, the merge produces a CT-scoped report covering the three
 * CT-migrated components plus their imported primitives. Files outside
 * the CT subgraph (the rest of `packages/ui/src/`) keep their per-runner
 * Vitest coverage in `coverage/coverage-summary.json` — they are at
 * 100% there, unaffected by this script.
 *
 * Inputs
 * ------
 *   - `./coverage/ct/raw/*.json` — per-test raw V8 entries written by
 *     monocart-reporter's `'raw'` report. Auto-loaded by MCR via
 *     `inputDir`. See `playwright.ct.config.ts` `coverage.reports`.
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
 * informational signals during Phase 3 (gate enforcement is deferred
 * to Phase 4 CI integration). The exit code is non-zero only when MCR
 * itself fails to generate a report.
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { CoverageReport } from 'monocart-coverage-reports';

const VITEST_FINAL = './coverage/coverage-final.json';
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
    const hasVitest = existsSync(VITEST_FINAL);
    const hasCt = existsSync(CT_RAW_DIR);

    console.log(`coverage-merge: Vitest Istanbul = ${hasVitest ? VITEST_FINAL : 'absent'} (NOT merged — see Q26)`);
    console.log(`coverage-merge: CT raw V8       = ${describeRawDir(CT_RAW_DIR)}`);

    if (!hasCt) {
        console.error(
            'coverage-merge: ./coverage/ct/raw/ is absent — run `pnpm test:ct` first.',
        );
        process.exit(1);
    }

    const mcr = new CoverageReport({
        name: '@ever-works/ui Merged Coverage (CT subgraph)',
        inputDir: [CT_RAW_DIR],
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
        // so the merged report keeps only files in `packages/ui/src/`
        // (after source-map unpacking) and excludes test scaffolding.
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
    // Reported informationally in this iteration; Phase 4 CI will enforce.
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
            '  Gate is informational this iteration; Phase 4 CI will enforce.',
        );
        console.warn(
            '  See `docs/plans/q22-playwright-coverage.md` Phase 4 for CI gate.',
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
