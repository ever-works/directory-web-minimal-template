import { test, expect } from '@playwright/test';

/**
 * Navigation E2E tests.
 * Verifies links and routing work correctly across all page types.
 * Tests run against sample-basic.
 */

test.describe('Navigation', () => {
    test('should navigate to categories page', async ({ page, isMobile }) => {
        await page.goto('/');
        if (isMobile) {
            // Open mobile menu first
            await page.locator('[data-component="mobile-menu"] button').click();
            await page.locator('#mobile-nav-panel a[href="/categories"]').click();
        } else {
            await page.locator('a[href="/categories"]').click();
        }
        await expect(page).toHaveURL(/\/categories/);
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should navigate to tags page', async ({ page, isMobile }) => {
        await page.goto('/');
        if (isMobile) {
            await page.locator('[data-component="mobile-menu"] button').click();
            await page.locator('#mobile-nav-panel a[href="/tags"]').click();
        } else {
            await page.locator('a[href="/tags"]').click();
        }
        await expect(page).toHaveURL(/\/tags/);
        await expect(page).toHaveTitle(/Tags/);
    });

    test('should navigate to home from logo/site-name', async ({ page }) => {
        await page.goto('/categories/');
        const homeLink = page.locator('header a[href="/"]').first();
        await homeLink.click();
        await expect(page).toHaveURL('/');
    });

    test('should render 404 page for unknown routes', async ({ page }) => {
        const response = await page.goto('/this-route-does-not-exist/');
        expect(response?.status()).toBe(404);
    });

    test('should display 404 content with heading and message', async ({ page }) => {
        await page.goto('/this-route-does-not-exist/');
        await expect(page.getByText('404')).toBeVisible();
        await expect(page.getByText('Page not found')).toBeVisible();
    });

    test('should have a link back to home on 404 page', async ({ page }) => {
        await page.goto('/this-route-does-not-exist/');
        const homeLink = page.locator('a[href="/"]');
        await expect(homeLink).toBeVisible();
    });

    test('should navigate from 404 back to home', async ({ page }) => {
        await page.goto('/this-route-does-not-exist/');
        const homeLink = page.locator('a[href="/"]').first();
        await homeLink.click();
        await expect(page).toHaveURL('/');
    });
});
