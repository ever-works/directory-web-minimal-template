import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FilesystemAdapter } from '../filesystem-adapter.js';

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
});
