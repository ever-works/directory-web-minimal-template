# @ever-works/plugin-analytics

Privacy-friendly, multi-provider analytics plugin for the Ever Works minimal directory template. Supports Plausible, Umami, Fathom, GA4, and a custom escape hatch.

## Installation

Already included in the monorepo. Add to your `plugins.config.ts`:

```typescript
import { analyticsPlugin } from '@ever-works/plugin-analytics';
import { definePlugins } from '@ever-works/plugins';

export default definePlugins([
    analyticsPlugin({
        providers: [{ provider: 'plausible', domain: 'example.com' }],
    }),
]);
```

## Providers

### Plausible

```typescript
{ provider: 'plausible', domain: 'example.com' }
{ provider: 'plausible', domain: 'example.com', scriptHost: 'https://analytics.example.com', scriptFile: 'script.outbound-links.js' }
```

### Umami

```typescript
{ provider: 'umami', websiteId: 'a1b2c3d4-...', scriptUrl: 'https://analytics.umami.is/script.js' }
```

### Fathom

```typescript
{ provider: 'fathom', siteId: 'ABCDEF' }
{ provider: 'fathom', siteId: 'ABCDEF', scriptHost: 'https://my-fathom.example.com' }
```

### GA4

```typescript
{ provider: 'ga4', measurementId: 'G-XXXXXXXXXX' }
{ provider: 'ga4', measurementId: 'G-XXXXXXXXXX', anonymizeIp: false }
```

### Custom

```typescript
{ provider: 'custom', html: '<script src="https://example.com/tracker.js" defer></script>' }
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `providers` | `AnalyticsProviderConfig[]` | (required) | One or more analytics provider configurations |
| `respectDoNotTrack` | `boolean` | `true` | Honor the browser's Do-Not-Track header |
| `disableInDev` | `boolean` | `true` | Disable tracking in dev mode |
| `placement` | `'head' \| 'body-end'` | `'head'` | Where to inject script tags |

## Multi-provider

Supports multiple providers simultaneously (e.g., during migration):

```typescript
analyticsPlugin({
    providers: [
        { provider: 'plausible', domain: 'example.com' },
        { provider: 'ga4', measurementId: 'G-XXXXXXXXXX' },
    ],
})
```

## Privacy

- **Do-Not-Track**: Honored by default (`respectDoNotTrack: true`)
- **Cookieless**: Plausible, Umami, and Fathom are cookieless by default
- **IP anonymization**: GA4 anonymizes IP by default (`anonymizeIp: true`)
- **Dev mode**: Tracking disabled in dev by default (`disableInDev: true`)

## UI Component

Add `<AnalyticsScript />` from `@ever-works/ui` to your layout:

```astro
---
import { AnalyticsScript } from '@ever-works/ui/astro';
---
<html>
  <head>
    <AnalyticsScript config={analyticsConfig} />
  </head>
</html>
```
