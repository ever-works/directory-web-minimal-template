import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PluginContext } from '@ever-works/plugins';
import { searchPlugin } from '../plugin.js';

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

/** Safely get hook functions from a plugin (asserts they exist for tests). */
function getHooks(plugin: ReturnType<typeof searchPlugin>) {
    const hooks = plugin.hooks;
    if (!hooks) throw new Error('Plugin has no hooks');
    const onInit = hooks.onInit;
    const onAfterBuild = hooks.onAfterBuild;
    if (!onInit) throw new Error('Plugin has no onInit hook');
    if (!onAfterBuild) throw new Error('Plugin has no onAfterBuild hook');
    return { onInit, onAfterBuild, hooks };
}

// ---- Mock child_process ----

vi.mock('node:child_process', () => {
    const execFileMock = vi.fn(
        (
            _cmd: string,
            _args: string[],
            _opts: unknown,
            cb: (err: Error | null, result: { stdout: string; stderr: string }) => void,
        ) => {
            cb(null, { stdout: 'Indexed 42 pages', stderr: '' });
        },
    );
    return { execFile: execFileMock };
});

// Import the mocked module so we can inspect calls
import { execFile } from 'node:child_process';

const execFileMock = execFile as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
    vi.clearAllMocks();
});

// ---- Plugin creation / metadata ----

describe('searchPlugin — creation and metadata', () => {
    it('returns a valid Plugin object', () => {
        const plugin = searchPlugin();

        expect(plugin.id).toBe('search');
        expect(plugin.name).toBe('Search Plugin');
        expect(plugin.version).toBe('0.1.0');
        expect(typeof plugin.description).toBe('string');
        expect(plugin.description.length).toBeGreaterThan(0);
    });

    it('exposes onInit and onAfterBuild hooks', () => {
        const { onInit, onAfterBuild } = getHooks(searchPlugin());

        expect(typeof onInit).toBe('function');
        expect(typeof onAfterBuild).toBe('function');
    });

    it('does not expose onDataLoaded or onBeforeBuild hooks', () => {
        const { hooks } = getHooks(searchPlugin());

        expect(hooks.onDataLoaded).toBeUndefined();
        expect(hooks.onBeforeBuild).toBeUndefined();
    });
});

// ---- Configuration defaults ----

describe('searchPlugin — configuration defaults', () => {
    it('uses default bundlePath /pagefind', async () => {
        const { onInit } = getHooks(searchPlugin());
        const ctx = makeContext();

        await onInit(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('bundlePath=/pagefind');
    });

    it('uses default language en', async () => {
        const { onInit } = getHooks(searchPlugin());
        const ctx = makeContext();

        await onInit(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('language=en');
    });

    it('uses default indexFields [name, description]', async () => {
        const { onInit } = getHooks(searchPlugin());
        const ctx = makeContext();

        await onInit(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('indexFields=[name, description]');
    });
});

// ---- Configuration overrides ----

describe('searchPlugin — config resolution with user overrides', () => {
    it('applies custom bundlePath', async () => {
        const { onInit } = getHooks(searchPlugin({ bundlePath: '/search' }));
        const ctx = makeContext();

        await onInit(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('bundlePath=/search');
    });

    it('applies custom language', async () => {
        const { onInit } = getHooks(searchPlugin({ language: 'de' }));
        const ctx = makeContext();

        await onInit(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('language=de');
    });

    it('applies custom indexFields', async () => {
        const { onInit } = getHooks(searchPlugin({ indexFields: ['name', 'category', 'tags'] }));
        const ctx = makeContext();

        await onInit(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(logCall).toContain('indexFields=[name, category, tags]');
    });

    it('merges partial overrides with defaults', async () => {
        const { onInit } = getHooks(searchPlugin({ language: 'fr' }));
        const ctx = makeContext();

        await onInit(ctx);

        const logCall = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        // language overridden
        expect(logCall).toContain('language=fr');
        // bundlePath and indexFields keep defaults
        expect(logCall).toContain('bundlePath=/pagefind');
        expect(logCall).toContain('indexFields=[name, description]');
    });
});

// ---- onInit hook ----

describe('searchPlugin — onInit hook', () => {
    it('logs initialization message', async () => {
        const { onInit } = getHooks(searchPlugin());
        const ctx = makeContext();

        await onInit(ctx);

        expect(ctx.log.info).toHaveBeenCalledTimes(1);
        expect((ctx.log.info as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toContain(
            'Search plugin initialized',
        );
    });
});

// ---- onAfterBuild hook — success ----

describe('searchPlugin — onAfterBuild hook (success)', () => {
    it('invokes pagefind via npx with correct arguments', async () => {
        const { onAfterBuild } = getHooks(searchPlugin());
        const ctx = makeContext({ outDir: '/project/dist' });

        await onAfterBuild(ctx);

        expect(execFile).toHaveBeenCalledTimes(1);

        const [cmd, args, opts] = execFileMock.mock.calls[0] as [string, string[], Record<string, unknown>];
        expect(cmd).toBe('npx');
        expect(args).toEqual(['pagefind', '--site', '/project/dist']);
        expect(opts).toEqual(expect.objectContaining({ shell: true }));
    });

    it('logs start and success messages', async () => {
        const { onAfterBuild } = getHooks(searchPlugin());
        const ctx = makeContext({ outDir: '/project/dist' });

        await onAfterBuild(ctx);

        const infoCalls = (ctx.log.info as ReturnType<typeof vi.fn>).mock.calls.map(
            (c: unknown[]) => c[0],
        );
        expect(infoCalls).toEqual(
            expect.arrayContaining([
                expect.stringContaining('Running Pagefind'),
                expect.stringContaining('Pagefind indexing completed successfully'),
            ]),
        );
    });

    it('logs stdout as debug when present', async () => {
        // stdout was set to 'Indexed 42 pages' in the mock
        const { onAfterBuild } = getHooks(searchPlugin());
        const ctx = makeContext();

        await onAfterBuild(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('Indexed 42 pages');
    });

    it('logs stderr as debug when present', async () => {
        // Override the mock to return stderr content
        execFileMock.mockImplementationOnce(
            (
                _cmd: string,
                _args: string[],
                _opts: unknown,
                cb: (err: Error | null, result: { stdout: string; stderr: string }) => void,
            ) => {
                cb(null, { stdout: '', stderr: 'Some warning output' });
            },
        );

        const { onAfterBuild } = getHooks(searchPlugin());
        const ctx = makeContext();

        await onAfterBuild(ctx);

        expect(ctx.log.debug).toHaveBeenCalledWith('Some warning output');
    });
});

// ---- onAfterBuild hook — failure ----

describe('searchPlugin — onAfterBuild hook (failure)', () => {
    it('catches errors and logs a warning instead of throwing', async () => {
        execFileMock.mockImplementationOnce(
            (
                _cmd: string,
                _args: string[],
                _opts: unknown,
                cb: (err: Error | null, result: { stdout: string; stderr: string }) => void,
            ) => {
                cb(new Error('pagefind not found'), { stdout: '', stderr: '' });
            },
        );

        const { onAfterBuild } = getHooks(searchPlugin());
        const ctx = makeContext();

        // Should not throw
        await expect(onAfterBuild(ctx)).resolves.toBeUndefined();

        const warnCall = (ctx.log.warn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(warnCall).toContain('Pagefind indexing failed');
        expect(warnCall).toContain('pagefind not found');
    });

    it('handles non-Error thrown values gracefully', async () => {
        execFileMock.mockImplementationOnce(
            (
                _cmd: string,
                _args: string[],
                _opts: unknown,
                cb: (err: unknown) => void,
            ) => {
                cb('string error');
            },
        );

        const { onAfterBuild } = getHooks(searchPlugin());
        const ctx = makeContext();

        await expect(onAfterBuild(ctx)).resolves.toBeUndefined();

        const warnCall = (ctx.log.warn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
        expect(warnCall).toContain('Pagefind indexing failed');
        expect(warnCall).toContain('string error');
    });
});

// ---- Index exports ----

describe('plugin-search barrel exports', () => {
    it('re-exports searchPlugin from index', async () => {
        const mod = await import('../index.js');
        expect(typeof mod.searchPlugin).toBe('function');
    });
});
