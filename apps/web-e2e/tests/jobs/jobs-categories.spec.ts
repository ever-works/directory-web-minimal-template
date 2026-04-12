import { test, expect } from '@playwright/test';

/**
 * Categories E2E tests for sample-jobs.
 * Tests run against sample-jobs (Remote Tech Jobs directory) on port 4324.
 */

test.describe('Jobs Categories Index', () => {
    test('should render categories index page', async ({ page }) => {
        await page.goto('/categories');
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should display all job categories', async ({ page }) => {
        await page.goto('/categories');
        await expect(page.locator('a[href="/category/engineering"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/design"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/product"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/marketing"]').first()).toBeVisible();
    });

    test('should render category page with items', async ({ page }) => {
        await page.goto('/category/engineering');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Engineering');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Jobs Tags', () => {
    test('should render tags index page', async ({ page }) => {
        await page.goto('/tags');
        await expect(page).toHaveTitle(/Tags/);
    });

    test('should render tag page with items', async ({ page }) => {
        await page.goto('/tag/remote');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Remote');
    });
});
