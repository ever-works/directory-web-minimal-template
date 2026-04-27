---
title: "Deployment"
sidebar_label: "Deployment"
---

# Deployment

How to deploy the minimal template to Vercel and other static hosts.

## Prerequisites

- **Node.js** 22+ (24 LTS recommended)
- **pnpm** 10+
- A **Vercel** account (free tier works)
- A **GitHub** repository with your template code

## Environment Variables

The build requires these core environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATA_REPOSITORY` | Yes | GitHub URL of your content repository |
| `GH_TOKEN` | No | GitHub Personal Access Token (required for private content repos) |
| `GITHUB_BRANCH` | No | Branch to sync content from (defaults to `main`) |
| `SITE_URL` | No | Production URL of your site (defaults to `https://example.com`) |
| `ENABLE_ISR` | No | Set to `false` for pure-static output without on-demand regeneration (defaults to `true` — see [Output mode](#output-mode-isr-vs-pure-static) below) |

For the full set of content-sync / webhook / polling / cache-TTL variables (`WEBHOOK_SECRET`, `SYNC_POLL_INTERVAL_MS`, `SYNC_TIMEOUT_MS`, `SYNC_MAX_RETRIES`, `CONTENT_CACHE_TTL_MS`, `VERCEL_DEPLOY_HOOK_URL`, `CONTENT_PATH`), see the [Content Sync guide](/guides/content-sync/) — those variables only matter once you choose how to keep the deployed site in sync with the data repo over time, and the Content Sync guide covers all four supported modes (ISR + webhook, ISR + polling, ISR + manual `/api/webhook` trigger, pure-static + Vercel Deploy Hook).

## Deploy via Vercel GitHub Integration

The simplest approach is connecting your GitHub repository directly to Vercel:

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Configure the project settings:
   - **Build Command**: `pnpm --filter @ever-works/web-minimal build`
   - **Output Directory**: `apps/web/dist`
   - **Install Command**: `pnpm install`
   - **Root Directory**: leave empty (monorepo root)
4. Add environment variables (`DATA_REPOSITORY`, `GH_TOKEN`, etc.) in the Vercel dashboard under **Settings > Environment Variables**
5. Click **Deploy**

In ISR mode (default) the template ships a single Vercel server function (`/api/webhook`) that handles content-change webhooks; in pure-static mode (`ENABLE_ISR=false`) no server functions run at all. Either way, Vercel serves pre-rendered pages from its edge network — ISR re-runs the page renderer on-demand only after a webhook invalidates the affected paths.

### Automatic Deployments

Once connected, Vercel automatically deploys:
- **Production** on every push to `main`
- **Preview** on every pull request

## Deploy via Vercel CLI

For manual or scripted deployments:

```bash
# Install the Vercel CLI
npm i -g vercel

# Link your project (first time only)
vercel link

# Deploy a preview
vercel deploy

# Deploy to production
vercel deploy --prod
```

Set environment variables via the CLI:

```bash
vercel env add DATA_REPOSITORY
vercel env add GH_TOKEN
vercel env add GITHUB_BRANCH
vercel env add SITE_URL
```

## GitHub Actions CI/CD

The template includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that runs on every push to `main`.

The workflow performs these steps:

1. Checks out the code
2. Sets up pnpm and Node.js
3. Installs dependencies with `pnpm install --frozen-lockfile`
4. Runs `pnpm typecheck` to catch type errors
5. Builds the web app with `pnpm --filter @ever-works/web-minimal build`

### Required GitHub Secrets

Add these secrets in your GitHub repository under **Settings > Secrets and variables > Actions**:

| Secret | Required | Description |
|--------|----------|-------------|
| `DATA_REPOSITORY` | Yes | GitHub URL of your content repository |
| `GH_TOKEN` | Yes | GitHub PAT for cloning content |
| `GITHUB_BRANCH` | No | Content branch (defaults to `main`) |
| `SITE_URL` | No | Production URL (defaults to `https://example.com`) |

### Enabling Vercel CLI Deployment in CI

The workflow includes commented-out steps for deploying via the Vercel CLI. To enable them:

1. Install the Vercel CLI step and deploy step are at the bottom of `deploy.yml` — uncomment them
2. Add these additional secrets to GitHub:
   - `VERCEL_TOKEN` — your Vercel API token
   - `VERCEL_ORG_ID` — your Vercel organization ID
   - `VERCEL_PROJECT_ID` — your Vercel project ID

You can find `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in the `.vercel/project.json` file after running `vercel link` locally.

## Custom Domain Setup

1. In the Vercel dashboard, go to your project **Settings > Domains**
2. Add your custom domain (e.g., `my-directory.com`)
3. Configure your DNS provider:
   - **A record**: point `@` to `76.76.21.21`
   - **CNAME record**: point `www` to `cname.vercel-dns.com`
4. Vercel automatically provisions an SSL certificate
5. Update the `SITE_URL` environment variable to match your custom domain

## Build Details

- **Build command**: `pnpm --filter @ever-works/web-minimal build`
- **Output directory**: `apps/web/dist`
- **Framework**: Astro with `output: 'static'` and `@astrojs/vercel` adapter (ISR-enabled by default; opt out by setting `ENABLE_ISR=false`)

The build fetches content from the configured `DATA_REPOSITORY` at build time and pre-renders every page. By default the deployed site uses Vercel ISR (Incremental Static Regeneration): pages stay statically served from the edge until a content-change webhook hits `/api/webhook`, at which point the affected pages regenerate on-demand without a full rebuild. To update content in **ISR mode**, push to your data repo and let the GitHub webhook fire (or invoke the webhook manually — see [Content Sync](/guides/content-sync/)). To update content in **pure-static mode** (`ENABLE_ISR=false`), trigger a new build (via a git push, manual redeploy in the Vercel dashboard, or a `VERCEL_DEPLOY_HOOK_URL` POST).

### Output mode (ISR vs pure-static)

| Mode | When to choose | Setup |
|------|----------------|-------|
| **ISR (default)** | Most directory sites — content updates without a full rebuild; minimal latency for readers | No extra config; webhook + cache TTL covered in [Content Sync](/guides/content-sync/) |
| **Pure-static** (`ENABLE_ISR=false`) | Content rarely changes, you want zero server-side runtime, or you're deploying to a non-Vercel static host | Set `ENABLE_ISR=false`; for content updates, use a Vercel Deploy Hook (`VERCEL_DEPLOY_HOOK_URL`) or manual rebuild |

## Deploying to Other Static Hosts

Set `ENABLE_ISR=false` before building to opt out of the Vercel ISR adapter and produce a fully static `apps/web/dist/` tree with no server function. The output then deploys to any static host:

### Netlify

```bash
ENABLE_ISR=false pnpm --filter @ever-works/web-minimal build
# Upload apps/web/dist/ as your publish directory
```

### Cloudflare Pages

```bash
ENABLE_ISR=false pnpm --filter @ever-works/web-minimal build
# Set build output directory to apps/web/dist
```

### GitHub Pages

Use the build output from `apps/web/dist/` and configure GitHub Pages to serve from that directory. You may need to add a `.nojekyll` file to the output.
