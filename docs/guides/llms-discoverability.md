---
title: "LLM / AI Agent Discoverability"
sidebar_label: "LLM Discoverability"
---

# LLM / AI Agent Discoverability

The minimal template ships an opinionated set of endpoints designed for
AI agents — separate from search-engine SEO — so directories built
with Ever Works are first-class sources for ChatGPT, Claude,
Perplexity, and any other LLM that crawls or fetches by URL.

## Feeds

Three feed formats ship out of the box, each with autodiscovery
in the page `<head>`:

- **RSS 2.0** at `/rss.xml`
- **Atom 1.0** at `/atom.xml`
- **JSON Feed 1.1** at `/feed.json` — JSON-native alternative,
  ideal for AI agents and dashboards. See
  [jsonfeed.org](https://www.jsonfeed.org/version/1.1/).

All three are produced by `@ever-works/plugin-rss`. The plugin's
`buildFeedEntries` + `generateRss` / `generateAtom` /
`generateJsonFeed` helpers are pure functions sharing a single
`ResolvedRssConfig` so the three formats stay in lockstep.

## Endpoints

### `/llms.txt`

A short Markdown manifest at `apps/web/src/pages/llms.txt.ts`. Lists
the site name, description, and pointers to the canonical data dumps
and per-page mirrors. Per the
[llms.txt convention](https://llmstxt.org/).

### `/llms-full.txt`

The long-form companion at `apps/web/src/pages/llms-full.txt.ts`.
Concatenates the entire directory into a single Markdown document:
site preamble, every category and tag, every item with its full body
content, and every comparison. Agents can ingest the whole directory
in one fetch instead of crawling per-page HTML.

The route delegates to `generateLlmsFullTxt()` from
`@ever-works/plugin-seo`, so vertical templates and downstream forks
get the same behavior for free.

### Per-page `.md` mirrors

Every public page also serves a clean Markdown twin at the same path
with `.md` appended:

| Public URL                  | HTML route                                | Mirror route                                  |
| --------------------------- | ----------------------------------------- | --------------------------------------------- |
| `/item/<slug>.md`           | `src/pages/item/[slug].astro`             | `src/pages/item/[slug].md.ts`                 |
| `/category/<id>.md`         | `src/pages/category/[slug].astro`         | `src/pages/category/[slug].md.ts`             |
| `/tag/<id>.md`              | `src/pages/tag/[slug].astro`              | `src/pages/tag/[slug].md.ts`                  |
| `/collection/<slug>.md`     | `src/pages/collection/[slug].astro`       | `src/pages/collection/[slug].md.ts`           |
| `/comparison/<slug>.md`     | `src/pages/comparison/[slug].astro`       | `src/pages/comparison/[slug].md.ts`           |
| `/pages/<slug>.md`          | `src/pages/pages/[slug].astro`            | `src/pages/pages/[slug].md.ts`                |

Each HTML page advertises its mirror via the standard alternate-link
mechanism in the page `<head>`:

```html
<link rel="alternate" type="text/markdown" href="/item/cursor.md" />
```

Pages emit this automatically when they pass `markdownMirrorUrl` to
`<BaseLayout>`. The Markdown content is rendered by pure functions in
`@ever-works/plugin-seo` (`renderItemMarkdown`, `renderCategoryMarkdown`,
etc.) — no I/O, no Astro internals, easily testable.

### `BreadcrumbList` JSON-LD on every page

Every public page that has a navigational trail emits a Schema.org
`BreadcrumbList` as a `<script type="application/ld+json">` block. The
template uses the existing `generateJsonLd('BreadcrumbList', …)` helper
inline, paired with the visible `<Breadcrumbs>` UI component. AI agents
and search engines pick up the breadcrumb hierarchy without parsing
the rendered HTML.

## AI crawler policy in `robots.txt`

`apps/web/src/pages/robots.txt.ts` emits a default `User-agent: *`
rule **plus** an explicit per-bot allow-list of 18 major AI crawlers:
GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User,
Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User,
Google-Extended, Applebot, Applebot-Extended, Bingbot, CCBot,
Meta-ExternalAgent, Amazonbot, Bytespider, cohere-ai. The list is
rendered in randomized order so no single operator appears clustered
or "first" in robots.txt.

Default policy: every listed bot gets `Allow: /` plus the same
admin/api `Disallow` block as the generic rule. Override via the
`AI_CRAWLERS` environment variable:

```bash
AI_CRAWLERS=allow                              # default — same as omitting it
AI_CRAWLERS=disallow                           # explicit Disallow: / for every listed bot
AI_CRAWLERS=GPTBot,ClaudeBot,PerplexityBot     # selective: allow these, disallow the rest
AI_CRAWLERS=none                               # don't emit any AI-crawler rules at all
```

The bot list and policy resolver live in
`packages/plugin-seo/src/robots.ts`. To extend the list, add the bot's
documented user-agent string to `AI_CRAWLER_USER_AGENTS` and ship a
new `@ever-works/plugin-seo` release.

## Why this matters

- **HTML wastes context.** Agents that scrape HTML burn tokens on nav,
  footers, scripts, and theme chrome before reaching the content. A
  `.md` mirror ships only what they need.
- **One fetch beats many.** `/llms-full.txt` lets an agent reason
  about the whole directory in a single context window for any site
  with up to ~500 items.
- **Explicit beats implicit.** The per-bot user-agent rules in
  `robots.txt` document the operator's stance unambiguously and let
  selective opt-in/opt-out without a bespoke proxy.

## Disabling / customizing

If a directory is private or unfinished:

```bash
AI_CRAWLERS=disallow
```

To opt only into Anthropic's bots while excluding the rest:

```bash
AI_CRAWLERS=ClaudeBot,Claude-Web,anthropic-ai
```

To remove the `/llms-full.txt` and per-page `.md` mirrors entirely,
delete the corresponding files under `apps/web/src/pages/` and revert
the `<link rel="alternate" type="text/markdown">` line in
`apps/web/src/layouts/BaseLayout.astro`. Nothing else depends on them.
