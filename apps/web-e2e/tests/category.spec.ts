import { test, expect } from '@playwright/test';

/**
 * Category page E2E tests.
 * Verifies category listing and index pages.
 */

test.describe('Categories', () => {
    test('should render categories index page', async ({ page }) => {
        await page.goto('/categories/');
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should render individual category page', async ({ page }) => {
        await page.goto('/category/sample-category/');
        await expect(page).toHaveTitle(/Sample Category/);
    });

    test('should display items in category page', async ({ page }) => {
        await page.goto('/category/sample-category/');
        const listing = page.locator('[data-component="item-listing"]');
        await expect(listing).toBeVisible();
    });

    test('should link from categories index to category page', async ({ page }) => {
        await page.goto('/categories/');
        const link = page.locator('a[href="/category/sample-category"]').first();
        if (await link.isVisible()) {
            await link.click();
            await expect(page).toHaveURL(/\/category\/sample-category/);
        }
    });
});

test.describe('Tags', () => {
    test('should render tags index page', async ({ page }) => {
        await page.goto('/tags/');
        await expect(page).toHaveTitle(/Tags/);
    });

    test('should render individual tag page', async ({ page }) => {
        await page.goto('/tag/sample-tag/');
        await expect(page).toHaveTitle(/sample-tag/i);
    });
});
