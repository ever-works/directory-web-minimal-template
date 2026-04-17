---
title: "Content Sync Setup Guide"
sidebar_label: "Content Sync"
---

# Content Sync Setup Guide

How to configure content synchronization between your content repository and your deployed site.

## Quick Start

ISR (Incremental Static Regeneration) works out of the box with zero configuration beyond the standard data source variables. When your site is deployed with the default settings, it will:

1. Clone the content repository at build time
2. Serve pages from an in-memory cache at runtime
3. Accept webhook notifications to refresh content without a full rebuild

For most deployments, you only need `DATA_REPOSITORY` (and `GH_TOKEN` for private repos). Content sync features activate automatically when the corresponding environment variables are set.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATA_REPOSITORY` | Yes | — | GitHub URL of your content repository |
| `GH_TOKEN` | No | — | GitHub Personal Access Token (required for private content repos) |
| `GITHUB_BRANCH` | No | `main` | Branch to sync content from |
| `ENABLE_ISR` | No | `true` | Set to `false` for static mode with deploy hooks |
| `WEBHOOK_SECRET` | No | — | Shared secret for webhook HMAC-SHA256 validation |
| `SYNC_POLL_INTERVAL_MS` | No | `0` (disabled) | Polling interval in milliseconds |
| `SYNC_TIMEOUT_MS` | No | `60000` | Maximum time for a single sync operation |
| `SYNC_MAX_RETRIES` | No | `3` | Retry attempts on sync failure |
| `CONTENT_CACHE_TTL_MS` | No | `300000` | Content cache TTL in milliseconds |
| `VERCEL_DEPLOY_HOOK_URL` | No | — | Vercel deploy hook URL (required when `ENABLE_ISR=false`) |

## Setting Up GitHub Webhooks

Webhooks give you near-instant content updates. When you push changes to your content repository, GitHub notifies your site, which then pulls the latest content.

### Step-by-Step Setup

1. Go to your **content repository** on GitHub (not the template code repository)
2. Navigate to **Settings > Webhooks > Add webhook**
3. Configure the webhook:
   - **Payload URL**: `https://your-site.com/api/webhook`
   - **Content type**: `application/json`
   - **Secret**: Enter a strong random string (e.g., generate one with `openssl rand -hex 32`)
   - **Which events?**: Select **Just the push event**
   - **Active**: Checked
4. Click **Add webhook**
5. Add the same secret as the `WEBHOOK_SECRET` environment variable in your Vercel project:

```bash
# Via Vercel CLI
vercel env add WEBHOOK_SECRET

# Or set it in the Vercel dashboard under Settings > Environment Variables
```

6. Redeploy your site so the new environment variable takes effect

### Verifying the Webhook

After setup, push a change to your content repository and check:

- **GitHub**: Go to your webhook settings and click **Recent Deliveries**. You should see a `200` response.
- **Vercel**: Check your function logs in the Vercel dashboard. You should see a log entry for the sync operation.

If you see a `401` response, verify that the `WEBHOOK_SECRET` values match exactly in both GitHub and your Vercel environment variables.

## Setting Up Polling (Alternative to Webhooks)

If webhooks are not an option (e.g., your content repository is behind a firewall), you can use polling instead. The sync manager will periodically check the remote repository for changes.

Set the `SYNC_POLL_INTERVAL_MS` environment variable to your desired interval:

```bash
# Poll every 5 minutes
vercel env add SYNC_POLL_INTERVAL_MS
# Enter: 300000

# Poll every 1 minute (more aggressive)
vercel env add SYNC_POLL_INTERVAL_MS
# Enter: 60000
```

Polling uses lightweight HEAD ref checks — it compares the local and remote SHA without downloading any content. A full fetch only happens when the SHAs differ.

**Note**: Webhooks and polling can be used together. The webhook provides instant updates, while polling acts as a safety net for any missed webhook deliveries.

## Static Mode

For sites that do not need runtime regeneration, set `ENABLE_ISR=false`. In this mode, the site is fully static — no server functions run at runtime. Content changes trigger a full rebuild via a Vercel Deploy Hook.

### Configuration

1. Set the environment variable:

```bash
vercel env add ENABLE_ISR
# Enter: false
```

2. Create a Deploy Hook in Vercel (see next section)
3. Set the deploy hook URL:

```bash
vercel env add VERCEL_DEPLOY_HOOK_URL
# Enter: https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyy
```

4. Set up a GitHub webhook pointing to your site's `/api/webhook` endpoint (same steps as above). When a push is received, the webhook handler will fire the deploy hook instead of refreshing content in-place.

### How to Create a Vercel Deploy Hook

1. Go to your project in the [Vercel dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings > Git > Deploy Hooks**
3. Enter a name for the hook (e.g., `content-sync`)
4. Select the branch to deploy (typically `main`)
5. Click **Create Hook**
6. Copy the generated URL — it looks like `https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyy`
7. Store this URL as the `VERCEL_DEPLOY_HOOK_URL` environment variable

**Important**: Treat the deploy hook URL as a secret. Anyone with the URL can trigger a deployment. Do not commit it to your repository.

## Troubleshooting

### Webhook returns 401 Unauthorized

- Verify that `WEBHOOK_SECRET` is set in your Vercel environment variables
- Confirm the secret in GitHub webhook settings matches exactly (no trailing whitespace)
- Redeploy after adding or changing the environment variable

### Content not updating after push

- Check the GitHub webhook delivery log for errors
- Verify the webhook is configured to send `push` events (not just `ping`)
- Confirm the push is to the correct branch (must match `GITHUB_BRANCH`, default: `main`)
- Check Vercel function logs for sync errors

### Polling not detecting changes

- Verify `SYNC_POLL_INTERVAL_MS` is set to a positive number
- Check that `GH_TOKEN` has read access to the content repository
- Look for `sync:error` events in the server logs

### Deploy hook not firing (static mode)

- Verify `ENABLE_ISR` is set to `false`
- Confirm `VERCEL_DEPLOY_HOOK_URL` is set and the URL is valid
- Test the deploy hook manually:

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyy"
```

### Cache serving stale content

- The default cache TTL is 5 minutes (300 seconds). After invalidation, the next request triggers a fresh load.
- If content seems stale, check that the sync completed successfully (look for `sync:complete` in logs)
- You can reduce the TTL for faster updates at the cost of more frequent reloads

## Cache Configuration

### Adjusting the TTL

The content cache TTL controls how long loaded content is served from memory before being refreshed. Lower values mean fresher content but more frequent disk/network reads.

```bash
# 30-second cache (more responsive, higher load)
vercel env add CONTENT_CACHE_TTL_MS
# Enter: 30000

# 5-minute cache (less responsive, lower load)
vercel env add CONTENT_CACHE_TTL_MS
# Enter: 300000
```

For most sites, the default of 5 minutes provides a good balance. Webhook-triggered invalidation clears the cache immediately regardless of TTL, so the TTL mainly affects how quickly the site recovers if a webhook is missed.

### Manual Cache Invalidation

To force a content refresh without waiting for a webhook or poll cycle, you can send a POST request to the webhook endpoint manually:

```bash
# Generate a valid signature
SECRET="your-webhook-secret"
BODY='{"ref":"refs/heads/main"}'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print "sha256="$2}')

# Send the webhook
curl -X POST https://your-site.com/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: $SIGNATURE" \
  -d "$BODY"
```

Alternatively, in static mode, trigger a rebuild by calling the deploy hook URL directly.
