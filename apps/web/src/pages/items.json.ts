/**
 * Public canonical-data endpoint that emits every directory item as JSON,
 * so downstream agents and integrations can consume the directory without
 * scraping HTML. Mirrors the same shape as the Next.js template's
 * /items.json route — a stable cross-template contract.
 */

import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';

export const GET: APIRoute = async () => {
    const { items, config } = await getContent();

    const siteUrl = (config.app_url ?? '').replace(/\/$/, '');
    interface ItemShape {
        slug?: string;
        id?: string;
        name?: string;
        title?: string;
        url?: string;
        description?: string;
        categories?: ReadonlyArray<string>;
        tags?: ReadonlyArray<string>;
        meta?: {
            source_url?: string;
            url?: string;
            name?: string;
            description?: string;
            category?: ReadonlyArray<string>;
            tags?: ReadonlyArray<string>;
        };
    }

    const payload = {
        site: {
            name: config.company_name ?? 'Ever Works Directory',
            url: siteUrl,
            description: (config as { description?: string; tagline?: string }).description
                ?? (config as { tagline?: string }).tagline
                ?? ''
        },
        generatedAt: new Date().toISOString(),
        count: items.length,
        items: (items as ReadonlyArray<ItemShape>).map((item) => ({
            slug: item.slug ?? item.id,
            name: item.name ?? item.meta?.name ?? item.title,
            url:
                item.meta?.source_url ||
                item.meta?.url ||
                item.url ||
                (siteUrl ? `${siteUrl}/item/${item.slug ?? item.id}` : undefined),
            description: item.meta?.description ?? item.description,
            categories: item.meta?.category ?? item.categories ?? [],
            tags: item.meta?.tags ?? item.tags ?? []
        }))
    };

    return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=900',
            'Access-Control-Allow-Origin': '*'
        }
    });
};
