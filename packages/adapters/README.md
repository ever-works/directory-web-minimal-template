# @ever-works/adapters

Data source abstraction layer for the Ever Works minimal directory template. Provides a pluggable `DataAdapter` interface with two built-in implementations: filesystem and Git. The adapter pattern decouples content loading from storage backends, making it possible to swap data sources without changing any consuming code.

## What This Package Does

1. **Defines the `DataAdapter` interface** — A contract for reading files, listing directories, checking existence, refreshing, and change detection
2. **`FilesystemAdapter`** — Reads content directly from a local directory
3. **`GitAdapter`** — Clones a remote Git repository using `isomorphic-git` (shallow, single-branch) then delegates to `FilesystemAdapter`
4. **`createAdapter()` factory** — Automatically selects the right adapter based on configuration and environment variables
5. **`resolveAdapterConfig()`** — Merges explicit config with environment variable defaults

## Package Structure

```
src/
├── index.ts              — Public API barrel export
├── types.ts              — DataAdapter interface, AdapterConfig type
├── filesystem-adapter.ts — Local filesystem implementation
├── git-adapter.ts        — Git clone + filesystem delegation
└── create-adapter.ts     — Factory function + config resolution
```

## Usage

### Automatic adapter selection (recommended)

```typescript
import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';

const config = resolveAdapterConfig(); // reads env vars
const adapter = createAdapter(config);
await adapter.init(config);

const content = await adapter.readFile('.works/works.yml');
const items = await adapter.listDirectories('data');
```

### Direct filesystem adapter

```typescript
import { FilesystemAdapter } from '@ever-works/adapters';

const adapter = new FilesystemAdapter();
await adapter.init({ localPath: './.content' });
```

### Direct Git adapter

```typescript
import { GitAdapter } from '@ever-works/adapters';

const adapter = new GitAdapter();
await adapter.init({
    repository: 'https://github.com/org/content-repo.git',
    token: process.env.GH_TOKEN,
    branch: 'main',
});
```

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
    refresh(): Promise<boolean>;
    getHeadRef(): Promise<string | null>;
}
```

- `refresh()` — Pull latest changes from the remote data source. Returns `true` if content changed.
- `getHeadRef()` — Get the current HEAD reference (commit SHA or mtime hash) for cheap change detection.

All methods operate on paths **relative to the content root**. The adapter handles path resolution internally.

## Config Resolution

`resolveAdapterConfig()` checks these sources in order:

| Priority | Source | Adapter |
|----------|--------|---------|
| 1 | Explicit `localPath` in config | Filesystem |
| 2 | Explicit `repository` in config | Git |
| 3 | `CONTENT_PATH` env var | Filesystem |
| 4 | `DATA_REPOSITORY` env var | Git |
| 5 | Fallback: `.content/` directory | Filesystem |

When using `DATA_REPOSITORY`, the factory also reads `GH_TOKEN` and `GITHUB_BRANCH` (default: `main`) from environment.

## Security

- **Path traversal protection** — `FilesystemAdapter` validates that resolved paths don't escape the content root (e.g., `../../etc/passwd` is rejected)
- **Token redaction** — `GitAdapter` strips access tokens from error messages to prevent secret leakage in logs
- **Command injection prevention** — Git operations use `isomorphic-git` (pure JavaScript, no shell commands), eliminating command injection vectors entirely

## Key Design Decisions

- **Pure JS Git** — Uses `isomorphic-git` for Git operations (no `git` binary required, works in all environments)
- **Idempotent Git cloning** — Checks for `.content/.git` before cloning; safe to call `init()` multiple times
- **Shallow clone** — Uses `--depth 1 --single-branch` for minimal clone size and speed
- **Delegation pattern** — `GitAdapter` clones once, then delegates all reads to a `FilesystemAdapter` internally

## Testing

104 unit tests across 4 test files covering filesystem adapter operations, adapter factory config resolution, path traversal protection, and error handling.

```bash
pnpm --filter @ever-works/adapters test
```
