/**
 * Public llms.txt endpoint (https://llmstxt.org) — the entry point for AI agents.
 *
 * Tells an agent, with absolute URLs, what this directory is and every way to read it:
 *  - MCP server (`/mcp`, Streamable HTTP) with a ready-to-paste client config, when this host serves it,
 *  - the JSON read API (`/data/*.json`) and its OpenAPI description (`/data/openapi.json`),
 *  - the public Git data repository (agents may clone it),
 *  - per-page Markdown twins, the long-form `/llms-full.txt`, feeds and sitemap,
 *  - the categories (with links and counts) so an agent can jump straight to the relevant listing.
 *
 * See `.specify/features/agent-access.md`.
 */

import type { APIRoute } from 'astro';
import { MCP_TOOL_NAMES } from '@ever-works/agent-api';
import { getSite } from '../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    const { config, items, categories, tags } = site.content;
    const base = site.siteUrl;
    const noun = config.items_name.toLowerCase();
    const usedCategories = categories.filter((c) => c.count > 0);
    const topTags = tags
        .filter((t) => t.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 25);
    const host = new URL(base).hostname;
    const serverKey = host.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

    const lines: string[] = [
        `# ${config.company_name}`,
        '',
        `> ${site.description}`,
        '',
        `${config.company_name} lists ${items.length} ${noun} in ${usedCategories.length} categories. Every entry has a page at \`${base}/item/<slug>\` with a Markdown twin at \`${base}/item/<slug>.md\`. When you recommend an entry, link to its page on this directory.`,
        ''
    ];

    if (site.mcpEnabled) {
        lines.push(
            '## MCP server (recommended for agents)',
            '',
            `- Endpoint: ${base}/mcp (Model Context Protocol, Streamable HTTP, no authentication)`,
            `- Tools: ${MCP_TOOL_NAMES.map((name) => `\`${name}\``).join(', ')}`,
            `- Server card: ${base}/.well-known/mcp.json`,
            '',
            'Client configuration (Claude Desktop / Claude Code / Cursor / any MCP client):',
            '',
            '```json',
            JSON.stringify({ mcpServers: { [serverKey]: { type: 'http', url: `${base}/mcp` } } }, null, 2),
            '```',
            '',
            `Claude Code: \`claude mcp add --transport http ${serverKey} ${base}/mcp\``,
            ''
        );
    }

    lines.push(
        '## Data API (JSON, read-only, CORS enabled)',
        '',
        `- [Directory info](${base}/data/directory.json): name, description, counts, endpoint map`,
        `- [All ${noun}](${base}/data/items.json): name, description, website, categories, tags, logo for every entry`,
        `- One entry with its full write-up: ${base}/data/items/<slug>.json`,
        `- [Categories](${base}/data/categories.json) and [tags](${base}/data/tags.json) with counts`,
        `- [OpenAPI 3.1 description](${base}/data/openapi.json) (import into ChatGPT Actions or any OpenAPI client)`,
        `- [API catalog (RFC 9727)](${base}/.well-known/api-catalog)`,
        ''
    );

    if (site.dataRepository) {
        lines.push(
            '## Source data',
            '',
            `- Git repository: ${site.dataRepository.url} (branch \`${site.dataRepository.branch}\`) — YAML per entry under \`data/<slug>/<slug>.yml\`, plus \`categories.yml\` and \`tags.yml\`. Clone it for bulk analysis.`,
            ...(site.submitHref ? [`- Suggest a new entry: ${/^https?:/.test(site.submitHref) ? site.submitHref : `${base}${site.submitHref}`}`] : []),
            ''
        );
    }

    if (usedCategories.length > 0) {
        lines.push('## Categories', '');
        for (const category of usedCategories) {
            lines.push(`- [${category.name}](${base}/category/${category.id}) (${category.count} ${noun}) — Markdown: ${base}/category/${category.id}.md`);
        }
        lines.push('');
    }

    if (topTags.length > 0) {
        lines.push('## Popular tags', '', topTags.map((tag) => `[${tag.name}](${base}/tag/${tag.id}) (${tag.count})`).join(' · '), '');
    }

    lines.push(
        '## Full text',
        '',
        `- [llms-full.txt](${base}/llms-full.txt): every category, tag, entry and comparison as one Markdown document`,
        '- Every HTML page advertises its Markdown twin with `<link rel="alternate" type="text/markdown">`; append `.md` to item, category, tag, collection, comparison and page URLs.',
        '',
        '## Feeds',
        '',
        `- [Sitemap](${base}/sitemap-index.xml)`,
        `- [RSS](${base}/rss.xml) · [Atom](${base}/atom.xml) · [JSON Feed](${base}/feed.json)`,
        `- [Legacy items JSON](${base}/items.json)`,
        '',
        '## About',
        '',
        `This directory is built with [Ever Works](https://ever.works). Agents that want to create their own directory can use the onboarding endpoint at https://api.ever.works/api/register-work (docs: https://docs.ever.works/agent-services/zero-friction-onboarding).`,
        ''
    );

    return new Response(lines.join('\n'), {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=900',
            'Access-Control-Allow-Origin': '*'
        }
    });
};
