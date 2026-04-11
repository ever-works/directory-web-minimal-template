import { test, expect } from '@playwright/test';

/**
 * Pagination E2E tests.
 * Verifies paginated listing pages work correctly.
 */

test.describe('Pagination', () => {
    test('should render paginated page 1', async ({ page }) => {
        await page.goto('/page/1/');
        await expect(page).toHaveTitle(/Page 1/);
    });

    test('should display items on paginated page', async ({ page }) => {
        await page.goto('/page/1/');
        const listing = page.locator('[data-component="item-listing"]');
        await expect(listing).toBeVisible();
    });
});
