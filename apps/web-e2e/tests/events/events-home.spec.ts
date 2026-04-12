import { test, expect } from '@playwright/test';

/**
 * Home page E2E tests for sample-events.
 * Verifies the home page renders correctly with event-specific content.
 * Tests run against sample-events (Tech Events directory) on port 4325.
 */

test.describe('Events Home Page', () => {
    test('should render the home page with title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Tech Events/);
    });

    test('should display hero heading', async ({ page }) => {
        await page.goto('/');
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Tech Events');
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
        await expect(footer).toContainText('Tech Events');
    });

    test('should display featured events', async ({ page }) => {
        await page.goto('/');
        // Featured events: React Summit, Next.js Conf, AI Dev Summit
        await expect(page.locator('a[href="/item/react-summit"]').first()).toBeVisible();
        await expect(page.locator('a[href="/item/next-conf"]').first()).toBeVisible();
        await expect(page.locator('a[href="/item/ai-dev-summit"]').first()).toBeVisible();
    });

    test('should display item listing', async ({ page }) => {
        await page.goto('/');
        const itemLinks = page.locator('a[href^="/item/"]');
        const count = await itemLinks.count();
        // 10 total events: 4 featured shown first, then 6 non-featured
        expect(count).toBeGreaterThan(0);
    });

    test('should have category links', async ({ page }) => {
        await page.goto('/');
        // All 4 categories should be linked on the home page
        await expect(page.locator('a[href="/category/conference"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/meetup"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/workshop"]').first()).toBeVisible();
        await expect(page.locator('a[href="/category/hackathon"]').first()).toBeVisible();
    });
});
