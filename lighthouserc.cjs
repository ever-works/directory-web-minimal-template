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
      // Test against the built sample-basic preview server
      url: [
        'http://localhost:4323/',
        'http://localhost:4323/item/radix-ui/',
        'http://localhost:4323/category/form-components/',
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
