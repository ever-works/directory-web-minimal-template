import { test, expect } from '@playwright/test';

/**
 * Item detail E2E tests for sample-real-estate.
 * Tests run against sample-real-estate (Dream Properties directory) on port 4326.
 */

test.describe('Property Detail Page', () => {
    test('should render property detail page with title', async ({ page }) => {
        await page.goto('/item/downtown-loft');
        await expect(page).toHaveTitle(/Downtown Loft/);
    });

    test('should display property name as heading', async ({ page }) => {
        await page.goto('/item/downtown-loft');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Downtown Loft');
    });

    test('should display breadcrumbs', async ({ page }) => {
        await page.goto('/item/downtown-loft');
        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(breadcrumbs).toBeVisible();
    });

    test('should display tags', async ({ page }) => {
        await page.goto('/item/downtown-loft');
        await expect(page.locator('a[href="/tag/downtown"]').first()).toBeVisible();
        await expect(page.locator('a[href="/tag/luxury"]').first()).toBeVisible();
    });

    test('should display property price metadata', async ({ page }) => {
        await page.goto('/item/downtown-loft');
        await expect(page.locator('dd').getByText('$485,000')).toBeVisible();
    });

    test('should display property location metadata', async ({ page }) => {
        await page.goto('/item/downtown-loft');
        await expect(page.locator('dd').getByText('Portland, OR')).toBeVisible();
    });
});

test.describe('Property Detail Page — House', () => {
    test('should render suburban-family-home detail page', async ({ page }) => {
        await page.goto('/item/suburban-family-home');
        await expect(page).toHaveTitle(/Suburban Family Home/);
    });
});
