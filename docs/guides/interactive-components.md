---
title: "Interactive Components"
sidebar_label: "Interactive Components"
---

# Interactive Components Guide

> How to integrate Preact interactive islands into your directory site.

## Available Components

The `@ever-works/ui` package includes 7 Preact components that run as Astro Islands:

| Component | Import Path | Purpose |
|-----------|------------|---------|
| `SearchInput` | `@ever-works/ui/preact/SearchInput` | Debounced text search |
| `FilterBar` | `@ever-works/ui/preact/FilterBar` | Category + tag toggle filters |
| `SortSelect` | `@ever-works/ui/preact/SortSelect` | Sort dropdown |
| `ThemeToggle` | `@ever-works/ui/preact/ThemeToggle` | Dark/light mode toggle |
| `BackToTop` | `@ever-works/ui/preact/BackToTop` | Scroll-to-top button |
| `LayoutSwitcher` | `@ever-works/ui/preact/LayoutSwitcher` | Grid/list/compact view toggle |
| `ItemBrowser` | `@ever-works/ui/preact/ItemBrowser` | Composed search + filter + sort island |

## Standalone Components

**ThemeToggle** and **BackToTop** work without data props:

```astro
---
import ThemeToggle from '@ever-works/ui/preact/ThemeToggle';
import BackToTop from '@ever-works/ui/preact/BackToTop';
---
<ThemeToggle client:load />
<BackToTop client:load showAfterPx={400} />
```

### Dark Mode Configuration

ThemeToggle sets `data-theme="dark"` on `<html>`. Configure Tailwind CSS v4:

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Add flash-prevention in `<head>`:

```html
<script is:inline>
    (function() {
        var stored = localStorage.getItem('theme-preference');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    })();
</script>
```

## Data-Driven Components

SearchInput, FilterBar, and SortSelect need callbacks. Compose them into a Preact island component. See `apps/sample-basic/src/components/ItemBrowser.tsx` for a complete reference.

## Styling

All components emit `data-component` and `data-part` attributes:

```css
[data-component="search-input"] [data-part="input"] { /* style input */ }
[data-component="filter-bar"] [data-part="category-option"][data-selected] { /* active state */ }
[data-component="sort-select"] [data-part="select"] { /* style dropdown */ }
[data-component="back-to-top"] { /* position and style button */ }
[data-component="theme-toggle"] { /* style toggle button */ }
```

See `apps/sample-basic/src/styles/global.css` for complete styling reference.
