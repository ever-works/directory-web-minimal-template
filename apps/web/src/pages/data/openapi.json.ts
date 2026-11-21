/**
 * `/data/openapi.json` — OpenAPI 3.1 description of the read API (+ `/mcp` when served). Import it into ChatGPT
 * Actions or any OpenAPI client.
 */
import type { APIRoute } from 'astro';
import { buildDirectoryInfo, buildOpenApiDocument } from '@ever-works/agent-api';
import { agentOptions, jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    return jsonResponse(buildOpenApiDocument(buildDirectoryInfo(site.content, agentOptions(site))), 'application/openapi+json; charset=utf-8');
};
