import { test, expect } from '@playwright/test';

/**
 * SEO E2E tests.
 * Verifies meta tags, structured data, and sitemap.
 */

test.describe('SEO', () => {
    test('should have meta description on home page', async ({ page }) => {
        await page.goto('/');
        const description = page.locator('meta[name="description"]');
        await expect(description).toHaveAttribute('content', /.+/);
    });

    test('should have Open Graph tags on home page', async ({ page }) => {
        await page.goto('/');
        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toHaveAttribute('content', /.+/);
    });

    test('should have JSON-LD structured data on home page', async ({ page }) => {
        await page.goto('/');
        const jsonLd = page.locator('script[type="application/ld+json"]').first();
        await expect(jsonLd).toBeAttached();
    });

    test('should have JSON-LD structured data on item page', async ({ page }) => {
        await page.goto('/item/sample-item/');
        const jsonLd = page.locator('script[type="application/ld+json"]').first();
        await expect(jsonLd).toBeAttached();
    });

    test('should serve sitemap', async ({ page }) => {
        const response = await page.goto('/sitemap-index.xml');
        expect(response?.status()).toBe(200);
    });
});
