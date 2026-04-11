---
title: "Deployment"
sidebar_label: "Deployment"
---

# Deployment

How to deploy the minimal template to Vercel and other static hosts.

## Prerequisites

- **Node.js** 20+ (24 LTS recommended)
- **pnpm** 10+
- A **Vercel** account (free tier works)
- A **GitHub** repository with your template code

## Environment Variables

The build requires these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATA_REPOSITORY` | Yes | GitHub URL of your content repository |
| `GH_TOKEN` | No | GitHub Personal Access Token (required for private content repos) |
| `GITHUB_BRANCH` | No | Branch to sync content from (defaults to `main`) |
| `SITE_URL` | No | Production URL of your site (defaults to `https://example.com`) |

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

Since the template produces fully static output, no server functions are needed. Vercel will serve the built HTML/CSS/JS directly from its edge network.

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
- **Output type**: Fully static HTML/CSS/JS — no server functions needed
- **Framework**: Astro with `output: 'static'`

The build fetches content from the configured `DATA_REPOSITORY` at build time and produces static files. To update content, trigger a new build (via a git push or manual redeploy in the Vercel dashboard).

## Deploying to Other Static Hosts

Since the template produces a standard static site, you can deploy to any static host:

### Netlify

```bash
pnpm --filter @ever-works/web-minimal build
# Upload apps/web/dist/ as your publish directory
```

### Cloudflare Pages

```bash
pnpm --filter @ever-works/web-minimal build
# Set build output directory to apps/web/dist
```

### GitHub Pages

Use the build output from `apps/web/dist/` and configure GitHub Pages to serve from that directory. You may need to add a `.nojekyll` file to the output.
