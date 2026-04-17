import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginRunner } from '../runner.js';
import { definePlugins } from '../define-plugins.js';
import type { Plugin, PluginContext } from '../types.js';
import type { ContentData, SiteConfig } from '@ever-works/core';

/** Minimal SiteConfig for tests */
function createTestConfig(): SiteConfig {
    return {
        company_name: 'Test',
        item_name: 'Item',
        items_name: 'Items',
        copyright_year: 2025,
    };
}

/** Minimal ContentData for tests */
function createTestContentData(): ContentData {
    return {
        items: [],
        categories: [],
        tags: [],
        collections: [],
        comparisons: [],
        pages: [],
        config: createTestConfig(),
        total: 0,
    };
}

/** Base context that the runner requires (without log and plugins, which it fills in) */
function createBaseContext() {
    return {
        config: createTestConfig(),
        contentPath: '/mock/content',
        outDir: '/mock/dist',
    };
}

/** Helper to create a simple plugin */
function createPlugin(overrides: Partial<Plugin> & { id: string }): Plugin {
    return {
        name: overrides.id,
        version: '0.1.0',
        description: `Test plugin ${overrides.id}`,
        ...overrides,
    };
}

describe('PluginRunner', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('runInit', () => {
        it('should call onInit on each plugin in order', async () => {
            const order: string[] = [];

            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onInit: vi.fn().mockImplementation(async () => {
                        order.push('a');
                    }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onInit: vi.fn().mockImplementation(async () => {
                        order.push('b');
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runInit(createBaseContext());

            expect(order).toEqual(['a', 'b']);
            expect(pluginA.hooks!.onInit).toHaveBeenCalledOnce();
            expect(pluginB.hooks!.onInit).toHaveBeenCalledOnce();
        });

        it('should skip plugins without onInit hook', async () => {
            const initFn = vi.fn();
            const pluginA = createPlugin({ id: 'a' }); // no hooks
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onInit: initFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runInit(createBaseContext());

            expect(initFn).toHaveBeenCalledOnce();
        });

        it('should catch errors in onInit and continue to next plugin', async () => {
            const order: string[] = [];

            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onInit: vi.fn().mockRejectedValue(new Error('Init failed')),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onInit: vi.fn().mockImplementation(async () => {
                        order.push('b');
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            // Should not throw
            await runner.runInit(createBaseContext());

            // Plugin B should still have been called
            expect(order).toEqual(['b']);
        });

        it('should handle non-Error thrown values in onInit', async () => {
            const order: string[] = [];

            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onInit: vi.fn().mockRejectedValue('string error'),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onInit: vi.fn().mockImplementation(async () => {
                        order.push('b');
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runInit(createBaseContext());

            expect(order).toEqual(['b']);
        });

        it('should skip plugins with hooks object but no onInit method', async () => {
            const initFn = vi.fn();
            // hooks exists but onInit is NOT defined — covers the branch where
            // `plugin.hooks` is truthy but `plugin.hooks.onInit` is undefined.
            const pluginA = createPlugin({ id: 'a', hooks: {} });
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onInit: initFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runInit(createBaseContext());

            expect(initFn).toHaveBeenCalledOnce();
        });

        it('should skip plugins whose hooks object only has unrelated hooks (no onInit)', async () => {
            const initFn = vi.fn();
            const afterBuildFn = vi.fn();
            // hooks has onAfterBuild but NOT onInit
            const pluginA = createPlugin({
                id: 'a',
                hooks: { onAfterBuild: afterBuildFn },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onInit: initFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runInit(createBaseContext());

            expect(initFn).toHaveBeenCalledOnce();
            // onAfterBuild should NOT have been called via runInit
            expect(afterBuildFn).not.toHaveBeenCalled();
        });

        it('should provide PluginContext with log and plugins to hooks', async () => {
            let capturedCtx: PluginContext | null = null;

            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onInit: vi.fn().mockImplementation(async (ctx: PluginContext) => {
                        capturedCtx = ctx;
                    }),
                },
            });

            const runner = new PluginRunner([pluginA]);
            await runner.runInit(createBaseContext());

            expect(capturedCtx).not.toBeNull();
            expect(capturedCtx!.config.company_name).toBe('Test');
            expect(capturedCtx!.contentPath).toBe('/mock/content');
            expect(capturedCtx!.outDir).toBe('/mock/dist');
            expect(capturedCtx!.log).toBeDefined();
            expect(typeof capturedCtx!.log.info).toBe('function');
            expect(typeof capturedCtx!.log.warn).toBe('function');
            expect(typeof capturedCtx!.log.error).toBe('function');
            expect(typeof capturedCtx!.log.debug).toBe('function');
            expect(capturedCtx!.plugins).toBeInstanceOf(Map);
            expect(capturedCtx!.plugins.get('a')).toBe(pluginA);
        });
    });

    describe('runDataLoaded', () => {
        it('should pass data through each plugin in a pipeline', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: data.total + 10 };
                    }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: data.total + 5 };
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            const initialData = createTestContentData();
            const result = await runner.runDataLoaded(initialData, createBaseContext());

            expect(result.total).toBe(15);
        });

        it('should use previous data when a plugin returns null', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: 42 };
                    }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: vi.fn().mockResolvedValue(null),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            const result = await runner.runDataLoaded(createTestContentData(), createBaseContext());

            // Plugin B returned null, so data from A (total=42) should be used
            expect(result.total).toBe(42);
        });

        it('should use previous data when a plugin throws', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: 99 };
                    }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: vi.fn().mockRejectedValue(new Error('Transform failed')),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            const result = await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(result.total).toBe(99);
        });

        it('should skip plugins without onDataLoaded', async () => {
            const pluginA = createPlugin({ id: 'a' }); // no hooks
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: 7 };
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            const result = await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(result.total).toBe(7);
        });

        it('should skip plugins with hooks object but no onDataLoaded method', async () => {
            const pluginA = createPlugin({ id: 'a', hooks: {} });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: 11 };
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            const result = await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(result.total).toBe(11);
        });

        it('should skip plugins whose hooks object only has unrelated hooks (no onDataLoaded)', async () => {
            const beforeBuildFn = vi.fn();
            const pluginA = createPlugin({
                id: 'a',
                hooks: { onBeforeBuild: beforeBuildFn },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: 13 };
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            const result = await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(result.total).toBe(13);
            expect(beforeBuildFn).not.toHaveBeenCalled();
        });

        it('should use previous data when a plugin returns undefined', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onDataLoaded: vi.fn().mockImplementation(async (data: ContentData) => {
                        return { ...data, total: 55 };
                    }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onDataLoaded: vi.fn().mockResolvedValue(undefined),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            const result = await runner.runDataLoaded(createTestContentData(), createBaseContext());

            expect(result.total).toBe(55);
        });

        it('should handle non-Error thrown values in onDataLoaded', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onDataLoaded: vi.fn().mockRejectedValue('string error'),
                },
            });

            const runner = new PluginRunner([pluginA]);
            const data = createTestContentData();
            const result = await runner.runDataLoaded(data, createBaseContext());

            expect(result.total).toBe(data.total);
        });
    });

    describe('runBeforeBuild', () => {
        it('should skip plugins without onBeforeBuild hook', async () => {
            const buildFn = vi.fn();
            const pluginA = createPlugin({ id: 'a' }); // no hooks
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onBeforeBuild: buildFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runBeforeBuild(createBaseContext());

            expect(buildFn).toHaveBeenCalledOnce();
        });

        it('should skip plugins with hooks object but no onBeforeBuild method', async () => {
            const buildFn = vi.fn();
            const pluginA = createPlugin({ id: 'a', hooks: {} });
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onBeforeBuild: buildFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runBeforeBuild(createBaseContext());

            expect(buildFn).toHaveBeenCalledOnce();
        });

        it('should skip plugins whose hooks object only has unrelated hooks (no onBeforeBuild)', async () => {
            const buildFn = vi.fn();
            const initFn = vi.fn();
            const pluginA = createPlugin({
                id: 'a',
                hooks: { onInit: initFn },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onBeforeBuild: buildFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runBeforeBuild(createBaseContext());

            expect(buildFn).toHaveBeenCalledOnce();
            expect(initFn).not.toHaveBeenCalled();
        });

        it('should call onBeforeBuild on each plugin in order', async () => {
            const order: string[] = [];

            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onBeforeBuild: vi.fn().mockImplementation(async () => {
                        order.push('a');
                    }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onBeforeBuild: vi.fn().mockImplementation(async () => {
                        order.push('b');
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runBeforeBuild(createBaseContext());

            expect(order).toEqual(['a', 'b']);
        });

        it('should catch errors and continue', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onBeforeBuild: vi.fn().mockRejectedValue(new Error('Before build failed')),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onBeforeBuild: vi.fn(),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runBeforeBuild(createBaseContext());

            expect(pluginB.hooks!.onBeforeBuild).toHaveBeenCalledOnce();
        });

        it('should handle non-Error thrown values in onBeforeBuild', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onBeforeBuild: vi.fn().mockRejectedValue(42),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onBeforeBuild: vi.fn(),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runBeforeBuild(createBaseContext());

            expect(pluginB.hooks!.onBeforeBuild).toHaveBeenCalledOnce();
        });
    });

    describe('runAfterBuild', () => {
        it('should skip plugins without onAfterBuild hook', async () => {
            const afterFn = vi.fn();
            const pluginA = createPlugin({ id: 'a' }); // no hooks
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onAfterBuild: afterFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runAfterBuild(createBaseContext());

            expect(afterFn).toHaveBeenCalledOnce();
        });

        it('should skip plugins with hooks object but no onAfterBuild method', async () => {
            const afterFn = vi.fn();
            const pluginA = createPlugin({ id: 'a', hooks: {} });
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onAfterBuild: afterFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runAfterBuild(createBaseContext());

            expect(afterFn).toHaveBeenCalledOnce();
        });

        it('should skip plugins whose hooks object only has unrelated hooks (no onAfterBuild)', async () => {
            const afterFn = vi.fn();
            const initFn = vi.fn();
            const pluginA = createPlugin({
                id: 'a',
                hooks: { onInit: initFn },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: { onAfterBuild: afterFn },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runAfterBuild(createBaseContext());

            expect(afterFn).toHaveBeenCalledOnce();
            expect(initFn).not.toHaveBeenCalled();
        });

        it('should call onAfterBuild on each plugin in order', async () => {
            const order: string[] = [];

            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onAfterBuild: vi.fn().mockImplementation(async () => {
                        order.push('a');
                    }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onAfterBuild: vi.fn().mockImplementation(async () => {
                        order.push('b');
                    }),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runAfterBuild(createBaseContext());

            expect(order).toEqual(['a', 'b']);
        });

        it('should catch errors and continue', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onAfterBuild: vi.fn().mockRejectedValue(new Error('After build failed')),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onAfterBuild: vi.fn(),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runAfterBuild(createBaseContext());

            expect(pluginB.hooks!.onAfterBuild).toHaveBeenCalledOnce();
        });

        it('should handle non-Error thrown values in onAfterBuild', async () => {
            const pluginA = createPlugin({
                id: 'a',
                hooks: {
                    onAfterBuild: vi.fn().mockRejectedValue({ code: 'CUSTOM' }),
                },
            });
            const pluginB = createPlugin({
                id: 'b',
                hooks: {
                    onAfterBuild: vi.fn(),
                },
            });

            const runner = new PluginRunner([pluginA, pluginB]);
            await runner.runAfterBuild(createBaseContext());

            expect(pluginB.hooks!.onAfterBuild).toHaveBeenCalledOnce();
        });
    });
});

describe('definePlugins', () => {
    it('should return plugins in dependency order', () => {
        const pluginA = createPlugin({ id: 'a', dependencies: ['b'] });
        const pluginB = createPlugin({ id: 'b' });

        const sorted = definePlugins([pluginA, pluginB]);

        expect(sorted[0]!.id).toBe('b');
        expect(sorted[1]!.id).toBe('a');
    });

    it('should return plugins without dependencies in original order', () => {
        const pluginA = createPlugin({ id: 'a' });
        const pluginB = createPlugin({ id: 'b' });
        const pluginC = createPlugin({ id: 'c' });

        const sorted = definePlugins([pluginA, pluginB, pluginC]);

        expect(sorted.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    });

    it('should throw on duplicate plugin IDs', () => {
        const pluginA1 = createPlugin({ id: 'a' });
        const pluginA2 = createPlugin({ id: 'a' });

        expect(() => definePlugins([pluginA1, pluginA2])).toThrow('Duplicate plugin ID');
    });

    it('should throw on circular dependencies', () => {
        const pluginA = createPlugin({ id: 'a', dependencies: ['b'] });
        const pluginB = createPlugin({ id: 'b', dependencies: ['a'] });

        expect(() => definePlugins([pluginA, pluginB])).toThrow('Circular plugin dependency');
    });

    it('should handle deep dependency chains', () => {
        const pluginA = createPlugin({ id: 'a', dependencies: ['b'] });
        const pluginB = createPlugin({ id: 'b', dependencies: ['c'] });
        const pluginC = createPlugin({ id: 'c' });

        const sorted = definePlugins([pluginA, pluginB, pluginC]);

        expect(sorted.map((p) => p.id)).toEqual(['c', 'b', 'a']);
    });

    it('should throw when a dependency is not registered', () => {
        const pluginA = createPlugin({ id: 'a', dependencies: ['nonexistent'] });

        expect(() => definePlugins([pluginA])).toThrow('nonexistent');
        expect(() => definePlugins([pluginA])).toThrow('not registered');
    });

    it('should work with definePlugins + PluginRunner integration', async () => {
        const order: string[] = [];

        const pluginA = createPlugin({
            id: 'a',
            dependencies: ['b'],
            hooks: {
                onInit: vi.fn().mockImplementation(async () => {
                    order.push('a');
                }),
            },
        });
        const pluginB = createPlugin({
            id: 'b',
            hooks: {
                onInit: vi.fn().mockImplementation(async () => {
                    order.push('b');
                }),
            },
        });

        const plugins = definePlugins([pluginA, pluginB]);
        const runner = new PluginRunner(plugins);
        await runner.runInit(createBaseContext());

        // B should init before A because A depends on B
        expect(order).toEqual(['b', 'a']);
    });
});
