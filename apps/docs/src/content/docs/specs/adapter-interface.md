---
title: Adapter Interface
description: Contract for data source adapters that abstract file access for different storage backends.
---

Defines the contract for data source adapters. Adapters abstract how content files are accessed, allowing different storage backends (Git, filesystem, API, etc.).

## Interface

```typescript
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
     * Read a single file's contents as a UTF-8 string.
     * @param relativePath - Path relative to content root
     * @throws If file does not exist
     */
    readFile(relativePath: string): Promise<string>;

    /**
     * List all files in a directory.
     * @returns Array of file names only (not full paths)
     */
    listFiles(relativeDir: string): Promise<string[]>;

    /**
     * List all immediate subdirectories.
     * @returns Array of directory names only
     */
    listDirectories(relativeDir: string): Promise<string[]>;

    /**
     * Check if a file or directory exists.
     */
    exists(relativePath: string): Promise<boolean>;

    /**
     * Get the absolute filesystem path to the content root.
     */
    getContentPath(): string;
}
```

## Configuration

```typescript
interface AdapterConfig {
    /** Repository URL (git adapter) or API base URL */
    repository?: string;
    /** Authentication token */
    token?: string;
    /** Git branch name (default: 'main') */
    branch?: string;
    /** Local filesystem path (filesystem adapter) */
    localPath?: string;
    /** Additional adapter-specific options */
    [key: string]: unknown;
}
```

## Built-in Adapters

### GitAdapter

Clones a Git repository at build time using `git clone --depth 1`.

- `repository` — GitHub HTTPS URL (required)
- `token` — GitHub PAT for private repos (optional)
- `branch` — Branch name (default: `'main'`)

Skips clone if `.content/.git` already exists (idempotent).

### FilesystemAdapter

Reads from a local directory. For development.

- `localPath` — Absolute path to content directory (required)
- Validates path exists on `init()`

## Adapter Factory

```typescript
import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';

const config = resolveAdapterConfig();
const adapter = createAdapter(config);
await adapter.init(config);
```

Priority: `CONTENT_PATH` (filesystem) > `DATA_REPOSITORY` (git).

## Security

- **Path traversal protection**: All adapters validate `relativePath` doesn't escape content root.
- **Token handling**: Tokens are never logged or included in error messages.
- **Read-only**: Adapters only read at build time.
