import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Item Detail', () => {
    test('item detail page', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('item-detail.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });

    test('item detail full page', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('item-detail-full.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });
});
