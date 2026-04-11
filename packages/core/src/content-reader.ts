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

/**
 * Count how many items belong to each category.
 * An item's `category` field can be a single string or an array of strings.
 */
function computeCategoryCounts(
    categories: { id: string; name: string; icon_url?: string }[],
    items: ItemData[],
): CategoryWithCount[] {
    const counts = new Map<string, number>();

    for (const item of items) {
        const cats = Array.isArray(item.category) ? item.category : [item.category];
        for (const catId of cats) {
            if (catId) {
                counts.set(catId, (counts.get(catId) ?? 0) + 1);
            }
        }
    }

    return categories.map((cat) => ({
        ...cat,
        count: counts.get(cat.id) ?? 0,
    }));
}

/**
 * Count how many items have each tag.
 */
function computeTagCounts(
    tags: { id: string; name: string; isActive?: boolean }[],
    items: ItemData[],
): TagWithCount[] {
    const counts = new Map<string, number>();

    for (const item of items) {
        for (const tagId of item.tags) {
            if (tagId) {
                counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
            }
        }
    }

    return tags.map((tag) => ({
        ...tag,
        count: counts.get(tag.id) ?? 0,
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
        loadPages(adapter),
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
        total: items.length,
    };
}
