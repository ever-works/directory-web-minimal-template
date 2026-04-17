/**
 * Compute related items for a given item based on shared tags and categories.
 */

import type { ItemData } from '@ever-works/core';
import type { ResolvedRelatedConfig, RelatedItemRef } from './types';

function normalizeCategory(category: string | string[]): string[] {
    if (Array.isArray(category)) return category;
    return category ? [category] : [];
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

    const sourceTags = new Set(source.tags ?? []);
    const candidateTags = candidate.tags ?? [];
    for (const tag of candidateTags) {
        if (sourceTags.has(tag)) {
            score += config.tagWeight;
        }
    }

    const sourceCategories = new Set(normalizeCategory(source.category));
    const candidateCategories = normalizeCategory(candidate.category);
    for (const cat of candidateCategories) {
        if (sourceCategories.has(cat)) {
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
 * @returns Sorted array of related item references
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
