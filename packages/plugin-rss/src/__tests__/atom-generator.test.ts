import { describe, it, expect } from 'vitest';
import { generateAtom, toAtomDate } from '../atom-generator';
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

describe('toAtomDate (legacy export)', () => {
    // The `feed` library produces ISO-8601 datetimes itself, but we
    // keep this export for backward compatibility.
    it('converts to ISO-8601 format', () => {
        const result = toAtomDate('2026-03-15T10:00:00Z');
        expect(result).toBe('2026-03-15T10:00:00.000Z');
    });

    it('handles yyyy-MM-dd HH:mm format', () => {
        const result = toAtomDate('2026-03-15 10:00');
        expect(result).toContain('2026');
        expect(result).toContain('T');
    });

    it('returns current date for invalid input', () => {
        const result = toAtomDate('not-a-date');
        expect(result).toBeTruthy();
        expect(result).toContain('T');
    });
});

describe('generateAtom', () => {
    it('generates valid Atom 1.0 XML structure', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toMatch(/<\?xml version="1\.0" encoding="utf-8"\?>/i);
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
        expect(xml).toContain('</feed>');
    });

    it('includes feed metadata', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        // The `feed` library wraps text fields in CDATA; substring
        // assertions on the inner text work for both styles.
        expect(xml).toContain('Test Directory');
        expect(xml).toContain('A test feed');
        expect(xml).toMatch(/<link[^>]*href="https:\/\/example\.com"/);
        expect(xml).toContain('@ever-works/plugin-rss');
    });

    it('includes self link', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toMatch(/<link[^>]*rel="self"[^>]*href="https:\/\/example\.com\/atom\.xml"/);
    });

    it('includes entry elements', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toContain('<entry>');
        expect(xml).toContain('Item One');
        expect(xml).toMatch(/<link[^>]*href="https:\/\/example\.com\/item\/item-one\/"/);
        expect(xml).toContain('First item description');
    });

    it('includes category when present', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        // The `feed` library writes `<category label="Tools"/>` (Atom
        // permits either `term` or `label` for the category text).
        expect(xml).toMatch(/<category[^>]*(label|term)="Tools"/);
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
        const xml = generateAtom(entries, baseConfig);

        const entrySection = xml.split('<entry>')[1];
        expect(entrySection).not.toContain('<category');
    });

    it('includes updated timestamp', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toMatch(/<updated>\d{4}-\d{2}-\d{2}T/);
    });

    it('handles empty entries array', () => {
        const xml = generateAtom([], baseConfig);

        expect(xml).toContain('<feed');
        expect(xml).toContain('</feed>');
        expect(xml).not.toContain('<entry>');
    });

    it('safely emits special characters without breaking the XML document', () => {
        const entries: FeedEntry[] = [
            {
                title: 'A & B <test>',
                link: 'https://example.com/item/test/',
                description: 'Items with "quotes"',
                pubDate: '2026-01-01 00:00',
                guid: 'https://example.com/item/test/',
            },
        ];
        const xml = generateAtom(entries, baseConfig);

        // The `feed` library uses CDATA sections for free-form text;
        // verify the literal text is preserved and the surrounding
        // document remains well-formed.
        expect(xml).toContain('A & B <test>');
        expect(xml).toContain('Items with "quotes"');
        expect(xml).toMatch(/^<\?xml /);
        expect(xml.trim().endsWith('</feed>')).toBe(true);
    });
});
