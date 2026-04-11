/**
 * Git data adapter.
 * Clones a remote Git repository and delegates read operations
 * to a FilesystemAdapter pointing at the cloned directory.
 */

import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { access, stat } from 'node:fs/promises';
import { FilesystemAdapter } from './filesystem-adapter';
import type { DataAdapter, AdapterConfig } from './types';

/** Default branch to clone when none is specified. */
const DEFAULT_BRANCH = 'main';

/** Directory name for the cloned content, relative to the working directory. */
const CONTENT_DIR = '.content';

/**
 * Data adapter that clones a Git repository and reads content from it.
 * Uses a shallow clone (`--depth 1 --single-branch`) for efficiency.
 *
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

    /**
     * Initialize the adapter by cloning the repository.
     *
     * - If `.content/.git` already exists, the clone is skipped (idempotent).
     * - Inserts `x-access-token:<token>` into HTTPS URLs when `config.token` is provided.
     * - Uses `config.branch` (default: `'main'`).
     *
     * @param config - Must include `repository`. Optionally `token` and `branch`.
     * @throws If `repository` is missing or the clone fails.
     */
    async init(config: AdapterConfig): Promise<void> {
        const repository = config.repository;
        if (!repository) {
            throw new Error('GitAdapter requires "repository" in config.');
        }

        const branch = typeof config.branch === 'string' && config.branch
            ? config.branch
            : DEFAULT_BRANCH;

        this.contentPath = resolve(CONTENT_DIR);

        const alreadyCloned = await this.isAlreadyCloned();
        if (!alreadyCloned) {
            const cloneUrl = this.buildCloneUrl(repository, config.token);
            this.cloneRepository(cloneUrl, branch);
        }

        // Delegate all read operations to a FilesystemAdapter
        this.fsAdapter = new FilesystemAdapter();
        await this.fsAdapter.init({ localPath: this.contentPath });
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
     * Build the clone URL, optionally inserting an access token for HTTPS URLs.
     *
     * Transforms `https://github.com/owner/repo.git` into
     * `https://x-access-token:<token>@github.com/owner/repo.git`.
     *
     * @param repository - The base repository URL.
     * @param token - Optional authentication token.
     * @returns The final URL to pass to `git clone`.
     */
    private buildCloneUrl(
        repository: string,
        token: string | undefined,
    ): string {
        if (!token || typeof token !== 'string') {
            return repository;
        }

        // Only inject token into HTTPS URLs
        if (!repository.startsWith('https://')) {
            return repository;
        }

        // Insert x-access-token:<token>@ after https://
        return repository.replace(
            'https://',
            `https://x-access-token:${token}@`,
        );
    }

    /**
     * Validate that a branch name contains only safe characters.
     * Prevents command injection via malicious branch names.
     */
    private static validateBranchName(branch: string): void {
        if (!/^[\w./-]+$/.test(branch)) {
            throw new Error(
                `GitAdapter: invalid branch name "${branch}". Only alphanumeric, dots, slashes, hyphens, and underscores are allowed.`,
            );
        }
    }

    /**
     * Execute the `git clone` command using execFileSync to prevent shell injection.
     * Arguments are passed as an array, never interpolated into a shell string.
     *
     * @param url - The repository URL (possibly with embedded token).
     * @param branch - The branch to clone.
     * @throws If the git command fails.
     */
    private cloneRepository(url: string, branch: string): void {
        GitAdapter.validateBranchName(branch);

        try {
            execFileSync('git', [
                'clone',
                '--depth', '1',
                '--single-branch',
                '--branch', branch,
                url,
                this.contentPath,
            ], { stdio: 'pipe' });
        } catch (error) {
            // Strip any token from the error message to avoid leaking secrets
            const safeMessage =
                error instanceof Error
                    ? error.message.replace(
                          /x-access-token:[^@]+@/g,
                          'x-access-token:***@',
                      )
                    : 'unknown error';
            throw new Error(
                `GitAdapter: failed to clone repository: ${safeMessage}`,
            );
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
}
