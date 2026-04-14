import { test, expect } from '@playwright/test';

/**
 * RSS/Atom/robots.txt E2E tests.
 * Verifies feed endpoints return valid XML and robots.txt returns valid text.
 * Tests run against sample-basic.
 */

test.describe('RSS Feed', () => {
    test('should return valid RSS 2.0 XML', async ({ request }) => {
        const response = await request.get('/rss.xml');
        expect(response.status()).toBe(200);

        const body = await response.text();
        expect(body).toContain('<?xml');
        expect(body).toContain('<rss');
        expect(body).toContain('version="2.0"');
        expect(body).toContain('<channel>');
    });

    test('should contain channel title and link', async ({ request }) => {
        const response = await request.get('/rss.xml');
        const body = await response.text();

        expect(body).toContain('<title>');
        expect(body).toContain('<link>');
        expect(body).toContain('<description>');
    });

    test('should contain at least one item', async ({ request }) => {
        const response = await request.get('/rss.xml');
        const body = await response.text();

        expect(body).toContain('<item>');
        expect(body).toContain('<title>');
        expect(body).toContain('</item>');
    });

    test('should have feed autodiscovery link in page head', async ({ page }) => {
        await page.goto('/');
        const rssLink = page.locator('link[type="application/rss+xml"]');
        await expect(rssLink).toHaveAttribute('href', /rss\.xml/);
    });
});

test.describe('Atom Feed', () => {
    test('should return valid Atom XML', async ({ request }) => {
        const response = await request.get('/atom.xml');
        expect(response.status()).toBe(200);

        const body = await response.text();
        expect(body).toContain('<?xml');
        expect(body).toContain('<feed');
        expect(body).toContain('xmlns="http://www.w3.org/2005/Atom"');
    });

    test('should contain feed title and id', async ({ request }) => {
        const response = await request.get('/atom.xml');
        const body = await response.text();

        expect(body).toContain('<title>');
        expect(body).toContain('<id>');
    });

    test('should contain at least one entry', async ({ request }) => {
        const response = await request.get('/atom.xml');
        const body = await response.text();

        expect(body).toContain('<entry>');
        expect(body).toContain('</entry>');
    });

    test('should have feed autodiscovery link in page head', async ({ page }) => {
        await page.goto('/');
        const atomLink = page.locator('link[type="application/atom+xml"]');
        await expect(atomLink).toHaveAttribute('href', /atom\.xml/);
    });
});

test.describe('robots.txt', () => {
    test('should return valid robots.txt', async ({ request }) => {
        const response = await request.get('/robots.txt');
        expect(response.status()).toBe(200);

        const body = await response.text();
        expect(body).toContain('User-agent:');
    });

    test('should reference sitemap', async ({ request }) => {
        const response = await request.get('/robots.txt');
        const body = await response.text();

        expect(body.toLowerCase()).toContain('sitemap:');
    });

    test('should allow all by default', async ({ request }) => {
        const response = await request.get('/robots.txt');
        const body = await response.text();

        // Default config allows all crawlers
        expect(body).toContain('User-agent: *');
    });
});
