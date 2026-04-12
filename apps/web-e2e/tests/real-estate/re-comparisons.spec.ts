import { test, expect } from '@playwright/test';

/**
 * Comparisons E2E tests for sample-real-estate.
 * Tests run against sample-real-estate (Dream Properties directory) on port 4326.
 */

test.describe('Real Estate Comparisons Index', () => {
    test('should render comparisons index page', async ({ page }) => {
        await page.goto('/comparisons');
        await expect(page).toHaveTitle(/Comparisons/);
    });

    test('should display comparison links', async ({ page }) => {
        await page.goto('/comparisons');
        await expect(page.locator('a[href="/comparison/downtown-loft-vs-suburban-house"]').first()).toBeVisible();
        await expect(page.locator('a[href="/comparison/office-space-vs-coworking"]').first()).toBeVisible();
    });
});

test.describe('Real Estate Comparison Detail — Downtown Loft vs Suburban House', () => {
    test('should render comparison detail page', async ({ page }) => {
        await page.goto('/comparison/downtown-loft-vs-suburban-house');
        await expect(page).toHaveTitle(/Downtown Loft vs Suburban/);
    });

    test('should display the dimensions comparison table', async ({ page }) => {
        await page.goto('/comparison/downtown-loft-vs-suburban-house');
        const table = page.locator('table');
        await expect(table).toBeVisible();
    });

    test('should display breadcrumb navigation', async ({ page }) => {
        await page.goto('/comparison/downtown-loft-vs-suburban-house');
        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(breadcrumbs).toBeVisible();
    });
});
