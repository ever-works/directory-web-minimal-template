import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Homepage', () => {
    test('homepage above-the-fold', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('home-above-fold.png', {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });

    test('homepage full page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('home-full.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });
});
