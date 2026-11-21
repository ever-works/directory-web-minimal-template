/**
 * Compute related items for a given item based on shared tags and categories.
 *
 * Tags and categories are compared by a normalized key (lowercase, accents stripped, non-alphanumerics collapsed to
 * `-`), so `"Open Source"`, `"open-source"` and `"Open-Source"` match. Platform data repositories store category and
 * tag *names* on items while `categories.yml` / `tags.yml` use ids; normalizing keeps both forms related.
 */

import type { ItemData } from '@ever-works/core';
import type { ResolvedRelatedConfig, RelatedItemRef } from './types';

function normalizeCategory(category: string | string[]): string[] {
    if (Array.isArray(category)) return category;
    return category ? [category] : [];
}

/**
 * Normalize a tag or category value to a comparison key.
 *
 * @param value - Raw tag/category id or name
 * @returns Lowercase, accent-free, dash-separated key (empty string for empty input)
 */
export function relationKey(value: string): string {
    return String(value)
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

interface RelationKeys {
    tags: Set<string>;
    categories: string[];
}

/** Per-item normalized keys, computed once per item object (items are immutable during a build). */
const keyCache = new WeakMap<ItemData, RelationKeys>();

function keysOf(item: ItemData): RelationKeys {
    let keys = keyCache.get(item);
    if (!keys) {
        keys = {
            tags: new Set((item.tags ?? []).map(relationKey).filter(Boolean)),
            categories: normalizeCategory(item.category).map(relationKey).filter(Boolean)
        };
        keyCache.set(item, keys);
    }
    return keys;
}

/**
 * Compute a relevance score between two items.
 *
 * @param source - The item to find related items for
 * @param candidate - A potential related item
 * @param config - Scoring weights
 * @returns Relevance score (0 = unrelated)
 */
export function computeScore(
    source: ItemData,
    candidate: ItemData,
    config: ResolvedRelatedConfig,
): number {
    let score = 0;
    const sourceKeys = keysOf(source);
    const candidateKeys = keysOf(candidate);

    for (const tag of candidateKeys.tags) {
        if (sourceKeys.tags.has(tag)) {
            score += config.tagWeight;
        }
    }

    for (const cat of candidateKeys.categories) {
        if (sourceKeys.categories.includes(cat)) {
            score += config.categoryWeight;
            break;
        }
    }

    if (candidate.featured) {
        score += config.featuredBoost;
    }

    return score;
}

/**
 * Compute related items for a single source item.
 *
 * @param source - The item to find related items for
 * @param allItems - All items in the directory
 * @param config - Scoring configuration
 * @returns Sorted array of related item references (ties keep data order, then sort by name)
 */
export function computeRelatedItems(
    source: ItemData,
    allItems: readonly ItemData[],
    config: ResolvedRelatedConfig,
): RelatedItemRef[] {
    const scored: RelatedItemRef[] = [];

    for (const candidate of allItems) {
        if (candidate.slug === source.slug) continue;

        const score = computeScore(source, candidate, config);
        if (score <= config.minScore) continue;

        const category = Array.isArray(candidate.category)
            ? candidate.category[0]
            : candidate.category;

        scored.push({
            slug: candidate.slug,
            name: candidate.name,
            description: candidate.description,
            category: category || undefined,
            icon_url: candidate.icon_url,
            score,
        });
    }

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, config.maxItems);
}
