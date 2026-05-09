/**
 * Per-tag Markdown mirror at /tag/<slug>.md.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';
import { renderTagMarkdown } from '@ever-works/plugin-seo';
import type { TagData } from '@ever-works/core';

export async function getStaticPaths() {
    const { tags } = await getContent();
    return tags.map((tag) => ({
        params: { slug: tag.id },
        props: { tag },
    }));
}

export const GET: APIRoute = async ({ props, params }) => {
    const { tag } = props as { tag: TagData };
    const { items, config } = await getContent();

    const tagItems = items.filter((item) => item.tags?.includes(tag.id));

    const baseUrl = (config.app_url ?? '').toString();
    const md = renderTagMarkdown(
        { id: tag.id, name: tag.name },
        tagItems.map((item) => ({
            name: item.name,
            slug: item.slug,
            description: item.description,
        })),
        { baseUrl, tagRef: params.slug as string }
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
