import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PluginContext } from '@ever-works/plugins';
import { filtersPlugin } from '../plugin.js';

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

describe('filtersPlugin — creation and metadata', () => {
    it('returns a valid Plugin object', () => {
        const plugin = filtersPlugin();

        expect(plugin.id).toBe('filters');
        expect(plugin.name).toBe('Filters Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(typeof plugin.description).toBe('string');
        expect(plugin.description.length).toBeGreaterThan(0);
    });

    it('exposes onInit hook', () => {
        const plugin = filtersPlugin();
        expect(typeof plugin.hooks?.onInit).toBe('function');
    });

    it('does not expose onDataLoaded or build hooks', () => {
        const plugin = filtersPlugin();
        expect(plugin.hooks?.onDataLoaded).toBeUndefined();
        expect(plugin.hooks?.onBeforeBuild).toBeUndefined();
        expect(plugin.hooks?.onAfterBuild).toBeUndefined();
    });
});

// ---- onInit hook — defaults ----

describe('filtersPlugin — onInit with defaults', () => {
    it('logs all three filter types by default', async () => {
        const plugin = filtersPlugin();
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('category');
        expect(logCall).toContain('tag');
        expect(logCall).toContain('search');
    });

    it('uses URL sync true by default', async () => {
        const plugin = filtersPlugin();
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('URL sync: true');
    });
});

// ---- onInit hook — custom options ----

describe('filtersPlugin — onInit with custom options', () => {
    it('respects enabledFilters override', async () => {
        const plugin = filtersPlugin({ enabledFilters: ['category', 'search'] });
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('category');
        expect(logCall).toContain('search');
        expect(logCall).not.toContain('tag');
    });

    it('respects urlSync false override', async () => {
        const plugin = filtersPlugin({ urlSync: false });
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('URL sync: false');
    });

    it('handles empty enabledFilters array', async () => {
        const plugin = filtersPlugin({ enabledFilters: [] });
        const ctx = makeContext();

        await plugin.hooks!.onInit!(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('filters: []');
    });
});

// ---- Index exports ----

describe('plugin-filters barrel exports', () => {
    it('re-exports filtersPlugin from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.filtersPlugin).toBe('function');
    });

    it('re-exports filterItems from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.filterItems).toBe('function');
    });
});
