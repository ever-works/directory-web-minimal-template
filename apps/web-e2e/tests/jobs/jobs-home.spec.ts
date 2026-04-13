import { test, expect } from '@playwright/test';

/**
 * Home page E2E tests for sample-jobs.
 * Tests run against sample-jobs (Remote Tech Jobs directory) on port 4324.
 */

test.describe('Jobs Home Page', () => {
    test('should render the home page with title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Remote Tech Jobs/);
    });

    test('should display hero heading', async ({ page }) => {
        await page.goto('/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Remote Tech Jobs');
    });

    test('should have site header with navigation', async ({ page, isMobile }) => {
        await page.goto('/');
        const header = page.locator('header');
        await expect(header).toBeVisible();
        await expect(header.locator('a[href="/"]').first()).toBeVisible();

        if (isMobile) {
            const menuToggle = page.locator('[data-component="mobile-menu"] button');
            await expect(menuToggle).toBeVisible();
        } else {
            await expect(header.locator('a[href="/categories"]').first()).toBeVisible();
            await expect(header.locator('a[href="/tags"]').first()).toBeVisible();
        }
    });

    test('should have site footer with copyright', async ({ page }) => {
        await page.goto('/');
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText('©');
        await expect(footer).toContainText('Remote Tech Jobs');
    });

    test('should display featured jobs', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('a[href="/item/senior-frontend-engineer"]').first()).toBeVisible();
    });

    test('should display item listing', async ({ page }) => {
        await page.goto('/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should have category links', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('a[href="/category/engineering"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/design"]').first()).toBeVisible();
    });
});
