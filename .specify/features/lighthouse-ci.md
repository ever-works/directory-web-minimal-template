# Feature: Lighthouse CI Performance Testing

## Overview
Automated performance testing using Lighthouse CI in the GitHub Actions pipeline. Ensures all sample sites meet performance budgets on every PR.

## Goals
- Catch performance regressions before merge
- Enforce performance budgets (Performance ≥90, Accessibility ≥90, Best Practices ≥90, SEO ≥90)
- Test representative pages: homepage, item detail, category listing
- Run against the lightweight `sample-basic` app (fastest build, representative of all templates)

## Non-Goals
- Not testing sample-git (too slow to build for CI perf checks)
- Not blocking PRs on Lighthouse scores initially (assertion mode: warn)
- Not uploading to Lighthouse CI server (uses local assertions only)

## Implementation

### Files to Create/Modify
1. `lighthouserc.cjs` — Lighthouse CI configuration (root)
2. `.github/workflows/lighthouse.yml` — Dedicated GitHub Actions workflow
3. `docs/guides/performance-testing.md` — Documentation

### Lighthouse CI Config
- URLs to test: `/`, `/item/radix-ui/`, `/category/form-components/`, `/categories`
- Assertions:
  - Performance ≥ 0.90 (warn)
  - Accessibility ≥ 0.90 (warn)
  - Best Practices ≥ 0.90 (warn)
  - SEO ≥ 0.90 (warn)
- Settings:
  - `chromeFlags: ['--no-sandbox']` (for CI)
  - `onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']`
  - 3 runs per URL, take median

### Workflow
- Triggers: push to main/develop, PRs to main/develop
- Runs after build, serves sample-basic with `astro preview`
- Uses `treosh/lighthouse-ci-action@v12`
- Uploads results as artifacts

## Performance Budget
| Category | Threshold | Mode |
|----------|-----------|------|
| Performance | ≥ 90 | warn |
| Accessibility | ≥ 90 | warn |
| Best Practices | ≥ 90 | warn |
| SEO | ≥ 90 | warn |

## Dependencies
- `treosh/lighthouse-ci-action@v12` — GitHub Action for Lighthouse CI (no local `@lhci/cli` install needed)
