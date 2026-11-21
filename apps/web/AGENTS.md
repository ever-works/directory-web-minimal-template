# App Styling Guide for AI Agents

This app is the deployed directory website. When the Ever Works platform creates an AI-customized template, every visible UI edit should happen inside this directory.

## Styling Scope

Do all styling in **`src/styles/theme.css`**. It is plain CSS loaded after `global.css`, so anything there wins, and plain CSS cannot break the build. Override the design tokens (`--primary`, `--background`, `--radius`, …) and style the `[data-component]`/`[data-part]` hooks documented inside that file.

Do not edit any other file for styling. In particular, leave alone:

- `src/styles/global.css` — framework wiring and neutral defaults (`@import`, `@source`, `@theme`, base resets). Editing it risks build failures.
- `src/layouts/BaseLayout.astro`, `src/pages/**/*.astro` — markup/logic. Restyle via the `data-*` hooks in `theme.css` instead of touching these.
- `src/lib/`, Astro config, package manifests, deployment files, and workspace packages under `../../packages/`.

Shared `@ever-works/ui` components already carry neutral defaults and expose `[data-component]`/`[data-part]` attributes — re-skin them from `theme.css`, never by editing the package.

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
- Submit: `src/pages/submit.astro`; legal: `src/pages/legal.astro`
- Chrome shared by every route: `DirectoryHeader` (search dialog, display settings, theme toggle), `DirectoryFooter`, `DirectoryBrowser` (listings) from `@ever-works/ui`

Feed, sitemap, robots, LLM text, `/data/*.json`, `/.well-known/*` and `/mcp` are data outputs and do not need visual styling.

Visitor preferences are attributes on `<html>`: `data-layout="classic|grid"`, `data-view="grid|list|compact"`, `data-width="fixed|full"`, `data-pagination="standard|infinite"`, plus the `.dark` class. Style per layout with selectors like `html[data-layout="grid"] [data-component="directory-browser"]`.

## Quality Bar

- Keep the template static-first and fast: no new runtime dependencies for visual polish.
- Preserve `data-component`, `data-part`, `aria-*`, and `role` attributes.
- Cover light and dark mode using the existing `.dark` class.
- Make long item names, category names, URLs, tags, and comparison labels wrap without layout overlap.
- Keep contrast at WCAG AA or better.
