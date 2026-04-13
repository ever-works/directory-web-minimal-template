import { test, expect } from '@playwright/test';

/**
 * Home page E2E tests for sample-git.
 * Tests run against sample-git (Time Tracking directory from Git repo) on port 4327.
 * This sample uses the ItemBrowser Preact island for interactive browsing.
 */

test.describe('Git Home Page', () => {
    test('should render the home page with title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Home/);
    });

    test('should display hero heading', async ({ page }) => {
        await page.goto('/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Ever Works Demo');
    });

    test('should have site header with navigation', async ({ page, isMobile }) => {
        await page.goto('/');
        const header = page.locator('header');
        await expect(header).toBeVisible();
        await expect(header.locator('a[href="/"]').first()).toBeVisible();

        if (isMobile) {
            const menuToggle = page.locator('[data-component="mobile-menu"] button');
            await expect(menuToggle).toBeVisible();
        } else {
            await expect(header.locator('a[href="/categories"]').first()).toBeVisible();
            await expect(header.locator('a[href="/tags"]').first()).toBeVisible();
        }
    });

    test('should have site footer with copyright', async ({ page }) => {
        await page.goto('/');
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText('©');
    });

    test('should display item listing via ItemBrowser', async ({ page }) => {
        await page.goto('/');
        // The ItemBrowser renders item cards with links
        const itemLinks = page.locator('a[href^="/item/"]');
        await expect(itemLinks.first()).toBeVisible({ timeout: 30000 });
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should show hero item count', async ({ page }) => {
        await page.goto('/');
        // Hero mentions the total count of items
        const hero = page.locator('section').first();
        await expect(hero).toContainText(/\d+\s+items/i);
    });

    test('should have category sidebar in ItemBrowser', async ({ page }) => {
        await page.goto('/');
        // ItemBrowser renders categories via a Preact island (client:load).
        // sample-git has 90+ categories so hydration can take longer, especially on mobile.
        const categoriesLegend = page.locator('[data-component="item-browser"] [data-part="categories"] [data-part="legend"]');
        await expect(categoriesLegend).toBeVisible({ timeout: 30000 });
        await expect(categoriesLegend).toContainText('Categories');
    });
});
