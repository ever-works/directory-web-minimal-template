/**
 * `/mcp` for server (ISR / Vercel) builds — injected by `astro.config.ts` only when an adapter is present
 * (`ENABLE_ISR` not `false`). Static Cloudflare deploys serve `/mcp` from `src/worker/mcp-worker.ts` instead.
 */
import type { APIRoute } from 'astro';
import { createAgentDataset, handleMcpRequest } from '@ever-works/agent-api';
import type { AgentDataset } from '@ever-works/agent-api';
import type { ContentData } from '@ever-works/core';
import { agentOptions } from '../lib/agent';
import { getSite } from '../lib/site';

export const prerender = false;

let cache: { content: ContentData; dataset: AgentDataset } | null = null;

async function loadDataset(): Promise<AgentDataset> {
    const site = await getSite();
    if (!cache || cache.content !== site.content) {
        cache = { content: site.content, dataset: createAgentDataset(site.content, agentOptions(site)) };
    }
    return cache.dataset;
}

export const ALL: APIRoute = ({ request }) => handleMcpRequest(request, { loadDataset });
