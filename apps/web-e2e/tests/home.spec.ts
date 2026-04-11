import { test, expect } from '@playwright/test';

/**
 * Home page E2E tests.
 * Verifies the home page renders correctly with core elements.
 * Tests run against sample-basic (React UI Components directory).
 */

test.describe('Home Page', () => {
    test('should render the home page with title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/React UI Components/);
    });

    test('should have site header with navigation', async ({ page }) => {
        await page.goto('/');
        const header = page.locator('header');
        await expect(header).toBeVisible();
        await expect(header.locator('a[href="/"]').first()).toBeVisible();
        await expect(header.locator('a[href="/categories"]').first()).toBeVisible();
        await expect(header.locator('a[href="/tags"]').first()).toBeVisible();
    });

    test('should have site footer with copyright', async ({ page }) => {
        await page.goto('/');
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText('©');
    });

    test('should display hero section', async ({ page }) => {
        await page.goto('/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText(/React UI Components/i);
    });

    test('should display item listing section', async ({ page }) => {
        await page.goto('/');
        // Sample-basic has items displayed as cards with links
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
