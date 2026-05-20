import { describe, it, expect } from 'vitest';
import { generateRss, escapeXml, toRfc2822 } from '../rss-generator';
import type { FeedEntry, ResolvedRssConfig } from '../types';

const baseConfig: ResolvedRssConfig = {
    title: 'Test Directory',
    description: 'A test feed',
    siteUrl: 'https://example.com',
    limit: 50,
    atom: true,
    jsonFeed: true,
    rssFilename: 'rss.xml',
    atomFilename: 'atom.xml',
    jsonFeedFilename: 'feed.json',
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

describe('escapeXml (legacy export)', () => {
    // The `feed` library escapes XML internally, but we keep this
    // export for backward compatibility with any external callers.
    it('escapes ampersands', () => {
        expect(escapeXml('A & B')).toBe('A &amp; B');
    });

    it('escapes angle brackets', () => {
        expect(escapeXml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes quotes', () => {
        expect(escapeXml('"hello" \'world\'')).toBe('&quot;hello&quot; &apos;world&apos;');
    });

    it('handles empty string', () => {
        expect(escapeXml('')).toBe('');
    });
});

describe('toRfc2822 (legacy export)', () => {
    it('converts ISO date to RFC 2822', () => {
        const result = toRfc2822('2026-03-15T10:00:00Z');
        expect(result).toContain('2026');
        expect(result).toContain('Mar');
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

        // The `feed` library emits the encoding token in lowercase
        // (`utf-8`), which is equally valid per the XML 1.0 spec.
        expect(xml).toMatch(/<\?xml version="1\.0" encoding="utf-8"\?>/i);
        expect(xml).toContain('<rss version="2.0"');
        expect(xml).toContain('<channel>');
        expect(xml).toContain('</channel>');
        expect(xml).toContain('</rss>');
    });

    it('includes channel metadata', () => {
        const xml = generateRss(sampleEntries, baseConfig);

        // The `feed` library wraps `<title>` and `<description>` in
        // CDATA sections, so substring assertions on the inner text
        // work for both the channel metadata and item entries.
        expect(xml).toContain('Test Directory');
        expect(xml).toContain('A test feed');
        expect(xml).toContain('<link>https://example.com</link>');
        expect(xml).toContain('@ever-works/plugin-rss');
    });

    it('includes item entries', () => {
        const xml = generateRss(sampleEntries, baseConfig);

        expect(xml).toContain('Item One');
        expect(xml).toContain('First item description');
        expect(xml).toContain('<link>https://example.com/item/item-one/</link>');
        expect(xml).toContain('https://example.com/item/item-one/'); // guid + link share URL
        // RSS items live inside <item>...</item> blocks.
        expect(xml.match(/<item>/g)?.length).toBe(2);
    });

    it('includes category when present', () => {
        const xml = generateRss(sampleEntries, baseConfig);
        // The `feed` library writes `<category>Tools</category>` for
        // each entry-level category we add via `category: [{ name: ... }]`.
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
        const itemSection = xml.split('<item>')[1];
        expect(itemSection).not.toContain('<category>');
    });

    it('emits the RSS self-link via the atom namespace', () => {
        const xml = generateRss(sampleEntries, baseConfig);
        // The `feed` library always emits the RSS-self link under the
        // atom namespace; this is the recommended `<atom:link rel="self">`
        // pattern from the RSS Best Practices Profile.
        expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
        expect(xml).toMatch(/<atom:link[^>]*href="https:\/\/example\.com\/rss\.xml"[^>]*rel="self"/);
    });

    it('handles empty entries array', () => {
        const xml = generateRss([], baseConfig);

        expect(xml).toContain('<channel>');
        expect(xml).toContain('</channel>');
        expect(xml).not.toContain('<item>');
    });

    it('safely emits special characters without breaking the XML document', () => {
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

        // The `feed` library uses CDATA sections for free-form text
        // fields rather than entity escaping; either approach yields a
        // valid RSS document. We just verify the literal text is
        // preserved inside the document without breaking the surrounding
        // XML structure.
        expect(xml).toContain('Tools & Utilities <v2>');
        expect(xml).toContain('Items with "quotes" & <tags>');
        // The document remains well-formed at the top level.
        expect(xml).toMatch(/^<\?xml /);
        expect(xml.trim().endsWith('</rss>')).toBe(true);
    });
});
