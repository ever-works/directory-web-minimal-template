# Sample: Time Tracking Directory (Git Data)

> A reference implementation demonstrating the **Git data adapter**.
> Loads real-world content from a remote Git repository at build time.

## What This Is

A working directory website for **Time Tracking tools**, loading 3,200+ items from the [awesome-time-tracking-data](https://github.com/ever-works/awesome-time-tracking-data) repository. This sample demonstrates:

- **Git-backed content** — Data is cloned from a remote Git repo at build time (no local `.content/` folder checked in)
- **Dark-first theme** — shadcn/ui-inspired dark palette using zinc-based oklch colors
- **Large dataset handling** — Pagination, collapsible sections, and lazy loading for 3,200+ items

## Features

- **3,200+ items** from the awesome-time-tracking-data repository
- **100+ categories** and **200+ tags** with collapsible "show more" sections
- **Pagination** — 12 items per page with page navigation
- **Featured items** — Highlighted with amber badges and distinct card styling
- **Markdown rendering** — Item descriptions rendered with `marked`
- **Dark mode by default** — shadcn/ui dark theme
- **SEO optimized** — Meta tags, Open Graph, JSON-LD structured data, sitemap
- **Fully static** — Zero runtime JS except interactive Preact islands

## How It Works

1. `content.ts` passes default repo/branch config to the `GitAdapter` from `@ever-works/adapters`
2. On first request, `GitAdapter.init()` clones the data repository into `.content/` (shallow clone, single branch, idempotent)
3. All read operations are delegated to the `FilesystemAdapter` pointing at `.content/`
4. Astro statically generates all pages at build time

**No prebuild script needed** — the adapter handles cloning automatically.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATA_REPOSITORY` | `https://github.com/ever-works/awesome-time-tracking-data` | Git HTTPS URL for the data repository |
| `GITHUB_BRANCH` | `master` | Branch to clone |
| `GH_TOKEN` | — | GitHub PAT for private repos (optional) |
| `CONTENT_PATH` | — | Skip clone, use local path instead |

## Running Locally

```bash
# From monorepo root
pnpm run dev:sample-git

# Or via turbo
pnpm exec turbo run dev --filter=@ever-works/sample-git

# Or from this directory
pnpm dev
```

The GitAdapter will automatically clone the data repository on first request.

## Building

```bash
pnpm --filter @ever-works/sample-git build
# Output: apps/sample-git/dist/
```

## Architecture: ItemBrowser Divergence

The `sample-git` ItemBrowser (`src/components/ItemBrowser.tsx`, ~450 lines) is intentionally different from the other sample apps (~230 lines each). This is **by design** to handle the 3,200+ item dataset:

### Why it diverges

| Concern | sample-basic/jobs/events/real-estate | sample-git |
|---|---|---|
| **Data loading** | All items passed upfront as props | First page only; full dataset fetched lazily from `/api/items.json` on first interaction |
| **Initial HTML payload** | Small (~50KB for ~50 items) | Would be ~1.6MB without lazy loading; reduced to ~5KB |
| **Pagination** | None (all items shown) | Full pagination with page navigation (12 items/page) |
| **Category/Tag UI** | Shared `FilterBar` component | Custom grid cards with collapsible "Show all" sections (100+ categories, 200+ tags) |
| **Layout switching** | Uses shared `LayoutSwitcher` | Not applicable (custom card layout tuned for large datasets) |
| **Component imports** | `SearchInput`, `FilterBar`, `SortSelect`, `LayoutSwitcher` | `SearchInput` only (custom inline sort, custom filter UI) |

### Lazy loading pattern

```
Server renders first page (12 items) → fast initial paint (~5KB HTML)
                    ↓
User interacts (search/filter/sort/page) → fetch /api/items.json once (~200KB)
                    ↓
All subsequent filtering/sorting/pagination → client-side with full dataset
```

This divergence is intentional and should be preserved. Other sample apps can stay simple because their datasets are small (30-60 items).

## Customizing

To use a different data repository, create a `.env` file:

```env
DATA_REPOSITORY=https://github.com/your-org/your-data-repo
GITHUB_BRANCH=main
```

Or set environment variables directly in your CI/CD pipeline.
