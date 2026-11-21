/**
 * Discovery documents: OpenAPI 3.1 description of the read API, the MCP server card, and the RFC 9727 API catalog.
 *
 * These let agents find the data without scraping: ChatGPT "Actions" / any OpenAPI client import
 * `/data/openapi.json`; MCP-aware clients read `/.well-known/mcp.json`; generic crawlers follow
 * `/.well-known/api-catalog`.
 */

import { MCP_TOOL_NAMES, SUPPORTED_PROTOCOL_VERSIONS } from './mcp';
import type { DirectoryInfo } from './types';

const itemSummarySchema = {
    type: 'object',
    required: ['slug', 'name', 'description', 'url', 'categories', 'category_ids', 'tags', 'tag_ids', 'featured'],
    properties: {
        slug: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        url: { type: 'string', format: 'uri', description: 'Item page on this directory' },
        website: { type: ['string', 'null'], format: 'uri', description: "The item's own website" },
        categories: { type: 'array', items: { type: 'string' } },
        category_ids: { type: 'array', items: { type: 'string' } },
        tags: { type: 'array', items: { type: 'string' } },
        tag_ids: { type: 'array', items: { type: 'string' } },
        featured: { type: 'boolean' },
        logo: { type: ['string', 'null'], format: 'uri' },
        updated_at: { type: ['string', 'null'] }
    }
} as const;

/**
 * Build the OpenAPI 3.1 document for `/data/openapi.json`.
 *
 * @param directory - Directory info (name, URL, endpoints)
 */
export function buildOpenApiDocument(directory: DirectoryInfo): Record<string, unknown> {
    const noun = directory.items_name.toLowerCase();
    const jsonResponse = (schemaRef: string, description: string) => ({
        '200': { description, content: { 'application/json': { schema: { $ref: schemaRef } } } }
    });
    const paths: Record<string, unknown> = {
        '/data/directory.json': {
            get: {
                operationId: 'getDirectory',
                summary: 'Directory metadata, counts and endpoints',
                responses: jsonResponse('#/components/schemas/DirectoryInfo', 'Directory metadata')
            }
        },
        '/data/items.json': {
            get: {
                operationId: 'listItems',
                summary: `Every ${directory.item_name.toLowerCase()} in the directory (summary fields)`,
                description: `Returns all ${noun}. Filter client-side by category_ids / tag_ids, or use the MCP search_items tool for ranked search.`,
                responses: jsonResponse('#/components/schemas/ItemsDocument', `All ${noun}`)
            }
        },
        '/data/items/{slug}.json': {
            get: {
                operationId: 'getItem',
                summary: `One ${directory.item_name.toLowerCase()} with its full Markdown write-up`,
                parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    ...jsonResponse('#/components/schemas/ItemDetail', 'Item details'),
                    '404': { description: 'Unknown slug' }
                }
            }
        },
        '/data/categories.json': {
            get: {
                operationId: 'listCategories',
                summary: 'Categories with item counts',
                responses: jsonResponse('#/components/schemas/CategoriesDocument', 'Categories')
            }
        },
        '/data/tags.json': {
            get: {
                operationId: 'listTags',
                summary: 'Tags with item counts, most used first',
                responses: jsonResponse('#/components/schemas/TagsDocument', 'Tags')
            }
        }
    };
    if (directory.endpoints.mcp) {
        paths['/mcp'] = {
            post: {
                operationId: 'mcp',
                summary: 'Model Context Protocol endpoint (Streamable HTTP, JSON-RPC 2.0)',
                description: `Tools: ${MCP_TOOL_NAMES.join(', ')}. Protocol versions: ${SUPPORTED_PROTOCOL_VERSIONS.join(', ')}.`,
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
                responses: { '200': { description: 'JSON-RPC response', content: { 'application/json': { schema: { type: 'object' } } } }, '202': { description: 'Notification accepted' } }
            }
        };
    }

    return {
        openapi: '3.1.0',
        info: {
            title: `${directory.name} — Directory Data API`,
            version: '1.0.0',
            description: `${directory.description}\n\nRead-only, no authentication, CORS enabled. Agent guide: ${directory.endpoints.llms}`
        },
        servers: [{ url: directory.url }],
        externalDocs: { description: 'llms.txt', url: directory.endpoints.llms },
        paths,
        components: {
            schemas: {
                DirectoryInfo: {
                    type: 'object',
                    required: ['version', 'name', 'description', 'url', 'counts', 'endpoints'],
                    properties: {
                        version: { type: 'integer', const: 1 },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        url: { type: 'string', format: 'uri' },
                        item_name: { type: 'string' },
                        items_name: { type: 'string' },
                        counts: { type: 'object', additionalProperties: { type: 'integer' } },
                        updated_at: { type: ['string', 'null'] },
                        data_repository: { type: ['string', 'null'], format: 'uri' },
                        submit_url: { type: ['string', 'null'], format: 'uri' },
                        endpoints: { type: 'object', additionalProperties: { type: ['string', 'null'] } },
                        generator: { type: 'string' }
                    }
                },
                ItemSummary: itemSummarySchema,
                ItemDetail: {
                    allOf: [
                        { $ref: '#/components/schemas/ItemSummary' },
                        {
                            type: 'object',
                            properties: {
                                markdown: { type: ['string', 'null'] },
                                markdown_url: { type: 'string', format: 'uri' },
                                images: { type: 'array', items: { type: 'string', format: 'uri' } },
                                brand: { type: ['string', 'null'] },
                                publisher: { type: ['string', 'null'] },
                                related: { type: 'array', items: { type: 'string' }, description: 'Slugs of similar items' }
                            }
                        }
                    ]
                },
                ItemsDocument: {
                    type: 'object',
                    properties: {
                        version: { type: 'integer' },
                        total: { type: 'integer' },
                        items: { type: 'array', items: { $ref: '#/components/schemas/ItemSummary' } }
                    }
                },
                CategoriesDocument: {
                    type: 'object',
                    properties: {
                        version: { type: 'integer' },
                        total: { type: 'integer' },
                        categories: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: ['string', 'null'] },
                                    count: { type: 'integer' },
                                    url: { type: 'string', format: 'uri' }
                                }
                            }
                        }
                    }
                },
                TagsDocument: {
                    type: 'object',
                    properties: {
                        version: { type: 'integer' },
                        total: { type: 'integer' },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    count: { type: 'integer' },
                                    url: { type: 'string', format: 'uri' }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

/**
 * Build the MCP server card served at `/.well-known/mcp.json`.
 *
 * @param directory - Directory info (must have `endpoints.mcp`)
 */
export function buildMcpServerCard(directory: DirectoryInfo): Record<string, unknown> {
    return {
        name: 'ever-works-directory',
        title: directory.name,
        description: directory.description,
        version: '1.0.0',
        url: directory.endpoints.mcp,
        transport: 'streamable-http',
        protocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
        authentication: 'none',
        tools: [...MCP_TOOL_NAMES],
        documentation: directory.endpoints.llms,
        openapi: directory.endpoints.openapi
    };
}

/**
 * Build the RFC 9727 API catalog served at `/.well-known/api-catalog` (`application/linkset+json`).
 *
 * @param directory - Directory info
 */
export function buildApiCatalog(directory: DirectoryInfo): Record<string, unknown> {
    return {
        linkset: [
            {
                anchor: `${directory.url}/data/`,
                'service-desc': [{ href: directory.endpoints.openapi, type: 'application/openapi+json' }],
                'service-doc': [{ href: directory.endpoints.llms, type: 'text/plain' }],
                ...(directory.endpoints.mcp
                    ? { 'service-meta': [{ href: `${directory.url}/.well-known/mcp.json`, type: 'application/json' }] }
                    : {})
            }
        ]
    };
}
