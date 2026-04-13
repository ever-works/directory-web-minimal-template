import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Category Pages', () => {
    test('category listing page', async ({ page }) => {
        await page.goto('/category/form-components/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('category-listing.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });

    test('categories index page', async ({ page }) => {
        await page.goto('/categories/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('categories-index.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });

    test('404 page', async ({ page }) => {
        await page.goto('/nonexistent-page/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('404-page.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });
});
