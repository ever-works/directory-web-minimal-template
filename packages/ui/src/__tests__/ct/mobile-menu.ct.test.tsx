/**
 * Playwright Component Tests for `MobileMenu`.
 *
 * Migrated from `packages/ui/src/__tests__/preact/mobile-menu.test.tsx` per
 * Q22 follow-up #1 (preemptive — see `.specify/features/q22-mobilemenu-ct.md`
 * and `docs/plans/q22-mobilemenu-ct.md`). `MobileMenu` was not currently
 * broken under Vitest+jsdom (it passed under `pnpm test:ui:safe` through
 * iteration 107) but it shares the same risk profile as the previously
 * migrated `FilterBar` (Q22, iteration 105) and `LayoutSwitcher` (Q23,
 * iteration 107) — multiple `useEffect` blocks, document-level event
 * listeners, conditional remount of a panel subtree, and body-scroll
 * mutation. Migrating preemptively defuses the Q22 / Q23 fingerprint risk
 * before it surfaces.
 *
 * Translation conventions — same table as `filter-bar.ct.test.tsx` /
 * `layout-switcher.ct.test.tsx`, plus the MobileMenu-specific deviations
 * documented inline below (D1–D5):
 *
 * - `render(<C />)` → `await mount(<C />)` (returns a `Locator`).
 * - `screen.getByLabelText('X')` → `component.getByLabel('X')`.
 * - `screen.getByText('X')` → `component.getByText('X')`.
 * - `screen.getByTestId('X')` → `component.getByTestId('X')`.
 * - `container.querySelector('[data-component="mobile-menu"]')` is truthy
 *   when mounting `<MobileMenu />` alone → the mount root **IS** the
 *   `data-component` div (same shape as `LayoutSwitcher` for `radiogroup`):
 *   `await expect(component).toHaveAttribute('data-component', 'mobile-menu')`.
 * - `container.querySelector('[data-part="panel"]')` is null →
 *   `await expect(component.locator('[data-part="panel"]')).toHaveCount(0)`.
 * - `container.querySelector('[data-part="panel"]')` is truthy →
 *   `await expect(component.locator('[data-part="panel"]')).toBeVisible()`.
 * - `fireEvent.click(el)` → `await locator.click()`.
 * - `fireEvent.keyDown(document, { key: 'Escape' })` → D1:
 *   `await page.keyboard.press('Escape')`. The real browser dispatches a
 *   keydown to the focused element and bubbles it to `document`, where the
 *   MobileMenu listener fires identically to the jsdom approximation.
 * - `document.body.style.overflow === 'hidden'` → D3:
 *   `await page.evaluate(() => document.body.style.overflow)` then assert.
 * - "click outside" wrapper test (D2): mount the same wrapper as the
 *   original Vitest test. The mount root then becomes the wrapper `<div>`,
 *   so the data-component assertion uses
 *   `component.locator('[data-component="mobile-menu"]')` instead of the
 *   mount-root form.
 * - The original Vitest `beforeEach` reset `document.body.style.overflow = ''`
 *   to avoid cross-test leak. Playwright CT gives every test a fresh browser
 *   context (the host page reloads between tests), so the reset is
 *   unnecessary in CT — same context-isolation property that lets us drop
 *   `localStorage.clear()` in `layout-switcher.ct.test.tsx`.
 *
 * Read alongside `docs/architecture/testing-runners.md`,
 * `.specify/features/q22-mobilemenu-ct.md`, and `docs/plans/q22-mobilemenu-ct.md`.
 */
import { test, expect } from './fixtures';
import MobileMenu from '../../preact/MobileMenu';

const items = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Tags', href: '/tags' },
];

test.describe('MobileMenu (Playwright CT)', () => {
    test('renders with data-component attribute', async ({ mount }) => {
        // Mount root IS the `data-component="mobile-menu"` div — assert
        // on the locator directly, same pattern as LayoutSwitcher's
        // radiogroup root.
        const component = await mount(<MobileMenu items={items} />);
        await expect(component).toHaveAttribute(
            'data-component',
            'mobile-menu',
        );
    });

    test('renders toggle button', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await expect(component.getByLabel('Open menu')).toBeVisible();
    });

    test('menu is closed by default', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await expect(component.locator('[data-part="panel"]')).toHaveCount(0);
    });

    test('opens menu on button click', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        await expect(component.getByLabel('Close menu')).toBeVisible();
    });

    test('renders all nav links when open', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.getByText('Home')).toBeVisible();
        await expect(component.getByText('Categories')).toBeVisible();
        await expect(component.getByText('Tags')).toBeVisible();
    });

    test('closes menu on second toggle click', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        await component.getByLabel('Close menu').click();
        await expect(component.locator('[data-part="panel"]')).toHaveCount(0);
    });

    test('closes menu on Escape key', async ({ mount, page }) => {
        // D1 — `page.keyboard.press('Escape')` dispatches a real keydown
        // through the focused element to `document`, where MobileMenu's
        // useEffect listener fires.
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(component.locator('[data-part="panel"]')).toHaveCount(0);
    });

    test('does not close menu on non-Escape key', async ({ mount, page }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        // Pressing a non-Escape key should not close the panel. Use `Shift`
        // (a pure modifier with no Tab semantics) so the focus-trap
        // useEffect — which only acts on `Tab` — also does nothing.
        await page.keyboard.press('Shift');
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
    });

    test('locks body scroll when open', async ({ mount, page }) => {
        // D3 — read `document.body.style.overflow` via page.evaluate.
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        // Wait for panel render so the scroll-lock effect has flushed.
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        const overflow = await page.evaluate(
            () => document.body.style.overflow,
        );
        expect(overflow).toBe('hidden');
    });

    test('unlocks body scroll when closed', async ({ mount, page }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        await component.getByLabel('Close menu').click();
        // Wait for panel removal so the unmount-side scroll-unlock effect
        // has flushed before we read body style.
        await expect(component.locator('[data-part="panel"]')).toHaveCount(0);
        const overflow = await page.evaluate(
            () => document.body.style.overflow,
        );
        expect(overflow).toBe('');
    });

    test('sets aria-expanded on toggle button', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        const openButton = component.getByLabel('Open menu');
        await expect(openButton).toHaveAttribute('aria-expanded', 'false');
        await openButton.click();
        const closeButton = component.getByLabel('Close menu');
        await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('has correct nav link hrefs', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.getByText('Home')).toHaveAttribute('href', '/');
        await expect(component.getByText('Categories')).toHaveAttribute(
            'href',
            '/categories',
        );
    });

    test('has mobile navigation aria-label on panel', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        const panel = component.locator('[data-part="panel"]');
        await expect(panel).toHaveAttribute('aria-label', 'Mobile navigation');
    });

    test('closes menu on click outside', async ({ mount }) => {
        // D2 — mount the same wrapper as the original Vitest test. The
        // mount root is now the wrapper `<div>`, so the
        // data-component="mobile-menu" assertion uses `component.locator(...)`
        // instead of the mount-root form.
        const component = await mount(
            <div>
                <div data-testid="outside">Outside</div>
                <MobileMenu items={items} />
            </div>,
        );
        await expect(
            component.locator('[data-component="mobile-menu"]'),
        ).toBeVisible();
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        await component.getByTestId('outside').click();
        await expect(component.locator('[data-part="panel"]')).toHaveCount(0);
    });

    test('does not close menu when clicking inside', async ({ mount }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        const panel = component.locator('[data-part="panel"]');
        await expect(panel).toBeVisible();
        await panel.click();
        await expect(panel).toBeVisible();
    });
});
