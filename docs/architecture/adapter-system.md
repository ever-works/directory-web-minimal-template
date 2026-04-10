# Adapter System Architecture

## Overview

Adapters abstract data source access. The default adapter clones a Git repository, but the adapter pattern allows alternative sources without changing the rest of the system.

## Adapter Interface

```typescript
/**
 * Data source adapter interface.
 * Implement this to add a new data source (e.g., API, CMS, database).
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
     */
    init(config: AdapterConfig): Promise<void>;

    /**
     * Read a file's raw contents as a string.
     * @param relativePath - Path relative to content root (e.g., 'config.yml')
     */
    readFile(relativePath: string): Promise<string>;

    /**
     * List all files in a directory.
     * @param relativeDir - Directory relative to content root (e.g., 'data')
     * @returns Array of file names (not full paths)
     */
    listFiles(relativeDir: string): Promise<string[]>;

    /**
     * List all subdirectories in a directory.
     * @param relativeDir - Directory relative to content root (e.g., 'data')
     * @returns Array of directory names
     */
    listDirectories(relativeDir: string): Promise<string[]>;

    /**
     * Check if a file or directory exists.
     * @param relativePath - Path relative to content root
     */
    exists(relativePath: string): Promise<boolean>;

    /**
     * Get the absolute path to the content root.
     * Used by components that need direct filesystem access.
     */
    getContentPath(): string;
}

interface AdapterConfig {
    /** Git repository URL */
    repository?: string;
    /** Authentication token */
    token?: string;
    /** Git branch */
    branch?: string;
    /** Local filesystem path */
    localPath?: string;
}
```

## Built-in Adapters

### GitAdapter

The default adapter. Clones a Git repository at build time.

```typescript
import { GitAdapter } from '@ever-works/adapter-git';

const adapter = new GitAdapter();
await adapter.init({
    repository: process.env.DATA_REPOSITORY,
    token: process.env.GH_TOKEN,
    branch: process.env.GITHUB_BRANCH || 'main',
});
```

**Implementation details:**
- Uses `git clone --depth 1 --single-branch` for minimal clone
- Clones into `.content/` in the project root
- Skips clone if `.content/.git` already exists
- Falls back to `degit` if full git is unavailable

### FilesystemAdapter

For local development. Points to a directory on disk.

```typescript
import { FilesystemAdapter } from '@ever-works/adapter-filesystem';

const adapter = new FilesystemAdapter();
await adapter.init({
    localPath: '/path/to/content',
});
```

**Implementation details:**
- No cloning, no git operations
- Validates the path exists on init
- Ideal for development: point to a local copy of the content repo

## Adapter Selection

The adapter is selected based on environment variables in the build script:

```typescript
function createAdapter(): DataAdapter {
    if (process.env.CONTENT_PATH) {
        // Local development: use filesystem adapter
        return new FilesystemAdapter();
    }
    // Default: use git adapter
    return new GitAdapter();
}
```

## Creating a Custom Adapter

See `docs/guides/creating-an-adapter.md` for the step-by-step guide.

### Example: API Adapter (hypothetical)

```typescript
import type { DataAdapter, AdapterConfig } from '@ever-works/adapters';

export class ApiAdapter implements DataAdapter {
    readonly id = 'api';
    readonly name = 'API Adapter';
    private baseUrl = '';

    async init(config: AdapterConfig): Promise<void> {
        this.baseUrl = config.repository!; // Reuse repository field for API URL
    }

    async readFile(relativePath: string): Promise<string> {
        const res = await fetch(`${this.baseUrl}/files/${relativePath}`);
        return res.text();
    }

    async listFiles(relativeDir: string): Promise<string[]> {
        const res = await fetch(`${this.baseUrl}/list/${relativeDir}`);
        return res.json();
    }

    async listDirectories(relativeDir: string): Promise<string[]> {
        const res = await fetch(`${this.baseUrl}/dirs/${relativeDir}`);
        return res.json();
    }

    async exists(relativePath: string): Promise<boolean> {
        const res = await fetch(`${this.baseUrl}/exists/${relativePath}`);
        return res.ok;
    }

    getContentPath(): string {
        return this.baseUrl;
    }
}
```
