# @ever-works/sync

Content synchronization orchestration for the Ever Works minimal directory template. Coordinates webhook-driven and polling-based content refresh, deploy hook triggering, and configuration resolution.

## What This Package Does

1. **`SyncManager`** — Orchestrates content refresh via adapter `refresh()`, with event emission and status tracking
2. **`WebhookHandler`** — Validates GitHub push webhook signatures (`HMAC-SHA256`) and extracts push event data
3. **`DeployHookTrigger`** — Triggers Vercel deploy hooks for static site rebuilds when content changes
4. **`resolveSyncConfig()`** — Merges explicit config with environment variables (`WEBHOOK_SECRET`, `SYNC_POLL_INTERVAL_MS`, `VERCEL_DEPLOY_HOOK_URL`)

## Package Structure

```
src/
├── index.ts           — Public API barrel export
├── types.ts           — SyncConfig, SyncResult, SyncStatus, SyncEvent types
├── sync-manager.ts    — Content refresh orchestration with polling and events
├── webhook-handler.ts — GitHub webhook HMAC validation and payload parsing
├── deploy-hook.ts     — Vercel deploy hook HTTP trigger
└── resolve-config.ts  — Environment-aware configuration resolution
```

## Usage

### Webhook-driven refresh (ISR mode)

```typescript
import { SyncManager, WebhookHandler, resolveSyncConfig } from '@ever-works/sync';
import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';

const adapterConfig = resolveAdapterConfig();
const adapter = createAdapter(adapterConfig);
await adapter.init(adapterConfig);

const syncConfig = resolveSyncConfig();
const syncManager = new SyncManager(adapter, syncConfig);

// In your webhook endpoint:
const isValid = WebhookHandler.validateSignature(rawBody, signatureHeader, syncConfig.webhookSecret!);
if (isValid) {
    const pushData = WebhookHandler.parseGitHubPush(parsedBody);
    if (pushData && WebhookHandler.isRelevantPush(pushData.branch, 'main')) {
        const result = await syncManager.sync();
        // result.contentChanged === true means content was updated
    }
}
```

### Polling-based refresh

```typescript
const syncConfig = resolveSyncConfig({ pollIntervalMs: 60_000 });
const syncManager = new SyncManager(adapter, syncConfig);

syncManager.on((event) => {
    if (event.type === 'sync:content-changed') {
        console.log('Content updated:', event.result);
    }
});

syncManager.startPolling();
// Later: syncManager.stopPolling(); syncManager.destroy();
```

### Triggering Vercel deploy hooks (static mode)

```typescript
import { DeployHookTrigger } from '@ever-works/sync';

const result = await DeployHookTrigger.trigger(process.env.VERCEL_DEPLOY_HOOK_URL!);
// result.success, result.message, result.statusCode
```

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `WEBHOOK_SECRET` | HMAC secret for GitHub webhook validation | — |
| `SYNC_POLL_INTERVAL_MS` | Polling interval in ms (`0` = disabled) | `0` |
| `SYNC_TIMEOUT_MS` | Timeout for a single sync operation | `60000` |
| `SYNC_MAX_RETRIES` | Max retries on sync failure (exponential backoff) | `3` |
| `CONTENT_CACHE_TTL_MS` | Cache TTL in ms | `300000` (5 min) |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel deploy hook URL for static rebuilds | — |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/adapters` | `DataAdapter.refresh()` for pulling latest content |
| `@ever-works/core` | `ContentData` types |

## Testing

74 unit tests across 5 test files (sync-manager, webhook-handler, deploy-hook, resolve-config, barrel-exports) covering sync lifecycle, retry logic, event emission, webhook HMAC validation, payload parsing, deploy hooks, and config resolution.

```bash
pnpm --filter @ever-works/sync test
```
