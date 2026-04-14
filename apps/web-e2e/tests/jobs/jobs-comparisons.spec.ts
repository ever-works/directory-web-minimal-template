import { test, expect } from '@playwright/test';

/**
 * Comparisons E2E tests for sample-jobs.
 * Tests run against sample-jobs (Remote Tech Jobs directory) on port 4324.
 */

test.describe('Jobs Comparisons Index', () => {
    test('should render comparisons index page', async ({ page }) => {
        await page.goto('/comparisons');
        await expect(page).toHaveTitle(/Comparisons/);
    });

    test('should display comparison links', async ({ page }) => {
        await page.goto('/comparisons');
        await expect(page.locator('a[href="/comparison/vercel-vs-cloudflare"]').first()).toBeVisible();
        await expect(page.locator('a[href="/comparison/linear-vs-figma"]').first()).toBeVisible();
    });
});

test.describe('Jobs Comparison Detail — Vercel vs Cloudflare', () => {
    test('should render comparison detail page', async ({ page }) => {
        await page.goto('/comparison/vercel-vs-cloudflare');
        await expect(page).toHaveTitle(/Vercel vs Cloudflare/);
    });

    test('should display comparison title as heading', async ({ page }) => {
        await page.goto('/comparison/vercel-vs-cloudflare');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
    });

    test('should display the dimensions comparison table', async ({ page }) => {
        await page.goto('/comparison/vercel-vs-cloudflare');
        const table = page.locator('table');
        await expect(table).toBeVisible();
    });

    test('should display breadcrumb navigation', async ({ page }) => {
        await page.goto('/comparison/vercel-vs-cloudflare');
        const breadcrumbs = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbs).toBeVisible();
    });
});
