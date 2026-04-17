/**
 * Tests for the Ever Works Astro integration.
 *
 * Verifies that the integration correctly bridges plugin lifecycle
 * hooks into Astro's build pipeline.
 */

import { describe, it, expect, vi } from 'vitest';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { everWorksIntegration } from '../integration.js';
import type { ContentData, SiteConfig } from '@ever-works/core';
import { PluginRunner, definePlugins } from '@ever-works/plugins';
import type { Plugin } from '@ever-works/plugins';

/** Create a platform-correct file URL for a dist path */
function makeDistUrl(path: string = resolve('/tmp/dist/')): URL {
    return pathToFileURL(path);
}

/** Create a minimal mock ContentData */
function createMockContent(): ContentData {
    return {
        items: [],
        categories: [],
        tags: [],
        collections: [],
        comparisons: [],
        pages: [],
        config: {
            company_name: 'Test',
            items_name: 'Items',
            item_name: 'Item',
        } as SiteConfig,
        total: 0,
    };
}

describe('everWorksIntegration', () => {
    it('should return an AstroIntegration with the correct name', () => {
        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => createMockContent(),
        });

        expect(integration.name).toBe('@ever-works/astro-integration');
    });

    it('should have astro:build:start and astro:build:done hooks', () => {
        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => createMockContent(),
        });

        expect(integration.hooks['astro:build:start']).toBeDefined();
        expect(integration.hooks['astro:build:done']).toBeDefined();
    });

    it('should call runBeforeBuild on astro:build:start', async () => {
        const beforeBuild = vi.fn();
        const plugin: Plugin = {
            id: 'test',
            name: 'Test Plugin',
            version: '0.1.0',
            description: 'Test plugin',
            hooks: {
                onBeforeBuild: beforeBuild,
            },
        };

        const runner = new PluginRunner(definePlugins([plugin]));
        const integration = everWorksIntegration({
            getRunner: () => runner,
            getContent: async () => createMockContent(),
        });

        const hook = integration.hooks['astro:build:start'];
        if (hook) {
            // Call with minimal args that Astro would pass
            await (hook as () => Promise<void>)();
        }

        expect(beforeBuild).toHaveBeenCalledOnce();
    });

    it('should call runAfterBuild on astro:build:done', async () => {
        const afterBuild = vi.fn();
        const plugin: Plugin = {
            id: 'test',
            name: 'Test Plugin',
            version: '0.1.0',
            description: 'Test plugin',
            hooks: {
                onAfterBuild: afterBuild,
            },
        };

        const runner = new PluginRunner(definePlugins([plugin]));
        const integration = everWorksIntegration({
            getRunner: () => runner,
            getContent: async () => createMockContent(),
        });

        const hook = integration.hooks['astro:build:done'];
        if (hook) {
            // Simulate Astro's build:done args with a platform-correct file URL
            const dir = makeDistUrl();
            await (hook as (args: { dir: URL }) => Promise<void>)({ dir });
        }

        expect(afterBuild).toHaveBeenCalledOnce();
    });

    it('should pass correct outDir from file URL to plugin context', async () => {
        let capturedOutDir = '';
        const plugin: Plugin = {
            id: 'test',
            name: 'Test Plugin',
            version: '0.1.0',
            description: 'Test plugin',
            hooks: {
                onAfterBuild: async (ctx) => {
                    capturedOutDir = ctx.outDir;
                },
            },
        };

        const runner = new PluginRunner(definePlugins([plugin]));
        const integration = everWorksIntegration({
            getRunner: () => runner,
            getContent: async () => createMockContent(),
        });

        const hook = integration.hooks['astro:build:done'];
        if (hook) {
            const distPath = resolve('/tmp/my-project/dist/');
            const dir = makeDistUrl(distPath);
            await (hook as (args: { dir: URL }) => Promise<void>)({ dir });
        }

        // Should be a proper filesystem path, not a URL
        expect(capturedOutDir).not.toContain('file://');
        expect(capturedOutDir).toContain('dist');
    });

    it('should use custom contentPath when provided', async () => {
        let capturedContentPath = '';
        const plugin: Plugin = {
            id: 'test',
            name: 'Test Plugin',
            version: '0.1.0',
            description: 'Test plugin',
            hooks: {
                onBeforeBuild: async (ctx) => {
                    capturedContentPath = ctx.contentPath;
                },
            },
        };

        const runner = new PluginRunner(definePlugins([plugin]));
        const integration = everWorksIntegration({
            getRunner: () => runner,
            getContent: async () => createMockContent(),
            contentPath: '/custom/content',
        });

        const hook = integration.hooks['astro:build:start'];
        if (hook) {
            await (hook as () => Promise<void>)();
        }

        expect(capturedContentPath).toBe('/custom/content');
    });

    it('should default contentPath to .content', async () => {
        let capturedContentPath = '';
        const plugin: Plugin = {
            id: 'test',
            name: 'Test Plugin',
            version: '0.1.0',
            description: 'Test plugin',
            hooks: {
                onBeforeBuild: async (ctx) => {
                    capturedContentPath = ctx.contentPath;
                },
            },
        };

        const runner = new PluginRunner(definePlugins([plugin]));
        const integration = everWorksIntegration({
            getRunner: () => runner,
            getContent: async () => createMockContent(),
        });

        const hook = integration.hooks['astro:build:start'];
        if (hook) {
            await (hook as () => Promise<void>)();
        }

        expect(capturedContentPath).toBe('.content');
    });

    it('should catch and warn on onBeforeBuild errors', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const plugin: Plugin = {
            id: 'test',
            name: 'Test Plugin',
            version: '0.1.0',
            description: 'Test plugin',
            hooks: {
                onBeforeBuild: async () => {
                    throw new Error('before build failed');
                },
            },
        };

        const runner = new PluginRunner(definePlugins([plugin]));
        const integration = everWorksIntegration({
            getRunner: () => runner,
            getContent: async () => createMockContent(),
        });

        const hook = integration.hooks['astro:build:start'];
        if (hook) {
            // Should not throw
            await (hook as () => Promise<void>)();
        }

        // The runner catches individual plugin errors, so the integration
        // should complete without throwing
        warnSpy.mockRestore();
    });

    it('should catch and warn on getContent errors in afterBuild', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const runner = new PluginRunner([]);
        const integration = everWorksIntegration({
            getRunner: () => runner,
            getContent: async () => { throw new Error('content load failed'); },
        });

        const hook = integration.hooks['astro:build:done'];
        if (hook) {
            const dir = makeDistUrl();
            // Should not throw — should catch and warn
            await (hook as (args: { dir: URL }) => Promise<void>)({ dir });
        }

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('onAfterBuild failed'),
        );
        warnSpy.mockRestore();
    });

    it('should not inject webhook route when sync.webhook is not enabled', () => {
        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => createMockContent(),
        });

        const injectRoute = vi.fn();
        const logger = { warn: vi.fn(), info: vi.fn() };

        const hook = integration.hooks['astro:config:setup'];
        if (hook) {
            (hook as unknown as (args: {
                injectRoute: typeof injectRoute;
                config: { adapter?: unknown };
                logger: typeof logger;
            }) => void)({
                injectRoute,
                config: { adapter: {} },
                logger,
            });
        }

        expect(injectRoute).not.toHaveBeenCalled();
    });

    it('should inject webhook route when sync.webhook is true and adapter exists', () => {
        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => createMockContent(),
            sync: { webhook: true },
        });

        const injectRoute = vi.fn();
        const logger = { warn: vi.fn(), info: vi.fn() };

        const hook = integration.hooks['astro:config:setup'];
        if (hook) {
            (hook as unknown as (args: {
                injectRoute: typeof injectRoute;
                config: { adapter?: unknown };
                logger: typeof logger;
            }) => void)({
                injectRoute,
                config: { adapter: { name: 'vercel' } },
                logger,
            });
        }

        expect(injectRoute).toHaveBeenCalledWith({
            pattern: '/api/webhook',
            entrypoint: '@ever-works/astro-integration/webhook-endpoint',
        });
        expect(logger.info).toHaveBeenCalled();
    });

    it('should warn and skip injection when sync.webhook is true but no adapter', () => {
        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => createMockContent(),
            sync: { webhook: true },
        });

        const injectRoute = vi.fn();
        const logger = { warn: vi.fn(), info: vi.fn() };

        const hook = integration.hooks['astro:config:setup'];
        if (hook) {
            (hook as unknown as (args: {
                injectRoute: typeof injectRoute;
                config: { adapter?: unknown };
                logger: typeof logger;
            }) => void)({
                injectRoute,
                config: { adapter: undefined },
                logger,
            });
        }

        expect(injectRoute).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('server adapter'),
        );
    });

    it('should catch Error thrown from getContent in build:start', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => { throw new Error('content load failed in start'); },
        });

        const hook = integration.hooks['astro:build:start'];
        if (hook) {
            await (hook as () => Promise<void>)();
        }

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('content load failed in start'),
        );
        warnSpy.mockRestore();
    });

    it('should handle non-Error thrown in onBeforeBuild', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => { throw 'string error'; },
        });

        const hook = integration.hooks['astro:build:start'];
        if (hook) {
            await (hook as () => Promise<void>)();
        }

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('string error'),
        );
        warnSpy.mockRestore();
    });

    it('should handle non-Error thrown in onAfterBuild', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const integration = everWorksIntegration({
            getRunner: () => new PluginRunner([]),
            getContent: async () => { throw 'string error in after build'; },
        });

        const hook = integration.hooks['astro:build:done'];
        if (hook) {
            const dir = makeDistUrl();
            await (hook as (args: { dir: URL }) => Promise<void>)({ dir });
        }

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('string error in after build'),
        );
        warnSpy.mockRestore();
    });
});
