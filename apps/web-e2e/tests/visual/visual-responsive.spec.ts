import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Mobile Responsive', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('homepage mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('home-mobile.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });

    test('item detail mobile', async ({ page }) => {
        await page.goto('/item/radix-ui/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('item-detail-mobile.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });

    test('category listing mobile', async ({ page }) => {
        await page.goto('/category/form-components/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('category-mobile.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });
});
