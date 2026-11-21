# Feature: Agent Access (AI-agent discovery, read API and MCP)

> Status: implemented 2026-11-21 (minimal template). Shared contract with the full Next.js template
> (`ever-works/directory-web-template`), so an agent that learns one Ever Works directory can use all of them.

## Goal

Every Ever Works directory must be easy for AI agents (ChatGPT, Claude, Perplexity, Gemini, coding agents, custom
MCP clients) to **discover**, **read**, and **query** — without scraping HTML and without an account.

Three layers, each usable on its own:

1. **Discovery** — `llms.txt`, `robots.txt`, `<link>` tags, `/.well-known/*` documents tell an agent what exists.
2. **Read API** — static, cacheable JSON files (work on any static host: Cloudflare, Vercel, nginx, S3).
3. **MCP** — a stateless Model Context Protocol server at `/mcp` (Streamable HTTP) with search/list/get tools.

The read API is the source of truth. The MCP server is a thin query layer over the same data.

## Contract v1 (identical in both templates)

All URLs below are relative to the directory's origin. Every document that contains links uses **absolute** URLs
(`SITE_URL` / Astro `site`, falling back to `config.app_url`).

### Discovery

| Path | Type | Notes |
| --- | --- | --- |
| `/llms.txt` | `text/plain` | llmstxt.org index. Sections: summary, how to query (Read API, MCP, OpenAPI), categories with links, Markdown mirrors, feeds. |
| `/llms-full.txt` | `text/plain` | Whole directory as Markdown for one-shot ingestion. |
| `/robots.txt` | `text/plain` | Allows all crawlers incl. AI crawlers by default; **must not** disallow `/data/`, `/llms*.txt`, `/mcp`, `/.well-known/`. Absolute `Sitemap:` line. |
| `/.well-known/mcp.json` | JSON | MCP server card: `{ "name", "title", "description", "version", "url": "<abs>/mcp", "transport": "streamable-http", "tools": [names], "documentation": "<abs>/llms.txt" }` |
| `/.well-known/api-catalog` | `application/linkset+json` | RFC 9727 API catalog: one linkset entry anchored at `<abs>/data/` with `service-desc` → `<abs>/data/openapi.json`, `service-doc` → `<abs>/llms.txt`. |
| HTML `<head>` | — | `<link rel="alternate" type="application/json" href="/data/items.json">`, `<link rel="service-desc" type="application/openapi+json" href="/data/openapi.json">`, `<link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">`, per-page Markdown twin where available. |

### Read API (GET, JSON, `Access-Control-Allow-Origin: *`)

The namespace is `/data/` (not `/api/`) so it can never collide with a template's own server API routes.

| Path | Body |
| --- | --- |
| `/data/directory.json` | `DirectoryInfo` |
| `/data/items.json` | `{ "version": 1, "total": n, "items": ItemSummary[] }` |
| `/data/items/{slug}.json` | `ItemDetail` |
| `/data/categories.json` | `{ "version": 1, "total": n, "categories": CategoryEntry[] }` |
| `/data/tags.json` | `{ "version": 1, "total": n, "tags": TagEntry[] }` |
| `/data/openapi.json` | OpenAPI 3.1 document describing the five endpoints above and the `/mcp` endpoint. |

The legacy `/items.json` endpoint stays (backward compatible).

```ts
interface DirectoryInfo {
    version: 1;
    name: string;              // config.company_name
    description: string;       // homepage hero description / header.md first paragraph / generated
    url: string;               // absolute site URL
    item_name: string;         // singular, e.g. "Tool"
    items_name: string;        // plural
    counts: { items: number; categories: number; tags: number; collections: number; comparisons: number };
    updated_at: string | null; // newest item updated_at
    data_repository: string | null; // public Git URL of the data repo when known (agents may clone it)
    submit_url: string | null; // absolute URL of the "submit an item" page when enabled
    endpoints: { items: string; item: string /* with {slug} */; categories: string; tags: string; openapi: string;
                 llms: string; llms_full: string; sitemap: string; mcp: string | null };
    generator: 'ever-works-minimal' | 'ever-works';
}

interface ItemSummary {
    slug: string;
    name: string;
    description: string;
    url: string;               // absolute URL of the item page on this directory
    website: string | null;    // the item's own website (source_url)
    categories: string[];      // display names
    category_ids: string[];    // ids from categories.yml (slugified when unknown)
    tags: string[];            // display names
    tag_ids: string[];
    featured: boolean;
    logo: string | null;       // icon_url, else brand_logo_url
    updated_at: string | null;
}

interface ItemDetail extends ItemSummary {
    markdown: string | null;   // raw Markdown body
    markdown_url: string;      // absolute URL of the item's Markdown twin
    images: string[];
    brand: string | null;
    publisher: string | null;
    related: string[];         // slugs of similar items (shared tags/categories)
}

interface CategoryEntry { id: string; name: string; description: string | null; count: number; url: string }
interface TagEntry { id: string; name: string; count: number; url: string }
```

### MCP (`/mcp`)

- Transport: MCP **Streamable HTTP**, stateless (no `Mcp-Session-Id`), every response is a single
  `application/json` JSON-RPC message. `GET /mcp` → `405` with `Allow: POST, OPTIONS`; `OPTIONS` → `204` CORS
  preflight; CORS `*` on every response. Client responses (`result`/`error`, no `method`) → `202`; a `null` request
  id → `-32600`; internal errors use a generic message (no file paths or upstream URLs). An optional
  `allowedOrigins` list enables an `Origin` check (off by default: public, read-only data).
- Methods: `initialize` (negotiates `protocolVersion` from `2025-11-25`, `2025-06-18`, `2025-03-26`, `2024-11-05`;
  unknown → latest), `notifications/*` → `202` empty body, `ping`, `tools/list`, `tools/call`. Unknown method →
  JSON-RPC error `-32601`. Batches are not supported (`-32600`).
- `serverInfo`: `{ name: "ever-works-directory", title: <company_name>, version: "1.0.0" }`; `instructions`
  describes the directory in one paragraph and lists the tools.
- Tools (names and input schemas are part of the contract):

| Tool | Input | Result (`structuredContent`, also JSON-stringified in a `text` content block) |
| --- | --- | --- |
| `get_directory_info` | `{}` | `DirectoryInfo` |
| `search_items` | `{ query: string; category?: string; tag?: string; limit?: number (1-50, default 10) }` | `{ total, items: ItemSummary[] }` ranked by relevance |
| `list_items` | `{ category?: string; tag?: string; featured?: boolean; sort?: 'featured' \| 'name-asc' \| 'name-desc' \| 'date-desc' \| 'date-asc'; offset?: number; limit?: number (1-100, default 25) }` | `{ total, offset, limit, items: ItemSummary[] }` |
| `get_item` | `{ slug: string }` | `ItemDetail` (`isError: true` when not found) |
| `list_categories` | `{}` | `{ total, categories: CategoryEntry[] }` |
| `list_tags` | `{ limit?: number }` | `{ total, tags: TagEntry[] }` sorted by count desc |

`category` / `tag` filters accept an id, a display name or a slug (case-insensitive). A value that slugifies to an
empty string (non-Latin names such as `東京`) is compared as normalized text, never through the empty slug.

Date sorts (`date-desc`, `date-asc`) compare `updated_at` as instants (date-only and zone-less values read as UTC);
items without a parseable date sort last in both directions, ties by name.

Transport validation: an `MCP-Protocol-Version` request header with an unsupported value → HTTP `400`; `jsonrpc` other
than `"2.0"` → `-32600` with HTTP `400`.

Search ranking (shared): tokenize the query on non-alphanumerics; per token, score `+8` exact name, `+5` name
prefix, `+3` name contains, `+2` category/tag name contains, `+1` description contains; all tokens must match
somewhere; featured items get `+0.5`; ties sort by name.

### Where the MCP server runs (minimal template)

- **Cloudflare (static deploy)**: the Worker gets a tiny TypeScript entry (`apps/web/worker/index.ts`) with the
  static assets binding and `run_worker_first: ["/mcp"]`, so only `/mcp` executes code — every other request is
  still served straight from static assets (free, no Worker invocation). The Worker reads
  `/data/items.json` etc. through the `ASSETS` binding, caches the parsed data per isolate, and answers MCP calls.
- **Vercel / ISR mode**: the same handler is mounted as an on-demand Astro endpoint by `@ever-works/astro-integration`.
- **Pure static hosts (nginx, S3)**: no `/mcp`; `DirectoryInfo.endpoints.mcp` is `null` and `/.well-known/mcp.json`
  is not emitted. The read API still works.

The handler itself is framework-free (`packages/agent-api`): `handleMcpRequest(request, loadDataset)`.

## Non-goals

- No write API (submissions go through the Submit page — see `directory-experience.md`).
- No auth, rate limiting, or analytics in the MCP server (Cloudflare handles abuse at the edge).
- No embeddings / vector search (keeps builds fast and the Worker tiny).
