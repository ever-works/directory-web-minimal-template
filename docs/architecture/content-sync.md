---
title: "Content Synchronization Architecture"
sidebar_label: "Content Sync"
---

# Content Synchronization Architecture

## Overview

The content sync system detects and responds to changes in the external content repository. It bridges the gap between a Git-backed data source and the deployed site, ensuring visitors see up-to-date content without manual rebuilds.

Two modes are supported, selected by the `ENABLE_ISR` environment variable:

```
┌─────────────────────────────────────────────────────────────┐
│                     Content Repository                      │
│              (GitHub — YAML files in Git)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐       ┌─────────────────────┐
│   ISR Mode      │       │   Static Mode        │
│  (default)      │       │  (ENABLE_ISR=false)   │
│                 │       │                       │
│  Webhook/poll → │       │  Webhook/poll →       │
│  adapter refresh│       │  trigger Vercel       │
│  → cache bust → │       │  Deploy Hook →        │
│  page regen     │       │  full rebuild         │
└─────────────────┘       └─────────────────────┘
```

- **ISR mode (default)** — The running server detects changes, refreshes the adapter, invalidates its content cache, and regenerates affected pages on the next request.
- **Static mode** — When `ENABLE_ISR=false`, content changes trigger a full rebuild via a Vercel Deploy Hook. The site is fully static with no server-side regeneration.

## Data Flow

```
Content repo push
       │
       ▼
GitHub webhook POST ──────────────────────┐
       │                                   │
       ▼                                   ▼
WebhookHandler                       (or) SyncManager poll
  · HMAC-SHA256 validation                · periodic HEAD ref check
  · GitHub payload parsing                · compare local vs remote ref
       │                                   │
       └──────────┬────────────────────────┘
                  │
                  ▼
         Adapter refresh
  · GitAdapter: git fetch + fast-forward
  · FilesystemAdapter: mtime check
                  │
                  ▼
         ContentCache invalidation
  · Clear cached content data
  · Reset TTL timers
                  │
                  ▼
         Page regeneration
  · ISR mode: next request triggers regen
  · Static mode: Vercel Deploy Hook fires full rebuild
```

## Package Responsibilities

Each package in the monorepo owns a specific part of the sync pipeline:

| Package | Responsibility |
|---------|---------------|
| `@ever-works/adapters` | Adapter `refresh()` method — pulls latest content from the data source (git fetch/fast-forward for GitAdapter, mtime check for FilesystemAdapter) |
| `@ever-works/core` | `ContentCache` — in-memory cache with TTL, deduplication, and invalidation API |
| `@ever-works/sync` | `SyncManager` — orchestrates polling, mutex locking, timeout/retry logic, and emits sync events |
| `@ever-works/sync` | `WebhookHandler` — receives and validates incoming webhook POSTs; `DeployHookTrigger` — fires Vercel deploy hooks in static mode |
| `@ever-works/astro-integration` | Exposes webhook POST endpoint at `/api/webhook` using `WebhookHandler` from `@ever-works/sync` |

## isomorphic-git Usage

The GitAdapter uses `isomorphic-git` for lightweight, in-process Git operations without shelling out to the `git` CLI at runtime:

- **`clone`** — Initial shallow clone of the content repository into `.content/` at build time (with `--depth 1` semantics)
- **`fetch`** — Retrieves new commits from the remote during a sync refresh
- **`fastForward`** — Advances the local branch pointer to match the remote HEAD without a full merge
- **`resolveRef`** — Reads the current local HEAD SHA for comparison against the remote, enabling lightweight "has anything changed?" checks

All Git operations use the `fs` and `http` plugins from isomorphic-git, keeping the implementation portable across Node.js environments.

## FilesystemAdapter: mtime-based Change Detection

For local development (using the FilesystemAdapter), change detection relies on file modification times:

1. On each sync cycle, the adapter walks the content directory
2. It compares each file's `mtime` against the last recorded snapshot
3. If any file has a newer `mtime`, the adapter signals that content has changed
4. The content cache is invalidated and content is reloaded from disk

This approach avoids filesystem watchers (which can be unreliable in containers) while keeping the detection cost proportional to the number of content files.

## ContentCache

The `ContentCache` class in `@ever-works/core` provides a single-layer in-memory cache for loaded content data:

```typescript
interface ContentCache {
    /** Retrieve cached content, or null if expired/missing */
    get(key: string): ContentData | null;

    /** Store content with a TTL */
    set(key: string, data: ContentData, ttlMs: number): void;

    /** Invalidate a specific key */
    invalidate(key: string): void;

    /** Invalidate all cached content */
    invalidateAll(): void;
}
```

Key behaviors:

- **TTL** — Each cache entry expires after a configurable duration (default: 5 minutes (300000 ms)). Controlled by the `CONTENT_CACHE_TTL_MS` environment variable.
- **Deduplication** — Concurrent requests for the same content key share a single in-flight load. The first request triggers the load; subsequent requests await the same promise.
- **Invalidation** — Explicit invalidation (via webhook or sync event) clears the cache immediately, regardless of remaining TTL.

## SyncManager

The `SyncManager` in `@ever-works/sync` coordinates periodic content synchronization:

```typescript
interface SyncManagerOptions {
    /** Polling interval in milliseconds (0 = disabled) */
    pollIntervalMs: number;
    /** Maximum time for a single sync operation */
    syncTimeoutMs: number;
    /** Number of retry attempts on failure */
    maxRetries: number;
    /** Adapter instance to refresh */
    adapter: DataAdapter;
    /** Cache instance to invalidate */
    cache: ContentCache;
}
```

Key behaviors:

- **Polling** — When `SYNC_POLL_INTERVAL_MS` is set, the manager starts a `setInterval` loop that checks for remote changes. Each tick calls `resolveRef` to compare the local and remote HEAD SHAs.
- **Mutex** — A lock prevents overlapping sync operations. If a sync is already in progress when a webhook or poll tick fires, the new request is queued, not dropped.
- **Timeout** — Each sync operation has a deadline (default: 60 seconds). If the adapter refresh exceeds this, the operation is aborted and retried.
- **Retry** — Failed syncs are retried up to `maxRetries` times (default: 3) with exponential backoff.
- **Events** — The manager emits events for observability: `sync:start`, `sync:complete`, `sync:error`, and `sync:skip` (when no changes are detected).

## WebhookHandler

The `WebhookHandler` (from `@ever-works/sync`, integrated via `@ever-works/astro-integration`) exposes a POST endpoint at `/api/webhook` to receive push notifications from GitHub:

1. **HMAC-SHA256 validation** — The handler reads the `X-Hub-Signature-256` header, computes `HMAC-SHA256(secret, body)`, and performs a timing-safe comparison. Requests with missing or invalid signatures are rejected with `401`.
2. **GitHub payload parsing** — The handler extracts the `ref` field from the JSON body and verifies it matches the configured branch (e.g., `refs/heads/main`). Pushes to other branches are ignored with `200 OK` (no-op).
3. **Trigger sync** — On a valid push to the target branch, the handler calls `SyncManager.triggerSync()`, which starts the adapter refresh and cache invalidation flow.

```
POST /api/webhook
Headers:
  X-Hub-Signature-256: sha256=<hex-digest>
  Content-Type: application/json
Body:
  { "ref": "refs/heads/main", "commits": [...], ... }
```

## DeployHookTrigger

In static mode (`ENABLE_ISR=false`), content changes cannot be handled by runtime page regeneration. Instead, the `DeployHookTrigger` fires a Vercel Deploy Hook to initiate a full rebuild:

1. On receiving a valid webhook or detecting changes via polling, the trigger sends a POST request to the configured `VERCEL_DEPLOY_HOOK_URL`.
2. Vercel queues a new deployment using the latest code and content.
3. No request body is needed — the deploy hook URL contains all necessary context.

This approach trades latency (a full rebuild takes 1-3 minutes) for simplicity (no server runtime needed).

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATA_REPOSITORY` | Yes | — | GitHub URL of the content repository |
| `GH_TOKEN` | No | — | GitHub Personal Access Token (required for private repos) |
| `GITHUB_BRANCH` | No | `main` | Branch to sync content from |
| `ENABLE_ISR` | No | `true` | Set to `false` to use static mode with deploy hooks |
| `WEBHOOK_SECRET` | No | — | Shared secret for HMAC-SHA256 webhook validation |
| `SYNC_POLL_INTERVAL_MS` | No | `0` (disabled) | Polling interval in milliseconds (e.g., `300000` for 5 minutes) |
| `SYNC_TIMEOUT_MS` | No | `60000` | Maximum time for a single sync operation |
| `SYNC_MAX_RETRIES` | No | `3` | Number of retry attempts on sync failure |
| `CONTENT_CACHE_TTL_MS` | No | `300000` | Cache TTL in milliseconds |
| `VERCEL_DEPLOY_HOOK_URL` | No | — | Vercel deploy hook URL (required when `ENABLE_ISR=false`) |

## Performance Considerations

- **Shallow clone** — The initial clone uses `--depth 1 --single-branch` to minimize download size and clone time. Only the target branch's latest commit is fetched.
- **Lightweight HEAD ref checks** — Polling uses `resolveRef` to read a single SHA from the remote, avoiding full fetches on every tick. Network overhead is minimal.
- **Deduped loads** — Concurrent requests for content share a single in-flight load via the cache's deduplication logic, preventing thundering herd problems after cache invalidation.
- **Fast-forward only** — The sync process uses fast-forward merges rather than full resets, making incremental updates proportional to the diff rather than the full repo size.
- **mtime-based detection** — The filesystem adapter avoids expensive content hashing by relying on file modification times for change detection.

## Sequence Diagrams

### Webhook Flow (ISR Mode)

```
GitHub          WebhookHandler       SyncManager        GitAdapter        ContentCache
  │                  │                   │                   │                  │
  │  POST /api/webhook                   │                   │                  │
  │  (X-Hub-Signature-256)               │                   │                  │
  │─────────────────▶│                   │                   │                  │
  │                  │                   │                   │                  │
  │                  │ validate HMAC     │                   │                  │
  │                  │ parse branch      │                   │                  │
  │                  │                   │                   │                  │
  │                  │ triggerSync()     │                   │                  │
  │                  │──────────────────▶│                   │                  │
  │                  │                   │                   │                  │
  │                  │                   │ acquire mutex     │                  │
  │                  │                   │                   │                  │
  │                  │                   │ refresh()         │                  │
  │                  │                   │──────────────────▶│                  │
  │                  │                   │                   │                  │
  │                  │                   │                   │ git fetch        │
  │                  │                   │                   │ fast-forward     │
  │                  │                   │                   │                  │
  │                  │                   │          done     │                  │
  │                  │                   │◀──────────────────│                  │
  │                  │                   │                   │                  │
  │                  │                   │ invalidateAll()   │                  │
  │                  │                   │─────────────────────────────────────▶│
  │                  │                   │                   │                  │
  │                  │                   │ emit sync:complete│                  │
  │                  │                   │ release mutex     │                  │
  │                  │                   │                   │                  │
  │      200 OK      │                   │                   │                  │
  │◀─────────────────│                   │                   │                  │
```

### Polling Flow

```
Timer              SyncManager        GitAdapter        ContentCache
  │                   │                   │                  │
  │  tick             │                   │                  │
  │──────────────────▶│                   │                  │
  │                   │                   │                  │
  │                   │ resolveRef(remote)│                  │
  │                   │──────────────────▶│                  │
  │                   │                   │                  │
  │                   │    remote SHA     │                  │
  │                   │◀──────────────────│                  │
  │                   │                   │                  │
  │                   │ compare local SHA │                  │
  │                   │                   │                  │
  │         ┌─────────┴─────────┐        │                  │
  │         │ SHAs match?       │        │                  │
  │         ├── yes ────────────┤        │                  │
  │         │  emit sync:skip   │        │                  │
  │         │  (no-op)          │        │                  │
  │         ├── no ─────────────┤        │                  │
  │         │  acquire mutex    │        │                  │
  │         │                   │        │                  │
  │         │  refresh()        │        │                  │
  │         │  ─────────────────────────▶│                  │
  │         │                   │        │                  │
  │         │          done     │        │                  │
  │         │  ◀─────────────────────────│                  │
  │         │                   │        │                  │
  │         │  invalidateAll()  │        │                  │
  │         │  ────────────────────────────────────────────▶│
  │         │                   │        │                  │
  │         │  emit sync:complete        │                  │
  │         │  release mutex    │        │                  │
  │         └───────────────────┘        │                  │
```
