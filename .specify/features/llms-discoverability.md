# Feature: LLM / AI agent discoverability

## Summary

Make every directory built from this template a first-class source for
LLM agents (ChatGPT, Claude, Perplexity, etc.) by shipping an explicit
set of agent-friendly endpoints and structured-data signals — separate
from search-engine SEO:

1. `/llms.txt` — short Markdown manifest (already shipping; updated to
   advertise the new endpoints below).
2. `/llms-full.txt` — long-form Markdown dump of the entire directory
   for one-shot ingestion.
3. Per-page `.md` mirrors at `/<path>.md` for every public detail and
   listing page (item / category / tag / collection / comparison /
   static page).
4. `BreadcrumbList` JSON-LD on every page that has a navigational
   trail.
5. Explicit AI-crawler allow-list in `robots.txt` — exactly 18 bots
   (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User,
   Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User,
   Google-Extended, Applebot, Applebot-Extended, Bingbot, CCBot,
   Meta-ExternalAgent, Amazonbot, Bytespider, cohere-ai) rendered in
   randomized order, overridable via the `AI_CRAWLERS` env var.
6. `/feed.json` — JSON Feed 1.1 alongside the existing `/rss.xml` and
   `/atom.xml` so JSON-native consumers (AI agents, dashboards) don't
   have to parse XML.

## Goals

- One-shot ingestion: an agent can fetch `/llms-full.txt` and have the
  whole directory in its context.
- Per-page mirrors: agents that hop links can fetch `<page>.md` instead
  of stripping HTML.
- Unambiguous crawler stance: each major AI bot gets its own
  `User-agent` rule so operators don't have to debate whether
  `User-agent: *` covers them.
- Reusable plugin surface: helpers live in `@ever-works/plugin-seo` so
  every sample app and downstream template gets the same behavior.

## Non-Goals

- Generating `.md` mirrors for admin / dashboard / auth pages —
  those remain `Disallow:` for every crawler.
- Translating mirrors into other locales (the minimal template is
  monolingual; the full Next.js template handles localized mirrors).
- Versioning the `.md` schema: the format is human-readable Markdown,
  not a stable wire format. Agents that want stable structure should
  hit `/items.json`.

## API additions to `@ever-works/plugin-seo`

```typescript
// AI crawlers (in robots.ts)
export const AI_CRAWLER_USER_AGENTS: readonly string[];
export type AiCrawlerMode = 'allow' | 'disallow' | 'none' | 'selective';
export interface AiCrawlerPolicy {
    mode: AiCrawlerMode;
    allowList: readonly string[];
}
export function resolveAiCrawlerPolicy(raw: string | undefined | null): AiCrawlerPolicy;
export function buildAiCrawlerRules(
    policy: AiCrawlerPolicy,
    sharedDisallow?: readonly string[]
): RobotsTxtRule[];

// Markdown-mirror renderers (in markdown-mirror.ts)
export function renderItemMarkdown(item: MirrorItem, options: { baseUrl: string }): string;
export function renderCategoryMarkdown(category, items, options): string;
export function renderTagMarkdown(tag, items, options): string;
export function renderCollectionMarkdown(collection, items, options): string;
export function renderComparisonMarkdown(comparison, options): string;
export function renderStaticPageMarkdown(pageData, options): string;
export function generateLlmsFullTxt(input: LlmsFullTxtInput): string;
```

All helpers are pure functions (no I/O); the web app's route handlers
load data via `getContent()` and call into these helpers for rendering.

## Implementation

1. **plugin-seo robots.ts** — add `AI_CRAWLER_USER_AGENTS`,
   `resolveAiCrawlerPolicy`, and `buildAiCrawlerRules`. Expose via
   barrel.
2. **plugin-seo markdown-mirror.ts** — new file with six renderers
   (item / category / tag / collection / comparison / static page) and
   `generateLlmsFullTxt`. Export via barrel.
3. **apps/web routes**:
    - `src/pages/robots.txt.ts` — splice `buildAiCrawlerRules` into the
      rules list. Default policy is `allow`; honor `AI_CRAWLERS` env
      var.
    - `src/pages/llms-full.txt.ts` — new endpoint backed by
      `generateLlmsFullTxt`.
    - `src/pages/llms.txt.ts` — updated copy to advertise
      `/llms-full.txt` and the per-page `.md` URL convention.
    - `src/pages/<type>/[slug].md.ts` — new per-page mirror routes for
      items, categories, tags, collections, comparisons, and pages.
4. **BaseLayout.astro** — accept an optional `markdownMirrorUrl` prop
   and emit
   `<link rel="alternate" type="text/markdown" href="…">` when set.
5. **BreadcrumbList JSON-LD** — added inline (using existing
   `generateJsonLd('BreadcrumbList', …)`) to:
    - `index.astro`, `categories.astro`, `tags.astro`,
      `collections.astro`, `comparisons.astro`, `page/[page].astro`
      (listing pages that previously lacked it),
    - `category/[slug].astro`, `tag/[slug].astro`,
      `collection/[slug].astro`, `comparison/[slug].astro` (detail
      pages that previously emitted only `ItemList`).
    - `item/[slug].astro` and `pages/[slug].astro` keep their existing
      emission.

## Testing

- `packages/plugin-seo/src/__tests__/ai-crawlers.test.ts` —
    - `AI_CRAWLER_USER_AGENTS` contains GPTBot/ClaudeBot/Perplexity
      etc. and has no duplicates.
    - `resolveAiCrawlerPolicy` parses the four input shapes (empty,
      `'allow'`, `'disallow'`, `'none'`, comma-list).
    - `buildAiCrawlerRules` returns the right shape per mode and is
      case-insensitive on selective allow-lists.
    - End-to-end smoke: `generateRobotsTxt` with AI rules emits each
      bot block plus the sitemap.
- `packages/plugin-seo/src/__tests__/markdown-mirror.test.ts` —
    - Each renderer emits the expected H1, blockquote, fact list, and
      footer; handles missing fields gracefully; trims trailing slashes
      from `baseUrl`.
    - `generateLlmsFullTxt` orders sections (preamble, categories,
      tags, items, comparisons), demotes per-item heading levels,
      strips per-item footers, caps items at `maxItemsWithBody`, and
      truncates the tag list at 100 with an "…and N more" footer.
- `packages/plugin-seo/src/__tests__/barrel-exports.test.ts` —
  extended to assert every new symbol is re-exported and no
  unexpected exports leak.

## Acceptance Criteria

- [x] `pnpm typecheck` passes for the monorepo.
- [x] `pnpm test` passes for the monorepo (new vitest suites pass).
- [x] `pnpm lint` passes.
- [x] `pnpm build` succeeds (per-page `.md` routes pre-render at build
  time).
- [x] `/robots.txt` includes per-bot rules for every entry in
  `AI_CRAWLER_USER_AGENTS`.
- [x] `/llms.txt` advertises `/llms-full.txt` and the per-page `.md`
  convention.
- [x] `/llms-full.txt` returns a single Markdown document with site
  preamble, categories, tags, every item, and every comparison.
- [x] Every public detail/listing page emits `BreadcrumbList` JSON-LD.
- [x] Every detail/listing page that has a `.md` mirror also advertises
  it via `<link rel="alternate" type="text/markdown">` in the
  `<head>`.
