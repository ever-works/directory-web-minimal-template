# Feature: robots.txt Generation in SEO Plugin

## Summary

Extend `@ever-works/plugin-seo` with a `generateRobotsTxt()` utility function that produces a valid `robots.txt` string. This is rendered as a static page at `/robots.txt` in the Astro app.

## Goals

- Generate standards-compliant robots.txt content
- Reference sitemap.xml location
- Support configurable allow/disallow rules
- Support custom user-agent rules
- Pure function — no side effects

## Non-Goals

- Dynamic robots.txt based on environment
- Bot-specific complex rule sets (can be extended later)

## API

```typescript
interface RobotsTxtOptions {
    /** Base URL of the site for sitemap reference */
    siteUrl: string;
    /** Sitemap filename (default: 'sitemap-index.xml') */
    sitemapFilename?: string;
    /** Paths to disallow for all crawlers (default: []) */
    disallow?: string[];
    /** Paths to explicitly allow (default: ['/']) */
    allow?: string[];
    /** Additional user-agent specific rules */
    rules?: RobotsTxtRule[];
}

interface RobotsTxtRule {
    /** User-agent string (e.g., 'Googlebot', '*') */
    userAgent: string;
    /** Paths to allow */
    allow?: string[];
    /** Paths to disallow */
    disallow?: string[];
    /** Crawl delay in seconds */
    crawlDelay?: number;
}
```

### Output

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://example.com/sitemap-index.xml
```

## Implementation

1. Add `generateRobotsTxt()` to `@ever-works/plugin-seo`
2. Add types to `types.ts`
3. Create `robots.ts` utility file
4. Export from barrel
5. Add unit tests
6. Create `/robots.txt` page in web app and all samples

## Testing

- Generate with defaults
- Generate with custom disallow paths
- Generate with multiple user-agent rules
- Generate with crawl delay
- Sitemap URL included correctly

## Acceptance Criteria

- [ ] `pnpm typecheck` passes
- [ ] Unit tests pass
- [ ] Valid robots.txt format
- [ ] Sitemap reference correct
- [ ] All apps generate /robots.txt
