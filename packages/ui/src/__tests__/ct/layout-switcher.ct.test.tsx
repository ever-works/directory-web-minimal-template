/**
 * Playwright Component Tests for `LayoutSwitcher`.
 *
 * Migrated from `packages/ui/src/__tests__/preact/layout-switcher.test.tsx`
 * per Q23 (see `docs/questions.md` Q23 — opened iteration 106 after
 * Q22 / `FilterBar` already validated this playbook in iteration 105).
 *
 * The original Vitest+jsdom file hung at the `RUN v4.1.5` banner with
 * **zero test output** on Windows + Node 24.14.0 (verified iteration 106).
 * The hang fingerprint is *pre-test* (worker dies during file load /
 * test discovery) and so distinct from Q22's *mid-suite* fingerprint, but
 * the resolution is the same: run the component in a real Chromium tab
 * via Playwright CT, bypassing the jsdom + IPC worker layer entirely.
 *
 * Translation conventions — same table as `filter-bar.ct.test.tsx`:
 *
 * - `render(<C />)` → `await mount(<C />)` (returns a `Locator`).
 * - `screen.getByRole('radio')` → `component.getByRole('radio')`.
 * - `screen.getByLabelText('X')` → `component.getByLabel('X')`.
 * - `expect(buttons).toHaveLength(N)` →
 *   `await expect(component.getByRole('radio')).toHaveCount(N)`.
 * - `container.querySelector('[data-component="layout-switcher"]')` →
 *   `await expect(component).toHaveAttribute('data-component', 'layout-switcher')`
 *   (the mount root *is* the component's outermost element here).
 * - `fireEvent.click(el)` → `await locator.click()`.
 * - `vi.fn()` callbacks → inline `const calls: T[] = []; (v) => calls.push(v)`.
 *   Playwright CT serializes function props as RPC bridges; the closure
 *   executes in the test process so plain array assertions work.
 * - `localStorage.clear()` (Vitest `beforeEach`) → unnecessary; each
 *   Playwright test gets a fresh browser context with empty storage by
 *   default (`fullyParallel: true` in `playwright.ct.config.ts`).
 * - `localStorage.setItem(key, value)` (pre-render setup) →
 *   `await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value])`
 *   *before* the `mount(...)` call — the host CT page is already open at
 *   the right origin so storage writes survive into the mount.
 * - `localStorage.getItem(key)` (post-click assertion) →
 *   `await page.evaluate((k) => localStorage.getItem(k), key)`.
 *
 * Read alongside `docs/architecture/testing-runners.md` and
 * `docs/questions.md` Q23 for the rationale.
 */
import { test, expect } from './fixtures';
import LayoutSwitcher from '../../preact/LayoutSwitcher';

const DEFAULT_KEY = 'ew-layout-mode';

test.describe('LayoutSwitcher (Playwright CT)', () => {
    test('renders with default grid/list modes', async ({ mount }) => {
        const component = await mount(<LayoutSwitcher />);
        await expect(component.getByRole('radio')).toHaveCount(2);
    });

    test('renders with custom modes', async ({ mount }) => {
        const component = await mount(
            <LayoutSwitcher modes={['grid', 'list', 'compact']} />,
        );
        await expect(component.getByRole('radio')).toHaveCount(3);
    });

    test('has data-component attribute', async ({ mount }) => {
        const component = await mount(<LayoutSwitcher />);
        await expect(component).toHaveAttribute(
            'data-component',
            'layout-switcher',
        );
    });

    test('has radiogroup role with accessible label', async ({ mount }) => {
        // The mount root IS the radiogroup div — `component.getByRole(...)`
        // searches descendants only, so assert on `component` directly.
        const component = await mount(<LayoutSwitcher />);
        await expect(component).toHaveAttribute('role', 'radiogroup');
        await expect(component).toHaveAttribute('aria-label', 'Layout view');
    });

    test('marks default mode as checked', async ({ mount }) => {
        const component = await mount(<LayoutSwitcher />);
        const gridButton = component.getByLabel('Grid view');
        await expect(gridButton).toHaveAttribute('aria-checked', 'true');
    });

    test('switches active mode on click', async ({ mount }) => {
        const calls: string[] = [];
        const component = await mount(
            <LayoutSwitcher onChange={(v) => calls.push(v)} />,
        );
        const listButton = component.getByLabel('List view');
        await listButton.click();
        await expect(listButton).toHaveAttribute('aria-checked', 'true');
        expect(calls).toEqual(['list']);
    });

    test('persists mode to localStorage', async ({ mount, page }) => {
        const component = await mount(
            <LayoutSwitcher persistKey="test-layout" />,
        );
        const listButton = component.getByLabel('List view');
        await listButton.click();
        // `localStorage.setItem` runs in a `useEffect` that fires after
        // the click handler's setState commit. Wait on the rendered
        // aria-checked flip (Playwright auto-retries) so the effect has
        // definitely flushed before we read storage.
        await expect(listButton).toHaveAttribute('aria-checked', 'true');
        const stored = await page.evaluate(
            (k) => localStorage.getItem(k),
            'test-layout',
        );
        expect(stored).toBe('list');
    });

    test('restores persisted mode from localStorage', async ({
        mount,
        page,
    }) => {
        await page.evaluate(
            ([k, v]) => localStorage.setItem(k, v),
            [DEFAULT_KEY, 'list'] as const,
        );
        const component = await mount(<LayoutSwitcher />);
        const listButton = component.getByLabel('List view');
        await expect(listButton).toHaveAttribute('aria-checked', 'true');
    });

    test('ignores invalid persisted values', async ({ mount, page }) => {
        await page.evaluate(
            ([k, v]) => localStorage.setItem(k, v),
            [DEFAULT_KEY, 'invalid'] as const,
        );
        const component = await mount(<LayoutSwitcher />);
        const gridButton = component.getByLabel('Grid view');
        await expect(gridButton).toHaveAttribute('aria-checked', 'true');
    });

    test('uses custom persistKey', async ({ mount, page }) => {
        const component = await mount(
            <LayoutSwitcher persistKey="custom-key" />,
        );
        const listButton = component.getByLabel('List view');
        await listButton.click();
        // Same effect-flush wait as `persists mode to localStorage` —
        // Playwright auto-retries the aria-checked assertion until the
        // post-click `useEffect` commits the storage write.
        await expect(listButton).toHaveAttribute('aria-checked', 'true');
        const customStored = await page.evaluate(
            (k) => localStorage.getItem(k),
            'custom-key',
        );
        const defaultStored = await page.evaluate(
            (k) => localStorage.getItem(k),
            DEFAULT_KEY,
        );
        expect(customStored).toBe('list');
        expect(defaultStored).toBeNull();
    });

    test('does not persist when persistKey is empty', async ({
        mount,
        page,
    }) => {
        const component = await mount(<LayoutSwitcher persistKey="" />);
        await component.getByLabel('List view').click();
        const stored = await page.evaluate(
            (k) => localStorage.getItem(k),
            DEFAULT_KEY,
        );
        expect(stored).toBeNull();
    });

    test('does not restore from localStorage when persistKey is empty', async ({
        mount,
        page,
    }) => {
        await page.evaluate(
            ([k, v]) => localStorage.setItem(k, v),
            [DEFAULT_KEY, 'list'] as const,
        );
        const component = await mount(<LayoutSwitcher persistKey="" />);
        const gridButton = component.getByLabel('Grid view');
        await expect(gridButton).toHaveAttribute('aria-checked', 'true');
    });
});
