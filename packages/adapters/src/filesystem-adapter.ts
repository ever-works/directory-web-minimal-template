/**
 * Filesystem data adapter.
 * Reads content directly from a local filesystem directory.
 */

import { readFile, readdir, stat, access } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import type { DataAdapter, AdapterConfig } from './types';

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

    /** Snapshot of file mtimes from last refresh/init for change detection */
    private mtimeSnapshot: Map<string, number> = new Map();

    /** Cached hash of current snapshot (recomputed on init/refresh) */
    private cachedHeadRef: string | null = null;

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
        this.mtimeSnapshot = await this.captureSnapshot();
        this.cachedHeadRef = this.computeHash(this.mtimeSnapshot);
    }

    /**
     * Read a file's raw contents as a UTF-8 string.
     * @param relativePath - Path relative to the content root.
     * @returns The file contents as a string.
     * @throws If the file does not exist or cannot be read.
     */
    async readFile(relativePath: string): Promise<string> {
        this.ensureInitialized();
        const fullPath = this.safePath(relativePath);
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
        const fullPath = this.safePath(relativeDir);

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
        const fullPath = this.safePath(relativeDir);

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
        const fullPath = this.safePath(relativePath);
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
     * Check for file changes by comparing mtimes against stored snapshot.
     * @returns true if any files changed since last snapshot
     */
    async refresh(): Promise<boolean> {
        this.ensureInitialized();
        const current = await this.captureSnapshot();

        // Compare against stored snapshot
        let changed = false;
        if (current.size !== this.mtimeSnapshot.size) {
            changed = true;
        } else {
            for (const [path, mtime] of current) {
                if (this.mtimeSnapshot.get(path) !== mtime) {
                    changed = true;
                    break;
                }
            }
        }

        this.mtimeSnapshot = current;
        this.cachedHeadRef = this.computeHash(current);
        return changed;
    }

    /**
     * Get a hash representing the current state of all files.
     * Uses file mtimes to create a lightweight fingerprint.
     * @returns Hash string, or null if not initialized
     */
    async getHeadRef(): Promise<string | null> {
        this.ensureInitialized();
        const snapshot = await this.captureSnapshot();
        return this.computeHash(snapshot);
    }

    /** Compute a hash from a snapshot map */
    private computeHash(snapshot: Map<string, number>): string {
        const entries = [...snapshot.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([path, mtime]) => `${path}:${mtime}`)
            .join('|');

        let hash = 0;
        for (let i = 0; i < entries.length; i++) {
            const char = entries.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    /**
     * Walk the content directory and capture all file mtimes.
     */
    private async captureSnapshot(): Promise<Map<string, number>> {
        const snapshot = new Map<string, number>();
        await this.walkDir(this.contentPath, snapshot);
        return snapshot;
    }

    /**
     * Recursively walk a directory and add file mtimes to the map.
     */
    private async walkDir(dir: string, snapshot: Map<string, number>): Promise<void> {
        try {
            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = resolve(dir, entry.name);
                if (entry.isFile()) {
                    const info = await stat(fullPath);
                    const relPath = relative(this.contentPath, fullPath);
                    snapshot.set(relPath, info.mtimeMs);
                } else if (entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules') {
                    await this.walkDir(fullPath, snapshot);
                }
            }
        } catch (error: unknown) {
            // Only ignore ENOENT (directory not found); re-throw real errors
            if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
                return;
            }
            throw error;
        }
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

    /**
     * Resolve a relative path within the content root and validate it doesn't escape.
     * Prevents path traversal attacks (e.g., `../../etc/passwd`).
     *
     * @param relativePath - Path relative to the content root.
     * @returns The resolved absolute path.
     * @throws If the resolved path is outside the content root.
     */
    private safePath(relativePath: string): string {
        const fullPath = resolve(this.contentPath, relativePath);
        const rel = relative(this.contentPath, fullPath);
        if (rel.startsWith('..')) {
            throw new Error(
                `FilesystemAdapter: path traversal detected in "${relativePath}". Path must stay within content root.`,
            );
        }
        return fullPath;
    }
}
