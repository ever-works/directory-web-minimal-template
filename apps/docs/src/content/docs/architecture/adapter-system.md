---
title: Adapter System
description: Data source adapters that abstract file access for different storage backends.
---

Adapters abstract data source access so the rest of the system doesn't need to know where content comes from.

## DataAdapter Interface

```typescript
interface DataAdapter {
    readonly id: string;
    readonly name: string;
    init(config: AdapterConfig): Promise<void>;
    readFile(relativePath: string): Promise<string>;
    listFiles(relativeDir: string): Promise<string[]>;
    listDirectories(relativeDir: string): Promise<string[]>;
    exists(relativePath: string): Promise<boolean>;
    getContentPath(): string;
}
```

## Built-in Adapters

### GitAdapter
- Default adapter for production
- Clones repository with `git clone --depth 1 --single-branch`
- Requires `DATA_REPOSITORY` environment variable

### FilesystemAdapter
- For local development
- Points to a directory on disk
- Requires `CONTENT_PATH` or defaults to `.content/`

## Creating a Custom Adapter

1. Create `packages/adapter-my-source/`
2. Implement the `DataAdapter` interface
3. Register in the adapter factory

See the [Creating an Adapter](/guides/creating-an-adapter/) guide for details.
