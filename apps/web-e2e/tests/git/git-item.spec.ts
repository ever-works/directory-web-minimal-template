import { test, expect } from '@playwright/test';

/**
 * Item detail page E2E tests for sample-git.
 * Uses Toggl as a known item in the Time Tracking data repo.
 */

test.describe('Git Item Detail Page', () => {
    test('should render item page with title', async ({ page }) => {
        await page.goto('/item/toggl');
        await expect(page).toHaveTitle(/Toggl/);
    });

    test('should display item heading', async ({ page }) => {
        await page.goto('/item/toggl');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Toggl');
    });

    test('should show breadcrumbs', async ({ page }) => {
        await page.goto('/item/toggl');
        const breadcrumbs = page.locator('[data-component="breadcrumb-nav"]');
        await expect(breadcrumbs).toBeVisible();
    });

    test('should display source URL link', async ({ page }) => {
        await page.goto('/item/toggl');
        const visitLink = page.getByRole('link', { name: /Visit Website/i });
        await expect(visitLink).toBeVisible();
        await expect(visitLink).toHaveAttribute('href', /toggl\.com/);
    });

    test('should display tags', async ({ page }) => {
        await page.goto('/item/toggl');
        // Toggl has tags like cross-platform, productivity, etc.
        const tagLinks = page.locator('a[href^="/tag/"]');
        const count = await tagLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should display markdown content section', async ({ page }) => {
        await page.goto('/item/toggl');
        // Toggl has markdown content that gets rendered
        const prose = page.locator('.prose');
        await expect(prose).toBeVisible();
    });

    test('should display related items', async ({ page }) => {
        await page.goto('/item/toggl');
        const relatedHeading = page.getByText(/Related Items/i);
        await expect(relatedHeading).toBeVisible();
        const relatedLinks = page.locator('section').last().locator('a[href^="/item/"]');
        const count = await relatedLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
