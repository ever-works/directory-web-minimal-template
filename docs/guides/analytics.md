---
title: "Adding Analytics"
sidebar_label: "Analytics"
---

# Adding Analytics

The `@ever-works/plugin-analytics` plugin adds privacy-friendly analytics tracking to your directory site. It supports Plausible, Umami, Fathom, GA4, and a custom escape hatch.

## Quick Start

### 1. Register the plugin

In your `plugins.config.ts`:

```typescript
import { analyticsPlugin } from '@ever-works/plugin-analytics';

// Add to your definePlugins array:
analyticsPlugin({
    providers: [{ provider: 'plausible', domain: 'example.com' }],
}),
```

### 2. Add the component to your layout

In your base layout (e.g., `BaseLayout.astro`):

```astro
---
import AnalyticsScript from '@ever-works/ui/astro/AnalyticsScript.astro';
import type { ResolvedAnalyticsConfig } from '@ever-works/plugin-analytics';

// Get analytics config from content data
const contentData = await getContent();
const analyticsConfig = contentData._analytics as ResolvedAnalyticsConfig | undefined;
---

<head>
    <AnalyticsScript config={analyticsConfig} />
</head>
```

That's it. The plugin emits the correct `<script>` tags at build time.

## Provider Examples

### Plausible (recommended — cookieless, privacy-first)

```typescript
analyticsPlugin({
    providers: [{
        provider: 'plausible',
        domain: 'mysite.com',
    }],
})
```

Self-hosted Plausible with custom script:

```typescript
analyticsPlugin({
    providers: [{
        provider: 'plausible',
        domain: 'mysite.com',
        scriptHost: 'https://analytics.mysite.com',
        scriptFile: 'script.outbound-links.js',
    }],
})
```

### Umami (cookieless, self-hostable)

```typescript
analyticsPlugin({
    providers: [{
        provider: 'umami',
        websiteId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        scriptUrl: 'https://analytics.umami.is/script.js',
    }],
})
```

### Fathom (cookieless, simple)

```typescript
analyticsPlugin({
    providers: [{
        provider: 'fathom',
        siteId: 'ABCDEF',
    }],
})
```

### Google Analytics 4

```typescript
analyticsPlugin({
    providers: [{
        provider: 'ga4',
        measurementId: 'G-XXXXXXXXXX',
    }],
})
```

### Custom (escape hatch)

```typescript
analyticsPlugin({
    providers: [{
        provider: 'custom',
        html: '<script src="https://example.com/tracker.js" defer></script>',
    }],
})
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `providers` | `AnalyticsProviderConfig[]` | (required) | One or more provider configs |
| `respectDoNotTrack` | `boolean` | `true` | Honor browser's DNT header |
| `disableInDev` | `boolean` | `true` | No tracking during `astro dev` |
| `placement` | `'head' \| 'body-end'` | `'head'` | Where scripts are injected |

## Multiple Providers

Use multiple providers during migration or for redundancy:

```typescript
analyticsPlugin({
    providers: [
        { provider: 'plausible', domain: 'example.com' },
        { provider: 'ga4', measurementId: 'G-XXXXXXXXXX' },
    ],
})
```

## Privacy

- **Do-Not-Track** is honored by default. Set `respectDoNotTrack: false` to disable.
- **Dev mode** tracking is off by default. Set `disableInDev: false` to track in dev.
- **Plausible, Umami, Fathom** are cookieless by default.
- **GA4** anonymizes IP by default (`anonymizeIp: true`).

## Removing Analytics

Remove the `analyticsPlugin()` call from `plugins.config.ts`. Zero output when the plugin is not registered.
