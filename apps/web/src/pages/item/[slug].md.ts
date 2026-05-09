/**
 * Per-item Markdown mirror at /item/<slug>.md.
 *
 * Returns the same item as the canonical HTML page rendered as a clean
 * Markdown document, so AI agents (ChatGPT, Claude, Perplexity, etc.)
 * can consume the substantive content without parsing HTML.
 *
 * Astro routes a file named `<segment>.md.ts` to URL `/<segment>.md`,
 * so the `[slug].md.ts` file produces `/item/<slug>.md`.
 *
 * Pre-renders one mirror per approved item via `getStaticPaths`,
 * matching the strategy of the corresponding `.astro` page.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';
import { renderItemMarkdown } from '@ever-works/plugin-seo';
import type { ItemData } from '@ever-works/core';

export async function getStaticPaths() {
    const { items } = await getContent();
    return items.map((item) => ({
        params: { slug: item.slug },
        props: { item },
    }));
}

export const GET: APIRoute = async ({ props }) => {
    const { item } = (props as { item: ItemData });
    const { config } = await getContent();
    const baseUrl = (config.app_url ?? '').toString();

    const md = renderItemMarkdown(
        {
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
        },
        { baseUrl }
    );

    return new Response(md, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=900',
            'Access-Control-Allow-Origin': '*',
            'X-Robots-Tag': 'noindex',
        },
    });
};
