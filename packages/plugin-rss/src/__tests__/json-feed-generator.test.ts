import { describe, it, expect } from 'vitest';
import { generateJsonFeed, toRfc3339 } from '../json-feed-generator';
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
        pubDate: '2026-03-15T10:00:00Z',
        guid: 'https://example.com/item/item-one/',
        category: 'Tools',
    },
    {
        title: 'Item Two',
        link: 'https://example.com/item/item-two/',
        description: 'Second item description',
        pubDate: '2026-03-10T08:00:00Z',
        guid: 'https://example.com/item/item-two/',
    },
];

describe('toRfc3339', () => {
    it('formats an ISO date as a strict RFC 3339 datetime', () => {
        expect(toRfc3339('2026-03-15T10:00:00Z')).toBe('2026-03-15T10:00:00.000Z');
    });

    it('falls back to "now" for unparseable input', () => {
        const result = toRfc3339('not a date');
        expect(() => new Date(result)).not.toThrow();
        expect(new Date(result).toString()).not.toBe('Invalid Date');
    });
});

describe('generateJsonFeed', () => {
    it('produces a JSON Feed 1.1 document with the canonical version URL', () => {
        const json = generateJsonFeed(sampleEntries, baseConfig);
        const feed = JSON.parse(json);

        // The `feed` library natively emits the JSON Feed 1.0 version
        // URL; our wrapper post-processes to 1.1 since 1.0 and 1.1 are
        // byte-compatible for the fields we emit.
        expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
        expect(feed.title).toBe('Test Directory');
        expect(feed.language).toBe('en');
        expect(Array.isArray(feed.items)).toBe(true);
        expect(feed.items).toHaveLength(2);
    });

    it('maps each FeedEntry to a JSON Feed item with id/url/title/content', () => {
        const feed = JSON.parse(generateJsonFeed(sampleEntries, baseConfig));
        const item = feed.items[0];

        expect(item.id).toBe('https://example.com/item/item-one/');
        expect(item.url).toBe('https://example.com/item/item-one/');
        expect(item.title).toBe('Item One');
        // The `feed` library emits `content_html` for descriptions.
        // Both `content_html` and `content_text` are valid in JSON Feed 1.1.
        expect(item.content_html ?? item.content_text).toBe('First item description');
        expect(item.date_published).toBe('2026-03-15T10:00:00.000Z');
    });

    it('emits the entry category as JSON Feed `tags`', () => {
        const feed = JSON.parse(generateJsonFeed(sampleEntries, baseConfig));
        expect(feed.items[0].tags).toEqual(['Tools']);
    });

    it('omits `tags` when no category is set', () => {
        const feed = JSON.parse(generateJsonFeed(sampleEntries, baseConfig));
        expect(feed.items[1].tags).toBeUndefined();
    });

    it('handles an empty entry list', () => {
        const feed = JSON.parse(generateJsonFeed([], baseConfig));
        expect(feed.items).toEqual([]);
    });

    it('emits pretty-printed JSON (2-space indent) so the file is human-readable', () => {
        const json = generateJsonFeed(sampleEntries, baseConfig);
        expect(json).toContain('  "version"');
    });
});
