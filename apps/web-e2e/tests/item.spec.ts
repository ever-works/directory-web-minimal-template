import { test, expect } from '@playwright/test';

/**
 * Item page E2E tests.
 * Verifies item detail pages render correctly.
 * Tests run against sample-basic with item: radix-ui (Form Components category).
 */

test.describe('Item Detail Page', () => {
    test('should render item detail page', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        await expect(page).toHaveTitle(/Radix UI/);
    });

    test('should display item name and description', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Radix UI');
    });

    test('should display breadcrumbs', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        const breadcrumbs = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbs).toBeVisible();
        await expect(breadcrumbs.locator('a[href="/"]')).toContainText('Home');
    });

    test('should have source link', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        const link = page.locator('a[target="_blank"]').first();
        await expect(link).toBeAttached();
    });

    test('should display tags', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        // Radix UI has tags like TypeScript, Accessible, Headless, Open Source
        const tagLinks = page.locator('a[href^="/tag/"]');
        const count = await tagLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
