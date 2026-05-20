# Sample: Property Listings Directory

> A reference implementation built by AI from the minimal template.
> Demonstrates a real estate vertical with pricing, location, and property-specific metadata.

## What This Is

A working directory website for **Dream Properties**, showcasing 10 property listings across 4 categories and 10 tags. Built using:

- The `@ever-works/web-minimal` template as the starting point
- `SKILLS.md` and `AGENTS.md` for AI guidance
- Claude Code (Opus 4.6) as the AI agent

## Features

- **10 property listings** — Waterfront Penthouse, Downtown Loft, Suburban Family Home, Lake House Retreat, Craftsman Bungalow, Modern Office, Micro Studio, Coworking Retail, Development Parcel, Farmland Acreage
- **4 categories** — Apartment, House, Commercial, Land
- **10 tags** — Downtown, Suburban, Waterfront, Garden, Parking, Furnished, Pet-Friendly, New Build, Investment, Luxury
- **2 curated collections** — Under $500K, Luxury Collection
- **2 comparisons** — Side-by-side property comparisons
- **2 static pages** — About, Contact
- **Property metadata** — Price, bedrooms, bathrooms, square footage, location, year built, lot size, MLS number
- **Modern Tailwind CSS design** — Clean, responsive, dark mode ready
- **SEO optimized** — Meta tags, Open Graph, JSON-LD structured data, sitemap
- **Extreme performance** — Fully static, zero unnecessary JS

## Content Structure

```
.content/
├── .works/works.yml    — Site config ("Dream Properties", item_name: "Property")
├── categories.yml      — 4 property types (Apartment, House, Commercial, Land)
├── tags.yml            — 10 tags (Downtown, Waterfront, Luxury, Pet-Friendly, ...)
├── collections.yml     — 2 curated lists (Under $500K, Luxury Collection)
├── comparisons/        — 2 property comparison pages
├── pages/              — Static pages (About, Contact)
└── data/
    └── <property-slug>/
        └── <property-slug>.yml  — Property data with meta (price, beds, baths, sqft, location)
```

## Pages

| Route | Description |
|---|---|
| `/` | Home — all properties with search and filters |
| `/item/[slug]` | Property detail page with price, specs, location |
| `/categories` | All categories listing |
| `/category/[slug]` | Properties filtered by category |
| `/tags` | All tags listing |
| `/tag/[slug]` | Properties filtered by tag |
| `/collections` | All curated collections |
| `/collection/[slug]` | Collection detail page |
| `/comparisons` | All comparisons |
| `/comparison/[slug]` | Side-by-side property comparison |
| `/pages/[slug]` | Static pages (About, Contact) |
| `/page/[page]` | Paginated property listings |

## How It Was Built

1. AI read `AGENTS.md` and `CLAUDE.md` to understand the template rules
2. AI created real estate content data in `.content/` (config, categories, tags, items with property metadata)
3. AI copied the template structure and configured plugins
4. AI applied Tailwind CSS styling to all headless components
5. AI built and verified — static pages, 0 errors

## Prompt Used

```
Implement a property listings directory website using the ever-works
minimal template. The directory should list properties for sale with
categories (Apartment, House, Commercial, Land), tags (Waterfront,
Luxury, Pet-Friendly, etc.), pricing, bedroom/bathroom counts, square
footage, and a clean modern design with Tailwind CSS. Support dark and
light modes. Make it fully static and deployable to Vercel.
```

## Key Customizations

- **Real estate vocabulary** — Items are called "Properties" throughout the UI
- **Rich property metadata** — Price, bedrooms, bathrooms, square footage, location, year built, lot size, MLS number
- **Property type categories** — Apartment, House, Commercial, Land for broad filtering
- **Location tags** — Downtown, Suburban, Waterfront for area-based filtering
- **Feature tags** — Garden, Parking, Furnished, Pet-Friendly for amenity filtering
- **Value tags** — Investment, Luxury, New Build for buyer intent filtering
- **Curated collections** — Price-based groupings like "Under $500K" and "Luxury Collection"
- **Static pages** — About page and contact information

## Running Locally

```bash
# From monorepo root
pnpm dev --filter @ever-works/sample-real-estate

# Or from this directory
pnpm dev
```

## Building

```bash
pnpm --filter @ever-works/sample-real-estate build
# Output: apps/sample-real-estate/dist/
```
