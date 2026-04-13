import { test, expect } from '@playwright/test';

/**
 * Home page E2E tests for sample-real-estate.
 * Tests run against sample-real-estate (Dream Properties directory) on port 4326.
 */

test.describe('Real Estate Home Page', () => {
    test('should render the home page with title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Dream Properties/);
    });

    test('should display hero heading', async ({ page }) => {
        await page.goto('/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Dream Properties');
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
        await expect(footer).toContainText('Dream Properties');
    });

    test('should display featured properties', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('a[href="/item/downtown-loft"]').first()).toBeVisible();
    });

    test('should display item listing', async ({ page }) => {
        await page.goto('/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should have category links', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('a[href="/category/apartment"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/house"]').first()).toBeVisible();
    });
});
