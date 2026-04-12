import { test, expect } from '@playwright/test';

/**
 * Collections E2E tests for sample-jobs.
 * Tests run against sample-jobs (Remote Tech Jobs directory) on port 4324.
 */

test.describe('Jobs Collections Index', () => {
    test('should render collections index page', async ({ page }) => {
        await page.goto('/collections');
        await expect(page).toHaveTitle(/Collections/);
    });

    test('should display collection links', async ({ page }) => {
        await page.goto('/collections');
        await expect(page.locator('a[href="/collection/top-remote-engineering-jobs"]').first()).toBeVisible();
        await expect(page.locator('a[href="/collection/design-and-product-roles"]').first()).toBeVisible();
    });

    test('should render collection detail with items', async ({ page }) => {
        await page.goto('/collection/top-remote-engineering-jobs');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Top Remote Engineering Jobs');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
