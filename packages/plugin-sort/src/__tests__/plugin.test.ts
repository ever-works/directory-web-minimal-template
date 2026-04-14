import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PluginContext } from '@ever-works/plugins';
import type { ContentData, ItemData } from '@ever-works/core';
import { sortPlugin } from '../plugin.js';

/** Create a minimal mock PluginContext for testing hooks. */
function makeContext(overrides: Partial<PluginContext> = {}): PluginContext {
    return {
        config: {} as PluginContext['config'],
        contentPath: '/tmp/content',
        outDir: '/tmp/dist',
        plugins: new Map(),
        log: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        },
        ...overrides,
    };
}

/** Create a minimal ItemData. */
function makeItem(overrides: Partial<ItemData> & { name: string }): ItemData {
    return {
        id: overrides.name.toLowerCase(),
        slug: overrides.name.toLowerCase(),
        description: '',
        source_url: 'https://example.com',
        category: 'general',
        tags: [],
        updated_at: '2024-01-01 00:00',
        status: 'approved',
        ...overrides,
    };
}

/** Create minimal ContentData for testing. */
function makeContentData(items: ItemData[] = []): ContentData {
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
            app_url: 'https://example.com',
        } as ContentData['config'],
        total: items.length,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ---- Plugin creation / metadata ----

describe('sortPlugin — creation and metadata', () => {
    it('returns a valid Plugin object', () => {
        const plugin = sortPlugin();

        expect(plugin.id).toBe('sort');
        expect(plugin.name).toBe('Sort Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(typeof plugin.description).toBe('string');
    });

    it('exposes onInit and onDataLoaded hooks', () => {
        const plugin = sortPlugin();
        expect(typeof plugin.hooks?.onInit).toBe('function');
        expect(typeof plugin.hooks?.onDataLoaded).toBe('function');
    });

    it('does not expose build hooks', () => {
        const plugin = sortPlugin();
        expect(plugin.hooks?.onBeforeBuild).toBeUndefined();
        expect(plugin.hooks?.onAfterBuild).toBeUndefined();
    });
});

// ---- onInit hook ----

describe('sortPlugin — onInit hook', () => {
    it('logs default sort configuration', async () => {
        const plugin = sortPlugin();
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('name');
        expect(logCall).toContain('asc');
    });

    it('logs custom sort configuration', async () => {
        const plugin = sortPlugin({ defaultSort: 'updated_at', defaultDirection: 'desc' });
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('updated_at');
        expect(logCall).toContain('desc');
    });

    it('logs available sort options as debug', async () => {
        const plugin = sortPlugin();
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith(
            expect.stringContaining('name'),
        );
    });
});

// ---- onDataLoaded hook ----

describe('sortPlugin — onDataLoaded hook', () => {
    it('sorts items by name ascending by default', async () => {
        const plugin = sortPlugin();
        const ctx = makeContext();
        const data = makeContentData([
            makeItem({ name: 'Charlie' }),
            makeItem({ name: 'Alpha' }),
            makeItem({ name: 'Bravo' }),
        ]);

        const result = await plugin.hooks!.onDataLoaded!(data, ctx);

        expect(result.items.map((i) => i.name)).toEqual([
            'Alpha',
            'Bravo',
            'Charlie',
        ]);
    });

    it('sorts items by updated_at descending when configured', async () => {
        const plugin = sortPlugin({ defaultSort: 'updated_at', defaultDirection: 'desc' });
        const ctx = makeContext();
        const data = makeContentData([
            makeItem({ name: 'Old', updated_at: '2024-01-01 00:00' }),
            makeItem({ name: 'New', updated_at: '2024-06-01 00:00' }),
            makeItem({ name: 'Mid', updated_at: '2024-03-01 00:00' }),
        ]);

        const result = await plugin.hooks!.onDataLoaded!(data, ctx);

        expect(result.items.map((i) => i.name)).toEqual(['New', 'Mid', 'Old']);
    });

    it('preserves other ContentData fields', async () => {
        const plugin = sortPlugin();
        const ctx = makeContext();
        const data = makeContentData([makeItem({ name: 'Solo' })]);
        data.total = 42;

        const result = await plugin.hooks!.onDataLoaded!(data, ctx);

        expect(result.total).toBe(42);
        expect(result.categories).toEqual([]);
    });

    it('logs the number of sorted items', async () => {
        const plugin = sortPlugin();
        const ctx = makeContext();
        const data = makeContentData([makeItem({ name: 'A' }), makeItem({ name: 'B' })]);

        await plugin.hooks!.onDataLoaded!(data, ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('Sorted 2 items');
    });

    it('handles empty items array', async () => {
        const plugin = sortPlugin();
        const ctx = makeContext();
        const data = makeContentData([]);

        const result = await plugin.hooks!.onDataLoaded!(data, ctx);

        expect(result.items).toEqual([]);
    });
});

// ---- Index exports ----

describe('plugin-sort barrel exports', () => {
    it('re-exports sortPlugin from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.sortPlugin).toBe('function');
    });

    it('re-exports sortItems from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.sortItems).toBe('function');
    });
});
