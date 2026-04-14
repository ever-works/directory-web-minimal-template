import { describe, it, expect } from 'vitest';
import { generateAtom, toAtomDate } from '../atom-generator';
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

describe('toAtomDate', () => {
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

        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
        expect(xml).toContain('</feed>');
    });

    it('includes feed metadata', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toContain('<title>Test Directory</title>');
        expect(xml).toContain('<link href="https://example.com" />');
        expect(xml).toContain('<subtitle>A test feed</subtitle>');
        expect(xml).toContain('<generator>@ever-works/plugin-rss</generator>');
    });

    it('includes self link', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toContain('href="https://example.com/atom.xml" rel="self"');
    });

    it('includes entry elements', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toContain('<entry>');
        expect(xml).toContain('<title>Item One</title>');
        expect(xml).toContain('<link href="https://example.com/item/item-one/" />');
        expect(xml).toContain('<summary>First item description</summary>');
    });

    it('includes category when present', () => {
        const xml = generateAtom(sampleEntries, baseConfig);

        expect(xml).toContain('<category term="Tools" />');
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

        // Feed-level <updated> should exist
        expect(xml).toMatch(/<updated>\d{4}-\d{2}-\d{2}T/);
    });

    it('handles empty entries array', () => {
        const xml = generateAtom([], baseConfig);

        expect(xml).toContain('<feed');
        expect(xml).toContain('</feed>');
        expect(xml).not.toContain('<entry>');
    });

    it('escapes special characters', () => {
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

        expect(xml).toContain('A &amp; B &lt;test&gt;');
        expect(xml).toContain('Items with &quot;quotes&quot;');
    });
});
