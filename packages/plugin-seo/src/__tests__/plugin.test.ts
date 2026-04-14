/**
 * Tests for the seoPlugin() factory function.
 *
 * Verifies plugin structure, onInit validation/logging, and
 * onDataLoaded passthrough behavior.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seoPlugin } from '../plugin.js';
import type { ContentData } from '@ever-works/core';
import type { PluginContext } from '@ever-works/plugins';

function createMockContext(): PluginContext {
    return {
        log: {
            info: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        },
        options: {},
    } as unknown as PluginContext;
}

function createMockContentData(): ContentData {
    return {
        items: [],
        categories: [],
        tags: [],
        collections: [],
        comparisons: [],
        pages: [],
        config: {
            name: 'Test Site',
            description: 'A test site',
            url: 'https://example.com',
        },
    } as unknown as ContentData;
}

describe('seoPlugin()', () => {
    let ctx: PluginContext;

    beforeEach(() => {
        ctx = createMockContext();
    });

    /** Helper: create plugin and extract hooks (non-null — seoPlugin always provides hooks). */
    function createPlugin(options?: Parameters<typeof seoPlugin>[0]) {
        const plugin = seoPlugin(options);
        const hooks = plugin.hooks!;
        return { plugin, hooks };
    }

    /* ── Plugin structure ── */

    it('returns a valid Plugin object', () => {
        const { plugin, hooks } = createPlugin();

        expect(plugin.id).toBe('seo');
        expect(plugin.name).toBe('SEO Plugin');
        expect(plugin.version).toBeDefined();
        expect(plugin.description).toBeDefined();
        expect(hooks).toBeDefined();
        expect(hooks.onInit).toBeTypeOf('function');
        expect(hooks.onDataLoaded).toBeTypeOf('function');
    });

    /* ── onInit ── */

    it('logs initialization message', async () => {
        const { hooks } = createPlugin();
        await hooks.onInit!(ctx);

        expect(ctx.log.info).toHaveBeenCalledWith('SEO plugin initialized');
    });

    it('logs siteUrl when provided', async () => {
        const { hooks } = createPlugin({ siteUrl: 'https://example.com' });
        await hooks.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('Site URL: https://example.com');
    });

    it('logs titleTemplate when provided', async () => {
        const { hooks } = createPlugin({ titleTemplate: '%s | My Site' });
        await hooks.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('Title template: %s | My Site');
    });

    it('logs JSON-LD enabled by default', async () => {
        const { hooks } = createPlugin();
        await hooks.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('JSON-LD generation: enabled');
    });

    it('logs JSON-LD disabled when set to false', async () => {
        const { hooks } = createPlugin({ jsonLd: false });
        await hooks.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('JSON-LD generation: disabled');
    });

    /* ── Validation warnings ── */

    it('warns on invalid siteUrl', async () => {
        const { hooks } = createPlugin({ siteUrl: 'not-a-url' });
        await hooks.onInit!(ctx);

        expect(ctx.log.warn).toHaveBeenCalledWith(
            expect.stringContaining('not a valid URL'),
        );
    });

    it('does not warn on valid siteUrl', async () => {
        const { hooks } = createPlugin({ siteUrl: 'https://example.com' });
        await hooks.onInit!(ctx);

        const warnCalls = (ctx.log.warn as ReturnType<typeof vi.fn>).mock.calls as string[][];
        const urlWarnings = warnCalls.filter((c) =>
            c[0]?.includes('siteUrl'),
        );
        expect(urlWarnings).toHaveLength(0);
    });

    it('warns when titleTemplate lacks %s placeholder', async () => {
        const { hooks } = createPlugin({ titleTemplate: 'My Site' });
        await hooks.onInit!(ctx);

        expect(ctx.log.warn).toHaveBeenCalledWith(
            expect.stringContaining('does not contain a "%s" placeholder'),
        );
    });

    it('warns when twitterHandle lacks @ prefix', async () => {
        const { hooks } = createPlugin({ twitterHandle: 'mysite' });
        await hooks.onInit!(ctx);

        expect(ctx.log.warn).toHaveBeenCalledWith(
            expect.stringContaining('should start with "@"'),
        );
    });

    it('does not warn on correct twitterHandle', async () => {
        const { hooks } = createPlugin({ twitterHandle: '@mysite' });
        await hooks.onInit!(ctx);

        const warnCalls = (ctx.log.warn as ReturnType<typeof vi.fn>).mock.calls as string[][];
        const twitterWarnings = warnCalls.filter((c) =>
            c[0]?.includes('twitterHandle'),
        );
        expect(twitterWarnings).toHaveLength(0);
    });

    it('warns on invalid defaultOgImage URL', async () => {
        const { hooks } = createPlugin({ defaultOgImage: 'bad-url' });
        await hooks.onInit!(ctx);

        expect(ctx.log.warn).toHaveBeenCalledWith(
            expect.stringContaining('not a valid URL'),
        );
    });

    /* ── onDataLoaded passthrough ── */

    it('passes content data through unchanged', async () => {
        const { hooks } = createPlugin();
        const data = createMockContentData();

        const result = await hooks.onDataLoaded!(data, ctx);

        expect(result).toBe(data); // same reference, no modification
    });
});
