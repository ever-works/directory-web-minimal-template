import { test, expect } from '@playwright/test';

/**
 * Collections page E2E tests.
 * Verifies collection listing and detail pages using sample-basic data:
 * - "Top Picks" (slug: top-picks, 4 items)
 * - "Headless Libraries" (slug: headless-libraries, 3 items)
 */

test.describe('Collections Index', () => {
    test('should render collections index page', async ({ page }) => {
        await page.goto('/collections/');
        await expect(page).toHaveTitle(/Collections/);
    });

    test('should display page heading', async ({ page }) => {
        await page.goto('/collections/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Collections');
    });

    test('should list collection cards with names', async ({ page }) => {
        await page.goto('/collections/');
        const cards = page.locator('a[href^="/collection/"]');
        await expect(cards).toHaveCount(2);

        // Verify both collection names are visible
        await expect(page.getByText('Top Picks')).toBeVisible();
        await expect(page.getByText('Headless Libraries')).toBeVisible();
    });

    test('should show collection descriptions', async ({ page }) => {
        await page.goto('/collections/');
        await expect(
            page.getByText('Our recommended component libraries for new projects.')
        ).toBeVisible();
        await expect(
            page.getByText('Unstyled, composable component libraries you can style your way.')
        ).toBeVisible();
    });

    test('should show item counts on collection cards', async ({ page }) => {
        await page.goto('/collections/');
        await expect(page.getByText('4 items')).toBeVisible();
        await expect(page.getByText('3 items')).toBeVisible();
    });

    test('should link each collection to /collection/{slug}', async ({ page }) => {
        await page.goto('/collections/');
        const topPicksLink = page.locator('a[href="/collection/top-picks"]');
        await expect(topPicksLink).toBeVisible();

        const headlessLink = page.locator('a[href="/collection/headless-libraries"]');
        await expect(headlessLink).toBeVisible();
    });

    test('should navigate from collections index to collection detail', async ({ page }) => {
        await page.goto('/collections/');
        const link = page.locator('a[href="/collection/top-picks"]').first();
        await link.click();
        await expect(page).toHaveURL(/\/collection\/top-picks/);
    });
});

test.describe('Collection Detail', () => {
    test('should render collection detail page', async ({ page }) => {
        await page.goto('/collection/top-picks/');
        await expect(page).toHaveTitle(/Top Picks/);
    });

    test('should display collection name as heading', async ({ page }) => {
        await page.goto('/collection/top-picks/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Top Picks');
    });

    test('should display collection description', async ({ page }) => {
        await page.goto('/collection/top-picks/');
        await expect(
            page.getByText('Our recommended component libraries for new projects.')
        ).toBeVisible();
    });

    test('should render items in the collection', async ({ page }) => {
        await page.goto('/collection/top-picks/');
        // Top Picks has 4 items: shadcn-ui, radix-ui, react-aria, mantine
        const itemLinks = page.locator('a[href^="/item/"]');
        await expect(itemLinks).toHaveCount(4);
    });

    test('should display breadcrumb navigation', async ({ page }) => {
        await page.goto('/collection/top-picks/');
        const breadcrumbNav = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbNav).toBeVisible();
        await expect(breadcrumbNav.getByText('Collections')).toBeVisible();
        await expect(breadcrumbNav.getByText('Top Picks')).toBeVisible();
    });

    test('should render headless-libraries collection with its items', async ({ page }) => {
        await page.goto('/collection/headless-libraries/');
        await expect(page).toHaveTitle(/Headless Libraries/);

        const heading = page.locator('h1');
        await expect(heading).toHaveText('Headless Libraries');

        // Headless Libraries has 3 items: radix-ui, headless-ui, react-aria
        const itemLinks = page.locator('a[href^="/item/"]');
        await expect(itemLinks).toHaveCount(3);
    });
});
