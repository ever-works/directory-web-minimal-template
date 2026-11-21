/**
 * Listing helpers for taxonomy pages: scoped category/tag counts and default-sorted cards.
 */

import type { ItemData } from '@ever-works/core';
import { sortItems } from '@ever-works/agent-api/search';
import type { DirectoryCardData } from '@ever-works/ui/lib/directory-format';
import type { SiteContext } from './site';

/** Cards for `items`, in the site's default sort order. */
export function sortedCards(site: SiteContext, items: ItemData[]): DirectoryCardData[] {
    return sortItems(items, site.settings.homepage.defaultSort, (item) => ({
        name: item.name,
        featured: item.featured === true,
        updated: item.updated_at
    })).map(site.card);
}

/** Category and tag options with counts computed within a set of cards (e.g. one category's items). */
export function scopedTaxonomy(site: SiteContext, cards: DirectoryCardData[]) {
    const categoryCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    for (const card of cards) {
        for (const c of card.categories) categoryCounts.set(c.id, (categoryCounts.get(c.id) ?? 0) + 1);
        for (const t of card.tags) tagCounts.set(t.id, (tagCounts.get(t.id) ?? 0) + 1);
    }
    const tagNames = new Map<string, string>();
    for (const card of cards) for (const t of card.tags) tagNames.set(t.id, t.name);
    return {
        categories: site.content.categories
            .map((c) => ({ ...c, count: categoryCounts.get(c.id) ?? 0 }))
            .filter((c) => c.count > 0),
        tags: [...tagCounts.entries()].map(([id, count]) => ({ id, name: tagNames.get(id) ?? id, count }))
    };
}

/** "A, B, C and more" from the first names. */
export function exampleNames(cards: DirectoryCardData[], max = 3): string {
    const names = cards.slice(0, max).map((card) => card.name);
    if (names.length === 0) return '';
    return cards.length > max ? `${names.join(', ')} and more` : names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0] ?? '';
}

const categoryCardCache = new WeakMap<SiteContext, Map<string, DirectoryCardData[]>>();

/**
 * Cards of every item in a category, in default sort order — computed once per category per build (item pages use
 * it for previous/next and fallback alternatives, so it must not be O(n) per page).
 */
export function categoryCards(site: SiteContext, categoryId: string): DirectoryCardData[] {
    let byCategory = categoryCardCache.get(site);
    if (!byCategory) {
        byCategory = new Map();
        const groups = new Map<string, ItemData[]>();
        for (const item of site.content.items) {
            for (const category of site.card(item).categories) {
                const group = groups.get(category.id) ?? [];
                group.push(item);
                groups.set(category.id, group);
            }
        }
        for (const [id, items] of groups) byCategory.set(id, sortedCards(site, items));
        categoryCardCache.set(site, byCategory);
    }
    return byCategory.get(categoryId) ?? [];
}
