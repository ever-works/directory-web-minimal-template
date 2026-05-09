/**
 * Per-static-page Markdown mirror at /pages/<slug>.md.
 *
 * Renders the same source Markdown content that the HTML page renders,
 * stripped of UI chrome.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';
import { renderStaticPageMarkdown } from '@ever-works/plugin-seo';
import type { PageData } from '@ever-works/core';

export async function getStaticPaths() {
    const { pages } = await getContent();
    return pages.map((page) => ({
        params: { slug: page.slug },
        props: { page },
    }));
}

export const GET: APIRoute = async ({ props }) => {
    const { page } = props as { page: PageData };
    const { config } = await getContent();

    const baseUrl = (config.app_url ?? '').toString();
    const md = renderStaticPageMarkdown(
        {
            // Spread page first so explicit title/description take precedence over
            // any pass-through frontmatter fields with the same key.
            metadata: { ...page, title: page.title, description: page.description },
            content: page.content,
        },
        {
            title: page.title,
            path: `/pages/${page.slug}`,
            baseUrl,
        }
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
