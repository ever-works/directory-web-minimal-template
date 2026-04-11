---
title: "Creating an Adapter"
sidebar_label: "Creating an Adapter"
---

# Guide: Creating a Data Adapter

> Step-by-step guide for creating a custom data source adapter.

## Prerequisites

- Understanding of the adapter interface (see `docs/specs/adapter-interface.md`)
- The data source you want to connect to

## Step 1: Create the Package

```bash
mkdir -p packages/adapter-my-source/src
```

Create `packages/adapter-my-source/package.json`:

```json
{
    "name": "@ever-works/adapter-my-source",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "scripts": {
        "typecheck": "tsc --noEmit"
    },
    "dependencies": {
        "@ever-works/adapters": "workspace:*"
    },
    "devDependencies": {
        "typescript": "^5.7.0"
    }
}
```

## Step 2: Implement the Adapter Interface

Create `packages/adapter-my-source/src/index.ts`:

```typescript
import type { DataAdapter, AdapterConfig } from '@ever-works/adapters';

/**
 * My Source Adapter
 *
 * Reads content from [describe source].
 */
export class MySourceAdapter implements DataAdapter {
    readonly id = 'my-source';
    readonly name = 'My Source Adapter';

    private basePath = '';

    async init(config: AdapterConfig): Promise<void> {
        // Initialize your data source connection
        // Validate config, set up credentials, etc.
        this.basePath = config.localPath || '';
    }

    async readFile(relativePath: string): Promise<string> {
        // Validate path (no traversal)
        this.validatePath(relativePath);
        // Read and return file contents
        throw new Error('Not implemented');
    }

    async listFiles(relativeDir: string): Promise<string[]> {
        this.validatePath(relativeDir);
        // Return array of file names in the directory
        throw new Error('Not implemented');
    }

    async listDirectories(relativeDir: string): Promise<string[]> {
        this.validatePath(relativeDir);
        // Return array of subdirectory names
        throw new Error('Not implemented');
    }

    async exists(relativePath: string): Promise<boolean> {
        this.validatePath(relativePath);
        // Check if path exists
        throw new Error('Not implemented');
    }

    getContentPath(): string {
        return this.basePath;
    }

    /** Prevent path traversal attacks */
    private validatePath(path: string): void {
        if (path.includes('..') || path.startsWith('/')) {
            throw new Error(`Invalid path: ${path}`);
        }
    }
}
```

## Step 3: Register the Adapter

Update the adapter factory to include your adapter:

```typescript
// In your app's data loading code
import { MySourceAdapter } from '@ever-works/adapter-my-source';

function createAdapter(): DataAdapter {
    if (process.env.MY_SOURCE_URL) {
        return new MySourceAdapter();
    }
    // ... fallback to other adapters
}
```

## Checklist

- [ ] Implements all `DataAdapter` methods
- [ ] Path traversal protection in all read methods
- [ ] Tokens/credentials never logged
- [ ] `init()` validates configuration
- [ ] `readFile()` throws on missing files
- [ ] `listFiles()` returns file names only (not paths)
- [ ] TypeScript strict mode passes
