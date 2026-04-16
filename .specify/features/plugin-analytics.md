# Feature: Analytics Plugin

## Summary

Add `@ever-works/plugin-analytics` — a plugin that emits analytics tracking scripts for directory sites. Supports privacy-friendly providers (Plausible, Umami, Fathom), Google Analytics 4 (GA4), and a custom provider escape hatch. The plugin is opt-in per site, configured via `definePlugins()`, and produces zero output when disabled.

## Goals

- Support the most common analytics providers without vendor lock-in
- Privacy-friendly defaults (cookieless providers before cookie-based)
- Zero runtime cost when plugin is not registered (no bundles, no network)
- Deterministic, server-rendered `<script>` tags — no client-side injection surprises
- Honor Do-Not-Track by default (configurable)
- Same plugin conventions as `plugin-seo`, `plugin-sitemap`, `plugin-rss`
- Pure build-time decision — static output friendly

## Non-Goals

- Custom analytics dashboards (consumer uses provider's UI)
- Event tracking helpers beyond `pageview` (can be added later as `trackEvent` API)
- A/B testing or experimentation (separate plugin domain)
- Consent management / cookie banners (belongs in a dedicated plugin-consent)
- Server-side analytics (contradicts static/ISR model)

## Data Contract

### Input

- `AnalyticsPluginOptions` — user configuration passed to the plugin factory
- `ContentData` — the plugin stores the resolved analytics config on `data._analytics` so templates/components can render script tags

### Output

- `data._analytics: ResolvedAnalyticsConfig` — attached to `ContentData` via `onDataLoaded`
- `<AnalyticsScript />` Astro component (in `@ever-works/ui`) reads `data._analytics` and emits the correct `<script>` tags in `<head>` or just before `</body>`

## Plugin Options

```typescript
export type AnalyticsProvider =
    | 'plausible'
    | 'umami'
    | 'fathom'
    | 'ga4'
    | 'custom';

export interface PlausibleConfig {
    provider: 'plausible';
    /** Site domain registered with Plausible (e.g. 'example.com') */
    domain: string;
    /** Self-hosted Plausible endpoint. Default: 'https://plausible.io' */
    scriptHost?: string;
    /** Plausible script variant (e.g. 'script.outbound-links.js'). Default: 'script.js' */
    scriptFile?: string;
}

export interface UmamiConfig {
    provider: 'umami';
    /** Umami website id (UUID) */
    websiteId: string;
    /** Umami script URL, typically 'https://analytics.umami.is/script.js' */
    scriptUrl: string;
}

export interface FathomConfig {
    provider: 'fathom';
    /** Fathom site ID */
    siteId: string;
    /** Custom Fathom domain for first-party analytics */
    scriptHost?: string;
}

export interface GA4Config {
    provider: 'ga4';
    /** GA4 measurement ID (G-XXXXXXXXXX) */
    measurementId: string;
    /** Anonymize IP. Default: true */
    anonymizeIp?: boolean;
}

export interface CustomConfig {
    provider: 'custom';
    /** Raw HTML injected verbatim. Consumer is responsible for correctness. */
    html: string;
}

export type AnalyticsProviderConfig =
    | PlausibleConfig
    | UmamiConfig
    | FathomConfig
    | GA4Config
    | CustomConfig;

export interface AnalyticsPluginOptions {
    /**
     * One or more providers. Multiple providers are allowed
     * (e.g. GA4 + Plausible during migration).
     */
    providers: AnalyticsProviderConfig[];

    /**
     * Honor the browser's Do-Not-Track header.
     * When true, the plugin emits a short guard script that disables
     * tracking calls if `navigator.doNotTrack === '1'`.
     * Default: true
     */
    respectDoNotTrack?: boolean;

    /**
     * Disable tracking entirely in dev (import.meta.env.DEV).
     * Default: true
     */
    disableInDev?: boolean;

    /**
     * Where to inject the script tags.
     *   - 'head'     : inside <head> (recommended for Plausible/Umami/Fathom)
     *   - 'body-end' : just before </body> (useful for GA4 with third-party scripts)
     * Default: 'head'
     */
    placement?: 'head' | 'body-end';
}
```

## Resolved Config on ContentData

```typescript
export interface ResolvedAnalyticsConfig {
    providers: AnalyticsProviderConfig[];
    respectDoNotTrack: boolean;
    disableInDev: boolean;
    placement: 'head' | 'body-end';
}

// Extends ContentData:
//   data._analytics?: ResolvedAnalyticsConfig;
```

The `_analytics` key follows the established `_breadcrumbs` convention: private metadata, optional, attached by a plugin, read by components.

## Implementation

### Package Structure

```
packages/plugin-analytics/
├── src/
│   ├── index.ts                 — barrel exports (plugin, types, renderers)
│   ├── plugin.ts                — plugin factory (onInit, onDataLoaded)
│   ├── types.ts                 — AnalyticsPluginOptions, ResolvedAnalyticsConfig, provider configs
│   ├── resolve-config.ts        — validation + defaults
│   ├── renderers/
│   │   ├── plausible.ts         — renderPlausibleScript(config): string
│   │   ├── umami.ts             — renderUmamiScript(config): string
│   │   ├── fathom.ts            — renderFathomScript(config): string
│   │   ├── ga4.ts               — renderGa4Script(config): string
│   │   └── custom.ts            — renderCustomScript(config): string
│   └── __tests__/
│       ├── plugin.test.ts
│       ├── resolve-config.test.ts
│       └── renderers.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── README.md
```

### UI Component

Add `packages/ui/src/astro/AnalyticsScript.astro` — a zero-prop Astro component that:
1. Reads `Astro.locals.content._analytics` OR receives `config` prop
2. When absent → renders nothing
3. When `disableInDev && import.meta.env.DEV` → renders nothing
4. Iterates `providers` and emits one `<script>` block per provider using the renderer string
5. When `respectDoNotTrack` → wraps emission in a small IIFE guard

Integration: sample apps add `<AnalyticsScript />` to their base `Layout.astro` in `<head>` or body-end.

### Plugin Lifecycle

```typescript
// packages/plugin-analytics/src/plugin.ts
export function analyticsPlugin(options: AnalyticsPluginOptions): Plugin {
    return {
        id: 'analytics',
        name: 'Analytics Plugin',
        version: '0.1.0',
        description: 'Emits privacy-friendly analytics tracking scripts.',
        hooks: {
            async onInit(ctx) {
                const resolved = resolveAnalyticsConfig(options);
                ctx.log.info(
                    `analytics: ${resolved.providers.length} provider(s), placement=${resolved.placement}`
                );
            },
            async onDataLoaded(data, _ctx) {
                return { ...data, _analytics: resolveAnalyticsConfig(options) };
            },
        },
    };
}
```

## Validation Rules

- `providers` must be a non-empty array → throw descriptive error otherwise
- Plausible: `domain` required, non-empty
- Umami: `websiteId` must be UUID-like, `scriptUrl` must be https://
- Fathom: `siteId` required, non-empty
- GA4: `measurementId` must match `^G-[A-Z0-9]+$`
- Custom: `html` required, warn if missing `<script>` tag

Validation errors surface via `ctx.log.error` with actionable messages.

## Security

- All provider-supplied strings (domain, siteId, measurementId, websiteId) are rendered into `<script>` attributes and must be escaped against `"` and `<`
- Custom provider HTML is emitted verbatim — documented as a trust boundary
- No inline event handlers; prefer `defer`/`async` attributes
- No `eval` or Function constructor

## Testing

- Unit tests per renderer: valid script tag, escaped attributes, no XSS vectors
- Unit tests for `resolveAnalyticsConfig` (defaults, validation, multi-provider)
- Unit tests for the plugin lifecycle (`onInit` logging, `onDataLoaded` merge)
- Snapshot tests for rendered output per provider
- Target: ≥ 25 unit tests in `plugin-analytics`
- Barrel export tests for public API
- E2E: sample app loads, analytics `<script>` tag present in `<head>` when enabled, absent when disabled

## Documentation

- `packages/plugin-analytics/README.md` — API reference, examples per provider
- `docs/guides/analytics.md` — step-by-step setup guide
- Link from `docs/index.md`, `README.md`, `CLAUDE.md`
- Reference from `SKILLS.md` — how AI agents add analytics to a generated site

## Acceptance Criteria

- [ ] `pnpm typecheck` passes with 0 errors across all packages
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (≥ 25 new tests)
- [ ] `pnpm build` succeeds for all apps
- [ ] `AnalyticsScript.astro` component renders correct `<script>` for each provider
- [ ] No output when plugin not registered
- [ ] No output when `disableInDev` and `import.meta.env.DEV` is true
- [ ] DoNotTrack guard works when `respectDoNotTrack` is true
- [ ] Multi-provider config emits one script per provider
- [ ] Custom provider emits verbatim HTML
- [ ] Docs, README, guide all cross-link
- [ ] `docs/index.md` and `docs/log.md` updated

## Open Questions

- **Q-A1**: Should the plugin expose a `trackEvent(name, props)` API, or stay pageview-only for v0.1? Default: pageview-only; events deferred to v0.2.
- **Q-A2**: Should we bundle a consent banner? Default: no — belongs in a separate `plugin-consent`. Documented as such.
- **Q-A3**: Should `<AnalyticsScript />` live in `@ever-works/ui` or in the plugin package itself? Default: `@ever-works/ui/astro/AnalyticsScript.astro` — keeps all Astro components in one place; plugin only provides the config + renderers.
- **Q-A4**: Should we support Simple Analytics, Matomo, PostHog in v0.1? Default: no — v0.1 ships the 5 listed. Users fall back to `custom` provider for anything else.
