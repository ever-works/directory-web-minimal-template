import { test, expect } from '@playwright/test';

/**
 * Comparisons page E2E tests for sample-git.
 * Uses hubstaff--toggl as a known comparison.
 */

test.describe('Git Comparisons Page', () => {
    test('should render comparisons index', async ({ page }) => {
        await page.goto('/comparisons');
        await expect(page).toHaveTitle(/Comparisons/);
        const heading = page.locator('h1');
        await expect(heading).toContainText('Comparisons');
    });

    test('should list comparison links', async ({ page }) => {
        await page.goto('/comparisons');
        const comparisonLinks = page.locator('a[href^="/comparison/"]');
        const count = await comparisonLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should render comparison detail page', async ({ page }) => {
        await page.goto('/comparison/hubstaff--toggl');
        await expect(page).toHaveTitle(/Hubstaff.*Toggl/i);
    });

    test('should display comparison table', async ({ page }) => {
        await page.goto('/comparison/hubstaff--toggl');
        const table = page.locator('table');
        await expect(table).toBeVisible();
    });

    test('should show breadcrumbs on comparison page', async ({ page }) => {
        await page.goto('/comparison/hubstaff--toggl');
        const breadcrumbs = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbs).toBeVisible();
    });
});
