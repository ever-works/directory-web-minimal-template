import { test, expect } from '@playwright/test';

/**
 * Home page E2E tests.
 * Verifies the home page renders correctly with core elements.
 */

test.describe('Home Page', () => {
    test('should render the home page with title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Home/);
    });

    test('should have site header with navigation', async ({ page }) => {
        await page.goto('/');
        const header = page.locator('[data-component="site-header"]');
        await expect(header).toBeVisible();
        await expect(header.locator('a[href="/"]')).toBeVisible();
        await expect(header.locator('a[href="/categories"]')).toBeVisible();
        await expect(header.locator('a[href="/tags"]')).toBeVisible();
    });

    test('should have site footer with copyright', async ({ page }) => {
        await page.goto('/');
        const footer = page.locator('[data-component="site-footer"]');
        await expect(footer).toBeVisible();
        await expect(footer.locator('[data-part="copyright"]')).toContainText('©');
    });

    test('should display hero section', async ({ page }) => {
        await page.goto('/');
        const hero = page.locator('[data-component="hero"]');
        await expect(hero).toBeVisible();
        await expect(hero.locator('[data-part="title"]')).toBeVisible();
    });

    test('should display item listing section', async ({ page }) => {
        await page.goto('/');
        const listing = page.locator('[data-component="item-listing"]');
        await expect(listing).toBeVisible();
    });
});
