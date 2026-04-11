import { test, expect } from '@playwright/test';

/**
 * Navigation E2E tests.
 * Verifies links and routing work correctly across all page types.
 */

test.describe('Navigation', () => {
    test('should navigate to categories page', async ({ page }) => {
        await page.goto('/');
        await page.click('a[href="/categories"]');
        await expect(page).toHaveURL(/\/categories/);
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should navigate to tags page', async ({ page }) => {
        await page.goto('/');
        await page.click('a[href="/tags"]');
        await expect(page).toHaveURL(/\/tags/);
        await expect(page).toHaveTitle(/Tags/);
    });

    test('should navigate to home from logo/site-name', async ({ page }) => {
        await page.goto('/categories/');
        await page.click('[data-component="site-header"] [data-part="logo-link"]');
        await expect(page).toHaveURL('/');
    });

    test('should render 404 page for unknown routes', async ({ page }) => {
        const response = await page.goto('/this-route-does-not-exist/');
        expect(response?.status()).toBe(404);
    });
});
