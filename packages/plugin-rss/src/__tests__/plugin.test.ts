import { describe, it, expect } from 'vitest';
import { buildFeedEntries, resolveRssConfig } from '../plugin';
import type { ItemData } from '@ever-works/core';

const makeItem = (overrides: Partial<ItemData> = {}): ItemData => ({
    id: 'test-item',
    name: 'Test Item',
    slug: 'test-item',
    description: 'A test item',
    source_url: 'https://example.com',
    category: 'tools',
    tags: ['tag1'],
    updated_at: '2026-03-15 10:00',
    status: 'approved',
    ...overrides,
});

describe('resolveRssConfig', () => {
    it('uses defaults when no options provided', () => {
        const config = resolveRssConfig({}, 'My Site');

        expect(config.title).toBe('My Site');
        expect(config.description).toBe('Latest items from My Site');
        expect(config.limit).toBe(50);
        expect(config.atom).toBe(true);
        expect(config.rssFilename).toBe('rss.xml');
        expect(config.atomFilename).toBe('atom.xml');
        expect(config.sortBy).toBe('date-desc');
    });

    it('overrides with user options', () => {
        const config = resolveRssConfig(
            {
                title: 'Custom Title',
                description: 'Custom desc',
                siteUrl: 'https://custom.com/',
                limit: 10,
                atom: false,
                sortBy: 'name-asc',
            },
            'Fallback'
        );

        expect(config.title).toBe('Custom Title');
        expect(config.description).toBe('Custom desc');
        expect(config.siteUrl).toBe('https://custom.com');
        expect(config.limit).toBe(10);
        expect(config.atom).toBe(false);
        expect(config.sortBy).toBe('name-asc');
    });

    it('strips trailing slash from siteUrl', () => {
        const config = resolveRssConfig({ siteUrl: 'https://example.com/' }, 'Site');
        expect(config.siteUrl).toBe('https://example.com');
    });
});

describe('buildFeedEntries', () => {
    it('maps items to feed entries', () => {
        const items = [makeItem({ name: 'Alpha', slug: 'alpha', category: 'tools' })];
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com', limit: 50, sortBy: 'date-desc' });

        expect(entries).toHaveLength(1);
        expect(entries[0]!.title).toBe('Alpha');
        expect(entries[0]!.link).toBe('https://example.com/item/alpha/');
        expect(entries[0]!.guid).toBe('https://example.com/item/alpha/');
        expect(entries[0]!.category).toBe('tools');
    });

    it('sorts by date descending by default', () => {
        const items = [
            makeItem({ name: 'Old', slug: 'old', updated_at: '2026-01-01 10:00' }),
            makeItem({ name: 'New', slug: 'new', updated_at: '2026-03-15 10:00' }),
        ];
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com', limit: 50, sortBy: 'date-desc' });

        expect(entries[0]!.title).toBe('New');
        expect(entries[1]!.title).toBe('Old');
    });

    it('sorts by name ascending', () => {
        const items = [
            makeItem({ name: 'Zebra', slug: 'zebra', updated_at: '2026-03-01 10:00' }),
            makeItem({ name: 'Alpha', slug: 'alpha', updated_at: '2026-03-15 10:00' }),
        ];
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com', limit: 50, sortBy: 'name-asc' });

        expect(entries[0]!.title).toBe('Alpha');
        expect(entries[1]!.title).toBe('Zebra');
    });

    it('respects limit', () => {
        const items = Array.from({ length: 10 }, (_, i) =>
            makeItem({ name: `Item ${i}`, slug: `item-${i}`, updated_at: `2026-03-${String(i + 1).padStart(2, '0')} 10:00` })
        );
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com', limit: 3, sortBy: 'date-desc' });

        expect(entries).toHaveLength(3);
    });

    it('handles array category (uses first)', () => {
        const items = [makeItem({ category: ['cat-a', 'cat-b'] })];
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com', limit: 50, sortBy: 'date-desc' });

        expect(entries[0]!.category).toBe('cat-a');
    });

    it('handles empty items array', () => {
        const entries = buildFeedEntries([], { siteUrl: 'https://example.com', limit: 50, sortBy: 'date-desc' });
        expect(entries).toHaveLength(0);
    });

    it('strips trailing slash from siteUrl', () => {
        const items = [makeItem({ slug: 'test' })];
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com/', limit: 50, sortBy: 'date-desc' });

        expect(entries[0]!.link).toBe('https://example.com/item/test/');
    });
});
