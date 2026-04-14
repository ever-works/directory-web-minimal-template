import { test, expect } from '@playwright/test';

/**
 * Category page E2E tests.
 * Verifies category listing and index pages.
 * Tests run against sample-basic with categories like "Form Components", etc.
 */

test.describe('Categories', () => {
    test('should render categories index page', async ({ page }) => {
        await page.goto('/categories/');
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should render individual category page', async ({ page }) => {
        await page.goto('/category/form-components/');
        await expect(page).toHaveTitle(/Form Components/);
    });

    test('should display items in category page', async ({ page }) => {
        await page.goto('/category/form-components/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should link from categories index to category page', async ({ page }) => {
        await page.goto('/categories/');
        const link = page.locator('a[href="/category/form-components"]').first();
        await expect(link).toBeVisible();
        await link.click();
        await expect(page).toHaveURL(/\/category\/form-components/);
    });
});

test.describe('Tags', () => {
    test('should render tags index page', async ({ page }) => {
        await page.goto('/tags/');
        await expect(page).toHaveTitle(/Tags/);
    });

    test('should render individual tag page', async ({ page }) => {
        await page.goto('/tag/typescript/');
        await expect(page).toHaveTitle(/TypeScript/);
    });
});
