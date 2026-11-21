import { describe, it, expect, vi } from 'vitest';
import { createAgentDataset } from '../build';
import { handleMcpRequest, mcpToolDefinitions, MCP_TOOL_NAMES } from '../mcp';
import { content } from './fixtures';

const dataset = createAgentDataset(content(), {
    siteUrl: 'https://crm.ever.works',
    description: 'CRM software.',
    mcpEnabled: true
});
const loadDataset = vi.fn(async () => dataset);

async function rpc(body: unknown, init: RequestInit = {}) {
    const response = await handleMcpRequest(
        new Request('https://crm.ever.works/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
            body: typeof body === 'string' ? body : JSON.stringify(body),
            ...init
        }),
        { loadDataset }
    );
    const text = await response.text();
    return { response, body: text ? JSON.parse(text) : null };
}

async function call(name: string, args: Record<string, unknown> = {}) {
    const { body } = await rpc({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name, arguments: args } });
    return body.result;
}

describe('MCP transport', () => {
    it('answers CORS preflight and rejects GET', async () => {
        const preflight = await handleMcpRequest(new Request('https://x/mcp', { method: 'OPTIONS' }), { loadDataset });
        expect(preflight.status).toBe(204);
        expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe('*');
        const get = await handleMcpRequest(new Request('https://x/mcp'), { loadDataset });
        expect(get.status).toBe(405);
        expect(get.headers.get('Allow')).toBe('POST, OPTIONS');
    });

    it('reports parse errors and rejects batches', async () => {
        const bad = await rpc('{not json');
        expect(bad.response.status).toBe(400);
        expect(bad.body.error.code).toBe(-32700);
        const batch = await rpc([{ jsonrpc: '2.0', id: 1, method: 'ping' }]);
        expect(batch.body.error.code).toBe(-32600);
        const noMethod = await rpc({ jsonrpc: '2.0', id: 1 });
        expect(noMethod.body.error.code).toBe(-32600);
        const scalar = await rpc('42');
        expect(scalar.body.error.code).toBe(-32600);
    });

    it('accepts notifications and client responses with 202', async () => {
        const note = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
        expect(note.response.status).toBe(202);
        expect(note.body).toBeNull();
        const reply = await rpc({ jsonrpc: '2.0', result: {} });
        expect(reply.response.status).toBe(202);
        const replyWithId = await rpc({ jsonrpc: '2.0', id: 1, result: {} });
        expect(replyWithId.response.status).toBe(202);
        const errorReply = await rpc({ jsonrpc: '2.0', id: 2, error: { code: -1, message: 'x' } });
        expect(errorReply.response.status).toBe(202);
    });

    it('rejects a null request id', async () => {
        const nullId = await rpc({ jsonrpc: '2.0', id: null, method: 'tools/list' });
        expect(nullId.response.status).toBe(400);
        expect(nullId.body.error.code).toBe(-32600);
    });

    it('enforces allowedOrigins when configured', async () => {
        const call = (origin: string | null) =>
            handleMcpRequest(
                new Request('https://crm.ever.works/mcp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' })
                }),
                { loadDataset, allowedOrigins: ['https://crm.ever.works'] }
            );
        expect((await call('https://evil.example')).status).toBe(403);
        expect((await call('https://crm.ever.works')).status).toBe(200);
        expect((await call(null)).status).toBe(200);
    });

    it('initializes with version negotiation', async () => {
        const { response, body } = await rpc({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } }
        });
        expect(response.headers.get('Content-Type')).toBe('application/json');
        expect(body.result.protocolVersion).toBe('2025-06-18');
        expect(body.result.capabilities).toEqual({ tools: { listChanged: false } });
        expect(body.result.serverInfo).toMatchObject({ name: 'ever-works-directory', title: 'Awesome CRM' });
        expect(body.result.instructions).toContain('search_items');
        const unknown = await rpc({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: '1999-01-01' } });
        expect(unknown.body.result.protocolVersion).toBe('2025-11-25');
    });

    it('handles ping, empty resource/prompt lists and unknown methods', async () => {
        expect((await rpc({ jsonrpc: '2.0', id: 'a', method: 'ping' })).body).toEqual({ jsonrpc: '2.0', id: 'a', result: {} });
        expect((await rpc({ jsonrpc: '2.0', id: 1, method: 'resources/list' })).body.result).toEqual({ resources: [] });
        expect((await rpc({ jsonrpc: '2.0', id: 1, method: 'prompts/list' })).body.result).toEqual({ prompts: [] });
        expect((await rpc({ jsonrpc: '2.0', id: 1, method: 'sampling/x' })).body.error.code).toBe(-32601);
    });

    it('lists the contract tools', async () => {
        const { body } = await rpc({ jsonrpc: '2.0', id: 3, method: 'tools/list' });
        expect(body.result.tools.map((t: { name: string }) => t.name)).toEqual([...MCP_TOOL_NAMES]);
        expect(mcpToolDefinitions('Tools')[1]?.['title']).toBe('Search tools');
    });

    it('returns -32602 for unknown tools and -32603 for loader failures', async () => {
        const unknown = await rpc({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'drop_db' } });
        expect(unknown.body.error.code).toBe(-32602);
        const failing = await handleMcpRequest(
            new Request('https://x/mcp', {
                method: 'POST',
                body: JSON.stringify({ jsonrpc: '2.0', id: 5, method: 'tools/list' })
            }),
            { loadDataset: async () => Promise.reject(new Error('assets down')) }
        );
        const body = await failing.json();
        expect(body.error).toEqual({ code: -32603, message: 'Internal error: the directory data could not be loaded' });
    });
});

describe('MCP tools', () => {
    it('get_directory_info', async () => {
        const result = await call('get_directory_info');
        expect(result.structuredContent.name).toBe('Awesome CRM');
        expect(JSON.parse(result.content[0].text).url).toBe('https://crm.ever.works');
    });

    it('search_items ranks and filters', async () => {
        const result = await call('search_items', { query: 'open source', limit: 5 });
        expect(result.structuredContent.items.map((i: { slug: string }) => i.slug)).toEqual(['twenty', 'espocrm']);
        const filtered = await call('search_items', { query: 'crm', category: 'Sales CRM' });
        expect(filtered.structuredContent.items.map((i: { slug: string }) => i.slug)).toEqual(['hubspot', 'espocrm']);
        const byTag = await call('search_items', { query: 'crm', tag: 'api' });
        expect(byTag.structuredContent.total).toBe(1);
    });

    it('search_items validates input as a tool error', async () => {
        const missing = await call('search_items', {});
        expect(missing.isError).toBe(true);
        const wrongType = await call('search_items', { query: 5 });
        expect(wrongType.isError).toBe(true);
        const badLimit = await call('search_items', { query: 'crm', limit: 'abc' });
        expect(badLimit.isError).toBe(true);
    });

    it('list_items filters, sorts and pages', async () => {
        const all = await call('list_items', {});
        expect(all.structuredContent).toMatchObject({ total: 3, offset: 0, limit: 25 });
        expect(all.structuredContent.items[0].slug).toBe('hubspot');
        const oss = await call('list_items', { category: 'open-source-self-hosted-crm', sort: 'date-desc' });
        expect(oss.structuredContent.items.map((i: { slug: string }) => i.slug)).toEqual(['twenty', 'espocrm']);
        const featured = await call('list_items', { featured: true });
        expect(featured.structuredContent.total).toBe(1);
        const paged = await call('list_items', { sort: 'name-asc', offset: 1, limit: 1 });
        expect(paged.structuredContent.items.map((i: { slug: string }) => i.slug)).toEqual(['hubspot']);
        expect((await call('list_items', { sort: 'random' })).isError).toBe(true);
        expect((await call('list_items', { featured: 'yes' })).isError).toBe(true);
    });

    it('get_item returns details or a tool error', async () => {
        const found = await call('get_item', { slug: 'hubspot' });
        expect(found.structuredContent.related).toEqual(['twenty']);
        const missing = await call('get_item', { slug: 'nope' });
        expect(missing.isError).toBe(true);
        expect(missing.content[0].text).toContain('search_items');
        expect((await call('get_item', {})).isError).toBe(true);
    });

    it('list_categories and list_tags', async () => {
        expect((await call('list_categories')).structuredContent.total).toBe(2);
        const tags = await call('list_tags', { limit: 2 });
        expect(tags.structuredContent.total).toBe(4);
        expect(tags.structuredContent.tags).toHaveLength(2);
    });
});
