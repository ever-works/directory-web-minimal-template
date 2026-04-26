/**
 * Run vitest one test file at a time, sequentially.
 *
 * Workaround for Q22 — on Windows the combined UI test suite hangs after a
 * few test files complete with `Worker forks emitted error / Worker exited
 * unexpectedly`, apparently due to jsdom/Preact teardown leaking handles
 * across fork lifecycles. Each individual test file runs cleanly.
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
