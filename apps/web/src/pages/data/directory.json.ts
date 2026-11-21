/**
 * `/data/directory.json` — directory metadata, counts and endpoint map (Agent Access Contract v1).
 */
import type { APIRoute } from 'astro';
import { buildDirectoryInfo } from '@ever-works/agent-api';
import { agentOptions, jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    return jsonResponse(buildDirectoryInfo(site.content, agentOptions(site)));
};
