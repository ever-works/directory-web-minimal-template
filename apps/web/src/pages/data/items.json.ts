/**
 * `/data/items.json` — every item as an `ItemSummary` (Agent Access Contract v1).
 */
import type { APIRoute } from 'astro';
import { buildItemsDocument } from '@ever-works/agent-api';
import { jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    return jsonResponse(buildItemsDocument(site.content, site.siteUrl));
};
