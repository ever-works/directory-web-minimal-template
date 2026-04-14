import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PluginContext } from '@ever-works/plugins';
import type { ContentData } from '@ever-works/core';
import { breadcrumbsPlugin } from '../plugin.js';

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

/** Create minimal ContentData for testing. */
function makeContentData(overrides: Partial<ContentData> = {}): ContentData {
    return {
        items: [],
        categories: [],
        tags: [],
        collections: [],
        comparisons: [],
        pages: [],
        config: {
            company_name: 'Test Site',
            item_name: 'Item',
            items_name: 'Items',
            copyright_year: 2026,
            app_url: 'https://example.com',
        } as ContentData['config'],
        total: 0,
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ---- Plugin creation / metadata ----

describe('breadcrumbsPlugin — creation and metadata', () => {
    it('returns a valid Plugin object', () => {
        const plugin = breadcrumbsPlugin();

        expect(plugin.id).toBe('breadcrumbs');
        expect(plugin.name).toBe('Breadcrumbs Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(typeof plugin.description).toBe('string');
        expect(plugin.description.length).toBeGreaterThan(0);
    });

    it('exposes onInit and onDataLoaded hooks', () => {
        const plugin = breadcrumbsPlugin();
        expect(typeof plugin.hooks?.onInit).toBe('function');
        expect(typeof plugin.hooks?.onDataLoaded).toBe('function');
    });

    it('does not expose onBeforeBuild or onAfterBuild hooks', () => {
        const plugin = breadcrumbsPlugin();
        expect(plugin.hooks?.onBeforeBuild).toBeUndefined();
        expect(plugin.hooks?.onAfterBuild).toBeUndefined();
    });
});

// ---- onInit hook ----

describe('breadcrumbsPlugin — onInit hook', () => {
    it('logs initialization message', async () => {
        const plugin = breadcrumbsPlugin();
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);
        expect(ctx.log.info).toHaveBeenCalledWith('Breadcrumbs plugin initialized');
    });

    it('logs custom homeLabel when provided', async () => {
        const plugin = breadcrumbsPlugin({ homeLabel: 'Start' });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);
        expect(ctx.log.debug).toHaveBeenCalledWith('Home label: Start');
    });

    it('does not log homeLabel when not provided', async () => {
        const plugin = breadcrumbsPlugin();
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);
        expect(ctx.log.debug).not.toHaveBeenCalled();
    });
});

// ---- onDataLoaded hook ----

describe('breadcrumbsPlugin — onDataLoaded hook', () => {
    it('returns ContentData with _breadcrumbs field', async () => {
        const plugin = breadcrumbsPlugin();
        const ctx = makeContext();
        const data = makeContentData();

        const result = await plugin.hooks!.onDataLoaded!(data, ctx);

        expect(result).toHaveProperty('_breadcrumbs');
        expect(result._breadcrumbs).toBeInstanceOf(Map);
    });

    it('preserves original content data fields', async () => {
        const plugin = breadcrumbsPlugin();
        const ctx = makeContext();
        const data = makeContentData({
            items: [
                {
                    id: 'test',
                    name: 'Test Item',
                    slug: 'test',
                    description: 'Test',
                    source_url: 'https://example.com',
                    category: 'general',
                    tags: [],
                    updated_at: '2024-01-01 00:00',
                    status: 'approved',
                },
            ],
            total: 1,
        });

        const result = await plugin.hooks!.onDataLoaded!(data, ctx);

        expect(result.items).toHaveLength(1);
        expect(result.items[0]!.name).toBe('Test Item');
        expect(result.total).toBe(1);
    });

    it('logs the number of generated breadcrumb pages', async () => {
        const plugin = breadcrumbsPlugin();
        const ctx = makeContext();
        const data = makeContentData({
            categories: [{ id: 'tools', name: 'Tools', count: 5 }],
        });

        await plugin.hooks!.onDataLoaded!(data, ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('Generated breadcrumbs for'),
        );
    });

    it('generates breadcrumbs for categories', async () => {
        const plugin = breadcrumbsPlugin();
        const ctx = makeContext();
        const data = makeContentData({
            categories: [{ id: 'tools', name: 'Tools', count: 3 }],
        });

        const result = await plugin.hooks!.onDataLoaded!(data, ctx);
        const map = result._breadcrumbs!;

        expect(map.get('/category/tools')).toBeDefined();
    });
});

// ---- Index exports ----

describe('plugin-breadcrumbs barrel exports', () => {
    it('re-exports breadcrumbsPlugin from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.breadcrumbsPlugin).toBe('function');
    });

    it('re-exports generateBreadcrumbs from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.generateBreadcrumbs).toBe('function');
    });
});
