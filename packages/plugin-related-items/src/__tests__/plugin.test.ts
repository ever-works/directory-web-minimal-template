import { describe, it, expect, vi } from 'vitest';
import type { ContentData, ItemData } from '@ever-works/core';
import { relatedItemsPlugin } from '../plugin';

function makeItem(slug: string, category: string, tags: string[]): ItemData {
    return {
        id: slug,
        slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        description: `${slug} description`,
        source_url: `https://${slug}.example.com`,
        category,
        tags,
        updated_at: '2026-01-01 00:00',
        status: 'approved',
    };
}

function makeContentData(items: ItemData[]): ContentData {
    return {
        items,
        categories: [],
        tags: [],
        collections: [],
        comparisons: [],
        pages: [],
        config: {
            company_name: 'Test',
            item_name: 'Item',
            items_name: 'Items',
            copyright_year: 2026,
        },
        total: items.length,
    } as unknown as ContentData;
}

const mockLog = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

const mockContext = {
    config: { name: 'Test', description: '', url: '' },
    contentPath: '/tmp',
    outDir: '/tmp/dist',
    plugins: new Map(),
    log: mockLog,
} as never;

describe('relatedItemsPlugin', () => {
    it('has correct plugin metadata', () => {
        const plugin = relatedItemsPlugin();
        expect(plugin.id).toBe('related-items');
        expect(plugin.name).toBe('Related Items Plugin');
        expect(plugin.version).toBe('0.1.0');
    });

    it('logs on init', async () => {
        const plugin = relatedItemsPlugin();
        await plugin.hooks!.onInit!(mockContext);
        expect(mockLog.info).toHaveBeenCalledWith(
            expect.stringContaining('Initialized'),
        );
    });

    it('injects _relatedItems into items', async () => {
        const plugin = relatedItemsPlugin();
        const items = [
            makeItem('alpha', 'tools', ['ts', 'open-source']),
            makeItem('beta', 'tools', ['ts', 'react']),
            makeItem('gamma', 'libs', ['react']),
        ];
        const data = makeContentData(items);

        const result = await plugin.hooks!.onDataLoaded!(data, mockContext);

        for (const item of result.items) {
            expect(item).toHaveProperty('_relatedItems');
            expect(Array.isArray((item as Record<string, unknown>)._relatedItems)).toBe(true);
        }
    });

    it('correctly relates items with shared tags/category', async () => {
        const plugin = relatedItemsPlugin();
        const items = [
            makeItem('alpha', 'tools', ['ts', 'open-source']),
            makeItem('beta', 'tools', ['ts', 'react']),
            makeItem('gamma', 'libs', ['python']),
        ];
        const data = makeContentData(items);

        const result = await plugin.hooks!.onDataLoaded!(data, mockContext);

        const alphaRelated = (result.items[0] as Record<string, unknown>)
            ._relatedItems as Array<{ slug: string; score: number }>;

        expect(alphaRelated[0]!.slug).toBe('beta');
        expect(alphaRelated[0]!.score).toBe(3); // 1 tag (ts) + 2 category (tools)
    });

    it('respects maxItems option', async () => {
        const plugin = relatedItemsPlugin({ maxItems: 1 });
        const items = [
            makeItem('a', 'cat', ['x']),
            makeItem('b', 'cat', ['x']),
            makeItem('c', 'cat', ['x']),
        ];
        const data = makeContentData(items);

        const result = await plugin.hooks!.onDataLoaded!(data, mockContext);

        const related = (result.items[0] as Record<string, unknown>)
            ._relatedItems as unknown[];
        expect(related).toHaveLength(1);
    });

    it('returns original data structure with items mutated', async () => {
        const plugin = relatedItemsPlugin();
        const data = makeContentData([makeItem('solo', 'cat', [])]);

        const result = await plugin.hooks!.onDataLoaded!(data, mockContext);

        expect(result.categories).toBe(data.categories);
        expect(result.tags).toBe(data.tags);
        expect(result.config).toBe(data.config);
    });

    it('logs the total relations count', async () => {
        mockLog.info.mockClear();
        const plugin = relatedItemsPlugin();
        const items = [
            makeItem('a', 'cat', ['x']),
            makeItem('b', 'cat', ['x']),
        ];
        const data = makeContentData(items);

        await plugin.hooks!.onDataLoaded!(data, mockContext);

        expect(mockLog.info).toHaveBeenCalledWith(
            expect.stringContaining('2 related-item links'),
        );
    });
});
