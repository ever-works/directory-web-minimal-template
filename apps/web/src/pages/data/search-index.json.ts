/**
 * `/data/search-index.json` — compact index used by the site's search dialog and listing filters (not part of the
 * public agent contract; agents should use `/data/items.json`).
 */
import type { APIRoute } from 'astro';
import { buildSearchIndex } from '@ever-works/agent-api';
import { jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    return jsonResponse(buildSearchIndex(site.content));
};
