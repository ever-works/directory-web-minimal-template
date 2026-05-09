---
title: "Adapter Interface"
sidebar_label: "Adapter Interface"
---

# Adapter Interface Specification

> Defines the contract for data source adapters.

## Interface

```typescript
/**
 * Data source adapter interface.
 * Adapters abstract how content files are accessed,
 * allowing different storage backends (Git, filesystem, API, etc.).
 */
interface DataAdapter {
    /** Unique adapter identifier */
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
     * Read a single file's contents as a UTF-8 string.
     * @param relativePath - Path relative to content root (e.g., '.works/works.yml', 'data/foo/foo.yml')
     * @throws If file does not exist
     */
    readFile(relativePath: string): Promise<string>;

    /**
     * List all files (not directories) in a directory.
     * @param relativeDir - Directory relative to content root (e.g., 'data', 'comparisons')
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
     * For GitAdapter: git fetch + fast-forward merge via isomorphic-git.
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
```

## Configuration

```typescript
interface AdapterConfig {
    /** Repository URL (git adapter) or API base URL (API adapter) */
    repository?: string;

    /** Authentication token */
    token?: string;

    /** Git branch name (default: 'main') */
    branch?: string;

    /** Local filesystem path (filesystem adapter) */
    localPath?: string;

    /** Clone depth for git (default: 1 for shallow clone) */
    cloneDepth?: number;

    /** Additional adapter-specific options */
    [key: string]: unknown;
}
```

## Built-in Adapters

### GitAdapter (`@ever-works/adapters`)

Clones a Git repository using `isomorphic-git` (pure JS, no git binary required).

**Config:**
- `repository` — GitHub HTTPS URL (required)
- `token` — GitHub PAT for private repos (optional)
- `branch` — Branch name (default: `'main'`)
- `cloneDepth` — Shallow clone depth (default: `1`)

**Behavior:**
- Uses `isomorphic-git` for all git operations (clone, fetch, pull, resolveRef)
- Pure JavaScript — works in any Node.js environment including serverless
- Sets up HTTP auth header for private repos
- Skips clone if `.content/.git` already exists (idempotent)
- `refresh()` fetches + fast-forward merges from remote
- `getHeadRef()` returns current commit SHA via `resolveRef`
- Content path: `<project-root>/.content/`

### FilesystemAdapter (`@ever-works/adapters`)

Reads from a local directory. For development only.

**Config:**
- `localPath` — Absolute path to content directory (required)

**Behavior:**
- Validates path exists on `init()`
- All reads are direct filesystem operations
- No git operations

## Adapter Factory

```typescript
import { GitAdapter, FilesystemAdapter, type DataAdapter } from '@ever-works/adapters';

/**
 * Create the appropriate data adapter based on environment.
 * Priority: CONTENT_PATH (filesystem) > DATA_REPOSITORY (git)
 */
function createAdapter(): DataAdapter {
    if (process.env.CONTENT_PATH) {
        return new FilesystemAdapter();
    }
    if (process.env.DATA_REPOSITORY) {
        return new GitAdapter();
    }
    throw new Error(
        'No data source configured. Set DATA_REPOSITORY or CONTENT_PATH.'
    );
}
```

## Security

- **Path traversal protection**: All adapters must validate that `relativePath` does not escape the content root (no `..` components, no absolute paths).
- **Token handling**: Tokens are never logged or included in error messages.
- **Read-only**: Adapters are read-only at build time. No write operations.
