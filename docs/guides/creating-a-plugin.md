# Guide: Creating a Plugin

> Step-by-step guide for creating a new plugin for the minimal directory template.

## Prerequisites

- Familiarity with TypeScript
- Understanding of the plugin interface (see `docs/specs/plugin-interface.md`)

## Step 1: Create the Package

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
    "types": "./src/index.ts",
    "scripts": {
        "typecheck": "tsc --noEmit"
    },
    "dependencies": {
        "@ever-works/plugins": "workspace:*"
    },
    "devDependencies": {
        "typescript": "^5.7.0"
    }
}
```

## Step 2: Define the Plugin

Create `packages/plugin-my-feature/src/index.ts`:

```typescript
import type { Plugin } from '@ever-works/plugins';

/** Options for the my-feature plugin */
interface MyFeatureOptions {
    /** Enable verbose logging */
    verbose?: boolean;
}

/**
 * My Feature Plugin
 *
 * Adds [describe what this plugin does] to the directory website.
 *
 * @example
 * ```typescript
 * // plugins.config.ts
 * import { myFeaturePlugin } from '@ever-works/plugin-my-feature';
 * export default definePlugins([
 *     myFeaturePlugin({ verbose: true }),
 * ]);
 * ```
 */
export function myFeaturePlugin(options: MyFeatureOptions = {}): Plugin {
    return {
        id: 'my-feature',
        name: 'My Feature Plugin',
        version: '0.1.0',
        description: 'Adds [feature] to the directory website.',

        hooks: {
            onInit: async (context) => {
                if (options.verbose) {
                    context.log.info('My Feature Plugin initialized');
                }
            },

            onDataLoaded: async (data, context) => {
                // Transform or enrich data here
                // MUST return the data object
                return data;
            },

            onAfterBuild: async (context) => {
                // Post-build processing here
                context.log.info('My Feature Plugin post-build complete');
            },
        },
    };
}
```

## Step 3: Register the Plugin

Add to `apps/web/src/lib/plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { myFeaturePlugin } from '@ever-works/plugin-my-feature';

export default definePlugins([
    myFeaturePlugin({ verbose: true }),
    // ... other plugins
]);
```

## Step 4: Add UI Components (Optional)

If your plugin provides UI components, create them in your package:

```
packages/plugin-my-feature/src/
├── index.ts                — Plugin factory + export components
├── components/
│   ├── MyWidget.astro      — Static Astro component
│   └── MyInteractive.tsx   — Preact interactive component
└── types.ts                — Component prop types
```

Export components alongside the plugin factory:

```typescript
// index.ts
export { myFeaturePlugin } from './plugin';
export { default as MyWidget } from './components/MyWidget.astro';
```

## Step 5: Add Dependencies (Optional)

If your plugin depends on another plugin:

```typescript
export function myFeaturePlugin(): Plugin {
    return {
        id: 'my-feature',
        name: 'My Feature Plugin',
        version: '0.1.0',
        description: '...',
        dependencies: ['search'], // Requires the search plugin
        // ...
    };
}
```

## Step 6: Test

1. Run `pnpm typecheck` to verify types
2. Run `pnpm build` to verify the plugin doesn't break the build
3. Disable the plugin and verify the site still builds

## Checklist

- [ ] Plugin has a unique `id` (lowercase, kebab-case)
- [ ] Plugin has a descriptive `description` for AI agents
- [ ] All hooks return the expected types
- [ ] `onDataLoaded` returns the modified data object
- [ ] Dependencies are declared if needed
- [ ] TypeScript strict mode passes
- [ ] JSDoc on the factory function and options interface
