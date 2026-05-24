/**
 * Content reader — orchestrates all loaders to produce a complete ContentData object.
 * Computes category and tag counts from loaded items.
 */

import type { DataAdapter } from '@ever-works/adapters';
import type { ContentData, CategoryWithCount, TagWithCount, ItemData } from './types/index';
import { loadConfig } from './loaders/config-loader';
import { loadCategories } from './loaders/category-loader';
import { loadTags } from './loaders/tag-loader';
import { loadCollections } from './loaders/collection-loader';
import { loadItems } from './loaders/item-loader';
import { loadComparisons } from './loaders/comparison-loader';
import { loadPages } from './loaders/page-loader';

function slugify(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function taxonomyKey(value: string): string {
    return slugify(value);
}

function buildAliasMap(entries: { id: string; name: string }[]): Map<string, string> {
    const aliases = new Map<string, string>();
    for (const entry of entries) {
        for (const value of [entry.id, entry.name, slugify(entry.id), slugify(entry.name)]) {
            const key = taxonomyKey(value);
            if (key && !aliases.has(key)) {
                aliases.set(key, entry.id);
            }
        }
    }
    return aliases;
}

/**
 * Count how many items belong to each category.
 * Item data produced by older/full templates may store category names or
 * slugified names instead of the exact category id, so count by normalized
 * aliases to keep category listings and detail pages consistent.
 */
function computeCategoryCounts(
    categories: { id: string; name: string; icon_url?: string }[],
    items: ItemData[]
): CategoryWithCount[] {
    const counts = new Map<string, number>();
    const aliases = buildAliasMap(categories);

    for (const item of items) {
        const cats = Array.isArray(item.category) ? item.category : [item.category];
        const matchedIds = new Set<string>();
        for (const catId of cats) {
            if (!catId) continue;
            const matched = aliases.get(taxonomyKey(catId));
            if (matched) {
                matchedIds.add(matched);
            }
        }
        for (const matched of matchedIds) {
            counts.set(matched, (counts.get(matched) ?? 0) + 1);
        }
    }

    return categories.map((cat) => ({
        ...cat,
        count: counts.get(cat.id) ?? 0
    }));
}

/**
 * Count how many items have each tag. Matches by id, tag name, and slugified
 * forms for compatibility with generated and imported data repositories.
 */
function computeTagCounts(tags: { id: string; name: string; isActive?: boolean }[], items: ItemData[]): TagWithCount[] {
    const counts = new Map<string, number>();
    const aliases = buildAliasMap(tags);

    for (const item of items) {
        const matchedIds = new Set<string>();
        for (const tagId of item.tags) {
            if (!tagId) continue;
            const matched = aliases.get(taxonomyKey(tagId));
            if (matched) {
                matchedIds.add(matched);
            }
        }
        for (const matched of matchedIds) {
            counts.set(matched, (counts.get(matched) ?? 0) + 1);
        }
    }

    return tags.map((tag) => ({
        ...tag,
        count: counts.get(tag.id) ?? 0
    }));
}

/**
 * Load all content from a data adapter.
 * Orchestrates individual loaders and computes derived data (counts).
 *
 * @param adapter - Initialized data adapter to read content from
 * @returns Complete content data with all items, categories, tags, collections, and comparisons
 */
export async function loadContent(adapter: DataAdapter): Promise<ContentData> {
    const [config, rawCategories, rawTags, collections, items, comparisons, pages] = await Promise.all([
        loadConfig(adapter),
        loadCategories(adapter),
        loadTags(adapter),
        loadCollections(adapter),
        loadItems(adapter),
        loadComparisons(adapter),
        loadPages(adapter)
    ]);

    const categories = computeCategoryCounts(rawCategories, items);
    const tags = computeTagCounts(rawTags, items);

    return {
        config,
        items,
        categories,
        tags,
        collections,
        comparisons,
        pages,
        total: items.length
    };
}
