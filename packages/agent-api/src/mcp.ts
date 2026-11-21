/**
 * Model Context Protocol server for an Ever Works directory — Streamable HTTP transport, stateless, JSON responses.
 *
 * Framework-free: takes a standard `Request`, returns a standard `Response`, so the same code runs in a Cloudflare
 * Worker (static deploys), an Astro on-demand endpoint (Vercel/ISR) or any fetch-compatible runtime.
 *
 * Implemented surface (Agent Access Contract v1, `.specify/features/agent-access.md`):
 * - `initialize` (protocol version negotiation), `ping`, `tools/list`, `tools/call`; notifications → `202`.
 * - Read-only tools: `get_directory_info`, `search_items`, `list_items`, `get_item`, `list_categories`, `list_tags`.
 * - `GET` → `405`, `OPTIONS` → CORS preflight `204`, CORS `*` on every response. No sessions, no auth.
 */

import { normalizeText, rankItems, sortItems, taxonomySlug, type ItemSort } from './search';
import type { AgentDataset, ItemSummary } from './types';

/** Protocol revisions this server speaks, newest first. */
export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'] as const;

/** Tool names (part of the public contract). */
export const MCP_TOOL_NAMES = [
    'get_directory_info',
    'search_items',
    'list_items',
    'get_item',
    'list_categories',
    'list_tags'
] as const;

/** Options for {@link handleMcpRequest}. */
export interface McpHandlerOptions {
    /** Loads (or returns a cached) dataset. Called lazily, only for requests that need data. */
    loadDataset: () => Promise<AgentDataset>;
    /** Server version reported in `serverInfo` (default `1.0.0`) */
    version?: string;
    /**
     * Browser origins allowed to call the endpoint (exact match, e.g. `https://crm.ever.works`). When omitted every
     * origin is allowed, which is the default because the data is public and read-only.
     */
    allowedOrigins?: readonly string[];
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonRpcId = string | number | null;

interface JsonRpcRequest {
    jsonrpc?: unknown;
    id?: unknown;
    method?: unknown;
    params?: unknown;
}

const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers':
        'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
    'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
    'Access-Control-Max-Age': '86400'
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS, ...extra }
    });
}

function rpcResult(id: JsonRpcId, result: unknown): Response {
    return json({ jsonrpc: '2.0', id, result });
}

function rpcError(id: JsonRpcId, code: number, message: string, status = 200): Response {
    return json({ jsonrpc: '2.0', id, error: { code, message } }, status);
}

function negotiateVersion(requested: unknown): string {
    return typeof requested === 'string' && (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(requested)
        ? requested
        : SUPPORTED_PROTOCOL_VERSIONS[0];
}

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

/** JSON Schemas of the tools, as advertised by `tools/list`. */
export function mcpToolDefinitions(itemsName = 'items'): Array<Record<string, JsonValue>> {
    const noun = itemsName.toLowerCase();
    return [
        {
            name: 'get_directory_info',
            title: 'Directory info',
            description: `Describe this directory: name, purpose, how many ${noun}/categories/tags it lists, and its data endpoints.`,
            inputSchema: { type: 'object', properties: {}, additionalProperties: false },
            annotations: READ_ONLY
        },
        {
            name: 'search_items',
            title: `Search ${noun}`,
            description: `Full-text search of ${noun} by name, description, category and tag. Returns the best matches first. Use list_categories / list_tags to discover filter values.`,
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'What to look for, e.g. "open source time tracking".' },
                    category: { type: 'string', description: 'Optional category id, name or slug.' },
                    tag: { type: 'string', description: 'Optional tag id, name or slug.' },
                    limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
                },
                required: ['query'],
                additionalProperties: false
            },
            annotations: READ_ONLY
        },
        {
            name: 'list_items',
            title: `List ${noun}`,
            description: `List ${noun}, optionally filtered by category, tag or featured flag, with offset/limit paging.`,
            inputSchema: {
                type: 'object',
                properties: {
                    category: { type: 'string', description: 'Category id, name or slug.' },
                    tag: { type: 'string', description: 'Tag id, name or slug.' },
                    featured: { type: 'boolean', description: 'Only featured entries.' },
                    sort: {
                        type: 'string',
                        enum: ['featured', 'name-asc', 'name-desc', 'date-desc', 'date-asc'],
                        default: 'featured'
                    },
                    offset: { type: 'integer', minimum: 0, default: 0 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
                },
                additionalProperties: false
            },
            annotations: READ_ONLY
        },
        {
            name: 'get_item',
            title: 'Get item details',
            description: `Full details of one entry by slug: description, website, categories, tags, Markdown write-up, images and related ${noun}.`,
            inputSchema: {
                type: 'object',
                properties: { slug: { type: 'string', description: 'Item slug (from search_items or list_items).' } },
                required: ['slug'],
                additionalProperties: false
            },
            annotations: READ_ONLY
        },
        {
            name: 'list_categories',
            title: 'List categories',
            description: `All categories with the number of ${noun} in each.`,
            inputSchema: { type: 'object', properties: {}, additionalProperties: false },
            annotations: READ_ONLY
        },
        {
            name: 'list_tags',
            title: 'List tags',
            description: `Tags with usage counts, most used first.`,
            inputSchema: {
                type: 'object',
                properties: { limit: { type: 'integer', minimum: 1, maximum: 1000 } },
                additionalProperties: false
            },
            annotations: READ_ONLY
        }
    ];
}

/** Error raised for invalid tool arguments; reported as a tool result with `isError: true`. */
class ToolInputError extends Error {}

function args(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function optionalString(input: Record<string, unknown>, key: string): string | undefined {
    const value = input[key];
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string') throw new ToolInputError(`"${key}" must be a string`);
    return value.trim() || undefined;
}

function integer(input: Record<string, unknown>, key: string, fallback: number, min: number, max: number): number {
    const value = input[key];
    if (value === undefined || value === null) return fallback;
    const number = typeof value === 'string' ? Number(value) : value;
    if (typeof number !== 'number' || !Number.isFinite(number)) throw new ToolInputError(`"${key}" must be a number`);
    return Math.min(max, Math.max(min, Math.floor(number)));
}

function matchesTaxonomy(ids: readonly string[], names: readonly string[], wanted: string): boolean {
    const key = taxonomySlug(wanted);
    if (!key) {
        // Non-Latin values (e.g. "東京") slugify to "": compare normalized text instead, never via the empty slug,
        // otherwise every non-Latin category would match every other one.
        const text = normalizeText(wanted.trim());
        return [...ids, ...names].some((value) => normalizeText(value.trim()) === text);
    }
    return ids.some((id) => taxonomySlug(id) === key) || names.some((name) => taxonomySlug(name) === key);
}

/**
 * Filter summaries by category / tag / featured.
 *
 * @param items - Item summaries
 * @param filters - Optional filters (category/tag accept id, name or slug)
 */
export function filterSummaries(
    items: readonly ItemSummary[],
    filters: { category?: string; tag?: string; featured?: boolean }
): ItemSummary[] {
    return items.filter(
        (item) =>
            (!filters.category || matchesTaxonomy(item.category_ids, item.categories, filters.category)) &&
            (!filters.tag || matchesTaxonomy(item.tag_ids, item.tags, filters.tag)) &&
            (filters.featured !== true || item.featured)
    );
}

/**
 * Search summaries with the shared ranking.
 *
 * @param items - Item summaries
 * @param query - Search query
 */
export function searchSummaries(items: readonly ItemSummary[], query: string): ItemSummary[] {
    return rankItems(items, query, (item) => ({
        name: item.name,
        description: item.description,
        taxonomy: [...item.categories, ...item.tags],
        featured: item.featured
    }));
}

const SORTS: readonly ItemSort[] = ['featured', 'name-asc', 'name-desc', 'date-desc', 'date-asc'];

async function callTool(name: string, rawArgs: unknown, dataset: AgentDataset): Promise<unknown> {
    const input = args(rawArgs);
    switch (name) {
        case 'get_directory_info':
            return dataset.directory;
        case 'search_items': {
            const query = optionalString(input, 'query');
            if (!query) throw new ToolInputError('"query" is required');
            const limit = integer(input, 'limit', 10, 1, 50);
            const filtered = filterSummaries(dataset.items, {
                category: optionalString(input, 'category'),
                tag: optionalString(input, 'tag')
            });
            const hits = searchSummaries(filtered, query);
            return { query, total: hits.length, items: hits.slice(0, limit) };
        }
        case 'list_items': {
            const sortValue = optionalString(input, 'sort') ?? 'featured';
            if (!SORTS.includes(sortValue as ItemSort)) throw new ToolInputError(`"sort" must be one of ${SORTS.join(', ')}`);
            if (input['featured'] !== undefined && typeof input['featured'] !== 'boolean') {
                throw new ToolInputError('"featured" must be a boolean');
            }
            const offset = integer(input, 'offset', 0, 0, Number.MAX_SAFE_INTEGER);
            const limit = integer(input, 'limit', 25, 1, 100);
            const filtered = filterSummaries(dataset.items, {
                category: optionalString(input, 'category'),
                tag: optionalString(input, 'tag'),
                featured: input['featured'] === true
            });
            const sorted = sortItems(filtered, sortValue as ItemSort, (item) => ({
                name: item.name,
                featured: item.featured,
                updated: item.updated_at
            }));
            return { total: sorted.length, offset, limit, items: sorted.slice(offset, offset + limit) };
        }
        case 'get_item': {
            const slug = optionalString(input, 'slug');
            if (!slug) throw new ToolInputError('"slug" is required');
            const item = await dataset.getItem(slug);
            if (!item) throw new ToolInputError(`No item with slug "${slug}". Use search_items to find valid slugs.`);
            return item;
        }
        case 'list_categories':
            return { total: dataset.categories.length, categories: dataset.categories };
        case 'list_tags': {
            const limit = integer(input, 'limit', dataset.tags.length || 1, 1, 100000);
            return { total: dataset.tags.length, tags: dataset.tags.slice(0, limit) };
        }
        default:
            return undefined;
    }
}

function instructions(dataset: AgentDataset): string {
    const d = dataset.directory;
    return (
        `${d.name} (${d.url}) — ${d.description} It lists ${d.counts.items} ${d.items_name.toLowerCase()} in ` +
        `${d.counts.categories} categories. Use search_items for questions like "best open source options", ` +
        `list_items to browse a category or tag, get_item for full details of one entry, and list_categories / ` +
        `list_tags to discover filters. Always cite the entry's directory url.`
    );
}

/**
 * Handle one HTTP request to the MCP endpoint.
 *
 * @param request - Incoming request (any method)
 * @param options - Dataset loader and server version
 * @returns The HTTP response
 *
 * @example
 * ```typescript
 * // Cloudflare Worker
 * if (url.pathname === '/mcp') return handleMcpRequest(request, { loadDataset: () => loadFromAssets(env) });
 * ```
 */
export async function handleMcpRequest(request: Request, options: McpHandlerOptions): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
    // Origin check (MCP transport spec, DNS-rebinding protection). Off by default: this server only serves public,
    // read-only data with CORS `*`; deployments that want it pass `allowedOrigins`. Requests without an Origin
    // header (non-browser MCP clients) are always allowed.
    const origin = request.headers.get('Origin');
    if (origin && options.allowedOrigins && !options.allowedOrigins.includes(origin)) {
        return json({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Origin not allowed' } }, 403);
    }
    if (request.method !== 'POST') {
        return json(
            { jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Method not allowed. POST JSON-RPC messages to this endpoint.' } },
            405,
            { Allow: 'POST, OPTIONS' }
        );
    }

    let message: unknown;
    try {
        message = await request.json();
    } catch {
        return rpcError(null, -32700, 'Parse error: body must be a JSON-RPC 2.0 message', 400);
    }

    // MCP-Protocol-Version header (sent by clients after initialize): an unsupported value is a 400 per the spec.
    const protocolHeader = request.headers.get('MCP-Protocol-Version');
    if (protocolHeader && !(SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(protocolHeader)) {
        return rpcError(null, -32600, `Unsupported MCP-Protocol-Version: ${protocolHeader.slice(0, 40)}`, 400);
    }
    if (Array.isArray(message)) return rpcError(null, -32600, 'Batch requests are not supported', 400);
    if (message === null || typeof message !== 'object') return rpcError(null, -32600, 'Invalid request', 400);

    const rpc = message as JsonRpcRequest & { result?: unknown; error?: unknown };
    const hasId = 'id' in rpc && (typeof rpc.id === 'string' || typeof rpc.id === 'number');
    const id: JsonRpcId = hasId ? (rpc.id as string | number) : null;

    if (rpc.jsonrpc !== '2.0') return rpcError(id, -32600, 'Invalid request: jsonrpc must be "2.0"', 400);

    // Client responses (to server requests; this server sends none) are acknowledged with 202 and no body.
    if (typeof rpc.method !== 'string') {
        if ('result' in rpc || 'error' in rpc) return new Response(null, { status: 202, headers: CORS_HEADERS });
        return rpcError(id, -32600, 'Invalid request: missing method', 400);
    }
    // A request id must be a string or number; `null` (or any other type) is invalid, not a notification.
    if ('id' in rpc && !hasId) return rpcError(null, -32600, 'Invalid request: id must be a string or number', 400);
    // Notifications (no id) are acknowledged with 202 and no body.
    if (!hasId) return new Response(null, { status: 202, headers: CORS_HEADERS });

    const params = args(rpc.params);

    try {
        switch (rpc.method) {
            case 'initialize': {
                const dataset = await options.loadDataset();
                return rpcResult(id, {
                    protocolVersion: negotiateVersion(params['protocolVersion']),
                    capabilities: { tools: { listChanged: false } },
                    serverInfo: {
                        name: 'ever-works-directory',
                        title: dataset.directory.name,
                        version: options.version ?? '1.0.0',
                        websiteUrl: dataset.directory.url
                    },
                    instructions: instructions(dataset)
                });
            }
            case 'ping':
                return rpcResult(id, {});
            case 'tools/list': {
                const dataset = await options.loadDataset();
                return rpcResult(id, { tools: mcpToolDefinitions(dataset.directory.items_name) });
            }
            case 'tools/call': {
                const name = params['name'];
                if (typeof name !== 'string' || !(MCP_TOOL_NAMES as readonly string[]).includes(name)) {
                    return rpcError(id, -32602, `Unknown tool: ${String(name)}`);
                }
                const dataset = await options.loadDataset();
                try {
                    const result = await callTool(name, params['arguments'], dataset);
                    return rpcResult(id, {
                        content: [{ type: 'text', text: JSON.stringify(result) }],
                        structuredContent: result
                    });
                } catch (error) {
                    if (error instanceof ToolInputError) {
                        return rpcResult(id, { content: [{ type: 'text', text: error.message }], isError: true });
                    }
                    throw error;
                }
            }
            case 'resources/list':
                return rpcResult(id, { resources: [] });
            case 'prompts/list':
                return rpcResult(id, { prompts: [] });
            default:
                return rpcError(id, -32601, `Method not found: ${rpc.method}`);
        }
    } catch {
        // Generic message: loader errors can carry file paths or upstream URLs that callers should not see.
        return rpcError(id, -32603, 'Internal error: the directory data could not be loaded');
    }
}
