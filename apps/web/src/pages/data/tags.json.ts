/**
 * `/data/tags.json` — tags with item counts, most used first (Agent Access Contract v1).
 */
import type { APIRoute } from 'astro';
import { buildTagsDocument } from '@ever-works/agent-api';
import { jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    return jsonResponse(buildTagsDocument(site.content, site.siteUrl));
};
