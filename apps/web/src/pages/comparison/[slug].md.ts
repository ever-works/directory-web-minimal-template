/**
 * Per-comparison Markdown mirror at /comparison/<slug>.md.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';
import { renderComparisonMarkdown } from '@ever-works/plugin-seo';
import type { ComparisonData } from '@ever-works/core';

export async function getStaticPaths() {
    const { comparisons } = await getContent();
    return comparisons.map((comp) => ({
        params: { slug: comp.slug },
        props: { comparison: comp },
    }));
}

export const GET: APIRoute = async ({ props }) => {
    const { comparison } = props as { comparison: ComparisonData };
    const { config } = await getContent();

    const baseUrl = (config.app_url ?? '').toString();
    const md = renderComparisonMarkdown(
        {
            slug: comparison.slug,
            title: comparison.title,
            summary: comparison.summary,
            item_a_name: comparison.item_a_name,
            item_b_name: comparison.item_b_name,
            item_a_slug: comparison.item_a_slug,
            item_b_slug: comparison.item_b_slug,
            dimensions: comparison.dimensions?.map((d) => ({ name: d.name })),
            generated_at: comparison.generated_at,
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
