# Feature: Content Synchronization, Caching & Incremental Static Regeneration

## Description

Adds content change detection, caching, webhook support, polling, and ISR to the minimal template. Enables the template to detect when the upstream data repository (Git) or local filesystem changes, and efficiently regenerate only the affected pages instead of requiring a full rebuild.

The system operates in two modes:

1. **ISR (default)** — Astro hybrid mode with `@astrojs/vercel` adapter. Content is cached with TTL, refreshed on demand via webhooks or polling, and pages are regenerated incrementally.
2. **Static (opt-out)** — Pure static output with `ENABLE_ISR=false`. Content is loaded once at build time. Changes trigger a full Vercel rebuild via deploy hooks.

All sync logic lives in `packages/`, not in `apps/`.

## User Stories

- As an **Astro page**, I want to serve fresh content without a full rebuild so that content updates are visible within minutes.
- As a **content editor**, I want to push changes to the data repository and have them appear on the site automatically.
- As a **site operator**, I want to configure a GitHub webhook so that content changes trigger page regeneration.
- As a **site operator**, I want to optionally enable polling so the site checks for changes on a schedule.
- As a **developer**, I want a content cache with configurable TTL so redundant I/O is avoided during ISR page rendering.
- As a **developer**, I want to opt out of ISR and use pure static mode when I don't need on-demand regeneration.
- As a **static-mode user**, I want webhook pushes to trigger a Vercel deploy hook so my site rebuilds automatically.

## Non-Goals

- No real-time WebSocket push to browsers
- No conflict resolution or merge handling (read-only data)
- No multi-repo sync

## Acceptance Criteria

1. `ENABLE_ISR=true` (default) produces `output: 'hybrid'` with `@astrojs/vercel` adapter
2. `ENABLE_ISR=false` produces `output: 'static'` with no adapter
3. `DataAdapter.refresh()` is required and returns `true` if content changed
4. `DataAdapter.getHeadRef()` returns the current HEAD reference (commit SHA or mtime hash)
5. `ContentCache` deduplicates concurrent `get()` calls (single inflight Promise)
6. `ContentCache` with `ttlMs: 0` loads once and caches forever (static mode backward compat)
7. `ContentCache` with `ttlMs > 0` checks staleness on each `get()` and reloads if expired
8. `SyncManager.sync()` calls `adapter.refresh()` and invalidates the cache on changes
9. `SyncManager.startPolling()` / `stopPolling()` runs sync on a configurable interval
10. `WebhookHandler.validateSignature()` verifies HMAC-SHA256 signatures
11. `WebhookHandler.parseGitHubPush()` extracts branch and commit count from GitHub payloads
12. `DeployHookTrigger.trigger()` sends a POST to the Vercel deploy hook URL
13. The `/api/webhook` endpoint validates the signature, runs sync, and returns appropriate status codes
14. All environment variables have sensible defaults and are documented
15. GitAdapter uses `isomorphic-git` instead of shell `execFileSync` for all git operations

## Technical Design

### Operating Modes

| | ISR (default) | Static (`ENABLE_ISR=false`) |
|---|---|---|
| Output | `output: 'hybrid'` + `@astrojs/vercel` | `output: 'static'` |
| Content loading | Cached with TTL, refreshed on demand | Once at build time |
| Change detection | `adapter.refresh()` + polling/webhooks | N/A (full rebuild) |
| Webhook action | Invalidates cache, ISR regenerates pages | Triggers Vercel Deploy Hook |

### Data Flow

**ISR Mode (default)**:
```
Content repo push → GitHub webhook → /api/webhook
    → WebhookHandler validates signature
    → SyncManager.sync() calls adapter.refresh()
    → ContentCache.invalidate()
    → Next request triggers ISR page regeneration
```

**Polling (optional)**:
```
SyncManager.startPolling() every N ms
    → adapter.refresh() checks for changes
    → If changed: ContentCache.invalidate()
    → ISR regenerates pages on next request
```

**Static Mode**:
```
Content repo push → GitHub webhook → /api/webhook (or GitHub Action)
    → DeployHookTrigger.trigger(vercelHookUrl)
    → Vercel rebuilds entire site
```

## Package: `@ever-works/adapters` — DataAdapter interface changes

`refresh()` is now REQUIRED on `DataAdapter` (not optional):

```typescript
interface DataAdapter {
    // existing methods...

    /** Pull latest changes. Returns true if content changed. */
    refresh(): Promise<boolean>;

    /** Get HEAD ref (commit SHA for git, mtime hash for filesystem). */
    getHeadRef(): Promise<string | null>;
}
```

**GitAdapter implementation** (using `isomorphic-git`):
- `init()`: Uses `isomorphic-git` `git.clone()` instead of shell `execFileSync`
- `refresh()`: `git.fetch()` + compare remote vs local HEAD + `git.fastForward()` if different
- `getHeadRef()`: `git.resolveRef({ ref: 'HEAD' })`
- Auth: Uses `onAuth` callback for token-based auth

**FilesystemAdapter implementation**:
- `refresh()`: Scans directory for mtime changes vs stored snapshot, returns `true` if any changed
- `getHeadRef()`: Returns hash of all file mtimes (lightweight fingerprint)

**New config field**: `cloneDepth?: number` (default: `1`)

## Package: `@ever-works/core` — ContentCache

New class `ContentCache`:

```typescript
interface ContentCacheConfig {
    ttlMs: number;           // 0 = forever, >0 = TTL in ms
    onInvalidate?: () => void;
}

class ContentCache {
    get(loader: () => Promise<ContentData>): Promise<ContentData>;
    invalidate(): void;
    isValid(): boolean;
    getStatus(): CacheStatus;
}
```

Behaviors:
- Deduplicates concurrent `get()` calls (single inflight Promise)
- `ttlMs: 0` = load once, cache forever (backward compat for static mode)
- `ttlMs > 0` = check staleness on each `get()`, reload if expired

## Package: `@ever-works/sync` — NEW package

```typescript
interface SyncConfig {
    pollIntervalMs: number;      // 0 = disabled
    syncTimeoutMs: number;       // default: 60000
    maxRetries: number;          // default: 3
    webhookSecret?: string;      // HMAC-SHA256 secret
    deployHookUrl?: string;      // Vercel deploy hook URL
    cacheTtlMs: number;          // default: 300000 (5 min)
}

class SyncManager {
    constructor(adapter: DataAdapter, config: SyncConfig);
    sync(): Promise<SyncResult>;
    startPolling(): void;
    stopPolling(): void;
    on(listener: SyncEventListener): () => void;
    getStatus(): SyncStatus;
    destroy(): void;
}

class WebhookHandler {
    validateSignature(rawBody: string, signature: string, secret: string): boolean;
    static parseGitHubPush(body: unknown): { branch: string; commits: number } | null;
    isRelevantPush(branch: string, targetBranch: string): boolean;
}

class DeployHookTrigger {
    static async trigger(hookUrl: string): Promise<{ success: boolean; message: string }>;
}

function resolveSyncConfig(overrides?: Partial<SyncConfig>): SyncConfig;
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ENABLE_ISR` | `true` | Enable ISR mode with hybrid output |
| `SYNC_POLL_INTERVAL_MS` | `0` (disabled) | Polling interval in milliseconds |
| `SYNC_TIMEOUT_MS` | `60000` | Timeout for a single sync operation |
| `SYNC_MAX_RETRIES` | `3` | Max retry attempts for failed syncs |
| `WEBHOOK_SECRET` | — | HMAC-SHA256 secret for webhook validation |
| `VERCEL_DEPLOY_HOOK_URL` | — | Vercel deploy hook URL (static mode) |
| `CONTENT_CACHE_TTL_MS` | `300000` (5 min) | Content cache TTL |

## Package: `@ever-works/astro-integration` — Webhook endpoint + ISR config

Extended integration options:

```typescript
interface EverWorksIntegrationOptions {
    // existing...
    sync?: {
        isr?: boolean;
        revalidateSeconds?: number;
        webhook?: boolean;
        webhookSecret?: string;
    };
}
```

New files:
- `webhook-endpoint.ts` — Astro API route handler for `/api/webhook`
- `sync-registry.ts` — Module-level singleton registry for `SyncManager` / `ContentCache`

## Testing

Unit tests for:
- **ContentCache**: TTL expiry, invalidation, concurrent deduplication, zero-TTL mode
- **SyncManager**: sync flow, polling start/stop, timeout handling, retry logic, event emission
- **WebhookHandler**: HMAC-SHA256 validation (valid/invalid/missing), payload parsing, branch matching
- **DeployHookTrigger**: fetch mock, success/failure responses
- **GitAdapter refresh**: `isomorphic-git` mocked, change detection (changed vs unchanged)
- **FilesystemAdapter refresh**: mtime comparison, hash fingerprinting

## Dependencies

- `isomorphic-git` — Pure JS git implementation (used by full Next.js template)
- `@astrojs/vercel` — Vercel adapter for ISR support (optional peer dep)
- `@ever-works/adapters` — Data source adapters
- `@ever-works/core` — Core data layer and types
