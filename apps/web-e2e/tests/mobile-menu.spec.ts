import { test, expect } from '@playwright/test';

/**
 * Mobile menu E2E tests.
 * Verifies the hamburger menu works correctly on mobile viewports.
 * Only runs on mobile projects (skipped on desktop).
 */

test.describe('Mobile Menu', () => {
    test.skip(({ isMobile }) => !isMobile, 'Mobile-only test');

    test('should show hamburger button on mobile', async ({ page }) => {
        await page.goto('/');
        const menuToggle = page.locator('[data-component="mobile-menu"] button');
        await expect(menuToggle).toBeVisible();
    });

    test('should open mobile nav panel on click', async ({ page }) => {
        await page.goto('/');
        const menuToggle = page.locator('[data-component="mobile-menu"] button');
        await menuToggle.click();
        const panel = page.locator('#mobile-nav-panel');
        await expect(panel).toBeVisible();
    });

    test('should show all nav links in mobile menu', async ({ page }) => {
        await page.goto('/');
        await page.locator('[data-component="mobile-menu"] button').click();
        const panel = page.locator('#mobile-nav-panel');
        await expect(panel.locator('a[href="/"]')).toBeVisible();
        await expect(panel.locator('a[href="/categories"]')).toBeVisible();
        await expect(panel.locator('a[href="/tags"]')).toBeVisible();
    });

    test('should navigate from mobile menu', async ({ page }) => {
        await page.goto('/');
        await page.locator('[data-component="mobile-menu"] button').click();
        await page.locator('#mobile-nav-panel a[href="/categories"]').click();
        await expect(page).toHaveURL(/\/categories/);
    });

    test('should close on Escape key', async ({ page }) => {
        await page.goto('/');
        const toggle = page.locator('[data-component="mobile-menu"] button');
        await toggle.click();
        const panel = page.locator('#mobile-nav-panel');
        await expect(panel).toBeVisible();
        // Wait for Preact hydration to attach event listeners
        await page.waitForTimeout(500);
        await panel.locator('a').first().focus();
        await page.keyboard.press('Escape');
        await expect(panel).not.toBeVisible({ timeout: 10000 });
    });
});
