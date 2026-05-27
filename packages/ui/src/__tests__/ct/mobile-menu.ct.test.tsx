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

    test('closes menu on Escape key', async ({ mount }) => {
        // D1 — Escape must bubble to `document` where MobileMenu's useEffect
        // listener fires. Use `locator.press()` on the toggle button rather
        // than `page.keyboard.press()`: locator.press() explicitly focuses
        // its target before dispatching, which is the difference between
        // green and flaky on Linux Chromium. The pure-page-keyboard form
        // relies on whatever element happens to hold focus after click —
        // which on Linux can be the hamburger SVG that got replaced during
        // the open transition (focus lands on a detached node, the keydown
        // never reaches document). The label flips from "Open menu" to
        // "Close menu" once the panel is open, so we re-query by the new
        // label rather than caching the locator.
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        await component.getByLabel('Close menu').press('Escape');
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

    // ─── Focus trap (Q22 follow-up #3 / iteration 120 — closes the
    // 12-branch gap in MobileMenu.tsx focus-trap useEffect, lines 69-95).
    // Three behaviors exercised: Tab when there are NO focusable elements
    // (early return), Tab from the LAST focusable wrapping to the FIRST
    // (forward wrap), and Shift+Tab from the FIRST focusable wrapping to
    // the LAST (backward wrap). Combined these cover every uncovered
    // branch identified in the iteration 119 merged report.

    test('focus trap: Tab on last nav link wraps focus to first', async ({
        mount,
        page,
    }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        // Focus the LAST nav link (Tags), then press Tab — focus-trap should
        // preventDefault and wrap focus back to the first focusable element
        // (Close menu button).
        const lastLink = component.getByText('Tags');
        await lastLink.focus();
        await expect(lastLink).toBeFocused();
        await page.keyboard.press('Tab');
        // Wrap target is the Close menu button (the panel's first focusable
        // element after the toggle, which sits OUTSIDE the panel — the
        // focusable[0] inside the menuRef is the first nav anchor).
        await expect(component.getByText('Home')).toBeFocused();
    });

    test('focus trap: Shift+Tab on first nav link wraps focus to last', async ({
        mount,
        page,
    }) => {
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        // Focus the FIRST nav link (Home), then Shift+Tab — focus-trap
        // should preventDefault and wrap focus to the LAST focusable element
        // (Tags).
        const firstLink = component.getByText('Home');
        await firstLink.focus();
        await expect(firstLink).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(component.getByText('Tags')).toBeFocused();
    });

    // ─── Q27 SMOKE: Step 0 of `docs/plans/q27-mobilemenu-empty-items-coverage.md`.
    // Synthetic Tab dispatch via `page.evaluate` to bypass the iter-120
    // CT-host-page focus-attribution race that blocked
    // `page.keyboard.press('Tab')` against `<MobileMenu items={[]} />`.
    // If this passes, Step 1 lands the real B1 test; the iteration-120
    // inline-deferral comment retires.
    // ─── Q27 (iteration 124 — closes the iteration-120 inline-deferral
    // 3-branch outlier in the focus-trap useEffect on lines 69-95 of
    // MobileMenu.tsx). All three tests below use `dispatchEvent(new
    // KeyboardEvent('keydown', { key: 'Tab' }))` via `page.evaluate`
    // instead of `page.keyboard.press('Tab')` because the natural keypress
    // moves focus BEFORE the document handler runs, so the
    // `document.activeElement === last` check never sees the original
    // focus state. Synthetic dispatch keeps focus stable while still
    // routing the keydown through the captured listener.

    test('focus trap: empty panel - Tab does nothing (focusable.length === 0)', async ({
        mount,
        page,
    }) => {
        const component = await mount(<MobileMenu items={[]} />);
        await component.getByLabel('Open menu').click();
        // Note: with `items={[]}` the panel is CSS-hidden in the CT host
        // page (iter-120 race), but the DOM node IS attached and the
        // focus-trap useEffect IS registered — `toBeAttached()` is the
        // correct assertion. Closes the line-79 `if (focusable.length === 0)
        // return;` early-return branch (B1).
        await expect(component.locator('[data-part="panel"]')).toBeAttached();
        const wasPrevented = await page.evaluate(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(event);
            return event.defaultPrevented;
        });
        // Empty panel → handleTab early-returns at `focusable.length === 0`
        // → defaultPrevented stays false.
        expect(wasPrevented).toBe(false);
    });

    test('focus trap: synthetic Tab on last nav link wraps focus to first', async ({
        mount,
        page,
    }) => {
        // Closes the entry side of `else if (!e.shiftKey &&
        // document.activeElement === last)` on line 85 (B2) by
        // synthetically dispatching the keydown while focus is held on
        // the LAST link. The iteration-120 natural-keyboard variant
        // covers behavior but not this V8 branch — `page.keyboard.press`
        // moves focus before the document listener evaluates the
        // condition.
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        const lastLink = component.getByText('Tags');
        await lastLink.focus();
        await expect(lastLink).toBeFocused();
        const wasPrevented = await page.evaluate(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(event);
            return event.defaultPrevented;
        });
        // Forward Tab from LAST link → handleTab calls preventDefault +
        // first.focus().
        expect(wasPrevented).toBe(true);
    });

    test('focus trap: Tab on middle nav link does not preventDefault (non-boundary)', async ({
        mount,
        page,
    }) => {
        // Closes the FALSE arm of both short-circuits (B3): focus on the
        // MIDDLE link means `document.activeElement === first` is false
        // AND `document.activeElement === last` is false, so neither
        // wrap branch fires and control falls through to the browser's
        // native Tab handling.
        const component = await mount(<MobileMenu items={items} />);
        await component.getByLabel('Open menu').click();
        await expect(component.locator('[data-part="panel"]')).toBeVisible();
        const middleLink = component.getByText('Categories');
        await middleLink.focus();
        await expect(middleLink).toBeFocused();
        const wasPrevented = await page.evaluate(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(event);
            return event.defaultPrevented;
        });
        // Middle link → neither boundary check is true → no preventDefault.
        expect(wasPrevented).toBe(false);
    });
});
