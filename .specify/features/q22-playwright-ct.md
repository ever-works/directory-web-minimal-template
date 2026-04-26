# Feature: Q22 — Playwright Component Testing for Preact UI Components

> ## ⚠️ CORRECTION (iteration 103, 2026-04-26)
>
> The original spec (iteration 102) referenced **`@playwright/experimental-ct-preact`** as if it were a published npm package. **It is not.** Verified on 2026-04-26 via `pnpm view`:
>
> | Package                                  | Status                  |
> |------------------------------------------|-------------------------|
> | `@playwright/experimental-ct-react`      | ✅ Published, v1.59.1   |
> | `@playwright/experimental-ct-react17`    | ✅ Published, v1.59.1   |
> | `@playwright/experimental-ct-vue`        | ✅ Published, v1.59.1   |
> | `@playwright/experimental-ct-svelte`     | ✅ Published, v1.58.2   |
> | `@playwright/experimental-ct-core`       | ✅ Published, v1.59.1   |
> | `@playwright/experimental-ct-preact`     | ❌ **404 — never published** |
>
> Playwright's official docs (<https://playwright.dev/docs/test-components>) only document React and Vue. There is no first-party Preact CT package.
>
> **Revised approach (used throughout the rest of this spec):**
>
> - **Path A (default):** Use **`@playwright/experimental-ct-react`** with a Vite alias `react` → `preact/compat`, `react-dom` → `preact/compat`. Mirrors the existing pattern in `packages/ui/vitest.config.ts`. The mount layer ultimately calls `React.createElement`, which the alias maps to `preact/compat.h`. Path A is the lowest-friction migration.
> - **Path B (fallback):** Use **`@playwright/experimental-ct-core`** with a custom Preact mount adapter — Playwright's framework packages are themselves thin wrappers over `experimental-ct-core`. More code but avoids any React-name-leak in the test sources.
>
> The Step 3 smoke test in `docs/plans/q22-playwright-ct.md` is the validation gate that decides Path A vs Path B. If Path A's `mount(<PreactComponent />)` throws or renders an empty tree, fall back to Path B before declaring rollback.
>
> **Every reference below to `@playwright/experimental-ct-preact` should be read as `@playwright/experimental-ct-react` (with the `preact/compat` alias).** The original references are kept inline for traceability with iteration-102 commits but are NOT what the implementer should install.

## Description

Replace the Vitest + jsdom + `@testing-library/preact` toolchain — for the subset
of `@ever-works/ui` Preact component tests that hit the **Q22 worker-crash wall**
(documented in `docs/questions.md#q22`) — with **Playwright Component Testing**.
Leaves the pure-TS Vitest test surface (`utils.test.ts`, `lib/*` tests, and
non-`fireEvent` render-only tests) untouched.

Q22 (iterations 97–101) traced the hang to the specific combination of
`fireEvent` × `FilterBar` × Windows + Node 24 + jsdom. Bisecting Vitest 3.2.4
made the bug *worse* (2/16 vs 5/16 tests before crash), so the bug pre-dates the
4.x pool rewrite and almost certainly lives at the
**Node 24 `child_process` IPC × tinypool worker × jsdom event teardown**
boundary. Migrating the affected tests off jsdom — to a real browser via
Playwright — bypasses the layer that crashes.

## User Stories

- As a **developer on Windows**, I want the full UI test suite to complete
  without manual per-file babysitting, so I get a green/red signal in one
  command.
- As a **CI pipeline** (Linux / macOS / Windows), I want a uniform component
  test runner that does not depend on jsdom's lifecycle quirks.
- As an **AI agent**, I want one canonical place where the rules for
  "Playwright vs. Vitest" component testing are documented, so I know which
  runner to add a new test to.
- As a **maintainer**, I want a smoke path that boots a real browser against an
  isolated component mount, so I catch regressions that pure jsdom would miss
  (event delegation, focus ring, viewport queries).

## Acceptance Criteria

1. **Toolchain installed** in `packages/ui`:
    - `@playwright/experimental-ct-preact` (devDependency, latest stable).
    - `playwright.ct.config.ts` at the package root, scoped to `src/__tests__/ct/**/*.test.tsx`.
    - `playwright/index.html` and `playwright/index.ts` mount fixture files
      generated per the official Playwright CT scaffold.
    - `tsconfig.json` updated so `playwright/` and `src/__tests__/ct/` are part
      of the typecheck graph.
2. **`pnpm test:ct`** script in `packages/ui/package.json`:
    - Default invocation runs all `*.test.tsx` files in `src/__tests__/ct/`.
    - `pnpm test:ct -- --grep "FilterBar"` for filtering by name.
    - `pnpm test:ct -- --update-snapshots` for regenerating screenshots.
    - Root `package.json` exposes `pnpm test:ct` → `pnpm --filter @ever-works/ui test:ct`.
3. **Migrated tests** (Phase 1 — only the demonstrably-broken file):
    - `src/__tests__/ct/filter-bar.ct.test.tsx` — covers all 16 cases from
      `src/__tests__/preact/filter-bar.test.tsx`. Behavior asserted via
      Playwright's `expect(locator).toBeVisible()`,
      `await locator.click()`, etc. Mocked callbacks captured via
      `page.exposeFunction()` so we can still assert call counts/arguments.
    - The original `src/__tests__/preact/filter-bar.test.tsx` is **deleted**
      after the CT version is green on Windows + Linux.
4. **CI integration**:
    - `.github/workflows/ci.yml` adds a `test:ct` job that runs after install,
      uses `microsoft/playwright-github-action@v1` (or
      `pnpm exec playwright install --with-deps`) and executes
      `pnpm test:ct` on `ubuntu-latest` and `windows-latest`.
    - The job **must pass** on `windows-latest` (otherwise Q22 is not actually
      fixed by the migration).
5. **Decision matrix documented**:
    - `docs/architecture/testing-runners.md` — new doc explaining when to use
      Vitest vs. Playwright CT, with the rule set:
      - **Vitest**: pure TS utilities, plugin lifecycle, data loaders, schemas,
        any non-Preact pure logic.
      - **Vitest (Preact)**: render-only assertions, no `fireEvent`, no
        conditional remounts. Acceptable for tiny stateless components.
      - **Playwright CT**: any Preact component that uses `fireEvent` /
        `userEvent`, conditional remounts, focus management, event delegation,
        media queries, or scroll/resize listeners.
6. **Q22 status closed** in `docs/questions.md`:
    - Status flips to RESOLVED with a link to this spec and the migration PR.
    - The per-file Vitest runner (`pnpm test:ui:safe`, iteration 98) stays in
      place as a fallback for the remaining Vitest-runnable Preact tests
      (back-to-top, sort-select, etc.) but is no longer required for the
      filter-bar file.
7. **No regressions** in:
    - Total test count (16 cases must remain in the migrated file).
    - Coverage targets (the `@ever-works/ui` package was at 100% branch in
      iteration 82; CT tests are not measured by Vitest V8 coverage, so the
      coverage configuration must be updated to *exclude* the CT test files
      AND *include* the components they cover via Playwright's
      `playwright-coverage` reporter, OR the coverage acceptance bar is
      explicitly relaxed for `FilterBar.tsx` with a comment in
      `vitest.config.ts` and a note in this spec).

## Non-Goals

1. Migrating *all* Preact component tests to Playwright CT. Only files that
   either (a) currently crash under Q22 or (b) trigger conditional remount /
   focus / animation behavior that jsdom historically misrepresents.
2. Rewriting `BackToTop`, `SortSelect`, `SearchInput`, `ThemeToggle`,
   `MobileMenu`, `LayoutSwitcher`, `ItemBrowser` test files. They pass
   individually on Vitest and are not in scope.
3. Adopting `@playwright/experimental-ct-react` for non-existent React
   components. The template is Preact-only.
4. Removing `pnpm test:ui:safe`. It still serves as the per-file Vitest
   fallback.
5. Mounting *full pages* in CT. CT scope is single-component mount; full-page
   coverage continues to live in `apps/web-e2e` against the built sample apps.

## Technical Design

### Package additions

```jsonc
// packages/ui/package.json (devDependencies)
{
    "@playwright/experimental-ct-preact": "^1.59.1",
    "@playwright/test": "^1.59.1"
}
```

`@playwright/test` is hoisted from `apps/web-e2e` so the version pin must be
kept aligned (use the same `^1.59.1` constraint).

### Playwright CT config

```typescript
// packages/ui/playwright.ct.config.ts
import { defineConfig, devices } from '@playwright/experimental-ct-preact';

export default defineConfig({
    testDir: './src/__tests__/ct',
    timeout: 10_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        trace: 'on-first-retry',
        ctPort: 3100,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
```

### Mount fixture

```typescript
// packages/ui/playwright/index.ts
import '../src/styles/test-globals.css'; // optional
```

```html
<!-- packages/ui/playwright/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>UI CT</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./index.ts"></script>
</body>
</html>
```

### Migrated test file structure

```typescript
// packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx
import { test, expect } from '@playwright/experimental-ct-preact';
import FilterBar from '../../preact/FilterBar';

const categories = [
    { id: 'cat-1', name: 'Category A', slug: 'cat-a' },
    { id: 'cat-2', name: 'Category B', slug: 'cat-b' },
];

const tags = [
    { id: 'tag-1', name: 'Tag X', slug: 'tag-x' },
    { id: 'tag-2', name: 'Tag Y', slug: 'tag-y' },
    { id: 'tag-3', name: 'Tag Z', slug: 'tag-z' },
];

test.describe('FilterBar (Playwright CT)', () => {
    test('renders with data-component attribute', async ({ mount }) => {
        const component = await mount(<FilterBar />);
        await expect(component).toHaveAttribute('data-component', 'filter-bar');
    });

    test('selects category on click', async ({ mount }) => {
        const calls: (string | null)[] = [];
        const component = await mount(
            <FilterBar
                categories={categories}
                onCategoryChange={(next) => calls.push(next)}
            />,
        );
        await component.getByRole('button', { name: 'Category A' }).click();
        expect(calls).toEqual(['cat-1']);
    });

    // ...remaining 14 cases follow the same shape
});
```

### Callback capture pattern

`vi.fn()` is replaced with **inline closures + arrays** for synchronous
callback assertions, OR with `page.exposeFunction()` for async / multi-step
flows. We **do not** introduce sinon, jest-mock, or testing-library mocking
shims — the inline pattern is the convention for the entire CT corpus.

### CI integration

```yaml
# .github/workflows/ci.yml (new job)
test-ct:
    runs-on: ${{ matrix.os }}
    strategy:
        fail-fast: false
        matrix:
            os: [ubuntu-latest, windows-latest]
    steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 10 }
        - uses: actions/setup-node@v4
          with: { node-version: 24, cache: pnpm }
        - run: pnpm install --frozen-lockfile
        - run: pnpm exec playwright install --with-deps chromium
        - run: pnpm test:ct
```

The `windows-latest` cell is the **definitive Q22 fix signal**. If it
passes, the migration succeeded.

### Coverage handling

The simplest stable choice is to **exclude `FilterBar.tsx` from V8
coverage** in `packages/ui/vitest.config.ts`:

```typescript
coverage: {
    // ...existing config
    exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.ts',
        'src/preact/FilterBar.tsx', // covered by Playwright CT, see .specify/features/q22-playwright-ct.md
    ],
}
```

Then update `.specify/features/testing.md` Acceptance Criteria #10 to note
that branch coverage of `FilterBar.tsx` is verified via
`apps/web-e2e/tests/**` plus `packages/ui/src/__tests__/ct/filter-bar.ct.test.tsx`,
not via V8.

If a future iteration wants V8-equivalent coverage from CT, integrate
`playwright-coverage` (npm: `playwright-coverage`) — it merges Chromium
`Profiler.takePreciseCoverage()` output into a v8 JSON. But this is *out of
scope for Phase 1*.

## Risks / Open Decisions

- **CT mount cost**: Each test boots a Chromium tab. 16 tests at ~200 ms each
  = ~3.2 s walltime sequential, ~1 s parallel with workers=4. Acceptable.
- **Preact 10 + CT compatibility**: Playwright CT for Preact is in
  `@playwright/experimental-ct-preact` (still labeled experimental at
  Playwright 1.59.x). Verify before committing the full migration that
  `mount(<Preact10Component />)` works against `preact@10.29.1`. If it
  doesn't, the fallback is `@playwright/experimental-ct-vue` style adapter
  via a thin Preact-on-React shim — but that adds complexity and should be
  treated as a blocker requiring spec revision.
- **`apps/docs` Docusaurus React 18**: irrelevant — the CT package mounts
  Preact, not React. No interaction.
- **Test data sharing**: the `categories` / `tags` fixtures are duplicated
  between the existing Vitest file and the new CT file during the
  transition. Once the Vitest file is deleted (Acceptance Criterion 3), they
  live only in the CT file.
- **Snapshot policy**: Phase 1 does **not** introduce screenshot snapshots.
  All assertions are behavioral (visibility, attribute, callback args). This
  matches the existing Vitest test contract.

## Implementation Phases

| Phase | Scope | Estimated effort |
|-------|-------|------------------|
| Phase 1 — bootstrap | Add deps, write `playwright.ct.config.ts`, scaffold `playwright/index.{html,ts}`, write 1 smoke CT test for `FilterBar` ("renders with data-component"), get it green on local Windows | ~2 hours |
| Phase 2 — migration | Port remaining 15 cases from `filter-bar.test.tsx`, delete Vitest file, update coverage config | ~3 hours |
| Phase 3 — CI | Add `test-ct` job to CI matrix on ubuntu + windows, verify both green | ~1 hour |
| Phase 4 — close-out | Flip Q22 status to RESOLVED, update `docs/questions.md`, write `docs/architecture/testing-runners.md`, log final iteration | ~1 hour |

Total estimated effort: **~7 hours** of focused implementation, spread across
3-4 scheduled iterations.

## Rollback Plan

If Phase 1 reveals that `@playwright/experimental-ct-preact` does not
actually work with our Preact 10.29.1 setup:

1. Revert all `packages/ui/playwright/` and `packages/ui/playwright.ct.config.ts`
   files.
2. Remove the new devDependencies from `packages/ui/package.json`.
3. Re-open Q22 in `docs/questions.md` with the failure mode documented.
4. Fall back to **Q22 Option E (Node 22 LTS check)** OR
   **Component-level upstream repro for vitest-dev/vitest** — neither of
   which requires a code migration.

## Verification

- **Local Windows + Node 24**: `pnpm test:ct` green, all 16 cases passing,
  no `Worker exited unexpectedly` chain in stderr.
- **Local Linux + Node 22**: `pnpm test:ct` green (smoke check that the
  migration is OS-portable, not Windows-locked).
- **CI**: `test-ct` job green on both `ubuntu-latest` and `windows-latest`.
- **Typecheck**: `pnpm typecheck` continues to pass with the new files.
- **Lint**: `pnpm lint` continues to pass with the new files.
- **No regression** in `pnpm test` for any other package.

## Cross-References

- `docs/questions.md#q22` — the open question this spec answers.
- `docs/plans/q22-playwright-ct.md` — paired implementation plan.
- `.specify/features/testing.md` — overall testing infrastructure spec.
- `.specify/features/visual-regression.md` — adjacent Playwright-based
  testing surface in the repo.
- `apps/web-e2e/playwright.config.ts` — existing Playwright config to mirror
  conventions from.
