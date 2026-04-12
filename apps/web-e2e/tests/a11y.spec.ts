import { test, expect } from '@playwright/test';

/**
 * Accessibility E2E tests.
 * Verifies key a11y features like skip-to-content, ARIA attributes, etc.
 */

test.describe('Accessibility', () => {
    test('should have a skip-to-content link', async ({ page }) => {
        await page.goto('/');
        const skipLink = page.locator('a[href="#main-content"]');
        // Skip link exists in DOM (hidden by sr-only)
        await expect(skipLink).toHaveCount(1);
        await expect(skipLink).toContainText('Skip to content');
    });

    test('should have main-content landmark', async ({ page }) => {
        await page.goto('/');
        const main = page.locator('#main-content');
        await expect(main).toBeVisible();
    });

    test('should have header with navigation landmark', async ({ page, isMobile }) => {
        await page.goto('/');
        const header = page.locator('header');
        await expect(header).toBeVisible();

        if (!isMobile) {
            const nav = header.locator('nav[aria-label="Main navigation"]');
            await expect(nav).toBeVisible();
        }
    });

    test('should have descriptive aria-labels on interactive elements', async ({ page }) => {
        await page.goto('/');
        // Theme toggle has aria-label
        const themeToggle = page.locator('[data-component="theme-toggle"]');
        if (await themeToggle.count() > 0) {
            await expect(themeToggle.first()).toHaveAttribute('aria-label', /Switch to (dark|light) mode/);
        }
    });
});
