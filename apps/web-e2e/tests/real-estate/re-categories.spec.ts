import { test, expect } from '@playwright/test';

/**
 * Categories E2E tests for sample-real-estate.
 * Tests run against sample-real-estate (Dream Properties directory) on port 4326.
 */

test.describe('Real Estate Categories Index', () => {
    test('should render categories index page', async ({ page }) => {
        await page.goto('/categories');
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should display all property categories', async ({ page }) => {
        await page.goto('/categories');
        await expect(page.locator('a[href="/category/apartment"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/house"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/commercial"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/land"]').first()).toBeVisible();
    });

    test('should render category page with items', async ({ page }) => {
        await page.goto('/category/apartment');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Apartment');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Real Estate Tags', () => {
    test('should render tags index page', async ({ page }) => {
        await page.goto('/tags');
        await expect(page).toHaveTitle(/Tags/);
    });

    test('should render tag page with items', async ({ page }) => {
        await page.goto('/tag/downtown');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Downtown');
    });
});
