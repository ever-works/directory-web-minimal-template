/**
 * Builders that turn loaded directory content into the Agent Access Contract v1 documents.
 *
 * Pure functions over `ContentData` — used by the static `/data/*.json` endpoints at build time and by the in-process
 * MCP dataset in server (ISR) mode.
 */

import type { CategoryWithCount, ContentData, ItemData, TagWithCount } from '@ever-works/core';
import { taxonomySlug } from './search';
import type {
    AgentDataset,
    CategoriesDocument,
    CategoryEntry,
    DirectoryInfo,
    ItemDetail,
    ItemsDocument,
    ItemSummary,
    SearchIndex,
    TagEntry,
    TagsDocument
} from './types';

/** Options shared by the builders. */
export interface AgentBuildOptions {
    /** Absolute site URL, e.g. `https://crm.ever.works` (trailing slash is stripped) */
    siteUrl: string;
    /** Directory description (falls back to a generated sentence) */
    description?: string;
    /** Public Git URL of the data repository, when known and public */
    dataRepository?: string | null;
    /** Absolute or site-relative URL of the submit page, when enabled */
    submitUrl?: string | null;
    /** Whether `/mcp` is served on this host */
    mcpEnabled?: boolean;
    /** Generator id written into `directory.json` */
    generator?: DirectoryInfo['generator'];
}

/** A resolved taxonomy reference. */
export interface TaxonomyRef {
    id: string;
    name: string;
}

/** Resolves raw item category/tag values (ids, names or slugs) to taxonomy entries. */
export interface TaxonomyIndex {
    category(raw: string): TaxonomyRef;
    tag(raw: string): TaxonomyRef;
}

function aliasMap(entries: ReadonlyArray<{ id: string; name: string }>): Map<string, TaxonomyRef> {
    const map = new Map<string, TaxonomyRef>();
    for (const entry of entries) {
        for (const value of [entry.id, entry.name]) {
            const key = taxonomySlug(value);
            if (key && !map.has(key)) map.set(key, { id: entry.id, name: entry.name });
        }
    }
    return map;
}

/**
 * Build a resolver for raw taxonomy values. Unknown values resolve to `{ id: slug(raw), name: raw }`.
 *
 * @param categories - Categories from `categories.yml`
 * @param tags - Tags from `tags.yml`
 */
export function createTaxonomyIndex(
    categories: ReadonlyArray<{ id: string; name: string }>,
    tags: ReadonlyArray<{ id: string; name: string }>
): TaxonomyIndex {
    const categoryMap = aliasMap(categories);
    const tagMap = aliasMap(tags);
    const resolve = (map: Map<string, TaxonomyRef>, raw: string): TaxonomyRef =>
        map.get(taxonomySlug(raw)) ?? { id: taxonomySlug(raw) || raw, name: raw };
    return {
        category: (raw) => resolve(categoryMap, raw),
        tag: (raw) => resolve(tagMap, raw)
    };
}

/** Strip a trailing slash from a site URL. */
export function normalizeSiteUrl(siteUrl: string): string {
    return siteUrl.replace(/\/+$/, '');
}

function httpUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const url = value.trim();
    return /^https?:\/\//i.test(url) ? url : null;
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function uniqueRefs(refs: TaxonomyRef[]): TaxonomyRef[] {
    const seen = new Set<string>();
    return refs.filter((ref) => (seen.has(ref.id) ? false : (seen.add(ref.id), true)));
}

/** Resolve an item's categories (single string or array) to unique taxonomy refs. */
export function itemCategoryRefs(item: ItemData, taxonomy: TaxonomyIndex): TaxonomyRef[] {
    const raw = Array.isArray(item.category) ? item.category : [item.category];
    return uniqueRefs(raw.filter((value): value is string => typeof value === 'string' && value !== '').map(taxonomy.category));
}

/** Resolve an item's tags to unique taxonomy refs. */
export function itemTagRefs(item: ItemData, taxonomy: TaxonomyIndex): TaxonomyRef[] {
    return uniqueRefs((item.tags ?? []).filter((value) => typeof value === 'string' && value !== '').map(taxonomy.tag));
}

/** The item's logo: `icon_url`, else `brand_logo_url` (http(s) only). */
export function itemLogo(item: ItemData): string | null {
    return httpUrl(item.icon_url) ?? httpUrl(item['brand_logo_url']);
}

/**
 * Convert an item to the public summary shape.
 *
 * @param item - Loaded item
 * @param taxonomy - Taxonomy resolver
 * @param siteUrl - Absolute site URL
 */
export function toItemSummary(item: ItemData, taxonomy: TaxonomyIndex, siteUrl: string): ItemSummary {
    const base = normalizeSiteUrl(siteUrl);
    const categories = itemCategoryRefs(item, taxonomy);
    const tags = itemTagRefs(item, taxonomy);
    return {
        slug: item.slug,
        name: item.name,
        description: item.description ?? '',
        url: `${base}/item/${item.slug}`,
        website: httpUrl(item.source_url),
        categories: categories.map((ref) => ref.name),
        category_ids: categories.map((ref) => ref.id),
        tags: tags.map((ref) => ref.name),
        tag_ids: tags.map((ref) => ref.id),
        featured: item.featured === true,
        logo: itemLogo(item),
        updated_at: text(item.updated_at)
    };
}

/**
 * Convert an item to the public detail shape.
 *
 * @param item - Loaded item
 * @param taxonomy - Taxonomy resolver
 * @param siteUrl - Absolute site URL
 * @param related - Slugs of related items (e.g. from `@ever-works/plugin-related-items`)
 */
export function toItemDetail(
    item: ItemData,
    taxonomy: TaxonomyIndex,
    siteUrl: string,
    related: readonly string[] = []
): ItemDetail {
    const summary = toItemSummary(item, taxonomy, siteUrl);
    return {
        ...summary,
        markdown: text(item.markdown),
        markdown_url: `${normalizeSiteUrl(siteUrl)}/item/${item.slug}.md`,
        images: (Array.isArray(item.images) ? item.images : []).map(httpUrl).filter((url): url is string => url !== null),
        brand: text(item.brand),
        publisher: text(item.publisher),
        related: [...related]
    };
}

/**
 * Related slugs injected by `@ever-works/plugin-related-items` (`item._relatedItems`), if present.
 *
 * @param item - Loaded item
 */
export function relatedSlugsOf(item: ItemData): string[] {
    const raw = (item as Record<string, unknown>)['_relatedItems'];
    if (!Array.isArray(raw)) return [];
    return raw
        .map((entry) => (entry && typeof entry === 'object' ? (entry as { slug?: unknown }).slug : undefined))
        .filter((slug): slug is string => typeof slug === 'string');
}

/** Build category entries (data order). */
export function buildCategoryEntries(categories: readonly CategoryWithCount[], siteUrl: string): CategoryEntry[] {
    const base = normalizeSiteUrl(siteUrl);
    return categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: text(category.description),
        count: category.count,
        url: `${base}/category/${category.id}`
    }));
}

/** Build tag entries, most used first. */
export function buildTagEntries(tags: readonly TagWithCount[], siteUrl: string): TagEntry[] {
    const base = normalizeSiteUrl(siteUrl);
    return tags
        .map((tag) => ({ id: tag.id, name: tag.name, count: tag.count, url: `${base}/tag/${tag.id}` }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Build `/data/directory.json`.
 *
 * @param content - Loaded content
 * @param options - Build options
 */
export function buildDirectoryInfo(content: ContentData, options: AgentBuildOptions): DirectoryInfo {
    const base = normalizeSiteUrl(options.siteUrl);
    const { config, items } = content;
    const newest = items.reduce<string | null>((latest, item) => {
        const updated = text(item.updated_at);
        return updated && (!latest || updated > latest) ? updated : latest;
    }, null);
    const submit = options.submitUrl
        ? /^https?:/i.test(options.submitUrl)
            ? options.submitUrl
            : `${base}${options.submitUrl.startsWith('/') ? '' : '/'}${options.submitUrl}`
        : null;
    return {
        version: 1,
        name: config.company_name,
        description:
            options.description ??
            `A curated directory of ${items.length} ${(items.length === 1 ? config.item_name : config.items_name).toLowerCase()}.`,
        url: base,
        item_name: config.item_name,
        items_name: config.items_name,
        counts: {
            items: items.length,
            categories: content.categories.length,
            tags: content.tags.length,
            collections: content.collections.length,
            comparisons: content.comparisons.length
        },
        updated_at: newest,
        data_repository: options.dataRepository ?? null,
        submit_url: submit,
        endpoints: {
            items: `${base}/data/items.json`,
            item: `${base}/data/items/{slug}.json`,
            categories: `${base}/data/categories.json`,
            tags: `${base}/data/tags.json`,
            openapi: `${base}/data/openapi.json`,
            llms: `${base}/llms.txt`,
            llms_full: `${base}/llms-full.txt`,
            sitemap: `${base}/sitemap-index.xml`,
            mcp: options.mcpEnabled ? `${base}/mcp` : null
        },
        generator: options.generator ?? 'ever-works-minimal'
    };
}

/** Build `/data/items.json`. */
export function buildItemsDocument(content: ContentData, siteUrl: string): ItemsDocument {
    const taxonomy = createTaxonomyIndex(content.categories, content.tags);
    const items = content.items.map((item) => toItemSummary(item, taxonomy, siteUrl));
    return { version: 1, total: items.length, items };
}

/** Build `/data/categories.json`. */
export function buildCategoriesDocument(content: ContentData, siteUrl: string): CategoriesDocument {
    const categories = buildCategoryEntries(content.categories, siteUrl);
    return { version: 1, total: categories.length, categories };
}

/** Build `/data/tags.json`. */
export function buildTagsDocument(content: ContentData, siteUrl: string): TagsDocument {
    const tags = buildTagEntries(content.tags, siteUrl);
    return { version: 1, total: tags.length, tags };
}

/**
 * Build the compact browser search index (`/data/search-index.json`).
 *
 * @param content - Loaded content
 * @param maxDescription - Description truncation length (default 160)
 */
export function buildSearchIndex(content: ContentData, maxDescription = 160): SearchIndex {
    const taxonomy = createTaxonomyIndex(content.categories, content.tags);
    const categoryIds: string[] = [];
    const categoryPos = new Map<string, number>();
    const tagIds: string[] = [];
    const tagPos = new Map<string, number>();
    const categoryNames = new Map<string, string>();
    const tagNames = new Map<string, string>();
    for (const category of content.categories) categoryNames.set(category.id, category.name);
    for (const tag of content.tags) tagNames.set(tag.id, tag.name);

    const position = (ref: TaxonomyRef, ids: string[], pos: Map<string, number>, names: Map<string, string>) => {
        let index = pos.get(ref.id);
        if (index === undefined) {
            index = ids.length;
            ids.push(ref.id);
            pos.set(ref.id, index);
            if (!names.has(ref.id)) names.set(ref.id, ref.name);
        }
        return index;
    };

    const truncate = (value: string) => {
        const clean = value.replace(/\s+/g, ' ').trim();
        return clean.length > maxDescription ? `${clean.slice(0, maxDescription - 1).trimEnd()}…` : clean;
    };

    const items = content.items.map((item) => {
        const entry: SearchIndex['i'][number] = {
            s: item.slug,
            n: item.name,
            d: truncate(item.description ?? ''),
            c: itemCategoryRefs(item, taxonomy).map((ref) => position(ref, categoryIds, categoryPos, categoryNames)),
            t: itemTagRefs(item, taxonomy).map((ref) => position(ref, tagIds, tagPos, tagNames))
        };
        if (item.featured === true) entry.f = 1;
        const logo = itemLogo(item);
        if (logo) entry.l = logo;
        const website = httpUrl(item.source_url);
        if (website) entry.w = website;
        const updated = text(item.updated_at);
        // Full value (not just the date) so client-side date sorting matches the server-rendered order.
        if (updated) entry.u = updated;
        return entry;
    });

    return {
        v: 1,
        c: categoryIds.map((id) => [id, categoryNames.get(id) ?? id]),
        t: tagIds.map((id) => [id, tagNames.get(id) ?? id]),
        i: items
    };
}

/**
 * Assemble an in-process {@link AgentDataset} (server/ISR mode) from loaded content.
 *
 * @param content - Loaded content (after plugins ran, so `_relatedItems` is available)
 * @param options - Build options
 */
export function createAgentDataset(content: ContentData, options: AgentBuildOptions): AgentDataset {
    const taxonomy = createTaxonomyIndex(content.categories, content.tags);
    const bySlug = new Map(content.items.map((item) => [item.slug, item]));
    return {
        directory: buildDirectoryInfo(content, options),
        items: content.items.map((item) => toItemSummary(item, taxonomy, options.siteUrl)),
        categories: buildCategoryEntries(content.categories, options.siteUrl),
        tags: buildTagEntries(content.tags, options.siteUrl),
        async getItem(slug: string) {
            const item = bySlug.get(slug);
            return item ? toItemDetail(item, taxonomy, options.siteUrl, relatedSlugsOf(item)) : null;
        }
    };
}
