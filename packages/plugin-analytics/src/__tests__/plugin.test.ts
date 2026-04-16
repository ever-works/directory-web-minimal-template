import { describe, it, expect, vi } from 'vitest';
import { analyticsPlugin } from '../plugin';
import type { ContentData } from '@ever-works/core';

function createMockContext() {
    return {
        config: {} as ContentData['config'],
        contentPath: '/tmp/.content',
        outDir: '/tmp/dist',
        plugins: new Map(),
        log: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        },
    };
}

function createMockData(): ContentData {
    return {
        items: [],
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
            settings: {},
        },
        total: 0,
    };
}

describe('analyticsPlugin', () => {
    it('returns valid plugin structure', () => {
        const plugin = analyticsPlugin({
            providers: [{ provider: 'plausible', domain: 'example.com' }],
        });
        expect(plugin.id).toBe('analytics');
        expect(plugin.name).toBe('Analytics Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(plugin.hooks).toBeDefined();
        expect(plugin.hooks!.onInit).toBeTypeOf('function');
        expect(plugin.hooks!.onDataLoaded).toBeTypeOf('function');
    });

    describe('onInit', () => {
        it('logs provider count and names', async () => {
            const plugin = analyticsPlugin({
                providers: [
                    { provider: 'plausible', domain: 'test.com' },
                    { provider: 'ga4', measurementId: 'G-XYZ' },
                ],
            });
            const ctx = createMockContext();
            await plugin.hooks!.onInit!(ctx);
            expect(ctx.log.info).toHaveBeenCalledWith(
                expect.stringContaining('2 provider(s)'),
            );
            expect(ctx.log.info).toHaveBeenCalledWith(
                expect.stringContaining('plausible, ga4'),
            );
        });

        it('logs DNT debug when enabled', async () => {
            const plugin = analyticsPlugin({
                providers: [{ provider: 'plausible', domain: 'test.com' }],
                respectDoNotTrack: true,
            });
            const ctx = createMockContext();
            await plugin.hooks!.onInit!(ctx);
            expect(ctx.log.debug).toHaveBeenCalledWith(
                'Do-Not-Track: honored',
            );
        });

        it('logs dev disable debug when enabled', async () => {
            const plugin = analyticsPlugin({
                providers: [{ provider: 'plausible', domain: 'test.com' }],
                disableInDev: true,
            });
            const ctx = createMockContext();
            await plugin.hooks!.onInit!(ctx);
            expect(ctx.log.debug).toHaveBeenCalledWith(
                'Dev mode: tracking disabled',
            );
        });
    });

    describe('onDataLoaded', () => {
        it('attaches _analytics to content data', async () => {
            const plugin = analyticsPlugin({
                providers: [{ provider: 'plausible', domain: 'test.com' }],
            });
            const ctx = createMockContext();
            const data = createMockData();
            const result = await plugin.hooks!.onDataLoaded!(data, ctx);
            expect(result._analytics).toEqual({
                providers: [{ provider: 'plausible', domain: 'test.com' }],
                respectDoNotTrack: true,
                disableInDev: true,
                placement: 'head',
            });
        });

        it('preserves existing data fields', async () => {
            const plugin = analyticsPlugin({
                providers: [{ provider: 'fathom', siteId: 'ABC' }],
            });
            const ctx = createMockContext();
            const data = createMockData();
            data.total = 42;
            const result = await plugin.hooks!.onDataLoaded!(data, ctx);
            expect(result.total).toBe(42);
            expect(result.items).toEqual([]);
        });
    });
});
