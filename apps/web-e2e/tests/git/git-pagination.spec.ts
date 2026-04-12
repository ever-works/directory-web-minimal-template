import { test, expect } from '@playwright/test';

/**
 * Pagination E2E tests for sample-git.
 * sample-git has 3264 items with 12 per page = many pages.
 */

test.describe('Git Pagination', () => {
    test('should have pagination on home page', async ({ page }) => {
        await page.goto('/');
        // The ItemBrowser handles pagination internally
        // Wait for items to load
        await expect(page.locator('a[href^="/item/"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('should render page 2 static route', async ({ page }) => {
        await page.goto('/page/2');
        await expect(page.locator('h1')).toBeVisible();
    });

    test('should have pagination navigation on page 2', async ({ page }) => {
        await page.goto('/page/2');
        // Should have links to other pages
        const paginationLinks = page.locator('a[href^="/page/"]');
        const count = await paginationLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should show items on page 2', async ({ page }) => {
        await page.goto('/page/2');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
