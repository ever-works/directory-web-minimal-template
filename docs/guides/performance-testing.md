---
title: "Performance Testing"
sidebar_label: "Performance Testing"
---

# Performance Testing

The template includes automated Lighthouse CI performance testing that runs on every push and PR.

## How It Works

The `.github/workflows/lighthouse.yml` workflow:

1. Builds `sample-basic` (fastest representative sample)
2. Starts the Astro preview server on port 4323
3. Runs Lighthouse CI against 4 representative pages
4. Reports results as GitHub Actions artifacts

### Pages Tested

| Page | URL | Tests |
|------|-----|-------|
| Homepage | `/` | Hero, item grid, navigation |
| Item Detail | `/item/radix-ui/` | Breadcrumbs, metadata, tags, related items |
| Category Listing | `/category/form-components/` | Filtered item grid |
| Categories Index | `/categories/` | Category card grid |

### Performance Budget

| Category | Threshold | Mode |
|----------|-----------|------|
| Performance | ≥ 90 | warn |
| Accessibility | ≥ 90 | warn |
| Best Practices | ≥ 90 | warn |
| SEO | ≥ 90 | warn |

Scores below the threshold produce warnings in CI but do not block the PR. This allows you to track regressions without breaking the build.

## Running Locally

Install the Lighthouse CI CLI:

```bash
npx @lhci/cli@latest autorun
```

Or run manually against a preview server:

```bash
# Terminal 1: Start the preview server
pnpm --filter @ever-works/sample-basic build
pnpm --filter @ever-works/sample-basic preview

# Terminal 2: Run Lighthouse CI
npx @lhci/cli@latest autorun --config=lighthouserc.cjs
```

## Configuration

The Lighthouse CI config is at `lighthouserc.cjs` in the repository root.

### Adding URLs

To test additional pages, add them to the `url` array in `lighthouserc.cjs`:

```js
collect: {
  url: [
    'http://localhost:4323/',
    'http://localhost:4323/item/radix-ui/',
    'http://localhost:4323/your-new-page/',
  ],
}
```

### Changing Thresholds

To make assertions stricter (block PRs on failures):

```js
assert: {
  assertions: {
    'categories:performance': ['error', { minScore: 0.95 }],
  },
}
```

### Testing Other Samples

To test a different sample (e.g., `sample-jobs`), update the server command in the workflow and URLs in the config to match that sample's port and content.

## Interpreting Results

Lighthouse CI runs each URL 3 times and takes the median score. Results are uploaded as GitHub Actions artifacts.

### Common Performance Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Large serialized props | Slow hydration | Trim unused fields before passing to client components |
| Unoptimized images | Slow LCP | Use Astro's `<Image>` component |
| Unused CSS | Larger bundle | Tailwind purges automatically; check for imported but unused styles |
| Missing font preload | Layout shift | Add `<link rel="preload">` for web fonts |
| Too many DOM nodes | Slow paint | Paginate long lists, use virtual scrolling |
