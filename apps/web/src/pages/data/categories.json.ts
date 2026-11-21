/**
 * `/data/categories.json` — categories with item counts (Agent Access Contract v1).
 */
import type { APIRoute } from 'astro';
import { buildCategoriesDocument } from '@ever-works/agent-api';
import { jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    return jsonResponse(buildCategoriesDocument(site.content, site.siteUrl));
};
