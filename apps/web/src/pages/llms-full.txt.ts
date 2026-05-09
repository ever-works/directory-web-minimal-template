/**
 * /llms-full.txt — long-form companion to /llms.txt.
 *
 * Where /llms.txt is a short manifest pointing at canonical resources,
 * /llms-full.txt is a single concatenated Markdown dump of the entire
 * directory: site preamble, every category and tag, every item with
 * its full body content, and every comparison. AI agents can ingest
 * the whole directory in one fetch instead of crawling per-page HTML.
 *
 * @see https://llmstxt.org/
 */

import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { generateLlmsFullTxt } from '@ever-works/plugin-seo';

export const GET: APIRoute = async () => {
    const { items, categories, tags, comparisons, config } = await getContent();

    const description =
        (config as { description?: string; tagline?: string }).description ??
        (config as { tagline?: string }).tagline ??
        `A curated directory of ${items.length} ${items.length === 1 ? 'item' : 'items'}.`;

    const body = generateLlmsFullTxt({
        siteName: config.company_name ?? 'Ever Works Directory',
        siteUrl: config.app_url ?? '',
        description,
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        tags: tags.map((t) => ({ id: t.id, name: t.name })),
        items: items.map((item) => ({
            name: item.name,
            slug: item.slug,
            description: item.description,
            source_url: item.source_url,
            category: item.category as string | string[] | undefined,
            tags: item.tags,
            featured: item.featured,
            icon_url: item.icon_url,
            publisher: item.publisher,
            updated_at: item.updated_at,
            markdown: item.markdown,
        })),
        comparisons: comparisons.map((cmp) => ({
            slug: cmp.slug,
            title: cmp.title,
            summary: cmp.summary,
            item_a_name: cmp.item_a_name,
            item_b_name: cmp.item_b_name,
            item_a_slug: cmp.item_a_slug,
            item_b_slug: cmp.item_b_slug,
            dimensions: cmp.dimensions?.map((d) => ({ name: d.name })),
            generated_at: cmp.generated_at,
        })),
    });

    return new Response(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=900',
            'Access-Control-Allow-Origin': '*',
            'X-Robots-Tag': 'noindex',
        },
    });
};
