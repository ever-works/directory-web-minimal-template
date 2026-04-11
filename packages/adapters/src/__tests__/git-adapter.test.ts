import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitAdapter } from '../git-adapter.js';

// ---------------------------------------------------------------------------
// Mock isomorphic-git
// ---------------------------------------------------------------------------
vi.mock('isomorphic-git', () => ({
    clone: vi.fn(),
    fetch: vi.fn(),
    resolveRef: vi.fn(),
    fastForward: vi.fn(),
}));

// Mock isomorphic-git/http/node — used as the `http` transport
vi.mock('isomorphic-git/http/node', () => ({
    default: { request: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Mock the FilesystemAdapter that GitAdapter instantiates internally.
// This prevents init() from hitting the real filesystem after clone.
// ---------------------------------------------------------------------------
const mockFsInit = vi.fn();
const mockFsReadFile = vi.fn();
const mockFsListFiles = vi.fn();
const mockFsListDirectories = vi.fn();
const mockFsExists = vi.fn();
const mockFsGetContentPath = vi.fn().mockReturnValue('/mock/.content');

vi.mock('../filesystem-adapter.js', () => {
    return {
        FilesystemAdapter: class MockFilesystemAdapter {
            id = 'filesystem';
            name = 'Filesystem Adapter';
            init = mockFsInit;
            readFile = mockFsReadFile;
            listFiles = mockFsListFiles;
            listDirectories = mockFsListDirectories;
            exists = mockFsExists;
            getContentPath = mockFsGetContentPath;
            refresh = vi.fn().mockResolvedValue(false);
            getHeadRef = vi.fn().mockResolvedValue(null);
        },
    };
});

// ---------------------------------------------------------------------------
// Mock node:fs/promises — used for isAlreadyCloned check
// ---------------------------------------------------------------------------
vi.mock('node:fs/promises', () => ({
    access: vi.fn(),
    stat: vi.fn(),
}));

import * as git from 'isomorphic-git';
import { access, stat } from 'node:fs/promises';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Set up the mocks so isAlreadyCloned returns true (skip clone).
 * This is the most common setup for tests that need an initialized adapter.
 */
function setupAlreadyCloned(): void {
    vi.mocked(access).mockResolvedValue(undefined);
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => true } as any);
}

/**
 * Set up the mocks so isAlreadyCloned returns false (needs clone).
 */
function setupNotCloned(): void {
    vi.mocked(access).mockRejectedValue(new Error('ENOENT'));
}

/** Helper to initialize a GitAdapter with the clone step skipped. */
async function createInitializedAdapter(config?: {
    repository?: string;
    branch?: string;
    token?: string;
}): Promise<GitAdapter> {
    const adapter = new GitAdapter();
    setupAlreadyCloned();
    mockFsInit.mockResolvedValue(undefined);

    await adapter.init({
        repository: config?.repository ?? 'https://github.com/test/repo',
        branch: config?.branch,
        token: config?.token,
    });

    return adapter;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GitAdapter', () => {
    beforeEach(() => {
        // Reset call history on all mocks without clearing implementations
        vi.mocked(git.clone).mockReset();
        vi.mocked(git.fetch).mockReset();
        vi.mocked(git.resolveRef).mockReset();
        vi.mocked(git.fastForward).mockReset();
        vi.mocked(access).mockReset();
        vi.mocked(stat).mockReset();
        mockFsInit.mockReset().mockResolvedValue(undefined);
        mockFsReadFile.mockReset();
        mockFsListFiles.mockReset();
        mockFsListDirectories.mockReset();
        mockFsExists.mockReset();
        mockFsGetContentPath.mockReset().mockReturnValue('/mock/.content');
    });

    // ------------------------------------------------------------------
    // static properties
    // ------------------------------------------------------------------
    describe('static properties', () => {
        it('has id "git"', () => {
            const adapter = new GitAdapter();
            expect(adapter.id).toBe('git');
        });

        it('has name "Git Adapter"', () => {
            const adapter = new GitAdapter();
            expect(adapter.name).toBe('Git Adapter');
        });
    });

    // ------------------------------------------------------------------
    // init
    // ------------------------------------------------------------------
    describe('init', () => {
        it('throws if repository is missing', async () => {
            const adapter = new GitAdapter();
            await expect(adapter.init({})).rejects.toThrow(
                'GitAdapter requires "repository" in config.',
            );
        });

        it('clones when .content/.git does not exist', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockResolvedValue(undefined as any);

            await adapter.init({
                repository: 'https://github.com/test/repo',
                branch: 'develop',
            });

            expect(git.clone).toHaveBeenCalledOnce();
            expect(git.clone).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'https://github.com/test/repo',
                    ref: 'develop',
                    singleBranch: true,
                    depth: 1,
                }),
            );
        });

        it('skips clone when .content/.git already exists', async () => {
            const adapter = new GitAdapter();
            setupAlreadyCloned();

            await adapter.init({
                repository: 'https://github.com/test/repo',
            });

            expect(git.clone).not.toHaveBeenCalled();
        });

        it('defaults to "main" branch when none specified', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockResolvedValue(undefined as any);

            await adapter.init({
                repository: 'https://github.com/test/repo',
            });

            expect(git.clone).toHaveBeenCalledWith(
                expect.objectContaining({
                    ref: 'main',
                }),
            );
        });

        it('uses configured cloneDepth', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockResolvedValue(undefined as any);

            await adapter.init({
                repository: 'https://github.com/test/repo',
                cloneDepth: 10,
            });

            expect(git.clone).toHaveBeenCalledWith(
                expect.objectContaining({
                    depth: 10,
                }),
            );
        });

        it('defaults cloneDepth to 1 when not provided', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockResolvedValue(undefined as any);

            await adapter.init({
                repository: 'https://github.com/test/repo',
            });

            expect(git.clone).toHaveBeenCalledWith(
                expect.objectContaining({
                    depth: 1,
                }),
            );
        });

        it('wraps clone errors with a descriptive message', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockRejectedValue(new Error('Authentication failed'));

            await expect(
                adapter.init({ repository: 'https://github.com/test/repo' }),
            ).rejects.toThrow('GitAdapter: failed to clone repository: Authentication failed');
        });

        it('wraps non-Error clone failures as "unknown error"', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockRejectedValue('some string error');

            await expect(
                adapter.init({ repository: 'https://github.com/test/repo' }),
            ).rejects.toThrow('GitAdapter: failed to clone repository: unknown error');
        });

        it('initializes the internal FilesystemAdapter after clone', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockResolvedValue(undefined as any);

            await adapter.init({
                repository: 'https://github.com/test/repo',
            });

            expect(mockFsInit).toHaveBeenCalledOnce();
            expect(mockFsInit).toHaveBeenCalledWith(
                expect.objectContaining({
                    localPath: expect.stringContaining('.content'),
                }),
            );
        });

        it('uses token-based auth when token is provided', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();

            let capturedOnAuth: (() => any) | undefined;
            vi.mocked(git.clone).mockImplementation(async (opts: any) => {
                capturedOnAuth = opts.onAuth;
            });

            await adapter.init({
                repository: 'https://github.com/test/repo',
                token: 'my-secret-token',
            });

            expect(capturedOnAuth).toBeDefined();
            const auth = capturedOnAuth!();
            expect(auth).toEqual({
                username: 'x-access-token',
                password: 'my-secret-token',
            });
        });

        it('returns undefined auth when no token is provided', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();

            let capturedOnAuth: (() => any) | undefined;
            vi.mocked(git.clone).mockImplementation(async (opts: any) => {
                capturedOnAuth = opts.onAuth;
            });

            await adapter.init({
                repository: 'https://github.com/test/repo',
            });

            expect(capturedOnAuth).toBeDefined();
            const auth = capturedOnAuth!();
            expect(auth).toBeUndefined();
        });

        it('uses empty string branch fallback when branch is empty string', async () => {
            const adapter = new GitAdapter();
            setupNotCloned();
            vi.mocked(git.clone).mockResolvedValue(undefined as any);

            await adapter.init({
                repository: 'https://github.com/test/repo',
                branch: '',
            });

            // empty string should fall back to 'main'
            expect(git.clone).toHaveBeenCalledWith(
                expect.objectContaining({
                    ref: 'main',
                }),
            );
        });
    });

    // ------------------------------------------------------------------
    // before init — methods should throw
    // ------------------------------------------------------------------
    describe('before init', () => {
        it('readFile throws', async () => {
            const adapter = new GitAdapter();
            await expect(adapter.readFile('test.txt')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('listFiles throws', async () => {
            const adapter = new GitAdapter();
            await expect(adapter.listFiles('.')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('listDirectories throws', async () => {
            const adapter = new GitAdapter();
            await expect(adapter.listDirectories('.')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('exists throws', async () => {
            const adapter = new GitAdapter();
            await expect(adapter.exists('test.txt')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('refresh throws', async () => {
            const adapter = new GitAdapter();
            await expect(adapter.refresh()).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('getHeadRef throws', async () => {
            const adapter = new GitAdapter();
            await expect(adapter.getHeadRef()).rejects.toThrow(
                'adapter not initialized',
            );
        });
    });

    // ------------------------------------------------------------------
    // delegation to FilesystemAdapter
    // ------------------------------------------------------------------
    describe('delegation to FilesystemAdapter', () => {
        it('readFile delegates to internal filesystem adapter', async () => {
            const adapter = await createInitializedAdapter();
            mockFsReadFile.mockResolvedValue('file contents');

            const result = await adapter.readFile('some/path.txt');

            expect(result).toBe('file contents');
            expect(mockFsReadFile).toHaveBeenCalledWith('some/path.txt');
        });

        it('listFiles delegates to internal filesystem adapter', async () => {
            const adapter = await createInitializedAdapter();
            mockFsListFiles.mockResolvedValue(['a.txt', 'b.txt']);

            const result = await adapter.listFiles('data');

            expect(result).toEqual(['a.txt', 'b.txt']);
            expect(mockFsListFiles).toHaveBeenCalledWith('data');
        });

        it('listDirectories delegates to internal filesystem adapter', async () => {
            const adapter = await createInitializedAdapter();
            mockFsListDirectories.mockResolvedValue(['sub1', 'sub2']);

            const result = await adapter.listDirectories('.');

            expect(result).toEqual(['sub1', 'sub2']);
            expect(mockFsListDirectories).toHaveBeenCalledWith('.');
        });

        it('exists delegates to internal filesystem adapter', async () => {
            const adapter = await createInitializedAdapter();
            mockFsExists.mockResolvedValue(true);

            const result = await adapter.exists('config.yml');

            expect(result).toBe(true);
            expect(mockFsExists).toHaveBeenCalledWith('config.yml');
        });
    });

    // ------------------------------------------------------------------
    // getContentPath
    // ------------------------------------------------------------------
    describe('getContentPath', () => {
        it('returns the resolved .content path', async () => {
            const adapter = await createInitializedAdapter();
            const path = adapter.getContentPath();
            expect(path).toBeTruthy();
            expect(path).toContain('.content');
        });
    });

    // ------------------------------------------------------------------
    // getHeadRef
    // ------------------------------------------------------------------
    describe('getHeadRef', () => {
        it('returns the current HEAD commit SHA', async () => {
            const adapter = await createInitializedAdapter();

            vi.mocked(git.resolveRef).mockResolvedValue('abc123def456');

            const ref = await adapter.getHeadRef();
            expect(ref).toBe('abc123def456');
            expect(git.resolveRef).toHaveBeenCalledWith(
                expect.objectContaining({ ref: 'HEAD' }),
            );
        });

        it('returns null if resolveRef fails', async () => {
            const adapter = await createInitializedAdapter();

            vi.mocked(git.resolveRef).mockRejectedValue(new Error('No HEAD'));

            const ref = await adapter.getHeadRef();
            expect(ref).toBeNull();
        });
    });

    // ------------------------------------------------------------------
    // refresh
    // ------------------------------------------------------------------
    describe('refresh', () => {
        it('returns false when remote has no new commits', async () => {
            const adapter = await createInitializedAdapter();

            // getHeadRef returns same SHA as remote
            vi.mocked(git.resolveRef).mockResolvedValue('same-sha');
            vi.mocked(git.fetch).mockResolvedValue(undefined as any);

            const changed = await adapter.refresh();
            expect(changed).toBe(false);
            expect(git.fastForward).not.toHaveBeenCalled();
        });

        it('returns true and fast-forwards when remote has new commits', async () => {
            const adapter = await createInitializedAdapter();

            // First call (HEAD) returns old sha, second call (remote ref) returns new sha
            vi.mocked(git.resolveRef)
                .mockResolvedValueOnce('old-sha')  // HEAD
                .mockResolvedValueOnce('new-sha'); // remote ref
            vi.mocked(git.fetch).mockResolvedValue(undefined as any);
            vi.mocked(git.fastForward).mockResolvedValue(undefined as any);

            const changed = await adapter.refresh();
            expect(changed).toBe(true);
            expect(git.fastForward).toHaveBeenCalledOnce();
        });

        it('wraps fetch errors with a descriptive message', async () => {
            const adapter = await createInitializedAdapter();

            vi.mocked(git.resolveRef).mockResolvedValue('sha');
            vi.mocked(git.fetch).mockRejectedValue(new Error('Network error'));

            await expect(adapter.refresh()).rejects.toThrow(
                'GitAdapter: failed to refresh repository: Network error',
            );
        });

        it('wraps non-Error refresh failures as "unknown error"', async () => {
            const adapter = await createInitializedAdapter();

            vi.mocked(git.resolveRef).mockResolvedValue('sha');
            vi.mocked(git.fetch).mockRejectedValue('string error');

            await expect(adapter.refresh()).rejects.toThrow(
                'GitAdapter: failed to refresh repository: unknown error',
            );
        });

        it('uses token auth during fetch', async () => {
            const adapter = await createInitializedAdapter({ token: 'refresh-token' });

            let capturedOnAuth: (() => any) | undefined;
            vi.mocked(git.resolveRef).mockResolvedValue('same-sha');
            vi.mocked(git.fetch).mockImplementation(async (opts: any) => {
                capturedOnAuth = opts.onAuth;
            });

            await adapter.refresh();

            expect(capturedOnAuth).toBeDefined();
            const auth = capturedOnAuth!();
            expect(auth).toEqual({
                username: 'x-access-token',
                password: 'refresh-token',
            });
        });
    });
});
