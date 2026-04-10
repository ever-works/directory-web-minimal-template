/**
 * Filesystem data adapter.
 * Reads content directly from a local filesystem directory.
 */

import { readFile, readdir, stat, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import type { DataAdapter, AdapterConfig } from './types.js';

/**
 * Data adapter that reads content from the local filesystem.
 * Expects `config.localPath` to point to an existing directory.
 */
export class FilesystemAdapter implements DataAdapter {
    /** @inheritdoc */
    readonly id = 'filesystem' as const;

    /** @inheritdoc */
    readonly name = 'Filesystem Adapter' as const;

    /** Resolved absolute path to the content root directory. */
    private contentPath = '';

    /**
     * Initialize the adapter by validating the local path.
     * @param config - Must include `localPath` pointing to an existing directory.
     * @throws If `localPath` is missing, does not exist, or is not a directory.
     */
    async init(config: AdapterConfig): Promise<void> {
        const localPath = config.localPath;
        if (!localPath) {
            throw new Error(
                'FilesystemAdapter requires "localPath" in config.',
            );
        }

        const resolved = resolve(localPath);

        try {
            await access(resolved);
        } catch {
            throw new Error(
                `FilesystemAdapter: path does not exist: ${resolved}`,
            );
        }

        const info = await stat(resolved);
        if (!info.isDirectory()) {
            throw new Error(
                `FilesystemAdapter: path is not a directory: ${resolved}`,
            );
        }

        this.contentPath = resolved;
    }

    /**
     * Read a file's raw contents as a UTF-8 string.
     * @param relativePath - Path relative to the content root.
     * @returns The file contents as a string.
     * @throws If the file does not exist or cannot be read.
     */
    async readFile(relativePath: string): Promise<string> {
        this.ensureInitialized();
        const fullPath = join(this.contentPath, relativePath);
        try {
            return await readFile(fullPath, 'utf-8');
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            throw new Error(
                `FilesystemAdapter: failed to read file "${relativePath}": ${message}`,
            );
        }
    }

    /**
     * List all files (not directories) in a directory.
     * @param relativeDir - Directory path relative to the content root.
     * @returns Array of file names (not full paths).
     * @throws If the directory does not exist or cannot be read.
     */
    async listFiles(relativeDir: string): Promise<string[]> {
        this.ensureInitialized();
        const fullPath = join(this.contentPath, relativeDir);

        let entries;
        try {
            entries = await readdir(fullPath, { withFileTypes: true });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            throw new Error(
                `FilesystemAdapter: failed to list files in "${relativeDir}": ${message}`,
            );
        }

        return entries
            .filter((entry) => entry.isFile())
            .map((entry) => entry.name);
    }

    /**
     * List all immediate subdirectories in a directory.
     * @param relativeDir - Directory path relative to the content root.
     * @returns Array of subdirectory names (not full paths).
     * @throws If the directory does not exist or cannot be read.
     */
    async listDirectories(relativeDir: string): Promise<string[]> {
        this.ensureInitialized();
        const fullPath = join(this.contentPath, relativeDir);

        let entries;
        try {
            entries = await readdir(fullPath, { withFileTypes: true });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            throw new Error(
                `FilesystemAdapter: failed to list directories in "${relativeDir}": ${message}`,
            );
        }

        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
    }

    /**
     * Check if a file or directory exists relative to the content root.
     * @param relativePath - Path relative to the content root.
     * @returns `true` if the path exists, `false` otherwise.
     */
    async exists(relativePath: string): Promise<boolean> {
        this.ensureInitialized();
        const fullPath = join(this.contentPath, relativePath);
        try {
            await access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get the absolute filesystem path to the content root.
     * @returns The resolved content root path.
     */
    getContentPath(): string {
        this.ensureInitialized();
        return this.contentPath;
    }

    /**
     * Guard that throws if the adapter has not been initialized.
     * @throws If `init()` has not been called.
     */
    private ensureInitialized(): void {
        if (!this.contentPath) {
            throw new Error(
                'FilesystemAdapter: adapter not initialized. Call init() first.',
            );
        }
    }
}
