import { describe, it, expect } from 'vitest';
import { generateRss, escapeXml, toRfc2822 } from '../rss-generator';
import type { FeedEntry, ResolvedRssConfig } from '../types';

const baseConfig: ResolvedRssConfig = {
    title: 'Test Directory',
    description: 'A test feed',
    siteUrl: 'https://example.com',
    limit: 50,
    atom: true,
    rssFilename: 'rss.xml',
    atomFilename: 'atom.xml',
    sortBy: 'date-desc',
};

const sampleEntries: FeedEntry[] = [
    {
        title: 'Item One',
        link: 'https://example.com/item/item-one/',
        description: 'First item description',
        pubDate: '2026-03-15 10:00',
        guid: 'https://example.com/item/item-one/',
        category: 'Tools',
    },
    {
        title: 'Item Two',
        link: 'https://example.com/item/item-two/',
        description: 'Second item description',
        pubDate: '2026-03-10 08:00',
        guid: 'https://example.com/item/item-two/',
    },
];

describe('escapeXml', () => {
    it('escapes ampersands', () => {
        expect(escapeXml('A & B')).toBe('A &amp; B');
    });

    it('escapes angle brackets', () => {
        expect(escapeXml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes quotes', () => {
        expect(escapeXml('"hello" \'world\'')).toBe('&quot;hello&quot; &apos;world&apos;');
    });

    it('handles already clean text', () => {
        expect(escapeXml('Hello World')).toBe('Hello World');
    });

    it('handles empty string', () => {
        expect(escapeXml('')).toBe('');
    });
});

describe('toRfc2822', () => {
    it('converts ISO date to RFC 2822', () => {
        const result = toRfc2822('2026-03-15T10:00:00Z');
        expect(result).toContain('2026');
        expect(result).toContain('Mar');
    });

    it('handles yyyy-MM-dd HH:mm format', () => {
        const result = toRfc2822('2026-03-15 10:00');
        expect(result).toContain('2026');
    });

    it('returns current date for invalid input', () => {
        const result = toRfc2822('not-a-date');
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('generateRss', () => {
    it('generates valid RSS 2.0 XML structure', () => {
        const xml = generateRss(sampleEntries, baseConfig);

        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<rss version="2.0"');
        expect(xml).toContain('<channel>');
        expect(xml).toContain('</channel>');
        expect(xml).toContain('</rss>');
    });

    it('includes channel metadata', () => {
        const xml = generateRss(sampleEntries, baseConfig);

        expect(xml).toContain('<title>Test Directory</title>');
        expect(xml).toContain('<link>https://example.com</link>');
        expect(xml).toContain('<description>A test feed</description>');
        expect(xml).toContain('<generator>@ever-works/plugin-rss</generator>');
    });

    it('includes item entries', () => {
        const xml = generateRss(sampleEntries, baseConfig);

        expect(xml).toContain('<title>Item One</title>');
        expect(xml).toContain('<link>https://example.com/item/item-one/</link>');
        expect(xml).toContain('<description>First item description</description>');
        expect(xml).toContain('<guid isPermaLink="true">https://example.com/item/item-one/</guid>');
    });

    it('includes category when present', () => {
        const xml = generateRss(sampleEntries, baseConfig);

        expect(xml).toContain('<category>Tools</category>');
    });

    it('omits category when not present', () => {
        const entries: FeedEntry[] = [
            {
                title: 'No Category',
                link: 'https://example.com/item/no-cat/',
                description: 'No category item',
                pubDate: '2026-03-01 12:00',
                guid: 'https://example.com/item/no-cat/',
            },
        ];
        const xml = generateRss(entries, baseConfig);

        // Should not have a <category> tag for this item
        const itemSection = xml.split('<item>')[1];
        expect(itemSection).not.toContain('<category>');
    });

    it('includes Atom self-link when atom is enabled', () => {
        const xml = generateRss(sampleEntries, baseConfig);

        expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
        expect(xml).toContain('<atom:link href="https://example.com/rss.xml" rel="self"');
    });

    it('omits Atom self-link when atom is disabled', () => {
        const config = { ...baseConfig, atom: false };
        const xml = generateRss(sampleEntries, config);

        expect(xml).not.toContain('<atom:link');
    });

    it('handles empty entries array', () => {
        const xml = generateRss([], baseConfig);

        expect(xml).toContain('<channel>');
        expect(xml).toContain('</channel>');
        expect(xml).not.toContain('<item>');
    });

    it('escapes special characters in entry data', () => {
        const entries: FeedEntry[] = [
            {
                title: 'Tools & Utilities <v2>',
                link: 'https://example.com/item/tools/',
                description: 'Items with "quotes" & <tags>',
                pubDate: '2026-01-01 00:00',
                guid: 'https://example.com/item/tools/',
            },
        ];
        const xml = generateRss(entries, baseConfig);

        expect(xml).toContain('Tools &amp; Utilities &lt;v2&gt;');
        expect(xml).toContain('Items with &quot;quotes&quot; &amp; &lt;tags&gt;');
    });
});
