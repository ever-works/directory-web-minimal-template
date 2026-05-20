# Sample: Tech Events & Conferences Directory

> A reference implementation built by AI from the minimal template.
> Demonstrates an events vertical with date, location, and pricing metadata.

## What This Is

A working directory website for **Tech Events**, showcasing 10 events across 4 categories and 10 tags. Built using:

- The `@ever-works/web-minimal` template as the starting point
- `SKILLS.md` and `AGENTS.md` for AI guidance
- Claude Code (Opus 4.6) as the AI agent

## Features

- **10 tech events** — React Summit, Next Conf, AI Dev Summit, KubeCon Europe, GitHub Universe, MLOps Workshop, Mobile Dev Camp, React Meetup SF, Cloud Native Hackathon, Open Source Hackathon
- **4 categories** — Conference, Meetup, Workshop, Hackathon
- **10 tags** — AI, Web, Mobile, DevOps, Cloud, Open Source, Beginner Friendly, Networking, Hands-On, Keynote
- **2 curated collections** — Must-Attend 2026, Free Events
- **2 comparisons** — Side-by-side event comparisons
- **2 static pages** — About, Submit an Event
- **Event metadata** — Dates, location, format (Hybrid/In-Person/Virtual), price, speakers, attendee count
- **Modern Tailwind CSS design** — Clean, responsive, dark mode ready
- **SEO optimized** — Meta tags, Open Graph, JSON-LD structured data, sitemap
- **Extreme performance** — Fully static, zero unnecessary JS

## Content Structure

```
.content/
├── .works/works.yml    — Site config ("Tech Events", item_name: "Event")
├── categories.yml      — 4 event types (Conference, Meetup, Workshop, Hackathon)
├── tags.yml            — 10 tags (AI, Web, Cloud, Beginner Friendly, ...)
├── collections.yml     — 2 curated lists (Must-Attend 2026, Free Events)
├── comparisons/        — 2 event comparison pages
├── pages/              — Static pages (About, Submit)
└── data/
    └── <event-slug>/
        └── <event-slug>.yml  — Event data with meta (date, location, price, speakers)
```

## Pages

| Route | Description |
|---|---|
| `/` | Home — all events with search and filters |
| `/item/[slug]` | Event detail page with date, location, price |
| `/categories` | All categories listing |
| `/category/[slug]` | Events filtered by category |
| `/tags` | All tags listing |
| `/tag/[slug]` | Events filtered by tag |
| `/collections` | All curated collections |
| `/collection/[slug]` | Collection detail page |
| `/comparisons` | All comparisons |
| `/comparison/[slug]` | Side-by-side event comparison |
| `/pages/[slug]` | Static pages (About, Submit) |
| `/page/[page]` | Paginated event listings |

## How It Was Built

1. AI read `AGENTS.md` and `CLAUDE.md` to understand the template rules
2. AI created event-specific content data in `.content/` (config, categories, tags, items with rich metadata)
3. AI copied the template structure and configured plugins
4. AI applied Tailwind CSS styling to all headless components
5. AI built and verified — static pages, 0 errors

## Prompt Used

```
Implement a tech events directory website using the ever-works minimal
template. The directory should list tech conferences, meetups, workshops,
and hackathons with categories, tags (AI, Web, Cloud, etc.), dates,
locations, pricing, and a clean modern design with Tailwind CSS. Support
dark and light modes. Make it fully static and deployable to Vercel.
```

## Key Customizations

- **Event-specific vocabulary** — Items are called "Events" throughout the UI
- **Rich metadata** — Each event includes date range, location, format, price, speakers, and attendee count
- **Event type categories** — Conference, Meetup, Workshop, Hackathon for format filtering
- **Topic tags** — AI, Web, Mobile, DevOps, Cloud for technology filtering
- **Experience tags** — Beginner Friendly for accessibility filtering
- **Curated collections** — Hand-picked groupings like "Must-Attend 2026" and "Free Events"
- **Static pages** — About page and event submission guide

## Running Locally

```bash
# From monorepo root
pnpm dev --filter @ever-works/sample-events

# Or from this directory
pnpm dev
```

## Building

```bash
pnpm --filter @ever-works/sample-events build
# Output: apps/sample-events/dist/
```
