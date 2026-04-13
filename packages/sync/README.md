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

const adapter = createAdapter(resolveAdapterConfig());
await adapter.init(resolveAdapterConfig());

const syncConfig = resolveSyncConfig();
const syncManager = new SyncManager(adapter, syncConfig);
const webhookHandler = new WebhookHandler(syncConfig.webhookSecret);

// In your webhook endpoint:
const isValid = webhookHandler.verify(requestBody, signatureHeader);
if (isValid) {
    const result = await syncManager.refresh();
    // result.changed === true means content was updated
}
```

### Polling-based refresh

```typescript
const syncManager = new SyncManager(adapter, {
    pollIntervalMs: 60_000, // check every minute
});

syncManager.on('refresh', (event) => {
    console.log('Content updated:', event);
});

syncManager.startPolling();
```

### Triggering Vercel deploy hooks (static mode)

```typescript
import { DeployHookTrigger } from '@ever-works/sync';

const trigger = new DeployHookTrigger(process.env.VERCEL_DEPLOY_HOOK_URL!);
const result = await trigger.trigger();
// result.success, result.jobId
```

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `WEBHOOK_SECRET` | HMAC secret for GitHub webhook validation | — |
| `SYNC_POLL_INTERVAL_MS` | Polling interval in ms (`0` = disabled) | `0` |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel deploy hook URL for static rebuilds | — |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@ever-works/adapters` | `DataAdapter.refresh()` for pulling latest content |
| `@ever-works/core` | `ContentData` types |

## Testing

```bash
pnpm --filter @ever-works/sync test
```
