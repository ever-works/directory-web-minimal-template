import { test, expect } from '@playwright/test';

/**
 * Collections E2E tests for sample-real-estate.
 * Tests run against sample-real-estate (Dream Properties directory) on port 4326.
 */

test.describe('Real Estate Collections Index', () => {
    test('should render collections index page', async ({ page }) => {
        await page.goto('/collections');
        await expect(page).toHaveTitle(/Collections/);
    });

    test('should display collection links', async ({ page }) => {
        await page.goto('/collections');
        const collectionLinks = page.locator('a[href^="/collection/"]');
        const count = await collectionLinks.count();
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should render collection detail with items', async ({ page }) => {
        await page.goto('/collections');
        // Click the first collection link
        const firstLink = page.locator('a[href^="/collection/"]').first();
        await firstLink.click();
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
