/**
 * `/.well-known/api-catalog` — RFC 9727 API catalog (linkset) pointing to the OpenAPI description, llms.txt and the
 * MCP server card.
 */
import type { APIRoute } from 'astro';
import { buildApiCatalog, buildDirectoryInfo } from '@ever-works/agent-api';
import { agentOptions, jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    return jsonResponse(buildApiCatalog(buildDirectoryInfo(site.content, agentOptions(site))), 'application/linkset+json; charset=utf-8');
};
