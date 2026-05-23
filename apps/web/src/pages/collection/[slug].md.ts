/**
 * Per-collection Markdown mirror at /collection/<slug>.md.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';
import { renderCollectionMarkdown } from '@ever-works/plugin-seo';
import type { CollectionData } from '@ever-works/core';
import { itemBelongsToCollection, uniquePathAliases } from '../../lib/taxonomy';

export async function getStaticPaths() {
    const { collections } = await getContent();
    return collections
        .filter((c) => c.isActive !== false)
        .flatMap((collection) =>
            uniquePathAliases(collection.slug, collection.name).map((slug) => ({
                params: { slug },
                props: { collection }
            }))
        );
}

export const GET: APIRoute = async ({ props }) => {
    const { collection } = props as { collection: CollectionData };
    const { items, config } = await getContent();

    const collectionItems = items.filter((item) => itemBelongsToCollection(item, collection));

    const baseUrl = (config.app_url ?? '').toString();
    const md = renderCollectionMarkdown(
        {
            id: collection.id,
            slug: collection.slug,
            name: collection.name,
            description: collection.description,
            icon_url: collection.icon_url,
            items: collection.items
        },
        collectionItems.map((item) => ({
            name: item.name,
            slug: item.slug,
            description: item.description
        })),
        { baseUrl }
    );

    return new Response(md, {
        status: 200,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=900',
            'Access-Control-Allow-Origin': '*',
            'X-Robots-Tag': 'noindex'
        }
    });
};
