---
title: Creating an Adapter
description: How to create a custom data source adapter for the minimal directory template.
---

Adapters abstract data source access. Create a custom adapter to read content from a new source.

## 1. Create the Package

```bash
mkdir -p packages/adapter-my-source/src
```

## 2. Implement the Interface

Create `src/index.ts`:

```typescript
import type { DataAdapter, AdapterConfig } from '@ever-works/adapters';

export class MySourceAdapter implements DataAdapter {
    readonly id = 'my-source';
    readonly name = 'My Source Adapter';
    private data = new Map<string, string>();

    async init(config: AdapterConfig): Promise<void> {
        // Fetch/prepare your data source
    }

    async readFile(relativePath: string): Promise<string> {
        const content = this.data.get(relativePath);
        if (!content) throw new Error(`File not found: ${relativePath}`);
        return content;
    }

    async listFiles(relativeDir: string): Promise<string[]> {
        // Return file names in the directory
        return [];
    }

    async listDirectories(relativeDir: string): Promise<string[]> {
        return [];
    }

    async exists(relativePath: string): Promise<boolean> {
        return this.data.has(relativePath);
    }

    getContentPath(): string {
        return '/virtual';
    }
}
```

## Checklist

- [ ] Implements all `DataAdapter` methods
- [ ] Path traversal protection
- [ ] Tokens/credentials never logged
- [ ] `init()` validates configuration
- [ ] TypeScript strict mode passes
