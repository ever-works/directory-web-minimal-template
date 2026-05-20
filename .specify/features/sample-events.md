---
title: "Sample Events — Events & Conferences Directory"
status: complete
priority: medium
---

# Sample Events — Events & Conferences Directory

> Reference implementation: An events and conferences directory built by AI from the minimal template.

## Overview

`apps/sample-events/` is a vertical-specific sample demonstrating a tech events directory use case.
It follows the same architecture as `apps/sample-basic/` and `apps/sample-jobs/` but with event-listing content covering conferences, meetups, workshops, and hackathons.

## User Stories

- As an **AI agent**, I want a complete events reference implementation so I can follow the same patterns when building new directory sites for time-based content.
- As a **developer**, I want to see how the template handles date-based data, location fields, and price ranges in item listings.
- As a **visitor**, I want to browse upcoming tech events by category, tag, or search.
- As a **visitor**, I want to view detailed information about each event including dates, location, speakers, and pricing.
- As a **visitor**, I want to discover curated collections of events and compare similar ones side by side.
- As a **visitor**, I want to switch between dark and light modes.
- As a **visitor**, I want a fast, responsive experience on any device.

## Feature Overview

| Aspect | Detail |
|--------|--------|
| Directory name | Tech Events |
| Item type | Event |
| Items count | 10 curated events |
| Categories | 4 (Conference, Meetup, Workshop, Hackathon) |
| Tags | 10 (AI, Web, Mobile, DevOps, Cloud, Open Source, Beginner Friendly, Networking, Hands-On, Keynote) |
| Collections | 2 ("Must-Attend 2026", "Free Events") |
| Comparisons | 2 (react-summit-vs-next-conf, ai-dev-summit-vs-mlops-workshop) |
| Plugins | All 10 built-in plugins enabled (seo, pagination, filters, search, sort, sitemap, breadcrumbs, rss, analytics, related-items) |
| Styling | Tailwind CSS, modern clean design |
| Theme | Dark/light mode with system preference detection |
| Output | Fully static (Astro `output: 'static'`) |

## Content Data Structure

### Site Configuration (`.content/.works/works.yml`)

```yaml
company_name: "Tech Events"
item_name: "Event"
items_name: "Events"
copyright_year: 2026
app_url: "https://tech-events.example.com"

pagination:
  type: "standard"
  itemsPerPage: 12

settings:
  categories_enabled: true
  tags_enabled: true
```

### Categories (`.content/categories.yml`)

| ID | Name | Description |
|----|------|-------------|
| `conference` | Conference | Multi-day industry conferences with keynotes, tracks, and networking |
| `meetup` | Meetup | Local community gatherings for talks, demos, and socializing |
| `workshop` | Workshop | Hands-on training sessions focused on practical skills |
| `hackathon` | Hackathon | Competitive coding events where teams build projects in a fixed timeframe |

```yaml
- id: "conference"
  name: "Conference"
  description: "Multi-day industry conferences with keynotes, tracks, and networking"

- id: "meetup"
  name: "Meetup"
  description: "Local community gatherings for talks, demos, and socializing"

- id: "workshop"
  name: "Workshop"
  description: "Hands-on training sessions focused on practical skills"

- id: "hackathon"
  name: "Hackathon"
  description: "Competitive coding events where teams build projects in a fixed timeframe"
```

### Tags (`.content/tags.yml`)

| ID | Name | Description |
|----|------|-------------|
| `ai` | AI | Artificial intelligence, machine learning, and deep learning topics |
| `web` | Web | Frontend, backend, and full-stack web development |
| `mobile` | Mobile | iOS, Android, React Native, and cross-platform mobile development |
| `devops` | DevOps | CI/CD, infrastructure, containers, and platform engineering |
| `cloud` | Cloud | Cloud platforms, serverless, and distributed systems |
| `open-source` | Open Source | Open-source projects, communities, and contributions |
| `beginner-friendly` | Beginner Friendly | Accessible to newcomers with introductory-level content |
| `networking` | Networking | Strong emphasis on professional networking and community building |
| `hands-on` | Hands-On | Interactive sessions with live coding or lab exercises |
| `keynote` | Keynote | Features notable keynote speakers from the industry |

```yaml
- id: "ai"
  name: "AI"
  description: "Artificial intelligence, machine learning, and deep learning topics"
  isActive: true

- id: "web"
  name: "Web"
  description: "Frontend, backend, and full-stack web development"
  isActive: true

- id: "mobile"
  name: "Mobile"
  description: "iOS, Android, React Native, and cross-platform mobile development"
  isActive: true

- id: "devops"
  name: "DevOps"
  description: "CI/CD, infrastructure, containers, and platform engineering"
  isActive: true

- id: "cloud"
  name: "Cloud"
  description: "Cloud platforms, serverless, and distributed systems"
  isActive: true

- id: "open-source"
  name: "Open Source"
  description: "Open-source projects, communities, and contributions"
  isActive: true

- id: "beginner-friendly"
  name: "Beginner Friendly"
  description: "Accessible to newcomers with introductory-level content"
  isActive: true

- id: "networking"
  name: "Networking"
  description: "Strong emphasis on professional networking and community building"
  isActive: true

- id: "hands-on"
  name: "Hands-On"
  description: "Interactive sessions with live coding or lab exercises"
  isActive: true

- id: "keynote"
  name: "Keynote"
  description: "Features notable keynote speakers from the industry"
  isActive: true
```

### Collections (`.content/collections.yml`)

```yaml
- id: "must-attend-2026"
  name: "Must-Attend 2026"
  description: "The most anticipated tech events of 2026 that every developer should consider attending."
  items:
    - "react-summit"
    - "next-conf"
    - "ai-dev-summit"
    - "kubecon-europe"
    - "github-universe"

- id: "free-events"
  name: "Free Events"
  description: "High-quality tech events that are completely free to attend, either in-person or virtually."
  items:
    - "next-conf"
    - "react-meetup-sf"
    - "open-source-hackathon"
```

### Comparisons (`.content/comparisons/`)

#### react-summit-vs-next-conf

**File**: `.content/comparisons/react-summit-vs-next-conf/react-summit-vs-next-conf.yml`

```yaml
id: "react-summit-vs-next-conf"
name: "React Summit vs Next.js Conf"
description: "Comparing two premier React ecosystem conferences — a large in-person summit versus a free virtual event."
items:
  - "react-summit"
  - "next-conf"
```

#### ai-dev-summit-vs-mlops-workshop

**File**: `.content/comparisons/ai-dev-summit-vs-mlops-workshop/ai-dev-summit-vs-mlops-workshop.yml`

```yaml
id: "ai-dev-summit-vs-mlops-workshop"
name: "AI Dev Summit vs MLOps Workshop"
description: "A large-scale AI conference compared to an intensive hands-on workshop — different formats for learning AI and ML."
items:
  - "ai-dev-summit"
  - "mlops-workshop"
```

### Sample Items (`.content/data/<slug>/<slug>.yml`)

Each item follows the `ItemData` schema from `@ever-works/core`. Event-specific fields (dates, location, price, speakers) are stored in the `description` and as extended YAML fields that render in the item detail page.

#### 1. React Summit
```yaml
name: "React Summit"
description: "The largest React conference worldwide. Two days of talks, networking, and workshops covering React, Next.js, and the broader ecosystem. Held in Amsterdam with a hybrid online option."
source_url: "https://reactsummit.com"
category: "conference"
tags: ["web", "keynote", "networking"]
updated_at: "2026-02-10 10:00"
status: "approved"
featured: true
meta:
  date_start: "2026-06-12"
  date_end: "2026-06-13"
  location: "Amsterdam, Netherlands"
  format: "Hybrid"
  price: "$599"
  speakers: "Kent C. Dodds, Sara Vieira, Mark Erikson"
  attendees: "2000+"
```

#### 2. Next.js Conf
```yaml
name: "Next.js Conf"
description: "Vercel's annual conference dedicated to Next.js and the future of web development. Free virtual event with live demos, announcements, and community showcases."
source_url: "https://nextjs.org/conf"
category: "conference"
tags: ["web", "keynote", "beginner-friendly"]
updated_at: "2026-02-15 10:00"
status: "approved"
featured: true
meta:
  date_start: "2026-10-22"
  date_end: "2026-10-22"
  location: "Virtual"
  format: "Online"
  price: "Free"
  speakers: "Guillermo Rauch, Lee Robinson, Delba de Oliveira"
  attendees: "50000+"
```

#### 3. AI Dev Summit
```yaml
name: "AI Dev Summit"
description: "A three-day conference exploring the intersection of AI and software development. Covers LLMs, AI agents, code generation, and production ML systems."
source_url: "https://aidevsummit.example.com"
category: "conference"
tags: ["ai", "cloud", "keynote", "networking"]
updated_at: "2026-01-20 10:00"
status: "approved"
featured: true
meta:
  date_start: "2026-09-08"
  date_end: "2026-09-10"
  location: "San Francisco, CA"
  format: "In-Person"
  price: "$899"
  speakers: "Andrej Karpathy, Swyx, Simon Willison"
  attendees: "3000+"
```

#### 4. KubeCon Europe
```yaml
name: "KubeCon Europe"
description: "The Cloud Native Computing Foundation's flagship event for Kubernetes and cloud-native technologies. Features hundreds of sessions on containers, service mesh, and platform engineering."
source_url: "https://events.linuxfoundation.org/kubecon-cloudnativecon-europe"
category: "conference"
tags: ["devops", "cloud", "open-source", "networking"]
updated_at: "2026-01-18 10:00"
status: "approved"
featured: true
meta:
  date_start: "2026-03-17"
  date_end: "2026-03-20"
  location: "London, UK"
  format: "In-Person"
  price: "$1,100"
  speakers: "Kelsey Hightower, Liz Rice, Tim Hockin"
  attendees: "12000+"
```

#### 5. React Meetup SF
```yaml
name: "React Meetup SF"
description: "Monthly community meetup for React developers in the San Francisco Bay Area. Lightning talks, project showcases, and networking over food and drinks."
source_url: "https://reactmeetupsf.example.com"
category: "meetup"
tags: ["web", "networking", "beginner-friendly"]
updated_at: "2026-02-01 10:00"
status: "approved"
featured: false
meta:
  date_start: "2026-04-15"
  date_end: "2026-04-15"
  location: "San Francisco, CA"
  format: "In-Person"
  price: "Free"
  speakers: "Community speakers (rotating)"
  attendees: "80-120"
```

#### 6. MLOps Workshop
```yaml
name: "MLOps Workshop"
description: "An intensive two-day workshop on deploying and monitoring machine learning models in production. Covers model serving, feature stores, experiment tracking, and CI/CD for ML pipelines."
source_url: "https://mlopsworkshop.example.com"
category: "workshop"
tags: ["ai", "devops", "hands-on", "cloud"]
updated_at: "2026-01-25 10:00"
status: "approved"
featured: false
meta:
  date_start: "2026-05-19"
  date_end: "2026-05-20"
  location: "New York, NY"
  format: "In-Person"
  price: "$450"
  speakers: "Chip Huyen, Shreya Shankar"
  attendees: "100"
```

#### 7. GitHub Universe
```yaml
name: "GitHub Universe"
description: "GitHub's annual flagship conference showcasing the latest in developer tools, AI-powered coding, open-source collaboration, and DevOps workflows."
source_url: "https://githubuniverse.com"
category: "conference"
tags: ["devops", "open-source", "ai", "keynote"]
updated_at: "2026-02-05 10:00"
status: "approved"
featured: false
meta:
  date_start: "2026-11-04"
  date_end: "2026-11-05"
  location: "San Francisco, CA"
  format: "Hybrid"
  price: "$350"
  speakers: "Thomas Dohmke, Neha Batra, Devon Zuegel"
  attendees: "5000+"
```

#### 8. Mobile Dev Camp
```yaml
name: "Mobile Dev Camp"
description: "A weekend workshop covering cross-platform mobile development with React Native and Flutter. Build a complete app from scratch with guidance from experienced instructors."
source_url: "https://mobiledevcamp.example.com"
category: "workshop"
tags: ["mobile", "hands-on", "beginner-friendly"]
updated_at: "2026-01-30 10:00"
status: "approved"
featured: false
meta:
  date_start: "2026-07-11"
  date_end: "2026-07-12"
  location: "Austin, TX"
  format: "In-Person"
  price: "$250"
  speakers: "William Candillon, Fernando Rojo"
  attendees: "60"
```

#### 9. Open Source Hackathon
```yaml
name: "Open Source Hackathon"
description: "A 48-hour virtual hackathon focused on contributing to open-source projects. Mentors from top OSS projects guide participants through their first meaningful contributions."
source_url: "https://oshackathon.example.com"
category: "hackathon"
tags: ["open-source", "web", "beginner-friendly", "hands-on"]
updated_at: "2026-02-08 10:00"
status: "approved"
featured: false
meta:
  date_start: "2026-08-22"
  date_end: "2026-08-24"
  location: "Virtual"
  format: "Online"
  price: "Free"
  speakers: "Sindre Sorhus, Tanner Linsley, Anthony Fu"
  attendees: "500+"
```

#### 10. Cloud Native Hackathon
```yaml
name: "Cloud Native Hackathon"
description: "Build and deploy cloud-native applications in 36 hours. Teams compete to create the most innovative solution using Kubernetes, serverless, and modern cloud services. Prizes for top three teams."
source_url: "https://cloudnativehack.example.com"
category: "hackathon"
tags: ["cloud", "devops", "hands-on", "networking"]
updated_at: "2026-02-12 10:00"
status: "approved"
featured: false
meta:
  date_start: "2026-04-25"
  date_end: "2026-04-27"
  location: "Seattle, WA"
  format: "In-Person"
  price: "$50"
  speakers: "Judges from AWS, Google Cloud, Azure"
  attendees: "200"
```

### Static Pages (`.content/pages/`)

#### about.md

```markdown
---
title: "About Tech Events"
slug: "about"
---

Tech Events is a curated directory of the best technology conferences, meetups, workshops, and hackathons for developers. We help you discover events that match your interests, skill level, and budget.
```

#### submit.md

```markdown
---
title: "Submit an Event"
slug: "submit"
---

Want to list your tech event in our directory? We welcome submissions for conferences, meetups, workshops, and hackathons related to software development and technology.
```

## Pages

Same page routes as sample-basic and sample-jobs:

- `/` — Home with featured events, category grid, and search
- `/categories` — All categories
- `/category/[slug]` — Events in category
- `/tags` — All tags
- `/tag/[slug]` — Events with tag
- `/item/[slug]` — Event detail page
- `/collections` — All collections
- `/collection/[slug]` — Events in collection
- `/comparisons` — All comparisons
- `/comparison/[slug]` — Side-by-side comparison
- `/pages/[slug]` — Static content pages (about, submit)
- `/page/[page]` — Paginated listing
- `/404` — Not found page

### Home Page (`/`)

1. **Header** — Site name, navigation links (Home, Categories, Tags, Collections), dark/light mode toggle
2. **Hero Section** — Large heading ("Tech Events"), subtitle ("Discover conferences, meetups, workshops, and hackathons for developers"), search bar
3. **Category Grid** — 4 category cards in a responsive grid, each showing name, description, and event count
4. **Featured Events** — 4 featured events in a card grid with name, date range, location, category badge, and tag pills
5. **All Events** — Paginated grid of all events (12 per page) with sort controls
6. **Footer** — Copyright, site links

### Event Detail Page (`/item/[slug]`)

1. **Breadcrumbs** — Home > Category > Event Name
2. **Event Header** — Name (h1), description, date range badge, location, "Visit Website" button
3. **Meta Sidebar** — Category link, tag pills, format (In-Person / Online / Hybrid), price, speakers list, expected attendees, last updated date
4. **Content Body** — Markdown content (if present) rendered as HTML
5. **Related Events** — Up to 6 events from the same category

### Category Listing Page (`/category/[slug]`)

1. **Category Header** — Category name (h1), description, event count
2. **Filter Bar** — Sort by (name, date), tag filter chips
3. **Event Grid** — All events in this category, paginated
4. **Back to Categories** — Link back to category index

### Tag Listing Page (`/tag/[slug]`)

1. **Tag Header** — Tag name (h1), description, event count badge
2. **Event Grid** — All events with this tag, displayed as cards
3. **Related Tags** — Other tags frequently paired with this one

### Collection Page (`/collection/[slug]`)

1. **Collection Header** — Collection name (h1), description
2. **Event Grid** — All events in this collection, displayed as cards
3. **Back to Collections** — Link back to collections index

### Comparison Page (`/comparison/[slug]`)

1. **Comparison Header** — Comparison name (h1), description
2. **Side-by-Side Table** — Two events displayed in columns with matching rows for key fields (date, location, format, price, speakers, tags)
3. **Back to Comparisons** — Link back to comparisons index

### 404 Page

1. **Centered layout** — "Page Not Found" heading
2. **Helpful message** — Suggestion to browse categories or search for events
3. **Links** — Home, Categories, Tags

## Styling Approach

### Tailwind CSS v4

- Use `@tailwindcss/vite` plugin (Tailwind v4 API, not `@astrojs/tailwind` which is v3-only)
- Define design tokens in `global.css` via `@theme` directive
- Utility-first approach with semantic class composition for reusable patterns

### Design Tokens

```css
@theme {
  /* Colors — teal-based accent for events/calendar feel */
  --color-primary: #0d9488;
  --color-primary-hover: #0f766e;
  --color-bg: #ffffff;
  --color-bg-secondary: #f0fdfa;
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;

  /* Dark mode overrides via .dark class */
  --color-bg-dark: #0f172a;
  --color-bg-secondary-dark: #1e293b;
  --color-text-dark: #f1f5f9;
  --color-text-secondary-dark: #94a3b8;
  --color-border-dark: #334155;

  /* Spacing scale */
  --spacing-page: 1rem;
  --spacing-section: 3rem;

  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.1);
  --shadow-card-hover: 0 4px 12px rgb(0 0 0 / 0.15);
}
```

### Dark/Light Mode

- System preference detection via `prefers-color-scheme`
- Manual toggle button in the header (persists to `localStorage`)
- `.dark` class on `<html>` controls dark mode
- Preact island for the toggle (interactive, client-side only)

### Responsive Breakpoints

- **Mobile** (< 640px): Single column, stacked layout
- **Tablet** (640px - 1023px): Two-column grids
- **Desktop** (>= 1024px): Three-column grids, sidebar layouts

## Plugin Configuration

All 10 built-in plugins enabled in `plugins.config.ts`:

```typescript
import { definePlugins } from '@ever-works/plugins';
import { seoPlugin } from '@ever-works/plugin-seo';
import { paginationPlugin } from '@ever-works/plugin-pagination';
import { filtersPlugin } from '@ever-works/plugin-filters';
import { searchPlugin } from '@ever-works/plugin-search';
import { sortPlugin } from '@ever-works/plugin-sort';
import { sitemapPlugin } from '@ever-works/plugin-sitemap';
import { breadcrumbsPlugin } from '@ever-works/plugin-breadcrumbs';
import { rssPlugin } from '@ever-works/plugin-rss';
import { analyticsPlugin } from '@ever-works/plugin-analytics';
import { relatedItemsPlugin } from '@ever-works/plugin-related-items';

export const plugins = definePlugins([
    seoPlugin({
        titleTemplate: '%s | Tech Events',
    }),
    paginationPlugin({ itemsPerPage: 12 }),
    filtersPlugin(),
    searchPlugin(),
    sortPlugin({ defaultSort: 'name', defaultDirection: 'asc' }),
    sitemapPlugin(),
    breadcrumbsPlugin(),
    rssPlugin(),
    relatedItemsPlugin({ maxItems: 4 }),
    analyticsPlugin({
        providers: [{ provider: 'custom', html: '<!-- analytics: demo -->' }],
    }),
]);
```

## Build Verification Steps

1. `pnpm install` — All dependencies resolve
2. `pnpm --filter @ever-works/sample-events typecheck` — Zero TypeScript errors
3. `pnpm --filter @ever-works/sample-events build` — Static build succeeds
4. Verify generated pages exist:
   - `dist/index.html` — Home page
   - `dist/item/react-summit/index.html` — Event detail (one per event)
   - `dist/category/conference/index.html` — Category listing (one per category)
   - `dist/tag/ai/index.html` — Tag listing (one per tag)
   - `dist/categories/index.html` — Categories index
   - `dist/tags/index.html` — Tags index
   - `dist/collection/must-attend-2026/index.html` — Collection page
   - `dist/collections/index.html` — Collections index
   - `dist/comparison/react-summit-vs-next-conf/index.html` — Comparison page
   - `dist/comparisons/index.html` — Comparisons index
   - `dist/pages/about/index.html` — Static page
   - `dist/404.html` — Not found page
5. All pages contain valid HTML with proper meta tags
6. Dark mode toggle functions (Preact island hydrates)
7. No console errors in development server

## File Structure

```
apps/sample-events/
├── .content/
│   ├── .works/
│   │   └── works.yml
│   ├── categories.yml
│   ├── tags.yml
│   ├── collections.yml
│   ├── comparisons/
│   │   ├── react-summit-vs-next-conf/
│   │   │   └── react-summit-vs-next-conf.yml
│   │   └── ai-dev-summit-vs-mlops-workshop/
│   │       └── ai-dev-summit-vs-mlops-workshop.yml
│   ├── pages/
│   │   ├── about.md
│   │   └── submit.md
│   └── data/
│       ├── react-summit/
│       │   └── react-summit.yml
│       ├── next-conf/
│       │   └── next-conf.yml
│       ├── ai-dev-summit/
│       │   └── ai-dev-summit.yml
│       ├── kubecon-europe/
│       │   └── kubecon-europe.yml
│       ├── react-meetup-sf/
│       │   └── react-meetup-sf.yml
│       ├── mlops-workshop/
│       │   └── mlops-workshop.yml
│       ├── github-universe/
│       │   └── github-universe.yml
│       ├── mobile-dev-camp/
│       │   └── mobile-dev-camp.yml
│       ├── open-source-hackathon/
│       │   └── open-source-hackathon.yml
│       └── cloud-native-hackathon/
│           └── cloud-native-hackathon.yml
├── scripts/
│   └── clone-content.ts
├── src/
│   ├── components/
│   │   ├── BreadcrumbNav.astro   — Breadcrumb navigation component
│   │   └── ItemBrowser.tsx       — Preact item browsing island
│   ├── layouts/
│   │   └── BaseLayout.astro      — Styled root layout (header, footer, theme)
│   ├── lib/
│   │   ├── content.ts            — Content loading (same as web app)
│   │   └── plugins.config.ts     — Plugin configuration
│   ├── pages/
│   │   ├── index.astro           — Home (hero, search, categories, featured)
│   │   ├── categories.astro      — Categories index
│   │   ├── tags.astro            — Tags index
│   │   ├── collections.astro     — Collections index
│   │   ├── comparisons.astro     — Comparisons index
│   │   ├── 404.astro             — Not found
│   │   ├── rss.xml.ts            — RSS feed
│   │   ├── atom.xml.ts           — Atom feed
│   │   ├── robots.txt.ts         — robots.txt generation
│   │   ├── item/
│   │   │   └── [slug].astro      — Event detail
│   │   ├── category/
│   │   │   └── [slug].astro      — Category listing
│   │   ├── tag/
│   │   │   └── [slug].astro      — Tag listing
│   │   ├── collection/
│   │   │   └── [slug].astro      — Collection listing
│   │   ├── comparison/
│   │   │   └── [slug].astro      — Side-by-side comparison
│   │   ├── pages/
│   │   │   └── [slug].astro      — Static content pages
│   │   └── page/
│   │       └── [page].astro      — Paginated listing
│   └── styles/
│       └── global.css            — Tailwind v4 config + design tokens
├── astro.config.ts
├── package.json
└── tsconfig.json
```

## Dependencies

### Runtime
- `astro` ^6.1.9
- `@astrojs/preact` ^5.1.2
- `@astrojs/sitemap` ^3.7.2
- `@tailwindcss/vite` ^4.2.4
- `tailwindcss` ^4.2.4
- `preact` ^10.29.1
- `yaml` ^2.8.3
- `@ever-works/core` workspace:*
- `@ever-works/plugins` workspace:*
- `@ever-works/adapters` workspace:*
- `@ever-works/ui` workspace:*
- `@ever-works/astro-integration` workspace:*
- `@ever-works/plugin-seo` workspace:*
- `@ever-works/plugin-pagination` workspace:*
- `@ever-works/plugin-filters` workspace:*
- `@ever-works/plugin-search` workspace:*
- `@ever-works/plugin-sort` workspace:*
- `@ever-works/plugin-breadcrumbs` workspace:*
- `@ever-works/plugin-sitemap` workspace:*
- `@ever-works/plugin-rss` workspace:*
- `@ever-works/plugin-analytics` workspace:*
- `@ever-works/plugin-related-items` workspace:*

### Dev
- `@ever-works/tsconfig` workspace:*
- `@astrojs/check` ^0.9.8
- `pagefind` ^1.5.2
- `typescript` ^6.0.3

## Non-Goals

- **No registration or ticketing** — The directory lists event information only; users visit the event's own website to register
- **No payment processing** — No checkout, cart, or payment provider integration
- **No user accounts** — No authentication, saved events, or personal calendars
- **No real-time availability** — No live seat counts or waitlist management
- **No event creation** — Events are defined in YAML files, not via a CMS or admin panel

## Technical Notes

- The sample uses the same `content.ts` and `plugins.config.ts` pattern as `apps/web/` and `apps/sample-basic/`
- Event-specific metadata (dates, location, price, speakers) is stored in a `meta` object within each item's YAML file and rendered in the detail page sidebar
- Styling is applied directly in `.astro` files via Tailwind utility classes — no shared component styles
- The `ThemeToggle` is a Preact island (`client:load`) imported from `@ever-works/ui/preact/ThemeToggle` for client-side interactivity
- The `.content/` directory is checked into the sample app (not cloned from a remote repo) so it works without environment variables
- `clone-content.ts` is still included for consistency but `.content/` already exists, so it is a no-op
- Collections and comparisons demonstrate the full plugin feature set beyond what sample-basic covers

## CI Integration

Built in the E2E job of `.github/workflows/ci.yml` alongside sample-basic and sample-jobs.
