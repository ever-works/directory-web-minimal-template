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
    });

    describe('runBeforeBuild', () => {
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
    });

    describe('runAfterBuild', () => {
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

    it('should handle missing dependencies gracefully (warns, does not crash)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const pluginA = createPlugin({ id: 'a', dependencies: ['nonexistent'] });

        const sorted = definePlugins([pluginA]);

        expect(sorted).toHaveLength(1);
        expect(sorted[0]!.id).toBe('a');
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('nonexistent')
        );

        warnSpy.mockRestore();
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
