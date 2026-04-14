import { describe, it, expect } from 'vitest';
import { generateRobotsTxt } from '../robots';

describe('generateRobotsTxt', () => {
    it('generates default robots.txt with sitemap', () => {
        const txt = generateRobotsTxt({ siteUrl: 'https://example.com' });

        expect(txt).toContain('User-agent: *');
        expect(txt).toContain('Allow: /');
        expect(txt).toContain('Sitemap: https://example.com/sitemap-index.xml');
    });

    it('strips trailing slash from siteUrl', () => {
        const txt = generateRobotsTxt({ siteUrl: 'https://example.com/' });

        expect(txt).toContain('Sitemap: https://example.com/sitemap-index.xml');
        expect(txt).not.toContain('https://example.com//');
    });

    it('includes custom disallow paths', () => {
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            disallow: ['/api/', '/admin/'],
        });

        expect(txt).toContain('Disallow: /api/');
        expect(txt).toContain('Disallow: /admin/');
    });

    it('includes custom allow paths', () => {
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            allow: ['/', '/public/'],
        });

        expect(txt).toContain('Allow: /');
        expect(txt).toContain('Allow: /public/');
    });

    it('uses custom sitemap filename', () => {
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            sitemapFilename: 'sitemap.xml',
        });

        expect(txt).toContain('Sitemap: https://example.com/sitemap.xml');
    });

    it('renders user-agent specific rules', () => {
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            rules: [
                {
                    userAgent: 'Googlebot',
                    allow: ['/'],
                    disallow: ['/private/'],
                },
                {
                    userAgent: '*',
                    disallow: ['/api/'],
                },
            ],
        });

        expect(txt).toContain('User-agent: Googlebot');
        expect(txt).toContain('Allow: /');
        expect(txt).toContain('Disallow: /private/');
        expect(txt).toContain('User-agent: *');
        expect(txt).toContain('Disallow: /api/');
    });

    it('includes crawl delay when specified', () => {
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            rules: [
                {
                    userAgent: 'Bingbot',
                    crawlDelay: 10,
                },
            ],
        });

        expect(txt).toContain('User-agent: Bingbot');
        expect(txt).toContain('Crawl-delay: 10');
    });

    it('handles zero crawl delay', () => {
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            rules: [
                {
                    userAgent: '*',
                    crawlDelay: 0,
                },
            ],
        });

        expect(txt).toContain('Crawl-delay: 0');
    });

    it('always includes sitemap at end', () => {
        const txt = generateRobotsTxt({
            siteUrl: 'https://example.com',
            rules: [{ userAgent: '*', allow: ['/'] }],
        });

        const lines = txt.trim().split('\n');
        expect(lines[lines.length - 1]).toBe('Sitemap: https://example.com/sitemap-index.xml');
    });
});
