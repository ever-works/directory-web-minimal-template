/**
 * `/.well-known/mcp.json` — MCP server card (only meaningful when `/mcp` is served; otherwise it says so).
 */
import type { APIRoute } from 'astro';
import { buildDirectoryInfo, buildMcpServerCard } from '@ever-works/agent-api';
import { agentOptions, jsonResponse } from '../../lib/agent';
import { getSite } from '../../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    const directory = buildDirectoryInfo(site.content, agentOptions(site));
    return jsonResponse(
        directory.endpoints.mcp
            ? buildMcpServerCard(directory)
            : { name: 'ever-works-directory', title: directory.name, available: false, openapi: directory.endpoints.openapi, documentation: directory.endpoints.llms }
    );
};
