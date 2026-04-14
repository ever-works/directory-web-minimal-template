import { test, expect } from '@playwright/test';

/**
 * RSS/Atom/robots.txt E2E tests for sample-real-estate.
 */

test.describe('Real Estate - RSS Feed', () => {
    test('should return valid RSS 2.0 XML', async ({ request }) => {
        const response = await request.get('/rss.xml');
        expect(response.status()).toBe(200);
        const body = await response.text();
        expect(body).toContain('<rss');
        expect(body).toContain('<channel>');
        expect(body).toContain('<item>');
    });

    test('should have feed autodiscovery link', async ({ page }) => {
        await page.goto('/');
        const rssLink = page.locator('link[type="application/rss+xml"]');
        await expect(rssLink).toHaveAttribute('href', /rss\.xml/);
    });
});

test.describe('Real Estate - Atom Feed', () => {
    test('should return valid Atom XML', async ({ request }) => {
        const response = await request.get('/atom.xml');
        expect(response.status()).toBe(200);
        const body = await response.text();
        expect(body).toContain('<feed');
        expect(body).toContain('<entry>');
    });

    test('should have feed autodiscovery link', async ({ page }) => {
        await page.goto('/');
        const atomLink = page.locator('link[type="application/atom+xml"]');
        await expect(atomLink).toHaveAttribute('href', /atom\.xml/);
    });
});

test.describe('Real Estate - robots.txt', () => {
    test('should return valid robots.txt with sitemap', async ({ request }) => {
        const response = await request.get('/robots.txt');
        expect(response.status()).toBe(200);
        const body = await response.text();
        expect(body).toContain('User-agent: *');
        expect(body.toLowerCase()).toContain('sitemap:');
    });
});
