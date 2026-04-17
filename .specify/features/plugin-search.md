# Feature: Plugin — Search

## Description

A plugin that integrates [Pagefind](https://pagefind.app/) static search indexing into the Astro build pipeline. After Astro generates static HTML output, this plugin runs the Pagefind CLI to produce a client-side search index. The resulting index is served as static assets alongside the site, enabling instant full-text search with zero server-side infrastructure.

## User Stories

- As a **visitor**, I want to search the directory by keyword so I can quickly find items without browsing every category.
- As an **AI agent**, I want search indexing to happen automatically at build time so I don't need to configure a separate search pipeline.
- As a **developer**, I want to control which fields are indexed and which language stemmer is used so search results are relevant to my directory's content.

## Acceptance Criteria

1. Plugin runs Pagefind CLI automatically after `astro build` completes (via `onAfterBuild` hook)
2. Pagefind indexes the entire static HTML output directory (`context.outDir`)
3. Default configuration uses English stemming, indexes `name` and `description` fields, and writes the bundle to `/pagefind`
4. All three configuration options (`bundlePath`, `indexFields`, `language`) are individually overridable
5. Partial overrides merge with defaults (e.g., setting only `language` keeps default `bundlePath` and `indexFields`)
6. If Pagefind CLI fails (e.g., not installed), the plugin logs a warning but does **not** throw — the build succeeds without search
7. Pagefind stdout and stderr are logged at `debug` level (not shown unless verbose mode)
8. Plugin logs an initialization summary at `info` level during `onInit`
9. Plugin does **not** implement `onDataLoaded` or `onBeforeBuild` hooks
10. Barrel export exposes only `searchPlugin` as a runtime value (no leaking of internals)
11. TypeScript strict — no `any` types

## Package Structure

```
packages/plugin-search/
├── src/
│   ├── index.ts                      — Public API (barrel export)
│   ├── types.ts                      — SearchPluginOptions, ResolvedSearchConfig
│   ├── plugin.ts                     — Plugin factory: searchPlugin(options?) → Plugin
│   └── __tests__/
│       ├── plugin.test.ts            — Unit tests for plugin hooks and config resolution
│       └── barrel-exports.test.ts    — Tests that barrel exports are correct and minimal
├── package.json
└── tsconfig.json
```

## Dependencies

- `@ever-works/core` (peer — for ContentData types, though not directly used at runtime)
- `@ever-works/plugins` (for the `Plugin` interface)
- `node:child_process` (Node.js built-in — used to exec the Pagefind CLI)
- `node:util` (Node.js built-in — `promisify`)

Pagefind itself is **not** a direct dependency. It is invoked via `npx pagefind`, so it must be available in the project's node_modules or resolvable via npx at build time.

## Exported API

### Runtime Exports (from `@ever-works/plugin-search`)

| Export           | Kind     | Signature                                          |
|------------------|----------|-----------------------------------------------------|
| `searchPlugin`   | Function | `(options?: SearchPluginOptions) => Plugin`          |

### Type Exports

| Export                 | Kind      | Description                                              |
|------------------------|-----------|----------------------------------------------------------|
| `SearchPluginOptions`  | Interface | User-facing partial configuration (all fields optional)  |
| `ResolvedSearchConfig` | Interface | Fully-resolved configuration with defaults applied       |

## Configuration Options

### `SearchPluginOptions`

| Field         | Type       | Default                  | Description                                         |
|---------------|------------|--------------------------|-----------------------------------------------------|
| `bundlePath`  | `string`   | `'/pagefind'`            | URL path where Pagefind assets are served            |
| `indexFields` | `string[]` | `['name', 'description']`| Content fields to include in the search index        |
| `language`    | `string`   | `'en'`                   | Language code for Pagefind stemming and tokenization  |

All fields are optional. Omitted fields fall back to defaults. The `resolveConfig` internal function merges user options with `DEFAULTS` using nullish coalescing (`??`). When `indexFields` is not provided, a shallow copy of the default array is used (preventing mutation of the internal defaults).

### `ResolvedSearchConfig`

Identical shape to `SearchPluginOptions` but with all fields required. Represents the final merged configuration used at runtime.

## Hook Implementations

The plugin implements **2 of 4** available lifecycle hooks:

### `onInit(context: PluginContext): Promise<void>`

- **Purpose**: Log the resolved configuration for observability.
- **Behavior**: Calls `context.log.info()` with a summary string containing the resolved `language`, `bundlePath`, and `indexFields` values.
- **Side effects**: None (logging only).

### `onAfterBuild(context: PluginContext): Promise<void>`

- **Purpose**: Run Pagefind CLI to generate a static search index from the built HTML.
- **Behavior**:
  1. Logs `"Running Pagefind on output directory: {outDir}"` at `info` level.
  2. Executes `npx pagefind --site "{outDir}"` via `child_process.exec` (promisified).
  3. The output directory path is quoted in the command to handle paths containing spaces.
  4. On success: logs any `stderr` and `stdout` from Pagefind at `debug` level, then logs a success message at `info` level.
  5. On failure: catches the error, extracts the message (handling both `Error` instances and non-Error thrown values via `String()`), and logs a warning. **Does not re-throw** — the build completes without search rather than failing entirely.
- **Side effects**: Creates Pagefind index files inside `context.outDir`.

### Hooks NOT implemented

- `onDataLoaded` — Not needed. This plugin does not transform content data.
- `onBeforeBuild` — Not needed. This plugin only acts after static HTML exists.

## Search Index Format and Generation

### Build-time behavior

1. Astro generates static HTML into the output directory (typically `dist/`).
2. The plugin runner calls `onAfterBuild`, which triggers this plugin.
3. The plugin shells out to `npx pagefind --site "{outDir}"`.
4. Pagefind crawls all HTML files in the output directory, extracts text content, and generates:
   - A compressed search index (binary chunks)
   - A JavaScript bundle for client-side search (`pagefind.js`, `pagefind-ui.js`, etc.)
   - Metadata and fragment files for result rendering
5. All generated assets are placed inside `{outDir}/pagefind/` by default (controlled by Pagefind's own defaults, aligned with the plugin's `bundlePath` option).

### Client-side behavior

The plugin itself does **not** provide any client-side components or scripts. Client-side integration is the responsibility of the consuming application, which typically:

1. Loads the Pagefind JS bundle from the configured `bundlePath` (e.g., `/pagefind/pagefind.js`)
2. Initializes Pagefind search in the browser
3. Renders search UI (input field, results list) using Pagefind's built-in UI or a custom implementation

The `indexFields` and `language` options in this plugin are metadata for documentation and logging purposes in the current implementation. The actual indexing behavior is determined by Pagefind's own HTML crawling — Pagefind indexes based on `data-pagefind-*` attributes in the generated HTML, not based on these plugin options directly.

## Plugin Metadata

| Property      | Value                                                                         |
|---------------|-------------------------------------------------------------------------------|
| `id`          | `'search'`                                                                    |
| `name`        | `'Search Plugin'`                                                             |
| `version`     | `'0.1.0'`                                                                     |
| `description` | `'Adds static search via Pagefind. Indexes build output after Astro generates HTML.'` |
| `dependencies`| None (no plugin dependencies)                                                 |

## Integration

Register the plugin in your plugin configuration:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { searchPlugin } from '@ever-works/plugin-search';

export default definePlugins([
    searchPlugin({ indexFields: ['name', 'description', 'category'] }),
]);
```

With default options (no arguments needed):

```typescript
searchPlugin()
```

Client-side search setup (in an Astro page or component):

```html
<link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
<script src="/pagefind/pagefind-ui.js"></script>
<div id="search"></div>
<script>
    new PagefindUI({ element: "#search" });
</script>
```

## Edge Cases and Constraints

1. **Pagefind not installed**: If `npx pagefind` is not resolvable at build time, the plugin catches the error and logs a warning. The build succeeds but search is non-functional. This is intentional — search is a progressive enhancement, not a hard requirement.

2. **Paths with spaces**: The `outDir` path is wrapped in double quotes in the shell command (`--site "${outDir}"`) to handle directory names containing spaces.

3. **Non-Error thrown values**: The error handler in `onAfterBuild` handles both `Error` instances (reads `.message`) and arbitrary thrown values (converts via `String()`) to produce a meaningful warning message.

4. **No content transformation**: Unlike plugins such as `plugin-breadcrumbs` that attach computed data to `ContentData` via `onDataLoaded`, this plugin operates purely on the file system after the build. It does not modify or augment the content data pipeline.

5. **indexFields are informational**: The `indexFields` configuration is logged during `onInit` but not passed to the Pagefind CLI command. Actual field indexing is controlled by `data-pagefind-*` attributes in the HTML templates. The plugin option serves as documentation of intent and may be used in future versions to auto-generate Pagefind configuration.

6. **language is informational**: Similarly, the `language` option is logged but not passed as a CLI flag to Pagefind. Pagefind auto-detects language from the HTML `lang` attribute. This option documents the expected language and may be used for future Pagefind config file generation.

7. **Default array mutation safety**: When no `indexFields` are provided, the plugin creates a shallow copy of the default array (`[...DEFAULTS.indexFields]`) rather than sharing a reference, preventing accidental mutation of defaults across multiple plugin instances.

8. **Single execution**: The plugin assumes it runs once per build. There is no deduplication or idempotency guard — running the plugin hook multiple times would invoke Pagefind multiple times.

9. **Shell execution environment**: The plugin uses `node:child_process.exec` (not `execFile`), which runs the command through a shell. This means the command is subject to shell interpretation. The quoting of `outDir` mitigates path-related issues but does not fully sanitize against shell injection (acceptable because `outDir` comes from trusted `PluginContext`, not user input).

## Technical Notes

- The plugin factory (`searchPlugin`) is a pure function — calling it with the same options always produces an equivalent `Plugin` object.
- Config resolution happens eagerly when `searchPlugin()` is called, not lazily when hooks execute. The resolved config is captured in the closure.
- The plugin has no dependencies on other plugins (`dependencies` is not set on the returned `Plugin` object).
- Pagefind's own output path defaults to `{site}/pagefind/`, which naturally aligns with the plugin's default `bundlePath` of `'/pagefind'`.
