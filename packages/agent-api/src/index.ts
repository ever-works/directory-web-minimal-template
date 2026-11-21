/**
 * @ever-works/agent-api
 *
 * Agent access for Ever Works directories (Agent Access Contract v1 — `.specify/features/agent-access.md`):
 * - builders for the static read API (`/data/*.json`) and the browser search index,
 * - shared search ranking (also used by the site's search dialog and listing filters),
 * - a framework-free MCP (Streamable HTTP) request handler,
 * - discovery documents (OpenAPI 3.1, MCP server card, RFC 9727 API catalog).
 *
 * Sub-path exports keep browser bundles small: `@ever-works/agent-api/search` has no dependencies.
 */

export type {
    AgentDataset,
    CategoriesDocument,
    CategoryEntry,
    DirectoryInfo,
    ItemDetail,
    ItemsDocument,
    ItemSummary,
    SearchIndex,
    SearchIndexItem,
    TagEntry,
    TagsDocument
} from './types';

export {
    buildCategoriesDocument,
    buildCategoryEntries,
    buildDirectoryInfo,
    buildItemsDocument,
    buildSearchIndex,
    buildTagEntries,
    buildTagsDocument,
    createAgentDataset,
    createTaxonomyIndex,
    itemCategoryRefs,
    itemLogo,
    itemTagRefs,
    normalizeSiteUrl,
    relatedSlugsOf,
    toItemDetail,
    toItemSummary
} from './build';
export type { AgentBuildOptions, TaxonomyIndex, TaxonomyRef } from './build';

export { dateValue, normalizeText, rankItems, scoreItem, sortItems, taxonomySlug, tokenize } from './search';
export type { ItemSort, SearchableText, SortableItem } from './search';

export {
    MCP_TOOL_NAMES,
    SUPPORTED_PROTOCOL_VERSIONS,
    filterSummaries,
    handleMcpRequest,
    mcpToolDefinitions,
    searchSummaries
} from './mcp';
export type { McpHandlerOptions } from './mcp';

export { buildApiCatalog, buildMcpServerCard, buildOpenApiDocument } from './discovery';
