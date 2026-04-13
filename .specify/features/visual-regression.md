# Feature: Visual Regression Testing

## Overview
Automated visual regression testing using Playwright's built-in screenshot comparison. Catches unintended visual changes across key pages.

## Goals
- Detect visual regressions (layout shifts, missing elements, broken styles) before merge
- Baseline screenshots stored in git for team review
- Run against `sample-basic` for consistent, fast tests
- Complement existing functional E2E tests with visual verification

## Non-Goals
- Not replacing functional E2E tests
- Not testing all sample apps (only sample-basic)
- Not pixel-perfect matching (allow threshold for anti-aliasing)

## Implementation

### Test Structure
Add visual regression tests to `apps/web-e2e/tests/visual/` directory:
- `visual-home.spec.ts` — Homepage full-page and above-the-fold screenshots
- `visual-item.spec.ts` — Item detail page screenshots
- `visual-category.spec.ts` — Category listing screenshots
- `visual-responsive.spec.ts` — Mobile viewport screenshots

### Playwright Config Changes
- Add visual regression projects to `playwright.config.ts`
- Configure `toHaveScreenshot()` with `maxDiffPixelRatio: 0.01` threshold
- Store snapshots in `apps/web-e2e/tests/visual/__screenshots__/`

### Key Pages to Screenshot
| Page | Viewport | Notes |
|------|----------|-------|
| Homepage | 1280x720 | Hero, category grid, item grid |
| Homepage | 375x812 | Mobile layout |
| Item Detail | 1280x720 | Breadcrumbs, metadata, tags |
| Category | 1280x720 | Item grid with category header |
| Categories Index | 1280x720 | Category card grid |
| 404 Page | 1280x720 | Error page layout |

### Threshold Settings
- `maxDiffPixelRatio: 0.01` — Allow 1% pixel difference (anti-aliasing)
- `animations: 'disabled'` — Disable CSS animations for deterministic screenshots
- `mask: []` — Mask dynamic content (timestamps, etc.) if needed

## Dependencies
- Playwright (already installed)
- No additional packages needed — uses Playwright's built-in `toHaveScreenshot()`
