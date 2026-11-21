/**
 * Agent Access glue for the web app: build options for `@ever-works/agent-api` and a JSON response helper.
 * See `.specify/features/agent-access.md`.
 */

import type { AgentBuildOptions } from '@ever-works/agent-api';
import type { SiteContext } from './site';

/** Options for the agent-api builders, derived from the site context. */
export function agentOptions(site: SiteContext): AgentBuildOptions {
    return {
        siteUrl: site.siteUrl,
        description: site.description,
        dataRepository: site.dataRepository?.url ?? null,
        submitUrl: site.submitHref,
        mcpEnabled: site.mcpEnabled,
        generator: 'ever-works-minimal'
    };
}

/** JSON response for public, cacheable, CORS-enabled data endpoints. */
export function jsonResponse(body: unknown, contentType = 'application/json; charset=utf-8'): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=300, s-maxage=900',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
