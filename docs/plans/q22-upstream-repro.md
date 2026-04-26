---
title: "Plan: Q22 — Minimal Upstream Repro for vitest-dev/vitest"
sidebar_label: "Q22 Upstream Repro"
---

# Plan: Q22 — Minimal upstream repro for `vitest-dev/vitest`

> Companion to [`docs/plans/q22-playwright-ct.md`](./q22-playwright-ct.md).
>
> Authored: iteration 102 (2026-04-26).
>
> Status: **DRAFT — execute in parallel with the Playwright CT migration so
> the upstream issue is filed regardless of whether we move off Vitest for
> this surface.**

## Why bother with an upstream repro if we're migrating off Vitest?

Three reasons:

1. **Other packages still use Vitest + jsdom + fireEvent.** If a future
   commit re-introduces a `useEffect` cleanup + conditional remount pattern
   in `MobileMenu` or `LayoutSwitcher`, we want to learn about the
   regression source from upstream rather than rediscover it.
2. **Our diagnostic data is high-quality.** Iterations 97-101 produced a
   matrix of pool/version/reporter/test-count outcomes that significantly
   narrows the bug surface for upstream maintainers. That work shouldn't be
   wasted.
3. **A community response may unblock the Vitest path entirely**, removing
   the need for the Playwright CT migration on Windows. Worth one upstream
   issue to find out.

## Repro recipe (target shape)

A **single-file pnpm project** that hangs identically to our `FilterBar`
case but mentions only Preact, Vitest, jsdom, and Node — no `@ever-works/*`
packages.

```
q22-repro/
├── package.json          ← pnpm + vitest 4.1.5 + preact 10.29.1 + jsdom 29 + @testing-library/preact
├── pnpm-lock.yaml
├── vitest.config.ts      ← pool: 'forks', maxWorkers: 1, environment: 'jsdom'
├── tsconfig.json         ← preact JSX
├── src/
│   ├── FilterBarRepro.tsx  ← Preact component: 3 useState + 2 useEffect + 1 conditional remount
│   └── FilterBarRepro.test.tsx  ← 16 trivial tests, 1 of them uses fireEvent.click
└── README.md             ← Reproduction instructions, version table, expected vs. actual
```

### Component (FilterBarRepro.tsx)

A stripped-down `FilterBar` that retains only the structural pattern that
triggers the crash:

```typescript
import { useState, useEffect, useCallback } from 'preact/hooks';

export default function FilterBarRepro() {
    const [a, setA] = useState<string | null>(null);
    const [b, setB] = useState<string[]>([]);
    const [_c, _setC] = useState<number>(0);

    useEffect(() => { /* sync from props equivalent */ }, [a]);
    useEffect(() => { /* sync from props equivalent */ }, [b]);

    const onClickA = useCallback(() => {
        setA((prev) => (prev === 'a' ? null : 'a'));
    }, []);

    const showClear = a !== null || b.length > 0;

    return (
        <div data-testid="root">
            <button type="button" onClick={onClickA}>Toggle A</button>
            {showClear && (
                <button type="button" onClick={() => { setA(null); setB([]); }}>
                    Clear
                </button>
            )}
        </div>
    );
}
```

### Test file (FilterBarRepro.test.tsx)

```typescript
/** @jsxImportSource preact */
import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/preact';
import FilterBarRepro from './FilterBarRepro';

describe('FilterBarRepro', () => {
    // 15 trivial render-only tests (passes individually)
    for (let i = 0; i < 15; i++) {
        it(`render ${i}`, () => {
            const { container } = render(<FilterBarRepro />);
            expect(container.querySelector('[data-testid="root"]')).toBeTruthy();
        });
    }

    // 1 fireEvent test (triggers conditional remount of "Clear" button)
    it('toggles A and reveals Clear', async () => {
        render(<FilterBarRepro />);
        const toggle = screen.getByText('Toggle A');
        fireEvent.click(toggle);
        // The "Clear" button now appears — this is the conditional remount.
        expect(screen.getByText('Clear')).toBeTruthy();
    });
});
```

### Vitest config

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        pool: 'forks',
        maxWorkers: 1,
    },
});
```

### package.json (key bits)

```jsonc
{
    "name": "q22-repro",
    "type": "module",
    "scripts": {
        "test": "vitest run"
    },
    "devDependencies": {
        "@testing-library/preact": "^3.2.4",
        "jsdom": "^29.0.2",
        "preact": "^10.29.1",
        "typescript": "^6.0.3",
        "vitest": "^4.1.5"
    }
}
```

## Verification before filing

Before opening the upstream issue:

1. `pnpm install && pnpm test` on Windows + Node 24 → confirm the repro
   crashes with `[vitest-pool]: Worker forks emitted error / Worker exited
   unexpectedly`. Capture the full stderr.
2. `pnpm test` on Linux + Node 24 (WSL2 if available) → confirm whether the
   bug reproduces. If Linux passes, it's a **Windows + Node 24** bug;
   include this in the upstream report.
3. `pnpm test` on Windows + Node 22 LTS (manually `nvm use 22`, this also
   resolves Q22 Option E) → confirm whether the bug reproduces. If Node 22
   passes, it's a **Node 24 IPC regression**; include this in the upstream
   report.
4. `pnpm exec vitest --version` → confirm Vitest 4.1.5.

## Where to file

Primary: <https://github.com/vitest-dev/vitest/issues>

Secondary considerations (file only if maintainers redirect):

- <https://github.com/preactjs/preact/issues> — only if maintainers say
  Preact's event delegation is the cause, not Vitest.
- <https://github.com/jsdom/jsdom/issues> — only if maintainers say jsdom
  29 has a teardown handle leak under fork IPC.
- <https://github.com/nodejs/node/issues> — only if Node 22 vs. Node 24
  testing in step 3 above isolates the bug to Node 24's
  `child_process.fork` IPC.

## Issue template (paste into GitHub)

```markdown
### Summary
`vitest run` hangs/crashes after partial test execution when a Preact
component with `useState`+`useEffect`+conditional remount is exercised via
`@testing-library/preact` `fireEvent` under `pool: 'forks'`,
`environment: 'jsdom'`, on Windows + Node 24.14.0.

### Versions (verified)
- Vitest 4.1.5 (and 3.2.4 — *also* crashes, see "Bisect" below)
- @testing-library/preact 3.2.4
- preact 10.29.1
- jsdom 29.0.2
- Node 24.14.0
- Windows 10 19045
- pnpm 10

### Repro
1. `git clone <repro repo>` (link the repo)
2. `pnpm install`
3. `pnpm test`

### Expected
All 16 tests pass.

### Actual
- Vitest 4.1.5: 5 of 16 tests pass, then `[vitest-pool]: Worker forks
  emitted error / Worker exited unexpectedly` (run terminates ~17 min wall).
- Vitest 3.2.4: 2 of 16 tests pass, then `Unhandled Rejection: Error:
  Channel closed` `code: 'ERR_IPC_CHANNEL_CLOSED'` from
  `tinypool/dist/index.js:140 (ProcessWorker.send)`.

### Bisect
Vitest 3.2.4 is *worse* than 4.1.5 (2/16 vs 5/16 before crash), so this is
**not** a regression from the 4.x pool rewrite (PR #8705) — the bug
pre-dates that change.

### Diagnostic matrix
- `pool: 'forks'` → hangs after 5 tests (4.1.5)
- `pool: 'threads'` → hangs after 4 tests
- `pool: 'vmThreads'` → hangs after 3 tests
- `--reporter=json` → hangs identically (rules out stdout pipe backpressure)
- `--no-isolate` → hangs identically
- Single-test isolation (`-t`) → passes 1/1
- Skipping the first 3 tests via `-t pattern` still hangs *before* test 4
  runs — so the hang is not cumulative state from completed tests.

### File-split workaround
Splitting the 16-test file into 5 files of ≤5 tests each:
- Render-only file (5 tests) → passes 5/5 in 5.38 s.
- `fireEvent`-using file (3 tests) → 0/3 + worker crash at 386 s.

So the boundary is **`fireEvent` + this component**, not test count.

### Hypothesized layer
Preact event delegation + `useEffect` cleanup interacting with jsdom
event-target teardown when the conditional `Clear` button mounts after the
first `fireEvent.click`, causing a handle leak that crashes the worker on
Node 24 + Windows.

### Cross-platform
[ ] Will fill in: pass/fail on Linux + Node 24 (WSL2)
[ ] Will fill in: pass/fail on Windows + Node 22 LTS

### Workaround
We are migrating affected tests to `@playwright/experimental-ct-preact`
(real Chromium mount, no jsdom). See linked downstream tracking issue.
```

## After filing

- Add the upstream issue URL to `docs/questions.md` Q22 status block.
- Add a `docs/log.md` entry: `Filed upstream issue vitest-dev/vitest#XXXX`.
- Subscribe the user (`ever@ever.co`) to the issue for updates.
- Re-evaluate every 2-3 iterations whether upstream has responded; if a
  fix lands, plan a Vitest-only restoration (revert the Playwright CT
  migration, restore the original test file from git history).

## Estimated time

~2-3 hours total to author the repro repo, verify on the 3 environment
combinations, and write the issue. Independent of the Playwright CT
migration, so it can run in parallel.
