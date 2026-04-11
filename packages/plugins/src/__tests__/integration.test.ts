import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginRunner } from '../runner.js';
import { definePlugins } from '../define-plugins.js';
import type { Plugin, PluginContext } from '../types.js';
import type { ContentData, SiteConfig, ItemData } from '@ever-works/core';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createTestConfig(): SiteConfig {
    return {
        company_name: 'Integration Test',
        item_name: 'Tool',
        items_name: 'Tools',
        copyright_year: 2025,
    };
}

function createItem(overrides: Partial<ItemData> & { id: string }): ItemData {
    return {
        name: overrides.id,
        slug: overrides.id,
        description: `Description for ${overrides.id}`,
        source_url: `https://example.com/${overrides.id}`,
        category: 'general',
        tags: [],
        updated_at: '2025-01-01',
        status: 'approved',
        ...overrides,
    };
}

function createTestContentData(items: ItemData[] = []): ContentData {
    return {
        items,
        categories: [{ id: 'general', name: 'General', count: items.length }],
        tags: [],
        collections: [],
        comparisons: [],
        pages: [],
        config: createTestConfig(),
        total: items.length,
    };
}

function createBaseContext() {
    return {
        config: createTestConfig(),
        contentPath: '/mock/content',
        outDir: '/mock/dist',
    };
}

function createPlugin(overrides: Partial<Plugin> & { id: string }): Plugin {
    return {
        name: overrides.id,
        version: '0.1.0',
        description: `Test plugin ${overrides.id}`,
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Mock items used across multiple tests
// ---------------------------------------------------------------------------

const mockItems: ItemData[] = [
    createItem({ id: 'alpha', name: 'Alpha Tool', tags: ['typescript'], category: 'dev-tools', featured: true }),
    createItem({ id: 'beta', name: 'Beta App', tags: ['react'], category: 'productivity', featured: false }),
    createItem({ id: 'gamma', name: 'Gamma Lib', tags: ['typescript', 'react'], category: 'dev-tools', featured: false }),
    createItem({ id: 'delta', name: 'Delta SDK', tags: ['python'], category: 'data', featured: true }),
    createItem({ id: 'epsilon', name: 'Epsilon CLI', tags: ['typescript'], category: 'dev-tools', featured: false }),
];

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

describe('Plugin pipeline integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // 1. Full pipeline: define -> run -> verify
    // -----------------------------------------------------------------------
    describe('full plugin pipeline', () => {
        it('should define plugins, run the pipeline with mock data, and verify transformations', async () => {
            // A plugin that marks items as featured based on a tag
            const featureTsPlugin = createPlugin({
                id: 'feature-ts',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const items = data.items.map((item) => ({
                            ...item,
                            featured: item.tags.includes('typescript'),
                        }));
                        return { ...data, items, total: items.length };
                    },
                },
            });

            // A plugin that adds a computed field
            const enrichPlugin = createPlugin({
                id: 'enrich',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const items = data.items.map((item) => ({
                            ...item,
                            enriched: true,
                        }));
                        return { ...data, items };
                    },
                },
            });

            const plugins = definePlugins([featureTsPlugin, enrichPlugin]);
            const runner = new PluginRunner(plugins);

            const input = createTestContentData(mockItems);
            const result = await runner.runDataLoaded(input, createBaseContext());

            // feature-ts plugin should have set featured = true for items with 'typescript'
            // then enrich plugin should have added enriched = true
            expect(result.items).toHaveLength(5);

            const alpha = result.items.find((i) => i.id === 'alpha')!;
            expect(alpha.featured).toBe(true); // has typescript
            expect(alpha.enriched).toBe(true);

            const beta = result.items.find((i) => i.id === 'beta')!;
            expect(beta.featured).toBe(false); // no typescript
            expect(beta.enriched).toBe(true);
        });

        it('should run init, dataLoaded, beforeBuild, and afterBuild in full lifecycle', async () => {
            const lifecycle: string[] = [];

            const plugin = createPlugin({
                id: 'lifecycle-tracker',
                hooks: {
                    onInit: async () => { lifecycle.push('init'); },
                    onDataLoaded: async (data: ContentData) => {
                        lifecycle.push('dataLoaded');
                        return data;
                    },
                    onBeforeBuild: async () => { lifecycle.push('beforeBuild'); },
                    onAfterBuild: async () => { lifecycle.push('afterBuild'); },
                },
            });

            const plugins = definePlugins([plugin]);
            const runner = new PluginRunner(plugins);
            const ctx = createBaseContext();

            await runner.runInit(ctx);
            const result = await runner.runDataLoaded(createTestContentData(mockItems), ctx);
            await runner.runBeforeBuild(ctx);
            await runner.runAfterBuild(ctx);

            expect(lifecycle).toEqual(['init', 'dataLoaded', 'beforeBuild', 'afterBuild']);
            expect(result.items).toHaveLength(5);
        });
    });

    // -----------------------------------------------------------------------
    // 2. Multiple plugins chaining: filter + sort + paginate
    // -----------------------------------------------------------------------
    describe('multiple plugins chaining', () => {
        it('should chain filter, sort, and pagination plugins on the same data', async () => {
            // Filter: keep only dev-tools items
            const filterPlugin = createPlugin({
                id: 'filter',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const items = data.items.filter((item) => item.category === 'dev-tools');
                        return { ...data, items, total: items.length };
                    },
                },
            });

            // Sort: alphabetically by name
            const sortPlugin = createPlugin({
                id: 'sort',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const items = [...data.items].sort((a, b) => a.name.localeCompare(b.name));
                        return { ...data, items };
                    },
                },
            });

            // Paginate: take first 2 items
            const paginatePlugin = createPlugin({
                id: 'paginate',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const items = data.items.slice(0, 2);
                        return { ...data, items, total: items.length };
                    },
                },
            });

            const plugins = definePlugins([filterPlugin, sortPlugin, paginatePlugin]);
            const runner = new PluginRunner(plugins);

            const input = createTestContentData(mockItems);
            const result = await runner.runDataLoaded(input, createBaseContext());

            // dev-tools items: alpha, gamma, epsilon
            // sorted: Alpha Tool, Epsilon CLI, Gamma Lib
            // paginated (first 2): Alpha Tool, Epsilon CLI
            expect(result.items).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.items[0]!.name).toBe('Alpha Tool');
            expect(result.items[1]!.name).toBe('Epsilon CLI');
        });

        it('should chain tag-filter then enrich plugins preserving intermediate state', async () => {
            // Filter items by tag
            const tagFilterPlugin = createPlugin({
                id: 'tag-filter',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const items = data.items.filter((item) => item.tags.includes('react'));
                        return { ...data, items, total: items.length };
                    },
                },
            });

            // Add a score field to remaining items
            const scorePlugin = createPlugin({
                id: 'scorer',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const items = data.items.map((item, index) => ({
                            ...item,
                            score: (index + 1) * 10,
                        }));
                        return { ...data, items };
                    },
                },
            });

            const plugins = definePlugins([tagFilterPlugin, scorePlugin]);
            const runner = new PluginRunner(plugins);

            const input = createTestContentData(mockItems);
            const result = await runner.runDataLoaded(input, createBaseContext());

            // react items: beta, gamma
            expect(result.items).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.items[0]!.score).toBe(10);
            expect(result.items[1]!.score).toBe(20);
        });
    });

    // -----------------------------------------------------------------------
    // 3. Plugin error handling
    // -----------------------------------------------------------------------
    describe('plugin error handling', () => {
        it('should handle a throwing plugin gracefully and pass data through unchanged', async () => {
            const goodPlugin = createPlugin({
                id: 'good',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        return { ...data, total: 999 };
                    },
                },
            });

            const throwingPlugin = createPlugin({
                id: 'bad',
                hooks: {
                    onDataLoaded: async () => {
                        throw new Error('Unexpected plugin failure');
                    },
                },
            });

            const finalPlugin = createPlugin({
                id: 'final',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        // Should receive total=999 from 'good', since 'bad' threw
                        return { ...data, total: data.total + 1 };
                    },
                },
            });

            const plugins = definePlugins([goodPlugin, throwingPlugin, finalPlugin]);
            const runner = new PluginRunner(plugins);

            const input = createTestContentData(mockItems);
            const result = await runner.runDataLoaded(input, createBaseContext());

            // good sets 999, bad throws (data stays 999), final adds 1 -> 1000
            expect(result.total).toBe(1000);
        });

        it('should handle a plugin that returns null and preserve previous data', async () => {
            const transformPlugin = createPlugin({
                id: 'transform',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        return { ...data, total: 42 };
                    },
                },
            });

            const nullPlugin = createPlugin({
                id: 'null-returner',
                hooks: {
                    onDataLoaded: vi.fn().mockResolvedValue(null),
                },
            });

            const plugins = definePlugins([transformPlugin, nullPlugin]);
            const runner = new PluginRunner(plugins);

            const input = createTestContentData(mockItems);
            const result = await runner.runDataLoaded(input, createBaseContext());

            // null-returner returned null, so data from transform (total=42) is preserved
            expect(result.total).toBe(42);
        });

        it('should handle errors in onInit without stopping other plugins', async () => {
            const initOrder: string[] = [];

            const crashPlugin = createPlugin({
                id: 'crash',
                hooks: {
                    onInit: async () => {
                        throw new Error('Init crash');
                    },
                },
            });

            const okPlugin = createPlugin({
                id: 'ok',
                hooks: {
                    onInit: async () => {
                        initOrder.push('ok');
                    },
                },
            });

            const plugins = definePlugins([crashPlugin, okPlugin]);
            const runner = new PluginRunner(plugins);

            await runner.runInit(createBaseContext());

            expect(initOrder).toEqual(['ok']);
        });
    });

    // -----------------------------------------------------------------------
    // 4. Plugin ordering (dependency resolution)
    // -----------------------------------------------------------------------
    describe('plugin ordering', () => {
        it('should run plugins in dependency-resolved order', async () => {
            const executionOrder: string[] = [];

            const pluginA = createPlugin({
                id: 'a',
                dependencies: ['b'],
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        executionOrder.push('a');
                        return data;
                    },
                },
            });

            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        executionOrder.push('b');
                        return data;
                    },
                },
            });

            const pluginC = createPlugin({
                id: 'c',
                dependencies: ['a'],
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        executionOrder.push('c');
                        return data;
                    },
                },
            });

            // c depends on a, a depends on b => order: b, a, c
            const plugins = definePlugins([pluginC, pluginA, pluginB]);
            const runner = new PluginRunner(plugins);

            await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(executionOrder).toEqual(['b', 'a', 'c']);
        });

        it('should preserve original order when no dependencies exist', async () => {
            const executionOrder: string[] = [];

            const plugins = ['x', 'y', 'z'].map((id) =>
                createPlugin({
                    id,
                    hooks: {
                        onDataLoaded: async (data: ContentData) => {
                            executionOrder.push(id);
                            return data;
                        },
                    },
                }),
            );

            const sorted = definePlugins(plugins);
            const runner = new PluginRunner(sorted);

            await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(executionOrder).toEqual(['x', 'y', 'z']);
        });

        it('should run dependent plugin data transformations after their dependencies', async () => {
            // "base" adds items, "derived" depends on "base" and counts them
            const basePlugin = createPlugin({
                id: 'base',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        const newItems = [
                            createItem({ id: 'injected-1' }),
                            createItem({ id: 'injected-2' }),
                        ];
                        return { ...data, items: [...data.items, ...newItems] };
                    },
                },
            });

            const derivedPlugin = createPlugin({
                id: 'derived',
                dependencies: ['base'],
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        // Should see items injected by "base"
                        return { ...data, total: data.items.length };
                    },
                },
            });

            const plugins = definePlugins([derivedPlugin, basePlugin]);
            const runner = new PluginRunner(plugins);

            const input = createTestContentData(mockItems);
            const result = await runner.runDataLoaded(input, createBaseContext());

            // 5 original + 2 injected = 7
            expect(result.items).toHaveLength(7);
            expect(result.total).toBe(7);
        });
    });

    // -----------------------------------------------------------------------
    // 5. Plugin enable/disable (skipped plugins)
    // -----------------------------------------------------------------------
    describe('plugin enable/disable', () => {
        it('should not execute plugins that are omitted from the pipeline', async () => {
            const executedPlugins: string[] = [];

            const enabledPlugin = createPlugin({
                id: 'enabled',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        executedPlugins.push('enabled');
                        return { ...data, total: 100 };
                    },
                },
            });

            const disabledPlugin = createPlugin({
                id: 'disabled',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        executedPlugins.push('disabled');
                        return { ...data, total: -1 };
                    },
                },
            });

            // Simulate enable/disable by only including enabled plugins
            const allPlugins = [enabledPlugin, disabledPlugin];
            const activePlugins = allPlugins.filter((p) => p.id !== 'disabled');

            const plugins = definePlugins(activePlugins);
            const runner = new PluginRunner(plugins);

            const result = await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(executedPlugins).toEqual(['enabled']);
            expect(result.total).toBe(100);
        });

        it('should not execute hooks on plugins registered without hooks', async () => {
            const executedPlugins: string[] = [];

            const noHooksPlugin = createPlugin({ id: 'no-hooks' }); // No hooks defined

            const activePlugin = createPlugin({
                id: 'active',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        executedPlugins.push('active');
                        return data;
                    },
                },
            });

            const plugins = definePlugins([noHooksPlugin, activePlugin]);
            const runner = new PluginRunner(plugins);

            await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(executedPlugins).toEqual(['active']);
        });

        it('should skip plugins without specific lifecycle hooks while executing others', async () => {
            const initOrder: string[] = [];
            const dataOrder: string[] = [];

            const initOnlyPlugin = createPlugin({
                id: 'init-only',
                hooks: {
                    onInit: async () => { initOrder.push('init-only'); },
                },
            });

            const dataOnlyPlugin = createPlugin({
                id: 'data-only',
                hooks: {
                    onDataLoaded: async (data: ContentData) => {
                        dataOrder.push('data-only');
                        return data;
                    },
                },
            });

            const bothPlugin = createPlugin({
                id: 'both',
                hooks: {
                    onInit: async () => { initOrder.push('both'); },
                    onDataLoaded: async (data: ContentData) => {
                        dataOrder.push('both');
                        return data;
                    },
                },
            });

            const plugins = definePlugins([initOnlyPlugin, dataOnlyPlugin, bothPlugin]);
            const runner = new PluginRunner(plugins);
            const ctx = createBaseContext();

            await runner.runInit(ctx);
            await runner.runDataLoaded(createTestContentData(), ctx);

            expect(initOrder).toEqual(['init-only', 'both']);
            expect(dataOrder).toEqual(['data-only', 'both']);
        });
    });

    // -----------------------------------------------------------------------
    // 6. Empty plugin list
    // -----------------------------------------------------------------------
    describe('empty plugin list', () => {
        it('should pass data through unchanged when no plugins are registered', async () => {
            const plugins = definePlugins([]);
            const runner = new PluginRunner(plugins);

            const input = createTestContentData(mockItems);
            const result = await runner.runDataLoaded(input, createBaseContext());

            expect(result).toBe(input); // Same reference — no transformation
            expect(result.items).toHaveLength(5);
            expect(result.total).toBe(5);
        });

        it('should complete all lifecycle phases without error when no plugins exist', async () => {
            const plugins = definePlugins([]);
            const runner = new PluginRunner(plugins);
            const ctx = createBaseContext();

            await runner.runInit(ctx);
            const result = await runner.runDataLoaded(createTestContentData(), ctx);
            await runner.runBeforeBuild(ctx);
            await runner.runAfterBuild(ctx);

            expect(result).toBeDefined();
        });
    });

    // -----------------------------------------------------------------------
    // 7. Plugin context
    // -----------------------------------------------------------------------
    describe('plugin context', () => {
        it('should provide config, contentPath, and outDir from the base context', async () => {
            let capturedCtx: PluginContext | null = null;

            const plugin = createPlugin({
                id: 'ctx-reader',
                hooks: {
                    onDataLoaded: async (data: ContentData, ctx: PluginContext) => {
                        capturedCtx = ctx;
                        return data;
                    },
                },
            });

            const plugins = definePlugins([plugin]);
            const runner = new PluginRunner(plugins);

            await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(capturedCtx).not.toBeNull();
            expect(capturedCtx!.config.company_name).toBe('Integration Test');
            expect(capturedCtx!.contentPath).toBe('/mock/content');
            expect(capturedCtx!.outDir).toBe('/mock/dist');
        });

        it('should provide a scoped logger with info, warn, error, and debug methods', async () => {
            let capturedLog: PluginContext['log'] | null = null;

            const plugin = createPlugin({
                id: 'log-checker',
                hooks: {
                    onDataLoaded: async (data: ContentData, ctx: PluginContext) => {
                        capturedLog = ctx.log;
                        return data;
                    },
                },
            });

            const plugins = definePlugins([plugin]);
            const runner = new PluginRunner(plugins);

            await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(capturedLog).not.toBeNull();
            expect(typeof capturedLog!.info).toBe('function');
            expect(typeof capturedLog!.warn).toBe('function');
            expect(typeof capturedLog!.error).toBe('function');
            expect(typeof capturedLog!.debug).toBe('function');
        });

        it('should provide a plugins map containing all registered plugins', async () => {
            let capturedPlugins: ReadonlyMap<string, Plugin> | null = null;

            const pluginA = createPlugin({
                id: 'map-reader',
                hooks: {
                    onDataLoaded: async (data: ContentData, ctx: PluginContext) => {
                        capturedPlugins = ctx.plugins;
                        return data;
                    },
                },
            });

            const pluginB = createPlugin({ id: 'other-plugin' });

            const plugins = definePlugins([pluginA, pluginB]);
            const runner = new PluginRunner(plugins);

            await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(capturedPlugins).not.toBeNull();
            expect(capturedPlugins!.size).toBe(2);
            expect(capturedPlugins!.has('map-reader')).toBe(true);
            expect(capturedPlugins!.has('other-plugin')).toBe(true);
            expect(capturedPlugins!.get('map-reader')).toBe(pluginA);
            expect(capturedPlugins!.get('other-plugin')).toBe(pluginB);
        });

        it('should provide a fresh context per plugin per hook invocation', async () => {
            const capturedContexts: PluginContext[] = [];

            const pluginA = createPlugin({
                id: 'ctx-a',
                hooks: {
                    onDataLoaded: async (data: ContentData, ctx: PluginContext) => {
                        capturedContexts.push(ctx);
                        return data;
                    },
                },
            });

            const pluginB = createPlugin({
                id: 'ctx-b',
                hooks: {
                    onDataLoaded: async (data: ContentData, ctx: PluginContext) => {
                        capturedContexts.push(ctx);
                        return data;
                    },
                },
            });

            const plugins = definePlugins([pluginA, pluginB]);
            const runner = new PluginRunner(plugins);

            await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(capturedContexts).toHaveLength(2);
            // Each plugin gets its own context object
            expect(capturedContexts[0]).not.toBe(capturedContexts[1]);
            // But they share the same plugins map reference
            expect(capturedContexts[0]!.plugins).toBe(capturedContexts[1]!.plugins);
        });

        it('should allow a plugin to look up a dependency via the plugins map', async () => {
            let foundDependency = false;

            const depPlugin = createPlugin({
                id: 'dependency',
                version: '2.0.0',
            });

            const consumerPlugin = createPlugin({
                id: 'consumer',
                dependencies: ['dependency'],
                hooks: {
                    onInit: async (ctx: PluginContext) => {
                        const dep = ctx.plugins.get('dependency');
                        foundDependency = dep !== undefined && dep.version === '2.0.0';
                    },
                },
            });

            const plugins = definePlugins([consumerPlugin, depPlugin]);
            const runner = new PluginRunner(plugins);

            await runner.runInit(createBaseContext());

            expect(foundDependency).toBe(true);
        });
    });
});
