/**
 * Static JSON endpoint — generates /data/items.json at build time.
 *
 * Contains all items with only the fields needed for client-side
 * filtering, sorting, and pagination. This avoids serializing
 * 3200+ items directly into the HTML page as component props.
 *
 * The ItemBrowser component fetches this lazily on first user
 * interaction (search, filter, sort, or page change).
 */
import type { APIRoute } from 'astro';
import { getContent } from '../../lib/content';

export const GET: APIRoute = async () => {
    const { items } = await getContent();

    const browserItems = items.map((item) => ({
        slug: item.slug,
        name: item.name,
        description: item.description,
        category: item.category,
        tags: item.tags,
        featured: item.featured,
        icon_url: item.icon_url,
        updated_at: item.updated_at,
    }));

    return new Response(JSON.stringify(browserItems), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
