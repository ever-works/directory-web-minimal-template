/**
 * Cloudflare Worker entry for static deploys (`.github/workflows/deploy_cloudflare.yaml`).
 *
 * The Worker is configured with `assets.run_worker_first: ["/mcp", "/mcp/*"]`, so it only runs for the MCP
 * endpoint: every other request is served straight from Workers Static Assets (no Worker invocation, no cost).
 *
 * The MCP dataset is read from the site's own static read API through the `ASSETS` binding
 * (`/data/directory.json`, `/data/items.json`, `/data/categories.json`, `/data/tags.json`; item details on demand
 * from `/data/items/<slug>.json`) and cached per isolate for a few minutes. See `.specify/features/agent-access.md`.
 */

import { handleMcpRequest } from '@ever-works/agent-api/mcp';
import type {
    AgentDataset,
    CategoriesDocument,
    DirectoryInfo,
    ItemDetail,
    ItemsDocument,
    TagsDocument
} from '@ever-works/agent-api/types';

/** Minimal shape of the Workers Static Assets binding. */
interface AssetsBinding {
    fetch(request: Request): Promise<Response>;
}

/** Worker environment bindings. */
export interface WorkerEnv {
    ASSETS: AssetsBinding;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { origin: string; at: number; dataset: Promise<AgentDataset> } | null = null;

async function readJson<T>(env: WorkerEnv, origin: string, path: string): Promise<T> {
    const response = await env.ASSETS.fetch(new Request(new URL(path, origin)));
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    return (await response.json()) as T;
}

/**
 * Load the MCP dataset from the static read API.
 *
 * @param env - Worker bindings
 * @param origin - Request origin (used to build asset URLs)
 */
export async function loadDatasetFromAssets(env: WorkerEnv, origin: string): Promise<AgentDataset> {
    const [directory, items, categories, tags] = await Promise.all([
        readJson<DirectoryInfo>(env, origin, '/data/directory.json'),
        readJson<ItemsDocument>(env, origin, '/data/items.json'),
        readJson<CategoriesDocument>(env, origin, '/data/categories.json'),
        readJson<TagsDocument>(env, origin, '/data/tags.json')
    ]);
    const known = new Set(items.items.map((item) => item.slug));
    return {
        directory,
        items: items.items,
        categories: categories.categories,
        tags: tags.tags,
        async getItem(slug: string): Promise<ItemDetail | null> {
            if (!known.has(slug)) return null;
            return readJson<ItemDetail>(env, origin, `/data/items/${encodeURIComponent(slug)}.json`);
        }
    };
}

function dataset(env: WorkerEnv, origin: string): Promise<AgentDataset> {
    const now = Date.now();
    if (!cached || cached.origin !== origin || now - cached.at > CACHE_TTL_MS) {
        const promise = loadDatasetFromAssets(env, origin);
        cached = { origin, at: now, dataset: promise };
        promise.catch(() => {
            if (cached?.dataset === promise) cached = null;
        });
    }
    return cached.dataset;
}

export default {
    async fetch(request: Request, env: WorkerEnv): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === '/mcp' || url.pathname === '/mcp/') {
            return handleMcpRequest(request, { loadDataset: () => dataset(env, url.origin) });
        }
        return env.ASSETS.fetch(request);
    }
};
