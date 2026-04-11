---
title: Creating a Plugin
description: Step-by-step guide for creating a new plugin for the minimal directory template.
---

Plugins are the primary extension mechanism. This guide walks through creating a new plugin.

## 1. Create the Package

```bash
mkdir -p packages/plugin-my-feature/src
```

Create `packages/plugin-my-feature/package.json`:

```json
{
    "name": "@ever-works/plugin-my-feature",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "main": "./src/index.ts",
    "exports": { ".": "./src/index.ts" },
    "dependencies": {
        "@ever-works/plugins": "workspace:*",
        "@ever-works/core": "workspace:*"
    }
}
```

## 2. Define the Plugin

Create `src/plugin.ts`:

```typescript
import type { Plugin } from '@ever-works/plugins';

interface MyFeatureOptions {
    enabled?: boolean;
}

export function myFeaturePlugin(options: MyFeatureOptions = {}): Plugin {
    return {
        id: 'my-feature',
        name: 'My Feature Plugin',
        version: '0.1.0',
        description: 'Adds my feature to the directory site.',
        hooks: {
            async onInit(context) {
                context.log.info('My Feature plugin initialized');
            },
            async onDataLoaded(data, context) {
                // Transform data here
                return data;
            },
        },
    };
}
```

## 3. Register the Plugin

Add to `plugins.config.ts`:

```typescript
import { myFeaturePlugin } from '@ever-works/plugin-my-feature';

export const plugins = definePlugins([
    // ...existing plugins
    myFeaturePlugin({ enabled: true }),
]);
```

## Checklist

- [ ] Unique `id` (lowercase, kebab-case)
- [ ] Descriptive `description` for AI agents
- [ ] `onDataLoaded` returns modified data
- [ ] Dependencies declared
- [ ] TypeScript strict mode passes
- [ ] JSDoc on factory function
