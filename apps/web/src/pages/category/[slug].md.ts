/**
 * Per-category Markdown mirror at /category/<slug>.md.
 *
 * Mirrors the items in a category as a clean Markdown document for
 * consumption by AI agents.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';
import { renderCategoryMarkdown } from '@ever-works/plugin-seo';
import type { CategoryData } from '@ever-works/core';

export async function getStaticPaths() {
    const { categories } = await getContent();
    return categories.map((cat) => ({
        params: { slug: cat.id },
        props: { category: cat },
    }));
}

export const GET: APIRoute = async ({ props, params }) => {
    const { category } = props as { category: CategoryData };
    const { items, config } = await getContent();

    const categoryItems = items.filter((item) => {
        const cats = Array.isArray(item.category) ? item.category : [item.category];
        return cats.includes(category.id);
    });

    const baseUrl = (config.app_url ?? '').toString();
    const md = renderCategoryMarkdown(
        { id: category.id, name: category.name },
        categoryItems.map((item) => ({
            name: item.name,
            slug: item.slug,
            description: item.description,
        })),
        { baseUrl, categoryRef: params.slug as string }
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
