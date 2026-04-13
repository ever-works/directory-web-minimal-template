import { test, expect } from '@playwright/test';

/**
 * SEO E2E tests for sample-jobs.
 * Verifies meta tags, structured data, and JSON-LD.
 */

test.describe('Jobs SEO', () => {
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
        await page.goto('/item/backend-engineer-rust/');
        const jsonLdScripts = page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should have BreadcrumbList JSON-LD on item page', async ({ page }) => {
        await page.goto('/item/backend-engineer-rust/');
        const jsonLdScripts = page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();

        let foundBreadcrumb = false;
        for (let i = 0; i < count; i++) {
            const content = await jsonLdScripts.nth(i).textContent();
            if (content && content.includes('BreadcrumbList')) {
                foundBreadcrumb = true;
                const parsed = JSON.parse(content);
                expect(parsed['@type']).toBe('BreadcrumbList');
                expect(parsed['itemListElement'].length).toBeGreaterThanOrEqual(2);
                break;
            }
        }
        expect(foundBreadcrumb).toBe(true);
    });

    test('should have JSON-LD ItemList on category page', async ({ page }) => {
        await page.goto('/categories');
        const categoryLink = page.locator('a[href^="/category/"]').first();
        await expect(categoryLink).toBeVisible();
        await categoryLink.click();
        await page.waitForURL(/\/category\//);

        const jsonLdScripts = page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();

        let foundItemList = false;
        for (let i = 0; i < count; i++) {
            const content = await jsonLdScripts.nth(i).textContent();
            if (content && content.includes('ItemList')) {
                foundItemList = true;
                break;
            }
        }
        expect(foundItemList).toBe(true);
    });

    test('should have JSON-LD ItemList on tag page', async ({ page }) => {
        await page.goto('/tag/full-time/');
        const jsonLdScripts = page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();

        let foundItemList = false;
        for (let i = 0; i < count; i++) {
            const content = await jsonLdScripts.nth(i).textContent();
            if (content && content.includes('ItemList')) {
                foundItemList = true;
                break;
            }
        }
        expect(foundItemList).toBe(true);
    });
});
