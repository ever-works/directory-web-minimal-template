# Feature: Static Pages

## Overview

Support rendering static content pages from the `.content/pages/` directory. These are markdown files that represent standalone pages like "About", "Privacy Policy", "Terms of Service", etc.

## Data Source

The reference template stores static pages as markdown files in `.content/pages/`:

```
.content/
├── pages/
│   ├── about.md
│   ├── privacy-policy.md
│   ├── terms-of-service.md
│   └── help.md
```

Each markdown file contains:
- YAML frontmatter with `title`, `description`, and optional metadata
- Markdown body content

## Data Type

```typescript
interface PageData {
    /** URL-safe slug derived from filename (e.g., "about", "privacy-policy") */
    slug: string;
    /** Page title from frontmatter */
    title: string;
    /** Page description from frontmatter */
    description?: string;
    /** Raw markdown content (body after frontmatter) */
    content: string;
    /** Pass-through for additional frontmatter fields */
    [key: string]: unknown;
}
```

## Implementation Plan

### 1. Core Package Changes

- Add `PageData` type to `packages/core/src/types/page.ts`
- Export from `packages/core/src/types/index.ts`
- Add `loadPages()` and `loadPage()` functions to `packages/core/src/loaders/page-loader.ts`
- Export from `packages/core/src/index.ts`
- Add pages to `ContentData` type
- Update `loadContent()` in content-reader.ts to include pages

### 2. Web App Changes

- Add `src/pages/pages/[slug].astro` route to `apps/web`

### 3. Sample Basic Changes

- Add `src/pages/pages/[slug].astro` route to `apps/sample-basic`

### 4. Tests

- Add unit tests for page-loader in core package

## Non-Goals

- No rich text editor
- No CMS integration
- No page creation UI
- No nested page routing (flat pages only)

## Dependencies

- `@ever-works/core` — New type + loader
- `yaml` / `gray-matter` — For frontmatter parsing (already used by existing loaders)
