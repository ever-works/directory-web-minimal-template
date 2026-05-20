---
title: "Sample Real Estate — Property Listings Directory"
status: complete
priority: medium
---

# Sample Real Estate — Property Listings Directory

> Reference implementation: A real estate property listings directory built by AI from the minimal template.

## Overview

`apps/sample-real-estate/` is a vertical-specific sample demonstrating a property listings directory use case.
It follows the same architecture as `apps/sample-basic/`, `apps/sample-jobs/`, and `apps/sample-events/` but with real estate content covering apartments, houses, commercial spaces, and land.

## User Stories

- As an **AI agent**, I want a complete real estate reference implementation so I can follow the same patterns when building new directory sites for property/location-based content.
- As a **developer**, I want to see how the template handles price ranges, square footage, location data, and property-specific fields in item listings.
- As a **visitor**, I want to browse available properties by type, location, or feature tags.
- As a **visitor**, I want to view detailed information about each property including price, size, bedrooms, and amenities.
- As a **visitor**, I want to discover curated collections of properties and compare similar ones side by side.
- As a **visitor**, I want to switch between dark and light modes.
- As a **visitor**, I want a fast, responsive experience on any device.

## Feature Overview

| Aspect | Detail |
|--------|--------|
| Directory name | Dream Properties |
| Item type | Property |
| Items count | 10 curated listings |
| Categories | 4 (Apartment, House, Commercial, Land) |
| Tags | 10 (Downtown, Suburban, Waterfront, Garden, Parking, Furnished, Pet-Friendly, New Build, Investment, Luxury) |
| Collections | 2 ("Under $500K", "Luxury Collection") |
| Comparisons | 2 (downtown-loft-vs-suburban-house, office-space-vs-coworking) |
| Plugins | All 10 built-in plugins enabled (seo, pagination, filters, search, sort, sitemap, breadcrumbs, rss, analytics, related-items) |
| Styling | Tailwind CSS, modern clean design |
| Theme | Dark/light mode with system preference detection |
| Output | Fully static (Astro `output: 'static'`) |
| Brand color | Amber/warm (--color-brand: amber palette) |

## Content Data Structure

### Site Configuration (`.content/.works/works.yml`)

```yaml
company_name: "Dream Properties"
item_name: "Property"
items_name: "Properties"
copyright_year: 2026
app_url: "https://dream-properties.example.com"

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
| `apartment` | Apartment | Condos, lofts, and multi-unit dwellings in urban locations |
| `house` | House | Single-family homes, townhouses, and detached residences |
| `commercial` | Commercial | Office spaces, retail units, and mixed-use properties |
| `land` | Land | Vacant lots, development parcels, and agricultural land |

```yaml
- id: "apartment"
  name: "Apartment"
  description: "Condos, lofts, and multi-unit dwellings in urban locations"

- id: "house"
  name: "House"
  description: "Single-family homes, townhouses, and detached residences"

- id: "commercial"
  name: "Commercial"
  description: "Office spaces, retail units, and mixed-use properties"

- id: "land"
  name: "Land"
  description: "Vacant lots, development parcels, and agricultural land"
```

### Tags (`.content/tags.yml`)

| ID | Name | Description |
|----|------|-------------|
| `downtown` | Downtown | Located in the city center or business district |
| `suburban` | Suburban | Located in residential suburbs with good schools |
| `waterfront` | Waterfront | Ocean, lake, or river views and access |
| `garden` | Garden | Private garden, yard, or outdoor space |
| `parking` | Parking | Dedicated parking spaces or garage included |
| `furnished` | Furnished | Comes fully or partially furnished |
| `pet-friendly` | Pet-Friendly | Allows pets with no restrictions |
| `new-build` | New Build | Recently constructed or renovated property |
| `investment` | Investment | Strong rental yield or appreciation potential |
| `luxury` | Luxury | High-end finishes, premium amenities, prime location |

### Sample Items (`.content/data/<slug>/<slug>.yml`)

Each item follows the `ItemData` schema with property-specific `meta` fields.

#### 1. Downtown Loft
```yaml
name: "Downtown Loft"
description: "Stunning open-plan loft in a converted warehouse. Exposed brick, 14-foot ceilings, floor-to-ceiling windows with city skyline views. Walking distance to restaurants, galleries, and transit."
source_url: "https://dreamproperties.example.com/downtown-loft"
category: "apartment"
tags: ["downtown", "furnished", "luxury"]
updated_at: "2026-03-15 10:00"
status: "approved"
featured: true
meta:
  price: "$485,000"
  bedrooms: "1"
  bathrooms: "1"
  sqft: "1,200"
  location: "Portland, OR"
  year_built: "1920 (renovated 2024)"
  lot_size: "N/A"
  mls_number: "DP-2026-001"
```

#### 2. Suburban Family Home
```yaml
name: "Suburban Family Home"
description: "Spacious 4-bedroom home on a quiet cul-de-sac. Updated kitchen with granite countertops, hardwood floors throughout, large fenced backyard perfect for kids and pets."
source_url: "https://dreamproperties.example.com/suburban-family-home"
category: "house"
tags: ["suburban", "garden", "parking", "pet-friendly"]
updated_at: "2026-03-10 10:00"
status: "approved"
featured: true
meta:
  price: "$625,000"
  bedrooms: "4"
  bathrooms: "2.5"
  sqft: "2,400"
  location: "Austin, TX"
  year_built: "2018"
  lot_size: "0.25 acres"
  mls_number: "DP-2026-002"
```

#### 3. Waterfront Penthouse
```yaml
name: "Waterfront Penthouse"
description: "Ultra-luxury penthouse with panoramic ocean views. Private rooftop terrace, chef's kitchen, smart home system, and concierge service. Two reserved parking spots in secured garage."
source_url: "https://dreamproperties.example.com/waterfront-penthouse"
category: "apartment"
tags: ["waterfront", "luxury", "parking", "new-build"]
updated_at: "2026-02-28 10:00"
status: "approved"
featured: true
meta:
  price: "$2,850,000"
  bedrooms: "3"
  bathrooms: "3.5"
  sqft: "3,800"
  location: "Miami Beach, FL"
  year_built: "2025"
  lot_size: "N/A"
  mls_number: "DP-2026-003"
```

#### 4. Craftsman Bungalow
```yaml
name: "Craftsman Bungalow"
description: "Charming 1920s Craftsman with original details preserved. Built-in bookcases, window seats, wrap-around porch, and mature landscaping. Detached studio perfect for home office."
source_url: "https://dreamproperties.example.com/craftsman-bungalow"
category: "house"
tags: ["garden", "pet-friendly", "suburban"]
updated_at: "2026-03-05 10:00"
status: "approved"
featured: true
meta:
  price: "$445,000"
  bedrooms: "3"
  bathrooms: "2"
  sqft: "1,800"
  location: "Portland, OR"
  year_built: "1924"
  lot_size: "0.15 acres"
  mls_number: "DP-2026-004"
```

#### 5. Modern Office Space
```yaml
name: "Modern Office Space"
description: "Class A office space in a LEED-certified building. Open floor plan, private meeting rooms, fiber internet, and building amenities including gym, cafe, and rooftop lounge."
source_url: "https://dreamproperties.example.com/modern-office"
category: "commercial"
tags: ["downtown", "new-build", "parking"]
updated_at: "2026-03-01 10:00"
status: "approved"
featured: false
meta:
  price: "$1,200,000"
  bedrooms: "N/A"
  bathrooms: "4"
  sqft: "5,000"
  location: "Denver, CO"
  year_built: "2023"
  lot_size: "N/A"
  mls_number: "DP-2026-005"
```

#### 6. Coworking Retail Unit
```yaml
name: "Coworking Retail Unit"
description: "Street-level retail space ideal for coworking or boutique use. High foot traffic area, large storefront windows, ADA accessible, and shared courtyard."
source_url: "https://dreamproperties.example.com/coworking-retail"
category: "commercial"
tags: ["downtown", "furnished", "investment"]
updated_at: "2026-02-20 10:00"
status: "approved"
featured: false
meta:
  price: "$380,000"
  bedrooms: "N/A"
  bathrooms: "2"
  sqft: "2,200"
  location: "Nashville, TN"
  year_built: "2019"
  lot_size: "N/A"
  mls_number: "DP-2026-006"
```

#### 7. Lake House Retreat
```yaml
name: "Lake House Retreat"
description: "Peaceful lake house with private dock. Wraparound deck overlooking the water, stone fireplace, updated kitchen, and detached boat house. Perfect weekend getaway or Airbnb investment."
source_url: "https://dreamproperties.example.com/lake-house"
category: "house"
tags: ["waterfront", "garden", "investment", "pet-friendly"]
updated_at: "2026-03-12 10:00"
status: "approved"
featured: false
meta:
  price: "$520,000"
  bedrooms: "3"
  bathrooms: "2"
  sqft: "2,100"
  location: "Lake Tahoe, CA"
  year_built: "1985 (renovated 2022)"
  lot_size: "0.5 acres"
  mls_number: "DP-2026-007"
```

#### 8. Development Parcel
```yaml
name: "Development Parcel"
description: "Prime development land zoned for mixed-use. Utilities at the lot line, environmental assessment completed, and architectural plans available for a 12-unit residential project."
source_url: "https://dreamproperties.example.com/dev-parcel"
category: "land"
tags: ["investment", "downtown", "new-build"]
updated_at: "2026-02-25 10:00"
status: "approved"
featured: false
meta:
  price: "$750,000"
  bedrooms: "N/A"
  bathrooms: "N/A"
  sqft: "N/A"
  location: "Portland, OR"
  year_built: "N/A"
  lot_size: "0.4 acres"
  mls_number: "DP-2026-008"
```

#### 9. Micro Studio
```yaml
name: "Micro Studio"
description: "Efficiently designed studio in a brand-new micro-housing development. Murphy bed, kitchenette, in-unit laundry, and rooftop community space. Ideal for young professionals."
source_url: "https://dreamproperties.example.com/micro-studio"
category: "apartment"
tags: ["downtown", "new-build", "furnished"]
updated_at: "2026-03-08 10:00"
status: "approved"
featured: false
meta:
  price: "$195,000"
  bedrooms: "Studio"
  bathrooms: "1"
  sqft: "350"
  location: "Seattle, WA"
  year_built: "2025"
  lot_size: "N/A"
  mls_number: "DP-2026-009"
```

#### 10. Farmland Acreage
```yaml
name: "Farmland Acreage"
description: "Productive farmland with irrigation rights and fertile soil. Includes a small barn, equipment shed, and well. Currently leased for organic vegetable farming."
source_url: "https://dreamproperties.example.com/farmland"
category: "land"
tags: ["investment", "suburban", "pet-friendly"]
updated_at: "2026-02-18 10:00"
status: "approved"
featured: false
meta:
  price: "$320,000"
  bedrooms: "N/A"
  bathrooms: "N/A"
  sqft: "N/A"
  location: "Willamette Valley, OR"
  year_built: "N/A"
  lot_size: "10 acres"
  mls_number: "DP-2026-010"
```

### Static Pages (`.content/pages/`)

#### about.md
```markdown
---
title: "About Dream Properties"
slug: "about"
---

Dream Properties is a curated directory of the best real estate listings. We help you find your perfect home, investment property, or commercial space.
```

#### contact.md
```markdown
---
title: "Contact Us"
slug: "contact"
---

Interested in a property? Our team of licensed agents is ready to help you schedule viewings, negotiate offers, and close deals.
```

### Collections (`.content/collections.yml`)

```yaml
- id: "under-500k"
  name: "Under $500K"
  description: "Quality properties at an accessible price point — great first homes and investment opportunities."
  items:
    - "downtown-loft"
    - "craftsman-bungalow"
    - "coworking-retail"
    - "micro-studio"
    - "farmland-acreage"

- id: "luxury-collection"
  name: "Luxury Collection"
  description: "Premium properties with exceptional finishes, prime locations, and top-tier amenities."
  items:
    - "waterfront-penthouse"
    - "suburban-family-home"
    - "lake-house-retreat"
```

### Comparisons (`.content/comparisons/`)

#### downtown-loft-vs-suburban-house

```yaml
title: "Downtown Loft vs Suburban Family Home"
item_a_slug: "downtown-loft"
item_b_slug: "suburban-family-home"
item_a_name: "Downtown Loft"
item_b_name: "Suburban Family Home"
summary: "City loft living versus suburban family home — comparing lifestyle, space, and value."
verdict: "The loft suits single professionals or couples who value walkability and urban culture. The suburban home is ideal for families needing space, a yard, and quieter surroundings."
verdict_winner: "tie"
dimensions:
  - name: "Price"
    item_a_summary: "$485,000 for 1,200 sqft"
    item_b_summary: "$625,000 for 2,400 sqft"
    item_a_score: 7
    item_b_score: 8
    winner: "item_b"
  - name: "Location"
    item_a_summary: "Downtown Portland, walkable to everything"
    item_b_summary: "Quiet Austin suburb, car-dependent"
    item_a_score: 9
    item_b_score: 6
    winner: "item_a"
  - name: "Space"
    item_a_summary: "1 bed / 1 bath, open-plan living"
    item_b_summary: "4 bed / 2.5 bath, fenced yard"
    item_a_score: 5
    item_b_score: 9
    winner: "item_b"
  - name: "Investment Potential"
    item_a_summary: "Strong rental market in downtown area"
    item_b_summary: "Good appreciation in growing suburb"
    item_a_score: 8
    item_b_score: 8
    winner: "tie"
```

#### office-space-vs-coworking

```yaml
title: "Modern Office vs Coworking Retail Unit"
item_a_slug: "modern-office"
item_b_slug: "coworking-retail"
item_a_name: "Modern Office Space"
item_b_name: "Coworking Retail Unit"
summary: "Comparing a premium Class A office to a street-level coworking space for small business owners."
verdict: "The Class A office is best for established companies needing prestige and privacy. The retail coworking space offers better street presence and lower entry cost for startups and boutiques."
verdict_winner: "tie"
dimensions:
  - name: "Price"
    item_a_summary: "$1,200,000 for 5,000 sqft"
    item_b_summary: "$380,000 for 2,200 sqft"
    item_a_score: 5
    item_b_score: 9
    winner: "item_b"
  - name: "Visibility"
    item_a_summary: "Upper-floor office, limited street presence"
    item_b_summary: "Street-level with large storefront windows"
    item_a_score: 5
    item_b_score: 9
    winner: "item_b"
  - name: "Amenities"
    item_a_summary: "Gym, cafe, rooftop, fiber internet"
    item_b_summary: "Shared courtyard, basic utilities"
    item_a_score: 9
    item_b_score: 6
    winner: "item_a"
  - name: "Prestige"
    item_a_summary: "LEED-certified Class A building"
    item_b_summary: "Trendy neighborhood retail space"
    item_a_score: 9
    item_b_score: 7
    winner: "item_a"
```

## Pages

Same page routes as other sample apps:

- `/` — Home with featured properties, category grid, and search
- `/categories` — All categories
- `/category/[slug]` — Properties in category
- `/tags` — All tags
- `/tag/[slug]` — Properties with tag
- `/item/[slug]` — Property detail page
- `/collections` — All collections
- `/collection/[slug]` — Properties in collection
- `/comparisons` — All comparisons
- `/comparison/[slug]` — Side-by-side comparison
- `/pages/[slug]` — Static content pages (about, contact)
- `/page/[page]` — Paginated listing
- `/404` — Not found page

## Non-Goals

- **No payment processing** — No checkout, escrow, or payment provider integration
- **No user accounts** — No authentication, saved searches, or favorites
- **No real-time availability** — No live listing status updates
- **No property creation** — Properties are defined in YAML files, not via a CMS
- **No map integration** — No Google Maps or Mapbox embedding (future plugin)
- **No mortgage calculator** — No financial tools (future plugin)

## Technical Notes

- Port 4326 (avoids conflicts with web:4321, sample-basic:4323, sample-jobs:4324, sample-events:4325)
- Amber brand color palette to differentiate from other samples
- Property-specific metadata (price, bedrooms, sqft, location) stored in `meta` object
- Same `content.ts` and `plugins.config.ts` pattern as all other sample apps
- `.content/` directory checked into the app (no remote clone needed)
