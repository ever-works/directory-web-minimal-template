import { test, expect } from '@playwright/test';

/**
 * Pagination E2E tests.
 * Verifies paginated listing pages work correctly.
 * Tests run against sample-basic (12 items, 12 per page = 1 page).
 */

test.describe('Pagination', () => {
    test('should render paginated page 1', async ({ page }) => {
        await page.goto('/page/1/');
        await expect(page).toHaveTitle(/Page 1/);
    });

    test('should display items on paginated page', async ({ page }) => {
        await page.goto('/page/1/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
