# @ever-works/astro-integration

Astro integration that bridges the Ever Works plugin system into Astro's build lifecycle. This ensures plugin hooks like `onBeforeBuild` and `onAfterBuild` (e.g., Pagefind search indexing) actually execute during `astro build`.

## Why This Package Exists

The Ever Works plugin system has four lifecycle phases: `onInit`, `onDataLoaded`, `onBeforeBuild`, and `onAfterBuild`. The first two run during content loading (in the app's `content.ts`), but the build-time hooks need to fire at specific points in Astro's build pipeline. This integration bridges that gap by:

- Calling `runBeforeBuild()` during Astro's `astro:build:start` hook
- Calling `runAfterBuild()` during Astro's `astro:build:done` hook (with the correct output directory)

Without this integration, plugins like `plugin-search` (which runs Pagefind after build) would never execute their post-build hooks.

## Usage

```typescript
// astro.config.ts
import { defineConfig } from 'astro/config';
import { everWorksIntegration } from '@ever-works/astro-integration';
import { getPluginRunner, getContent } from './src/lib/content';

export default defineConfig({
    integrations: [
        everWorksIntegration({
            getRunner: () => getPluginRunner(),
            getContent: () => getContent(),
            contentPath: '.content', // optional, defaults to '.content'
        }),
    ],
});
```

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `getRunner` | `() => PluginRunner` | Yes | Returns the initialized `PluginRunner` instance. Called lazily so plugins are registered first. |
| `getContent` | `() => Promise<ContentData>` | Yes | Returns the loaded content data. Used to extract site config for plugin context. |
| `contentPath` | `string` | No | Override the content path passed to plugins. Defaults to `'.content'`. |

## How It Works

```
astro build
    │
    ├── astro:build:start  ──→  runner.runBeforeBuild(context)
    │       (before page generation)
    │
    ├── ... Astro generates static HTML ...
    │
    └── astro:build:done   ──→  runner.runAfterBuild(context)
            (after all pages are written)
            context.outDir = file URL → filesystem path
```

The `astro:build:done` hook receives the output directory as a `file://` URL. This integration converts it to a proper filesystem path using `fileURLToPath()` before passing it to plugins, ensuring cross-platform compatibility (handles spaces, Windows drive letters, etc.).

## Error Handling

Both hooks catch and log errors as warnings rather than failing the build. If a plugin's build hook throws, the build completes successfully and the error is surfaced in the console.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/plugins` | `PluginRunner` class |
| `@ever-works/core` | `ContentData` type |
| `astro` | `AstroIntegration` type (peer dependency) |

## Testing

51 unit tests across 3 test files covering hook registration, lifecycle bridging, output directory conversion, custom content paths, and error handling.

```bash
pnpm --filter @ever-works/astro-integration test
```
