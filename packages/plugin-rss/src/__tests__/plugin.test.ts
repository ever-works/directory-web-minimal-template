import { describe, it, expect, vi } from 'vitest';
import { buildFeedEntries, resolveRssConfig, rssPlugin } from '../plugin';
import type { ItemData } from '@ever-works/core';
import type { PluginContext } from '@ever-works/plugins';

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

    it('sorts by date ascending', () => {
        const items = [
            makeItem({ name: 'New', slug: 'new', updated_at: '2026-03-15 10:00' }),
            makeItem({ name: 'Old', slug: 'old', updated_at: '2026-01-01 10:00' }),
        ];
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com', limit: 50, sortBy: 'date-asc' });

        expect(entries[0]!.title).toBe('Old');
        expect(entries[1]!.title).toBe('New');
    });

    it('sorts by name descending', () => {
        const items = [
            makeItem({ name: 'Alpha', slug: 'alpha', updated_at: '2026-03-01 10:00' }),
            makeItem({ name: 'Zebra', slug: 'zebra', updated_at: '2026-03-15 10:00' }),
        ];
        const entries = buildFeedEntries(items, { siteUrl: 'https://example.com', limit: 50, sortBy: 'name-desc' });

        expect(entries[0]!.title).toBe('Zebra');
        expect(entries[1]!.title).toBe('Alpha');
    });

    it('preserves order for unknown sortBy value', () => {
        const items = [
            makeItem({ name: 'First', slug: 'first', updated_at: '2026-01-01 10:00' }),
            makeItem({ name: 'Second', slug: 'second', updated_at: '2026-03-15 10:00' }),
        ];
        const entries = buildFeedEntries(items, {
            siteUrl: 'https://example.com',
            limit: 50,
            sortBy: 'unknown' as 'date-desc',
        });

        expect(entries[0]!.title).toBe('First');
        expect(entries[1]!.title).toBe('Second');
    });
});

describe('rssPlugin', () => {
    const mockContext: PluginContext = {
        config: {} as never,
        contentPath: '/tmp/content',
        outDir: '/tmp/dist',
        plugins: new Map(),
        log: {
            info: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            error: vi.fn(),
        },
    };

    it('returns a valid plugin object', () => {
        const plugin = rssPlugin();

        expect(plugin.id).toBe('rss');
        expect(plugin.name).toBe('RSS Feed Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(plugin.hooks).toBeDefined();
        expect(plugin.hooks!.onInit).toBeTypeOf('function');
        expect(plugin.hooks!.onDataLoaded).toBeTypeOf('function');
    });

    it('onInit warns when siteUrl not set', async () => {
        const plugin = rssPlugin();
        await plugin.hooks!.onInit!(mockContext);

        expect(mockContext.log.warn).toHaveBeenCalledWith(
            'RSS plugin: "siteUrl" not set. Feed URLs will be relative.'
        );
        expect(mockContext.log.info).toHaveBeenCalledWith('RSS plugin initialized');
    });

    it('onInit does not warn when siteUrl is provided', async () => {
        const warnFn = vi.fn();
        const ctx: PluginContext = {
            ...mockContext,
            log: { ...mockContext.log, warn: warnFn, info: vi.fn(), debug: vi.fn(), error: vi.fn() },
        };
        const plugin = rssPlugin({ siteUrl: 'https://example.com' });
        await plugin.hooks!.onInit!(ctx);

        expect(warnFn).not.toHaveBeenCalled();
    });

    it('onInit logs limit and atom status', async () => {
        const debugFn = vi.fn();
        const ctx: PluginContext = {
            ...mockContext,
            log: { ...mockContext.log, debug: debugFn, info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        };
        const plugin = rssPlugin({ limit: 25, atom: false });
        await plugin.hooks!.onInit!(ctx);

        expect(debugFn).toHaveBeenCalledWith('Feed limit: 25');
        expect(debugFn).toHaveBeenCalledWith('Atom feed: disabled');
    });

    it('onDataLoaded returns data unchanged', async () => {
        const plugin = rssPlugin();
        const data = { items: [], categories: [], tags: [], collections: [], comparisons: [], pages: [], config: {} as never, total: 0 };
        const result = await plugin.hooks!.onDataLoaded!(data, mockContext);

        expect(result).toBe(data);
    });
});
