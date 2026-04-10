import { test, expect } from '@playwright/test';

/**
 * Home page E2E tests.
 * Verifies the home page renders correctly with core elements.
 */

test.describe('Home Page', () => {
    test('should render the home page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/./); // Any title
        await expect(page.locator('body')).toBeVisible();
    });

    // Additional tests to be added as pages are implemented
});
