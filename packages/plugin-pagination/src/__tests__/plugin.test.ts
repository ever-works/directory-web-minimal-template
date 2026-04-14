import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PluginContext } from '@ever-works/plugins';
import { paginationPlugin } from '../plugin.js';

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

beforeEach(() => {
    vi.clearAllMocks();
});

// ---- Plugin creation / metadata ----

describe('paginationPlugin — creation and metadata', () => {
    it('returns a valid Plugin object', () => {
        const plugin = paginationPlugin();

        expect(plugin.id).toBe('pagination');
        expect(plugin.name).toBe('Pagination Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(typeof plugin.description).toBe('string');
        expect(plugin.description.length).toBeGreaterThan(0);
    });

    it('exposes onInit hook', () => {
        const plugin = paginationPlugin();
        expect(typeof plugin.hooks?.onInit).toBe('function');
    });

    it('does not expose data or build hooks', () => {
        const plugin = paginationPlugin();
        expect(plugin.hooks?.onDataLoaded).toBeUndefined();
        expect(plugin.hooks?.onBeforeBuild).toBeUndefined();
        expect(plugin.hooks?.onAfterBuild).toBeUndefined();
    });
});

// ---- onInit hook — defaults ----

describe('paginationPlugin — onInit with defaults', () => {
    it('uses 12 items per page by default', async () => {
        const plugin = paginationPlugin();
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('12 items/page');
    });

    it('does not mention maxPages when not configured', async () => {
        const plugin = paginationPlugin();
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).not.toContain('max');
    });

    it('logs source as default', async () => {
        const plugin = paginationPlugin();
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('Source: default');
    });
});

// ---- onInit hook — plugin options ----

describe('paginationPlugin — onInit with plugin options', () => {
    it('uses itemsPerPage from options', async () => {
        const plugin = paginationPlugin({ itemsPerPage: 24 });
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('24 items/page');
    });

    it('logs maxPages when configured', async () => {
        const plugin = paginationPlugin({ itemsPerPage: 10, maxPages: 5 });
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('max 5 pages');
    });

    it('logs source as plugin options', async () => {
        const plugin = paginationPlugin({ itemsPerPage: 24 });
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('Source: plugin options');
    });
});

// ---- onInit hook — site config ----

describe('paginationPlugin — onInit with site config', () => {
    it('uses itemsPerPage from site config when no option override', async () => {
        const plugin = paginationPlugin();
        const ctx = makeContext({
            config: { pagination: { itemsPerPage: 20 } } as PluginContext['config'],
        });

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('20 items/page');
    });

    it('logs source as site config', async () => {
        const plugin = paginationPlugin();
        const ctx = makeContext({
            config: { pagination: { itemsPerPage: 20 } } as PluginContext['config'],
        });

        await plugin.hooks!.onInit!(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('Source: site config');
    });

    it('plugin options take precedence over site config', async () => {
        const plugin = paginationPlugin({ itemsPerPage: 36 });
        const ctx = makeContext({
            config: { pagination: { itemsPerPage: 20 } } as PluginContext['config'],
        });

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('36 items/page');
    });
});

// ---- Index exports ----

describe('plugin-pagination barrel exports', () => {
    it('re-exports paginationPlugin from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.paginationPlugin).toBe('function');
    });

    it('re-exports paginate from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.paginate).toBe('function');
    });
});
