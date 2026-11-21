/**
 * Lazy, shared loader for the compact search index (`/data/search-index.json`).
 *
 * The search dialog and the listing browser both call {@link loadSearchIndex}; the file is fetched at most once per
 * page view (and cached by the browser/CDN across pages). Nothing is fetched until a visitor actually searches,
 * filters, sorts or scrolls past the first page.
 */

import type { SearchIndex } from '@ever-works/agent-api/types';
import type { DirectoryCardData } from '../lib/directory-format';

/** A decoded index entry: card data plus pre-computed search text. */
export interface IndexedItem extends DirectoryCardData {
    /** Category + tag names (for ranking) */
    taxonomy: string[];
    /** Category ids */
    categoryIds: string[];
    /** Tag ids */
    tagIds: string[];
}

/** The decoded index. */
export interface DecodedIndex {
    items: IndexedItem[];
    categories: Array<{ id: string; name: string }>;
    tags: Array<{ id: string; name: string }>;
}

/** Default URL of the index. */
export const SEARCH_INDEX_URL = '/data/search-index.json';

let pending: Promise<DecodedIndex> | null = null;

/**
 * Decode the compact index into card-ready items.
 *
 * @param index - Raw index JSON
 */
export function decodeSearchIndex(index: SearchIndex): DecodedIndex {
    const categories = index.c.map(([id, name]) => ({ id, name }));
    const tags = index.t.map(([id, name]) => ({ id, name }));
    const items = index.i.map((entry): IndexedItem => {
        const itemCategories = entry.c.map((position) => categories[position]).filter((c): c is { id: string; name: string } => !!c);
        const itemTags = entry.t.map((position) => tags[position]).filter((t): t is { id: string; name: string } => !!t);
        return {
            slug: entry.s,
            name: entry.n,
            description: entry.d,
            logo: entry.l ?? null,
            website: entry.w ?? null,
            featured: entry.f === 1,
            updated: entry.u ?? null,
            categories: itemCategories,
            tags: itemTags,
            taxonomy: [...itemCategories.map((c) => c.name), ...itemTags.map((t) => t.name)],
            categoryIds: itemCategories.map((c) => c.id),
            tagIds: itemTags.map((t) => t.id)
        };
    });
    return { items, categories, tags };
}

/**
 * Load (once) and decode the search index.
 *
 * @param url - Index URL (default {@link SEARCH_INDEX_URL})
 */
export function loadSearchIndex(url = SEARCH_INDEX_URL): Promise<DecodedIndex> {
    if (!pending) {
        pending = fetch(url, { headers: { Accept: 'application/json' } })
            .then((response) => {
                if (!response.ok) throw new Error(`Search index HTTP ${response.status}`);
                return response.json() as Promise<SearchIndex>;
            })
            .then(decodeSearchIndex)
            .catch((error: unknown) => {
                pending = null;
                throw error;
            });
    }
    return pending;
}
