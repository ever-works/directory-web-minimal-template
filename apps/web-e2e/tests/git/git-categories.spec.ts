import { test, expect } from '@playwright/test';

/**
 * Categories and tags page E2E tests for sample-git.
 */

test.describe('Git Categories Page', () => {
    test('should render categories index', async ({ page }) => {
        await page.goto('/categories');
        await expect(page).toHaveTitle(/Categories/);
        const heading = page.locator('h1');
        await expect(heading).toContainText('Categories');
    });

    test('should list categories with item counts', async ({ page }) => {
        await page.goto('/categories');
        const categoryLinks = page.locator('a[href^="/category/"]');
        const count = await categoryLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should navigate to a category page', async ({ page }) => {
        await page.goto('/category/cross-platform-time-tracking');
        await expect(page).toHaveTitle(/Cross Platform Time Tracking/);
        const heading = page.locator('h1');
        await expect(heading).toContainText('Cross Platform Time Tracking');
    });

    test('should show items in category page', async ({ page }) => {
        await page.goto('/category/cross-platform-time-tracking');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('Git Tags Page', () => {
    test('should render tags index', async ({ page }) => {
        await page.goto('/tags');
        await expect(page).toHaveTitle(/Tags/);
        const heading = page.locator('h1');
        await expect(heading).toContainText('Tags');
    });

    test('should navigate to a tag page', async ({ page }) => {
        await page.goto('/tag/open-source');
        await expect(page).toHaveTitle(/Open Source/);
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
