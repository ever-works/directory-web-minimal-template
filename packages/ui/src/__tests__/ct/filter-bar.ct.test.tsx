/**
 * Smoke test for Q22 Playwright CT migration (Step 3 of `docs/plans/q22-playwright-ct.md`).
 *
 * Decision gate: if this single test passes locally on Windows + Node 24,
 * Path A (`@playwright/experimental-ct-react` + Vite alias `react` →
 * `preact/compat`) is validated and we can proceed with porting the
 * remaining 15 cases (Phase 2 of the spec). If it throws or renders an
 * empty subtree, Path B (`@playwright/experimental-ct-core` + custom
 * Preact mount adapter) is the next attempt before declaring rollback.
 *
 * Read alongside `.specify/features/q22-playwright-ct.md` (correction
 * block at the top) for the rationale.
 */
import { test, expect } from '@playwright/experimental-ct-react';
import FilterBar from '../../preact/FilterBar';

test.describe('FilterBar (Playwright CT smoke)', () => {
    test('renders with data-component attribute', async ({ mount }) => {
        const component = await mount(<FilterBar />);
        await expect(component).toHaveAttribute('data-component', 'filter-bar');
    });
});
