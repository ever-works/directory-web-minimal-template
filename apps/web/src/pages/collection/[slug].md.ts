/**
 * Per-collection Markdown mirror at /collection/<slug>.md.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';
import { renderCollectionMarkdown } from '@ever-works/plugin-seo';
import type { CollectionData } from '@ever-works/core';

export async function getStaticPaths() {
    const { collections } = await getContent();
    return collections
        .filter((c) => c.isActive !== false)
        .map((collection) => ({
            params: { slug: collection.slug },
            props: { collection },
        }));
}

export const GET: APIRoute = async ({ props }) => {
    const { collection } = props as { collection: CollectionData };
    const { items, config } = await getContent();

    const collectionItems = collection.items
        ? items.filter((item) => collection.items!.includes(item.slug))
        : [];

    const baseUrl = (config.app_url ?? '').toString();
    const md = renderCollectionMarkdown(
        {
            id: collection.id,
            slug: collection.slug,
            name: collection.name,
            description: collection.description,
            icon_url: collection.icon_url,
            items: collection.items,
        },
        collectionItems.map((item) => ({
            name: item.name,
            slug: item.slug,
            description: item.description,
        })),
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
