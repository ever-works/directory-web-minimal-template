import { describe, it, expect } from 'vitest';
import {
    buildCategoriesDocument,
    buildDirectoryInfo,
    buildItemsDocument,
    buildSearchIndex,
    buildTagsDocument,
    createAgentDataset,
    createTaxonomyIndex,
    relatedSlugsOf
} from '../build';
import { buildApiCatalog, buildMcpServerCard, buildOpenApiDocument } from '../discovery';
import { content } from './fixtures';

const SITE = 'https://crm.ever.works/';

describe('taxonomy resolution', () => {
    it('maps names, ids and slugs to taxonomy entries; unknowns are slugified', () => {
        const data = content();
        const taxonomy = createTaxonomyIndex(data.categories, data.tags);
        expect(taxonomy.category('Open-Source & Self-Hosted CRM')).toEqual({
            id: 'open-source-self-hosted-crm',
            name: 'Open Source & Self Hosted CRM'
        });
        expect(taxonomy.tag('open-source')).toEqual({ id: 'open-source', name: 'Open Source' });
        expect(taxonomy.tag('Brand New')).toEqual({ id: 'brand-new', name: 'Brand New' });
    });
});

describe('documents', () => {
    it('builds item summaries with absolute URLs and resolved taxonomy', () => {
        const doc = buildItemsDocument(content(), SITE);
        expect(doc.version).toBe(1);
        expect(doc.total).toBe(3);
        const [hubspot, twenty, espo] = doc.items;
        expect(hubspot).toMatchObject({
            slug: 'hubspot',
            url: 'https://crm.ever.works/item/hubspot',
            website: 'https://hubspot.example.com',
            categories: ['Sales CRM'],
            category_ids: ['sales-crm'],
            tags: ['Freemium', 'API'],
            tag_ids: ['freemium', 'api'],
            featured: true,
            logo: 'https://hubspot.example.com/logo.png',
            updated_at: '2026-03-01 09:00'
        });
        expect(twenty?.logo).toBe('https://twenty.example.com/icon.svg');
        expect(twenty?.category_ids).toEqual(['open-source-self-hosted-crm']);
        expect(espo?.website).toBeNull();
        expect(espo?.category_ids).toEqual(['open-source-self-hosted-crm', 'sales-crm']);
    });

    it('builds directory info', () => {
        const info = buildDirectoryInfo(content(), {
            siteUrl: SITE,
            description: 'CRM software.',
            dataRepository: 'https://github.com/ever-works/awesome-crm-data',
            submitUrl: '/submit',
            mcpEnabled: true
        });
        expect(info).toMatchObject({
            version: 1,
            name: 'Awesome CRM',
            description: 'CRM software.',
            url: 'https://crm.ever.works',
            counts: { items: 3, categories: 2, tags: 4, collections: 0, comparisons: 0 },
            updated_at: '2026-05-01 09:00',
            submit_url: 'https://crm.ever.works/submit',
            generator: 'ever-works-minimal'
        });
        expect(info.endpoints.mcp).toBe('https://crm.ever.works/mcp');
        expect(info.endpoints.item).toBe('https://crm.ever.works/data/items/{slug}.json');
    });

    it('generates a description and null MCP when disabled', () => {
        const info = buildDirectoryInfo(content(), { siteUrl: SITE });
        expect(info.description).toBe('A curated directory of 3 tools.');
        expect(info.endpoints.mcp).toBeNull();
        expect(info.submit_url).toBeNull();
    });

    it('builds category and tag documents (tags by usage)', () => {
        const categories = buildCategoriesDocument(content(), SITE);
        expect(categories.categories[1]).toEqual({
            id: 'open-source-self-hosted-crm',
            name: 'Open Source & Self Hosted CRM',
            description: 'OSS',
            count: 2,
            url: 'https://crm.ever.works/category/open-source-self-hosted-crm'
        });
        const tags = buildTagsDocument(content(), SITE);
        expect(tags.tags.map((t) => t.id)).toEqual(['open-source', 'api', 'freemium', 'self-hosted']);
    });

    it('builds a compact search index', () => {
        const index = buildSearchIndex(content(), 20);
        expect(index.v).toBe(1);
        expect(index.i[0]).toEqual({
            s: 'hubspot',
            n: 'HubSpot CRM',
            d: 'Free CRM with marke…',
            c: [0],
            t: [0, 1],
            f: 1,
            l: 'https://hubspot.example.com/logo.png',
            w: 'https://hubspot.example.com',
            u: '2026-03-01 09:00'
        });
        expect(index.c[0]).toEqual(['sales-crm', 'Sales CRM']);
        expect(index.t[0]).toEqual(['freemium', 'Freemium']);
        expect(index.i[2]?.w).toBeUndefined();
    });
});

describe('dataset', () => {
    it('serves item details with related slugs and safe images', async () => {
        const dataset = createAgentDataset(content(), { siteUrl: SITE, mcpEnabled: true });
        const detail = await dataset.getItem('hubspot');
        expect(detail).toMatchObject({
            markdown: '## Overview\n\nHubSpot.',
            markdown_url: 'https://crm.ever.works/item/hubspot.md',
            images: ['https://hubspot.example.com/shot.png'],
            related: ['twenty']
        });
        expect(await dataset.getItem('missing')).toBeNull();
        expect(relatedSlugsOf(content().items[1]!)).toEqual([]);
    });
});

describe('discovery documents', () => {
    const info = buildDirectoryInfo(content(), { siteUrl: SITE, mcpEnabled: true });

    it('describes the read API and MCP in OpenAPI 3.1', () => {
        const doc = buildOpenApiDocument(info) as { openapi: string; paths: Record<string, unknown>; servers: unknown };
        expect(doc.openapi).toBe('3.1.0');
        expect(Object.keys(doc.paths)).toEqual([
            '/data/directory.json',
            '/data/items.json',
            '/data/items/{slug}.json',
            '/data/categories.json',
            '/data/tags.json',
            '/mcp'
        ]);
        expect(doc.servers).toEqual([{ url: 'https://crm.ever.works' }]);
        const noMcp = buildOpenApiDocument(buildDirectoryInfo(content(), { siteUrl: SITE })) as {
            paths: Record<string, unknown>;
        };
        expect(noMcp.paths['/mcp']).toBeUndefined();
    });

    it('builds the MCP server card and API catalog', () => {
        expect(buildMcpServerCard(info)).toMatchObject({
            url: 'https://crm.ever.works/mcp',
            transport: 'streamable-http',
            tools: ['get_directory_info', 'search_items', 'list_items', 'get_item', 'list_categories', 'list_tags']
        });
        const catalog = buildApiCatalog(info) as { linkset: Array<Record<string, unknown>> };
        expect(catalog.linkset[0]?.['anchor']).toBe('https://crm.ever.works/data/');
        expect(catalog.linkset[0]?.['service-meta']).toBeDefined();
    });
});
