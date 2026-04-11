/**
 * Data adapter interface.
 * Adapters abstract how content files are accessed,
 * allowing different storage backends (Git, filesystem, API, etc.).
 *
 * See docs/specs/adapter-interface.md for the full specification.
 */

/**
 * Data source adapter interface.
 * Implement this to add a new data source.
 */
export interface DataAdapter {
    /** Unique adapter identifier (e.g., 'git', 'filesystem') */
    readonly id: string;

    /** Human-readable name */
    readonly name: string;

    /**
     * Initialize the data source.
     * For GitAdapter: clones the repository.
     * For FilesystemAdapter: validates the path exists.
     * Called once before any read operations.
     */
    init(config: AdapterConfig): Promise<void>;

    /**
     * Read a file's raw contents as a UTF-8 string.
     * @param relativePath - Path relative to content root (e.g., 'config.yml')
     * @throws If file does not exist or path is invalid
     */
    readFile(relativePath: string): Promise<string>;

    /**
     * List all files (not directories) in a directory.
     * @param relativeDir - Directory relative to content root (e.g., 'data')
     * @returns Array of file names only (not full paths)
     */
    listFiles(relativeDir: string): Promise<string[]>;

    /**
     * List all immediate subdirectories in a directory.
     * @param relativeDir - Directory relative to content root
     * @returns Array of directory names only
     */
    listDirectories(relativeDir: string): Promise<string[]>;

    /**
     * Check if a file or directory exists.
     * @param relativePath - Path relative to content root
     */
    exists(relativePath: string): Promise<boolean>;

    /**
     * Get the absolute filesystem path to the content root.
     * Used when tools need direct filesystem access (e.g., Pagefind indexing).
     */
    getContentPath(): string;

    /**
     * Pull latest changes from the remote data source.
     * For GitAdapter: git fetch + fast-forward merge.
     * For FilesystemAdapter: checks file mtimes for changes.
     * @returns `true` if content changed, `false` if already up-to-date
     */
    refresh(): Promise<boolean>;

    /**
     * Get the current HEAD reference for cheap change detection.
     * For GitAdapter: returns the current commit SHA.
     * For FilesystemAdapter: returns a hash of file mtimes.
     * @returns Reference string, or null if unavailable
     */
    getHeadRef(): Promise<string | null>;
}

/** Configuration for data adapters */
export interface AdapterConfig {
    /** Repository URL (for git adapter) or API base URL */
    repository?: string;

    /** Authentication token (for private repos) */
    token?: string;

    /** Git branch name (default: 'main') */
    branch?: string;

    /** Local filesystem path (for filesystem adapter) */
    localPath?: string;

    /** Clone depth for git (default: 1 for shallow clone) */
    cloneDepth?: number;

    /** Additional adapter-specific options */
    [key: string]: unknown;
}
