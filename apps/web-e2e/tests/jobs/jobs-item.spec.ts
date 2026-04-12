import { test, expect } from '@playwright/test';

/**
 * Item detail E2E tests for sample-jobs.
 * Tests run against sample-jobs (Remote Tech Jobs directory) on port 4324.
 */

test.describe('Job Detail Page', () => {
    test('should render job detail page with title', async ({ page }) => {
        await page.goto('/item/senior-frontend-engineer');
        await expect(page).toHaveTitle(/Senior Frontend Engineer/);
    });

    test('should display job name as heading', async ({ page }) => {
        await page.goto('/item/senior-frontend-engineer');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Senior Frontend Engineer');
    });

    test('should display breadcrumbs', async ({ page }) => {
        await page.goto('/item/senior-frontend-engineer');
        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(breadcrumbs).toBeVisible();
    });

    test('should have source link', async ({ page }) => {
        await page.goto('/item/senior-frontend-engineer');
        const sourceLink = page.locator('a[href*="vercel.com/careers"]');
        await expect(sourceLink).toBeVisible();
    });

    test('should display tags', async ({ page }) => {
        await page.goto('/item/senior-frontend-engineer');
        await expect(page.locator('a[href="/tag/remote"]').first()).toBeVisible();
        await expect(page.locator('a[href="/tag/senior"]').first()).toBeVisible();
    });
});

test.describe('Job Detail Page — Junior Role', () => {
    test('should render junior-react-developer detail page', async ({ page }) => {
        await page.goto('/item/junior-react-developer');
        await expect(page).toHaveTitle(/Junior React Developer/);
    });
});
