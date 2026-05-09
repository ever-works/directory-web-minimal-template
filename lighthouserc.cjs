/**
 * Lighthouse CI configuration.
 *
 * Tests representative pages from sample-basic against performance budgets.
 * Runs in CI via `.github/workflows/lighthouse.yml`.
 *
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */
module.exports = {
  ci: {
    collect: {
      // Start the preview server before running Lighthouse. The
      // `treosh/lighthouse-ci-action` (≥v10) does NOT accept `serverCommand` /
      // `serverReadyPattern` as action inputs (they emit `Unexpected input(s)`
      // warnings and are silently dropped). The supported entry point is the
      // `startServerCommand` / `startServerReadyPattern` config inside
      // `lighthouserc.cjs`, consumed by `lhci collect`. Without these, the
      // preview server never starts and Chrome hits a chrome-error://chromewebdata/
      // interstitial on every URL — exactly the failure mode observed in run
      // 25599075547. Keep this paired with the workflow's `Build sample-basic`
      // step so the `dist/` is ready before the server boots.
      startServerCommand: 'pnpm --filter @ever-works/sample-basic preview',
      startServerReadyPattern: 'localhost',
      // Test against the built sample-basic preview server. Only `/` is
      // listed because `apps/sample-basic/.content/` is gitignored (samples
      // pull data from external repos at runtime — see `.gitignore`'s
      // `.content/` rule); CI builds against an EMPTY `.content/` (the
      // FilesystemAdapter "tolerate missing dir" path landed in PR #3).
      // With no items / categories loaded, the dynamic routes
      // (`/item/<slug>/`, `/category/<slug>/`) generate no static paths and
      // serve 404s, which aborts `lhci collect` with an
      // `ERRORED_DOCUMENT_REQUEST` runtime error. The homepage and
      // `/categories/` index page render unconditionally because their
      // `.astro` sources tolerate empty arrays.
      url: [
        'http://localhost:4323/',
        'http://localhost:4323/categories/',
      ],
      // 3 runs per URL, take median for stable results
      numberOfRuns: 3,
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: '--no-sandbox',
        // Throttle to simulate real-world conditions
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        // Performance budget — warn on regression, don't block PRs
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      // Store results locally (no external LHCI server)
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
