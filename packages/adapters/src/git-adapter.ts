/**
 * Git data adapter.
 * Clones a remote Git repository using isomorphic-git (pure JS, no git binary)
 * and delegates read operations to a FilesystemAdapter pointing at the cloned directory.
 */

import * as fs from 'node:fs';
import { resolve, join } from 'node:path';
import { access, stat } from 'node:fs/promises';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { FilesystemAdapter } from './filesystem-adapter';
import type { DataAdapter, AdapterConfig } from './types';

/** Directory name for the cloned content, relative to the working directory. */
const CONTENT_DIR = '.content';

/**
 * Data adapter that clones a Git repository and reads content from it.
 * Uses isomorphic-git for all Git operations — no shell `git` binary required.
 * After cloning, all file operations are delegated to a {@link FilesystemAdapter}
 * pointed at the `.content/` directory.
 */
export class GitAdapter implements DataAdapter {
    /** @inheritdoc */
    readonly id = 'git' as const;

    /** @inheritdoc */
    readonly name = 'Git Adapter' as const;

    /** Internal filesystem adapter used for read operations after clone. */
    private fsAdapter: FilesystemAdapter | null = null;

    /** Resolved absolute path to the content directory. */
    private contentPath = '';

    /** Remote repository URL. */
    private repository = '';

    /** Branch name to track. Undefined means use the remote default branch. */
    private branch: string | undefined;

    /** Optional authentication token for private repositories. */
    private token: string | undefined;

    /**
     * Initialize the adapter by cloning the repository.
     *
     * - If `.content/.git` already exists, the clone is skipped (idempotent).
     * - Authentication is handled via the `onAuth` callback (no token in URL).
     * - Uses `config.branch` when provided; otherwise clones the remote default branch.
     *
     * @param config - Must include `repository`. Optionally `token` and `branch`.
     * @throws If `repository` is missing or the clone fails.
     */
    async init(config: AdapterConfig): Promise<void> {
        const repository = config.repository;
        if (!repository) {
            throw new Error('GitAdapter requires "repository" in config.');
        }

        this.repository = repository;
        this.branch = typeof config.branch === 'string' && config.branch
            ? config.branch
            : undefined;
        this.token = config.token;
        this.contentPath = resolve(CONTENT_DIR);

        const alreadyCloned = await this.isAlreadyCloned();
        if (!alreadyCloned) {
            try {
                await git.clone({
                    fs,
                    http,
                    dir: this.contentPath,
                    url: this.repository,
                    ...(this.branch ? { ref: this.branch, singleBranch: true } : {}),
                    depth: config.cloneDepth ?? 1,
                    onAuth: () => this.getAuth(),
                });
            } catch (error) {
                const safeMessage = error instanceof Error
                    ? error.message
                    : 'unknown error';
                throw new Error(
                    `GitAdapter: failed to clone repository: ${safeMessage}`,
                );
            }
        }

        // Delegate all read operations to a FilesystemAdapter
        this.fsAdapter = new FilesystemAdapter();
        await this.fsAdapter.init({ localPath: this.contentPath });
    }

    /**
     * Pull latest changes from the remote repository.
     * Performs a fetch followed by a fast-forward merge if new commits exist.
     * @returns `true` if content changed, `false` if already up-to-date.
     */
    async refresh(): Promise<boolean> {
        this.ensureInitialized();

        const beforeRef = await this.getHeadRef();

        try {
            const fetchOptions = this.branch
                ? { ref: this.branch, singleBranch: true }
                : {};

            await git.fetch({
                fs,
                http,
                dir: this.contentPath,
                ...fetchOptions,
                onAuth: () => this.getAuth(),
            });

            // Check if remote has new commits
            const remoteRef = this.branch
                ? await git.resolveRef({
                    fs,
                    dir: this.contentPath,
                    ref: `refs/remotes/origin/${this.branch}`,
                })
                : await git.resolveRef({
                    fs,
                    dir: this.contentPath,
                    ref: 'HEAD',
                });

            if (beforeRef === remoteRef) {
                return false; // No changes
            }

            // Fast-forward to remote
            await git.fastForward({
                fs,
                http,
                dir: this.contentPath,
                ...(this.branch ? { ref: this.branch } : {}),
                onAuth: () => this.getAuth(),
            });

            return true;
        } catch (error) {
            const safeMessage = error instanceof Error
                ? error.message
                : 'unknown error';
            throw new Error(
                `GitAdapter: failed to refresh repository: ${safeMessage}`,
            );
        }
    }

    /**
     * Get the current HEAD commit SHA for cheap change detection.
     * @returns The current commit SHA string, or `null` if unavailable.
     */
    async getHeadRef(): Promise<string | null> {
        this.ensureInitialized();
        try {
            return await git.resolveRef({
                fs,
                dir: this.contentPath,
                ref: 'HEAD',
            });
        } catch {
            return null;
        }
    }

    /**
     * Read a file's raw contents as a UTF-8 string.
     * @param relativePath - Path relative to the content root.
     * @returns The file contents as a string.
     */
    async readFile(relativePath: string): Promise<string> {
        return this.getFs().readFile(relativePath);
    }

    /**
     * List all files (not directories) in a directory.
     * @param relativeDir - Directory relative to the content root.
     * @returns Array of file names.
     */
    async listFiles(relativeDir: string): Promise<string[]> {
        return this.getFs().listFiles(relativeDir);
    }

    /**
     * List all immediate subdirectories in a directory.
     * @param relativeDir - Directory relative to the content root.
     * @returns Array of subdirectory names.
     */
    async listDirectories(relativeDir: string): Promise<string[]> {
        return this.getFs().listDirectories(relativeDir);
    }

    /**
     * Check if a file or directory exists relative to the content root.
     * @param relativePath - Path relative to the content root.
     * @returns `true` if the path exists.
     */
    async exists(relativePath: string): Promise<boolean> {
        return this.getFs().exists(relativePath);
    }

    /**
     * Get the absolute filesystem path to the cloned content directory.
     * @returns The resolved `.content/` path.
     */
    getContentPath(): string {
        return this.contentPath;
    }

    /**
     * Check whether the content directory already contains a `.git` folder,
     * indicating a prior clone.
     */
    private async isAlreadyCloned(): Promise<boolean> {
        const gitDir = join(this.contentPath, '.git');
        try {
            await access(gitDir);
            const info = await stat(gitDir);
            return info.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * Build the authentication object for isomorphic-git's `onAuth` callback.
     * Uses the `x-access-token` username convention for token-based HTTPS auth.
     * @returns Auth credentials if a token is configured, otherwise `undefined`.
     */
    private getAuth(): { username: string; password?: string } | void {
        if (this.token) {
            return { username: 'x-access-token', password: this.token };
        }
    }

    /**
     * Get the internal filesystem adapter, throwing if not initialized.
     * @returns The initialized FilesystemAdapter.
     * @throws If `init()` has not been called.
     */
    private getFs(): FilesystemAdapter {
        if (!this.fsAdapter) {
            throw new Error(
                'GitAdapter: adapter not initialized. Call init() first.',
            );
        }
        return this.fsAdapter;
    }

    /**
     * Guard that throws if the adapter has not been initialized.
     * @throws If `init()` has not been called.
     */
    private ensureInitialized(): void {
        if (!this.fsAdapter) {
            throw new Error(
                'GitAdapter: adapter not initialized. Call init() first.',
            );
        }
    }
}
