# Feature: Directory Experience v2 ("feels full, stays minimal")

> Status: implemented 2026-11-21. Owner request: the minimal template is now the default for Ever Works directories
> (hosted as static sites on Cloudflare). It must feel as complete as the full Next.js template for visitors — search,
> filters, layouts, theme switch, submit flow, logos, similar items, real header/footer, strong SEO — while staying a
> static, fast-building Astro site with a few KB of vanilla JavaScript.

## Constraints (unchanged minimal-template rules)

- Static output only (`ENABLE_ISR=false` must keep working; Cloudflare/nginx/S3 serve it). No server, DB, auth.
- No new runtime dependencies. Client code is vanilla TypeScript bundled by Astro (no Preact on the default site);
  every script is small, deferred, and only does work when the visitor interacts.
- Every new element carries `data-component` / `data-part` hooks so the platform's `theme.css` customization keeps
  working. Existing hooks are preserved.
- Existing `@ever-works/ui` components keep their current behaviour (the sample apps and their E2E suites use them);
  new building blocks are added next to them.
- Build time grows linearly and cheaply: no per-page network calls, no image processing, one extra JSON per item.

## Configuration (read from the data repo's `.works/works.yml`)

The platform already writes these keys (they were ignored before). `resolveSiteSettings(config)` in
`@ever-works/core` normalizes them with safe defaults:

| works.yml key | Meaning in the minimal template | Default |
| --- | --- | --- |
| `settings.header.submit_enabled` | "Submit" button in header + `/submit` page | `true` |
| `settings.header.layout_enabled` | Display-settings menu (layout / width / pagination / view) | `true` |
| `settings.header.theme_enabled` | Light/dark toggle in header | `true` |
| `settings.header.layout_default` | `home1`/`classic` → Classic (sidebar); `home2`/`grid`/`modern` → Modern Grid | `classic` |
| `settings.header.pagination_default` | `standard` or `infinite` | `standard` |
| `settings.header.theme_default` | `light`, `dark` or `system` (used until the visitor picks one) | `system` |
| `settings.homepage.hero_enabled` | Hero block on the homepage | `true` |
| `settings.homepage.search_enabled` | Search box in hero + listing toolbar | `true` |
| `settings.homepage.default_view` | Card view: `grid` (also `classic`, `cards`, `masonry`), `list`, `compact` | `grid` |
| `settings.homepage.default_sort` | `featured` (also `popularity`), `name-asc`, `name-desc`, `date-desc`, `date-asc` | `featured` |
| `settings.footer.theme_selector_enabled` | Light/Dark/System selector in footer | `true` |
| `settings.footer.version_enabled` | Shows `version` in footer | `true` |
| `settings.footer.subscribe_enabled` + `newsletter_url` | Newsletter form (posts to the given URL); hidden without a URL | off |
| `settings.categories_enabled` / `tags_enabled` / `collections_enabled` / `comparisons_enabled` | Hide the section from nav/footer when `false` | `true` |
| `custom_menu.header` / `custom_menu.footer` (`{label, path, target}`) and legacy `custom_header` / `custom_footer` (`{label, href, external}`) | Extra nav links | none |
| `logo.logo_image`, `logo.logo_image_dark`, `logo.favicon` | Site logo (dark variant swapped in dark mode); favicon | monogram + generated SVG favicon |
| `pagination.itemsPerPage` | Page size | `12` |
| `submit` (`{ url?, email?, github?: boolean }`) | Submission target overrides (see Submit) | GitHub when the data repo is a public GitHub repo |
| `social` (`{ github?, x?, linkedin?, facebook?, youtube?, discord?, website?, email? }`) | Footer social icons | none |
| `description` / `tagline` | Site description (else `homepage.hero_description`, else first paragraph of `markdown/header.md`) | generated |

## Surfaces

### Header
Logo (image with dark variant, or monogram + name), primary nav with active state (Home, Categories, Tags,
Collections, Comparisons when enabled and non-empty, plus custom links), search button (opens the search dialog;
`/` and `Ctrl/⌘+K` shortcuts), display-settings menu, theme toggle, "Submit" button, mobile menu (`<details>`).

### Search dialog
Native `<dialog>`. Lazy-loads `/data/search-index.json` on first open (compact index: names, short descriptions,
category/tag lookup tables). Instant ranked results (shared ranking from `@ever-works/plugin-search/rank`) for items,
plus matching categories and tags; arrow-key navigation, Enter opens, "See all results" goes to `/?q=<query>`.

### Listing (homepage, category, tag pages)
Server-rendered first page (works without JS, good for SEO). A vanilla "directory browser" script enhances it:
search, multi-select category and tag filters, 5 sort orders, view (grid/list/compact), standard pagination or
infinite scroll, result count, clear-all, and URL state (`?q=`, `?category=a,b`, `?tag=a,b`, `?sort=`, `?page=`), so
filtered views are shareable and `WebSite` `SearchAction` (`/?q={search_term_string}`) works. The index is loaded
only when the visitor interacts or the URL already carries filter state.

Layouts (switchable in the display-settings menu, default from config, remembered in `localStorage`, applied before
first paint by an inline script, so there is no layout flash):
- **Classic** — sticky left sidebar (search, categories with counts and icons, popular tags) + results.
- **Modern Grid** — no sidebar; a filter bar (search, sort, tags) with a category chip row above the results.
- **Content width** — Fixed (`max-w-7xl`) or Full width.
- **Pagination** — Standard (numbered pages; static `/page/N` routes for crawlers) or Infinite scroll.

### Homepage
Hero (title, description, search box, stats: items / categories / tags), featured section (when items are
featured), the listing, "Browse by category" cards (icons from `icon_svg`, rendered safely as CSS masks), and a
"Submit" call-to-action band.

### Item page
Logo (fallback chain: `icon_url` → `brand_logo_url` → website favicon → monogram), name, featured badge, description,
"Visit website" (and sticky mobile CTA), share (copy link, X, LinkedIn, email), categories, tags, info card (website,
publisher/brand, last updated), screenshot gallery (`images`, broken images hide themselves), rendered Markdown,
"Alternatives to <name>" (related items by shared tags + category via `@ever-works/plugin-related-items`),
previous/next in the same category, and "Suggest an edit" (GitHub edit link when the data repo is public on GitHub).

### Submit page (`/submit`)
Form: name, website, description, category, tags, contact email, notes. No-backend targets, in order of
preference: `submit.url` (external form, e.g. a platform form) → GitHub pull request (the form pre-fills GitHub's
"create new file" page with `data/<slug>/<slug>.yml`, so GitHub forks the repo and opens a PR for the visitor) or a
pre-filled GitHub issue → `submit.email` (mailto). Without JavaScript the page still offers the direct links.
Repository visibility is checked once at build time; private repos never get GitHub links.

### Footer
Brand column (logo, description, social icons), Browse (top categories + all categories), Explore (tags,
collections, comparisons, submit, custom footer links), Resources (static pages, legal page from
`markdown/footer.md`, RSS/Atom/JSON feeds, `llms.txt`, Data API, MCP, sitemap), bottom bar (copyright, version,
theme selector, "Built with Ever Works").

### Other
Back-to-top button, generated SVG favicon when none configured, `/legal` page rendering `markdown/footer.md`.

## SEO (see also agent-access.md)
Absolute canonical on every page; descriptive titles (no "Home |"); meta descriptions from real data trimmed to
~155 chars; Open Graph + Twitter (item image/logo when available); JSON-LD: `WebSite` + `SearchAction`,
`Organization`, `ItemList`/`CollectionPage` on listings, `SoftwareApplication` on items (no fabricated ratings),
absolute `BreadcrumbList`; sitemap `lastmod` from item `updated_at`; robots allows AI crawlers and data endpoints;
`theme-color`; image `width`/`height` to avoid layout shift.

## Performance budget
- JS on a typical page: < 10 KB gzip total (theme + header + browser), nothing executes until interaction except
  the inline theme/layout script (< 1 KB).
- Search index: ~70 bytes/item gzip (3,200 items ≈ 220 KB brotli), fetched lazily, cached by the browser.
- Build: CRM directory (90 items) builds in about the same time as before plus one JSON per item.
