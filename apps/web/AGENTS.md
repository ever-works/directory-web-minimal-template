# App Styling Guide for AI Agents

This app is the deployed directory website. When the Ever Works platform creates an AI-customized template, every visible UI edit should happen inside this directory.

## Styling Scope

Edit these surfaces first:

- `src/styles/global.css` for theme tokens, typography, spacing, page chrome, and shared component selectors.
- `src/layouts/BaseLayout.astro` for header/footer/main layout wrappers only.
- `src/pages/**/*.astro` for route-specific visible wrappers and classes.

Do not edit `src/lib/`, data loading, Astro config, package manifests, deployment files, or workspace packages under `../../packages/` for styling work. Shared UI components from `@ever-works/ui` are intentionally headless; style them with `[data-component]` and `[data-part]` selectors in `global.css`.

## Routes to Review

A professional customization must be coherent across the full directory surface:

- Homepage: `src/pages/index.astro`
- Paginated listings: `src/pages/page/[page].astro`
- Item detail: `src/pages/item/[slug].astro`
- Category index/detail: `src/pages/categories.astro`, `src/pages/category/[slug].astro`
- Tag index/detail: `src/pages/tags.astro`, `src/pages/tag/[slug].astro`
- Collection index/detail: `src/pages/collections.astro`, `src/pages/collection/[slug].astro`
- Comparison index/detail: `src/pages/comparisons.astro`, `src/pages/comparison/[slug].astro`
- Static content pages: `src/pages/pages/[slug].astro`
- Not found: `src/pages/404.astro`

Feed, sitemap, robots, and LLM text routes are data outputs and do not need visual styling.

## Quality Bar

- Keep the template static-first and fast: no new runtime dependencies for visual polish.
- Preserve `data-component`, `data-part`, `aria-*`, and `role` attributes.
- Cover light and dark mode using the existing `.dark` class.
- Make long item names, category names, URLs, tags, and comparison labels wrap without layout overlap.
- Keep contrast at WCAG AA or better.
