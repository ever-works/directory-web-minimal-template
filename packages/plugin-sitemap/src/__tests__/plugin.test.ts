import { describe, it, expect, vi } from 'vitest';
import { sitemapPlugin } from '../plugin.js';
import type { PluginContext } from '@ever-works/plugins';

/** Create a minimal mock PluginContext for testing hooks. */
function makeContext(overrides?: Partial<PluginContext>): PluginContext {
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

describe('sitemapPlugin', () => {
    // ---- plugin metadata ----

    it('returns a valid Plugin object with required fields', () => {
        const plugin = sitemapPlugin();
        expect(plugin.id).toBe('sitemap');
        expect(plugin.name).toBe('Sitemap Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(plugin.description).toBeTruthy();
    });

    it('has an onInit hook', () => {
        const plugin = sitemapPlugin();
        expect(plugin.hooks).toBeDefined();
        expect(plugin.hooks!.onInit).toBeTypeOf('function');
    });

    // ---- default configuration ----

    it('uses default changefreq of weekly', async () => {
        const plugin = sitemapPlugin();
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('changefreq=weekly'),
        );
    });

    it('uses default priority of 0.7', async () => {
        const plugin = sitemapPlugin();
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('priority=0.7'),
        );
    });

    it('uses empty exclude list by default', async () => {
        const plugin = sitemapPlugin();
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        // With empty exclude list, only the summary line is logged
        expect(ctx.log.info).toHaveBeenCalledTimes(1);
    });

    // ---- user overrides ----

    it('respects changefreq override', async () => {
        const plugin = sitemapPlugin({ changefreq: 'daily' });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('changefreq=daily'),
        );
    });

    it('respects priority override', async () => {
        const plugin = sitemapPlugin({ priority: 0.9 });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('priority=0.9'),
        );
    });

    it('respects exclude override and logs excluded paths', async () => {
        const plugin = sitemapPlugin({ exclude: ['/admin/*', '/private/*'] });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledTimes(2);
        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('/admin/*, /private/*'),
        );
    });

    it('applies all overrides together', async () => {
        const plugin = sitemapPlugin({
            changefreq: 'monthly',
            priority: 0.5,
            exclude: ['/secret'],
        });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('changefreq=monthly'),
        );
        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('priority=0.5'),
        );
        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('/secret'),
        );
    });

    // ---- partial overrides (some fields default, some provided) ----

    it('uses defaults for omitted fields when only changefreq is set', async () => {
        const plugin = sitemapPlugin({ changefreq: 'hourly' });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('changefreq=hourly'),
        );
        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('priority=0.7'),
        );
        // No exclude log since default is empty
        expect(ctx.log.info).toHaveBeenCalledTimes(1);
    });

    it('uses defaults for omitted fields when only priority is set', async () => {
        const plugin = sitemapPlugin({ priority: 1.0 });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('changefreq=weekly'),
        );
        expect(ctx.log.info).toHaveBeenCalledWith(
            expect.stringContaining('priority=1'),
        );
        expect(ctx.log.info).toHaveBeenCalledTimes(1);
    });

    // ---- edge cases ----

    it('handles empty exclude array without logging excludes', async () => {
        const plugin = sitemapPlugin({ exclude: [] });
        const ctx = makeContext();
        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledTimes(1);
    });

    it('handles undefined options the same as no options', async () => {
        const pluginA = sitemapPlugin();
        const pluginB = sitemapPlugin(undefined);

        const ctxA = makeContext();
        const ctxB = makeContext();

        await pluginA.hooks!.onInit!(ctxA);
        await pluginB.hooks!.onInit!(ctxB);

        expect(ctxA.log.info).toHaveBeenCalledWith(
            expect.stringContaining('changefreq=weekly'),
        );
        expect(ctxB.log.info).toHaveBeenCalledWith(
            expect.stringContaining('changefreq=weekly'),
        );
    });

    it('creates independent plugin instances', () => {
        const pluginA = sitemapPlugin({ changefreq: 'daily' });
        const pluginB = sitemapPlugin({ changefreq: 'yearly' });

        expect(pluginA).not.toBe(pluginB);
        expect(pluginA.id).toBe(pluginB.id);
    });
});
