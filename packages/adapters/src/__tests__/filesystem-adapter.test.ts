import { mkdir, writeFile, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import { FilesystemAdapter } from '../filesystem-adapter.js';

/**
 * Module-level mock for node:fs/promises.
 * All functions default to their real implementations (passthrough).
 * Individual tests can override via mockImplementationOnce / mockRejectedValueOnce.
 */
vi.mock('node:fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:fs/promises')>();
    return {
        ...actual,
        readFile: vi.fn(actual.readFile),
        readdir: vi.fn(actual.readdir),
        stat: vi.fn(actual.stat),
        access: vi.fn(actual.access),
    };
});

/** Root temp directory for all tests in this file. */
let tempDir: string;

beforeAll(async () => {
    tempDir = join(tmpdir(), `fs-adapter-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Create test file structure:
    //   tempDir/
    //     hello.txt
    //     nested/
    //       deep.txt
    //     empty/
    //     only-files/
    //       a.txt
    //       b.txt
    await writeFile(join(tempDir, 'hello.txt'), 'Hello, world!');
    await mkdir(join(tempDir, 'nested'), { recursive: true });
    await writeFile(join(tempDir, 'nested', 'deep.txt'), 'deep content');
    await mkdir(join(tempDir, 'empty'), { recursive: true });
    await mkdir(join(tempDir, 'only-files'), { recursive: true });
    await writeFile(join(tempDir, 'only-files', 'a.txt'), 'aaa');
    await writeFile(join(tempDir, 'only-files', 'b.txt'), 'bbb');
});

afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
});

/** Helper: create an initialized adapter pointing at tempDir. */
async function createInitializedAdapter(): Promise<FilesystemAdapter> {
    const adapter = new FilesystemAdapter();
    await adapter.init({ localPath: tempDir });
    return adapter;
}

describe('FilesystemAdapter', () => {
    // ------------------------------------------------------------------
    // init
    // ------------------------------------------------------------------
    describe('init', () => {
        it('throws if localPath is missing', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.init({})).rejects.toThrow(
                'FilesystemAdapter requires "localPath" in config.',
            );
        });

        it('throws if path does not exist', async () => {
            const adapter = new FilesystemAdapter();
            await expect(
                adapter.init({ localPath: join(tempDir, 'nonexistent') }),
            ).rejects.toThrow('path does not exist');
        });

        it('throws if path is a file not a directory', async () => {
            const adapter = new FilesystemAdapter();
            await expect(
                adapter.init({ localPath: join(tempDir, 'hello.txt') }),
            ).rejects.toThrow('path is not a directory');
        });

        it('succeeds with a valid directory', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.init({ localPath: tempDir })).resolves.toBeUndefined();
        });
    });

    // ------------------------------------------------------------------
    // before init — every method should throw
    // ------------------------------------------------------------------
    describe('before init', () => {
        it('readFile throws', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.readFile('hello.txt')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('listFiles throws', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.listFiles('.')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('listDirectories throws', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.listDirectories('.')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('exists throws', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.exists('hello.txt')).rejects.toThrow(
                'adapter not initialized',
            );
        });

        it('getContentPath throws', () => {
            const adapter = new FilesystemAdapter();
            expect(() => adapter.getContentPath()).toThrow(
                'adapter not initialized',
            );
        });
    });

    // ------------------------------------------------------------------
    // readFile
    // ------------------------------------------------------------------
    describe('readFile', () => {
        it('reads file contents', async () => {
            const adapter = await createInitializedAdapter();
            const content = await adapter.readFile('hello.txt');
            expect(content).toBe('Hello, world!');
        });

        it('reads a file in a subdirectory', async () => {
            const adapter = await createInitializedAdapter();
            const content = await adapter.readFile('nested/deep.txt');
            expect(content).toBe('deep content');
        });

        it('throws on non-existent file', async () => {
            const adapter = await createInitializedAdapter();
            await expect(adapter.readFile('missing.txt')).rejects.toThrow(
                'failed to read file',
            );
        });
    });

    // ------------------------------------------------------------------
    // listFiles
    // ------------------------------------------------------------------
    describe('listFiles', () => {
        it('lists only files, not directories', async () => {
            const adapter = await createInitializedAdapter();
            const files = await adapter.listFiles('.');
            expect(files).toContain('hello.txt');
            // 'nested' and 'empty' are directories and should NOT appear
            expect(files).not.toContain('nested');
            expect(files).not.toContain('empty');
        });

        it('returns empty array for empty directory', async () => {
            const adapter = await createInitializedAdapter();
            const files = await adapter.listFiles('empty');
            expect(files).toEqual([]);
        });

        it('returns multiple files', async () => {
            const adapter = await createInitializedAdapter();
            const files = await adapter.listFiles('only-files');
            expect(files).toHaveLength(2);
            expect(files).toContain('a.txt');
            expect(files).toContain('b.txt');
        });
    });

    // ------------------------------------------------------------------
    // listDirectories
    // ------------------------------------------------------------------
    describe('listDirectories', () => {
        it('lists only directories, not files', async () => {
            const adapter = await createInitializedAdapter();
            const dirs = await adapter.listDirectories('.');
            expect(dirs).toContain('nested');
            expect(dirs).toContain('empty');
            expect(dirs).toContain('only-files');
            // 'hello.txt' is a file and should NOT appear
            expect(dirs).not.toContain('hello.txt');
        });

        it('returns empty array when no subdirectories exist', async () => {
            const adapter = await createInitializedAdapter();
            const dirs = await adapter.listDirectories('only-files');
            expect(dirs).toEqual([]);
        });
    });

    // ------------------------------------------------------------------
    // exists
    // ------------------------------------------------------------------
    describe('exists', () => {
        it('returns true for an existing file', async () => {
            const adapter = await createInitializedAdapter();
            await expect(adapter.exists('hello.txt')).resolves.toBe(true);
        });

        it('returns true for an existing directory', async () => {
            const adapter = await createInitializedAdapter();
            await expect(adapter.exists('nested')).resolves.toBe(true);
        });

        it('returns false for a non-existent path', async () => {
            const adapter = await createInitializedAdapter();
            await expect(adapter.exists('nope.txt')).resolves.toBe(false);
        });
    });

    // ------------------------------------------------------------------
    // getContentPath
    // ------------------------------------------------------------------
    describe('getContentPath', () => {
        it('returns the resolved content root path', async () => {
            const adapter = await createInitializedAdapter();
            const contentPath = adapter.getContentPath();
            expect(contentPath).toBeTruthy();
            // Should be an absolute path containing our temp dir name
            expect(contentPath).toContain('fs-adapter-test-');
        });
    });

    // ------------------------------------------------------------------
    // path traversal protection
    // ------------------------------------------------------------------
    describe('path traversal', () => {
        it('throws on ../../ paths', async () => {
            const adapter = await createInitializedAdapter();
            await expect(adapter.readFile('../../etc/passwd')).rejects.toThrow(
                'path traversal detected',
            );
        });

        it('throws on ../ at the start', async () => {
            const adapter = await createInitializedAdapter();
            await expect(adapter.exists('../something')).rejects.toThrow(
                'path traversal detected',
            );
        });
    });

    // ------------------------------------------------------------------
    // refresh
    // ------------------------------------------------------------------
    describe('refresh', () => {
        it('returns false when no files changed between calls', async () => {
            const adapter = await createInitializedAdapter();
            const changed = await adapter.refresh();
            expect(changed).toBe(false);
        });

        it('returns true when a file is modified', async () => {
            const adapter = await createInitializedAdapter();
            // First refresh to establish baseline
            await adapter.refresh();

            // Small delay to ensure mtime differs
            await new Promise((r) => setTimeout(r, 50));
            await writeFile(join(tempDir, 'hello.txt'), 'Hello, modified!');

            const changed = await adapter.refresh();
            expect(changed).toBe(true);

            // Restore original content
            await writeFile(join(tempDir, 'hello.txt'), 'Hello, world!');
        });

        it('returns true when a new file is added', async () => {
            const adapter = await createInitializedAdapter();
            await adapter.refresh();

            await new Promise((r) => setTimeout(r, 50));
            await writeFile(join(tempDir, 'new-file.txt'), 'new content');

            const changed = await adapter.refresh();
            expect(changed).toBe(true);

            // Clean up
            await unlink(join(tempDir, 'new-file.txt'));
        });

        it('returns true when a file is deleted', async () => {
            // Create a temporary file to delete
            await writeFile(join(tempDir, 'to-delete.txt'), 'delete me');
            const adapter = await createInitializedAdapter();
            await adapter.refresh();

            await new Promise((r) => setTimeout(r, 50));
            await unlink(join(tempDir, 'to-delete.txt'));

            const changed = await adapter.refresh();
            expect(changed).toBe(true);
        });

        it('throws before init', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.refresh()).rejects.toThrow(
                'adapter not initialized',
            );
        });
    });

    // ------------------------------------------------------------------
    // getHeadRef
    // ------------------------------------------------------------------
    describe('getHeadRef', () => {
        it('returns a non-null string hash', async () => {
            const adapter = await createInitializedAdapter();
            const ref = await adapter.getHeadRef();
            expect(ref).not.toBeNull();
            expect(typeof ref).toBe('string');
            expect((ref as string).length).toBeGreaterThan(0);
        });

        it('returns same hash when files have not changed', async () => {
            const adapter = await createInitializedAdapter();
            const ref1 = await adapter.getHeadRef();
            const ref2 = await adapter.getHeadRef();
            expect(ref1).toBe(ref2);
        });

        it('returns different hash after file modification', async () => {
            const adapter = await createInitializedAdapter();
            const ref1 = await adapter.getHeadRef();

            await new Promise((r) => setTimeout(r, 50));
            await writeFile(join(tempDir, 'hello.txt'), 'Hello, changed!');

            const ref2 = await adapter.getHeadRef();
            expect(ref2).not.toBe(ref1);

            // Restore original content
            await writeFile(join(tempDir, 'hello.txt'), 'Hello, world!');
        });

        it('throws before init', async () => {
            const adapter = new FilesystemAdapter();
            await expect(adapter.getHeadRef()).rejects.toThrow(
                'adapter not initialized',
            );
        });
    });

    // ------------------------------------------------------------------
    // listFiles error handling
    // ------------------------------------------------------------------
    describe('listFiles error', () => {
        it('throws wrapped error when listing a non-existent directory', async () => {
            const adapter = await createInitializedAdapter();
            await expect(
                adapter.listFiles('does-not-exist'),
            ).rejects.toThrow('failed to list files');
        });
    });

    // ------------------------------------------------------------------
    // listDirectories error handling
    // ------------------------------------------------------------------
    describe('listDirectories error', () => {
        it('throws wrapped error when listing a non-existent directory', async () => {
            const adapter = await createInitializedAdapter();
            await expect(
                adapter.listDirectories('does-not-exist'),
            ).rejects.toThrow('failed to list directories');
        });
    });

    // ------------------------------------------------------------------
    // walkDir non-ENOENT error handling
    // ------------------------------------------------------------------
    describe('walkDir error handling', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should silently ignore ENOENT when a directory disappears during walk', async () => {
            const adapter = await createInitializedAdapter();
            // Remove a directory after init — when refresh re-walks, the cached subdir is gone
            const vanishDir = join(tempDir, 'vanish-dir');
            await mkdir(vanishDir, { recursive: true });
            await writeFile(join(vanishDir, 'file.txt'), 'temp');
            // Refresh to pick up new dir in snapshot
            await adapter.refresh();
            // Now remove it — next refresh will encounter ENOENT
            await rm(vanishDir, { recursive: true, force: true });
            // Should not throw
            const changed = await adapter.refresh();
            expect(typeof changed).toBe('boolean');
        });

        it('silently returns on ENOENT thrown by readdir during walk', async () => {
            const adapter = await createInitializedAdapter();
            const { readdir: mockedReaddir } = await import('node:fs/promises');

            // Simulate an ENOENT error from readdir during the walk
            const enoentError = Object.assign(
                new Error('ENOENT: no such file or directory'),
                { code: 'ENOENT' },
            );
            vi.mocked(mockedReaddir).mockRejectedValueOnce(enoentError as never);

            // Should not throw — ENOENT is silently ignored
            const changed = await adapter.refresh();
            expect(typeof changed).toBe('boolean');
        });
    });

    // ------------------------------------------------------------------
    // Non-Error thrown values in error handlers
    // ------------------------------------------------------------------
    describe('non-Error thrown values', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('readFile wraps non-Error thrown values with String()', async () => {
            const adapter = await createInitializedAdapter();
            const { readFile: mockedReadFile } = await import('node:fs/promises');
            // Make the mocked readFile reject with a plain string (not an Error)
            vi.mocked(mockedReadFile).mockRejectedValueOnce('raw string error');
            await expect(adapter.readFile('hello.txt')).rejects.toThrow(
                'raw string error',
            );
        });

        it('listFiles wraps non-Error thrown values with String()', async () => {
            const adapter = await createInitializedAdapter();
            const { readdir: mockedReaddir } = await import('node:fs/promises');
            // Make the mocked readdir reject with a number (not an Error)
            vi.mocked(mockedReaddir).mockRejectedValueOnce(42 as never);
            await expect(adapter.listFiles('.')).rejects.toThrow(
                'failed to list files in ".": 42',
            );
        });

        it('listDirectories wraps non-Error thrown values with String()', async () => {
            const adapter = await createInitializedAdapter();
            const { readdir: mockedReaddir } = await import('node:fs/promises');
            // Make the mocked readdir reject with a plain object (not an Error)
            vi.mocked(mockedReaddir).mockRejectedValueOnce(
                { custom: 'object' } as never,
            );
            await expect(adapter.listDirectories('.')).rejects.toThrow(
                'failed to list directories in ".":',
            );
        });
    });

    // ------------------------------------------------------------------
    // walkDir skips .git and node_modules directories
    // ------------------------------------------------------------------
    describe('walkDir directory filtering', () => {
        let filterTempDir: string;

        beforeAll(async () => {
            filterTempDir = join(tmpdir(), `fs-adapter-filter-test-${Date.now()}`);
            await mkdir(filterTempDir, { recursive: true });

            // Create a regular file
            await writeFile(join(filterTempDir, 'root.txt'), 'root content');

            // Create .git directory with a file inside
            await mkdir(join(filterTempDir, '.git'), { recursive: true });
            await writeFile(join(filterTempDir, '.git', 'HEAD'), 'ref: refs/heads/main');

            // Create node_modules directory with a file inside
            await mkdir(join(filterTempDir, 'node_modules'), { recursive: true });
            await writeFile(
                join(filterTempDir, 'node_modules', 'package.json'),
                '{}',
            );

            // Create a regular subdirectory with a file
            await mkdir(join(filterTempDir, 'src'), { recursive: true });
            await writeFile(join(filterTempDir, 'src', 'index.ts'), 'export {}');
        });

        afterAll(async () => {
            await rm(filterTempDir, { recursive: true, force: true });
        });

        it('ignores .git directory during snapshot capture', async () => {
            const adapter = new FilesystemAdapter();
            await adapter.init({ localPath: filterTempDir });
            const ref1 = await adapter.getHeadRef();

            // Modify a file inside .git — should NOT change the hash
            await new Promise((r) => setTimeout(r, 50));
            await writeFile(
                join(filterTempDir, '.git', 'HEAD'),
                'ref: refs/heads/develop',
            );

            const ref2 = await adapter.getHeadRef();
            expect(ref2).toBe(ref1);

            // Restore
            await writeFile(join(filterTempDir, '.git', 'HEAD'), 'ref: refs/heads/main');
        });

        it('ignores node_modules directory during snapshot capture', async () => {
            const adapter = new FilesystemAdapter();
            await adapter.init({ localPath: filterTempDir });
            const ref1 = await adapter.getHeadRef();

            // Modify a file inside node_modules — should NOT change the hash
            await new Promise((r) => setTimeout(r, 50));
            await writeFile(
                join(filterTempDir, 'node_modules', 'package.json'),
                '{"updated": true}',
            );

            const ref2 = await adapter.getHeadRef();
            expect(ref2).toBe(ref1);

            // Restore
            await writeFile(join(filterTempDir, 'node_modules', 'package.json'), '{}');
        });

        it('still tracks files in regular subdirectories', async () => {
            const adapter = new FilesystemAdapter();
            await adapter.init({ localPath: filterTempDir });
            const ref1 = await adapter.getHeadRef();

            // Modify a file in src/ — SHOULD change the hash
            await new Promise((r) => setTimeout(r, 50));
            await writeFile(join(filterTempDir, 'src', 'index.ts'), 'export const x = 1;');

            const ref2 = await adapter.getHeadRef();
            expect(ref2).not.toBe(ref1);

            // Restore
            await writeFile(join(filterTempDir, 'src', 'index.ts'), 'export {}');
        });
    });

    // ------------------------------------------------------------------
    // walkDir re-throws non-ENOENT errors
    // ------------------------------------------------------------------
    describe('walkDir non-ENOENT error re-throw', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('re-throws non-ENOENT errors during directory walk', async () => {
            const adapter = await createInitializedAdapter();
            const { readdir: mockedReaddir } = await import('node:fs/promises');

            // After init, make the mocked readdir reject with EACCES on next call
            const eaccesError = Object.assign(new Error('permission denied'), {
                code: 'EACCES',
            });
            vi.mocked(mockedReaddir).mockRejectedValueOnce(eaccesError as never);

            await expect(adapter.refresh()).rejects.toThrow('permission denied');
        });

        it('re-throws errors that are not Error instances during walk', async () => {
            const adapter = await createInitializedAdapter();
            const { readdir: mockedReaddir } = await import('node:fs/promises');

            // Throw a non-Error, non-ENOENT value — should be re-thrown as-is
            vi.mocked(mockedReaddir).mockRejectedValueOnce(
                'unexpected failure' as never,
            );

            await expect(adapter.refresh()).rejects.toBe('unexpected failure');
        });
    });

    // ------------------------------------------------------------------
    // safePath inner branch: outer condition true, inner false
    // ------------------------------------------------------------------
    describe('safePath edge cases', () => {
        it('allows a path with trailing separator that resolves within content root', async () => {
            const adapter = await createInitializedAdapter();
            // A path with trailing slash — resolve() strips it, but the
            // relative path does not start with '..', so it should be allowed.
            const result = await adapter.exists('nested/');
            expect(result).toBe(true);
        });

        it('allows a path that normalizes to content root itself', async () => {
            const adapter = await createInitializedAdapter();
            // '.' resolves to contentPath itself
            const result = await adapter.exists('.');
            expect(result).toBe(true);
        });

        it('rejects deeply nested traversal', async () => {
            const adapter = await createInitializedAdapter();
            await expect(
                adapter.readFile('nested/../../outside'),
            ).rejects.toThrow('path traversal detected');
        });
    });
});
