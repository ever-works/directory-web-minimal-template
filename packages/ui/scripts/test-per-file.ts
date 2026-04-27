/**
 * Run vitest one test file at a time, sequentially.
 *
 * Status: DEFENSIVE FALLBACK — no longer required for any test file in
 * this package. As of iteration 110 (2026-04-27), plain `pnpm --filter
 * @ever-works/ui test` runs all 11 Vitest files (174 tests) to
 * completion in ~98 s on Windows + Node 24.14.0 — verified 2 of 2
 * consecutive runs in the iteration-110 health pass. The original Q22
 * Worker-IPC hang fingerprint (Vitest 4.1.5 + jsdom 29 + Preact 10.29 +
 * Node 24.14, Windows) does not reproduce after the three Q22-shape
 * components (`FilterBar`, `LayoutSwitcher`, `MobileMenu`) were
 * migrated to Playwright Component Testing in iterations 105 / 107 /
 * 108 and the `EMPTY_TAGS` / `EMPTY_MODES` allocation races were fixed
 * in iterations 105 / 109.
 *
 * Why this script is kept (not deleted):
 *
 * 1. Operating-room failsafe — if a future Vitest / jsdom / Node bump
 *    re-introduces the IPC hang, this runner reproduces the
 *    iteration-98 baseline behavior with zero re-engineering.
 * 2. Per-file isolation is occasionally useful for debugging a single
 *    flaky test without pulling the whole suite in.
 * 3. The cron-task instruction "Do NOT remove anything (move or
 *    improve is OK)" — see `AGENTS.md` R15. The script is a small,
 *    self-contained, well-documented helper; keeping it has near-zero
 *    cost and meaningful insurance value.
 *
 * Q22 follow-up #2 status: SUPERSEDED — the original goal ("remove
 * `pnpm test:ui:safe`") is replaced by "soft-deprecate, keep as
 * defensive fallback". See `docs/questions.md` Q22 / Q25 and
 * `docs/log.md` iteration 110.
 *
 * Workaround mode (historical):
 *   On Windows the combined UI test suite hung after a few test files
 *   completed with `Worker forks emitted error / Worker exited
 *   unexpectedly`, apparently due to jsdom/Preact teardown leaking
 *   handles across fork lifecycles. Each individual test file ran
 *   cleanly. The CT migrations + sentinel fixes resolved the underlying
 *   cause; this runner is the documented escape hatch if the symptom
 *   ever returns.
 *
 * Usage: tsx scripts/test-per-file.ts [file ...]
 *   With no arguments: discovers all `*.test.{ts,tsx}` files under
 *   `src/__tests__/` and runs each one in its own vitest invocation.
 *
 * Exits 0 if every file passes, 1 if any fails.
 */

import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';

interface FileResult {
    file: string;
    status: number | null;
    durationMs: number;
}

function discoverTests(root: string): string[] {
    const out: string[] = [];
    function walk(dir: string): void {
        for (const entry of readdirSync(dir)) {
            // Skip the Playwright Component Testing directory — those
            // `.test.tsx` files are run by `pnpm test:ct`, not Vitest.
            // Without this the per-file runner spawns Vitest against
            // `*.ct.test.tsx` files (which import `@playwright/...`) and
            // fails. See `docs/architecture/testing-runners.md`.
            if (entry === 'ct' && dir.endsWith(`${sep}__tests__`)) continue;
            const p = join(dir, entry);
            const s = statSync(p);
            if (s.isDirectory()) walk(p);
            else if (/\.test\.(ts|tsx)$/.test(entry)) out.push(p);
        }
    }
    walk(root);
    return out.sort();
}

function relativise(file: string, cwd: string): string {
    return file.startsWith(cwd) ? file.slice(cwd.length + 1) : file;
}

function main(): void {
    const cwd = process.cwd();
    const explicit = process.argv.slice(2);
    const files = explicit.length ? explicit.map((f) => resolve(cwd, f)) : discoverTests(resolve(cwd, 'src/__tests__'));

    if (files.length === 0) {
        console.error('[test-per-file] no test files found');
        process.exit(1);
    }

    console.log(`[test-per-file] running ${files.length} test files sequentially in isolated vitest invocations`);

    // Spawn the vitest CLI script directly via Node so we don't need a shell
    // (avoids quoting headaches on Windows paths containing spaces).
    const vitestScript = resolve(cwd, 'node_modules', 'vitest', 'vitest.mjs');

    const results: FileResult[] = [];
    const start = Date.now();

    for (const file of files) {
        const rel = relativise(file, cwd);
        process.stdout.write(`\n[test-per-file] -> ${rel}\n`);
        const t0 = Date.now();
        const res = spawnSync(process.execPath, [vitestScript, 'run', file], {
            stdio: 'inherit',
            cwd,
            env: { ...process.env, FORCE_COLOR: '1' }
        });
        results.push({ file: rel, status: res.status, durationMs: Date.now() - t0 });
    }

    const elapsedS = ((Date.now() - start) / 1000).toFixed(1);
    const failures = results.filter((r) => r.status !== 0);
    const passes = results.length - failures.length;

    console.log(`\n[test-per-file] summary — ${passes}/${results.length} files passed in ${elapsedS}s`);
    for (const r of results) {
        const tag = r.status === 0 ? 'PASS' : `FAIL(${r.status})`;
        const ms = r.durationMs.toString().padStart(5, ' ');
        console.log(`  ${tag.padEnd(8, ' ')} ${ms}ms  ${r.file.split(sep).join('/')}`);
    }

    if (failures.length > 0) {
        console.error(`\n[test-per-file] ${failures.length} file(s) failed`);
        process.exit(1);
    }
}

main();
