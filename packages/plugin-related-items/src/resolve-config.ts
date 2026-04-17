/**
 * Resolve user-supplied options into a fully populated config.
 */

import type {
    RelatedItemsPluginOptions,
    ResolvedRelatedConfig,
} from './types';

const DEFAULTS: ResolvedRelatedConfig = {
    maxItems: 5,
    tagWeight: 1,
    categoryWeight: 2,
    featuredBoost: 0.5,
    minScore: 0,
};

/**
 * Resolve partial options into a complete config with defaults.
 *
 * @param options - User-supplied partial options
 * @returns Fully resolved config
 */
export function resolveRelatedConfig(
    options: RelatedItemsPluginOptions = {},
): ResolvedRelatedConfig {
    return {
        maxItems: options.maxItems ?? DEFAULTS.maxItems,
        tagWeight: options.tagWeight ?? DEFAULTS.tagWeight,
        categoryWeight: options.categoryWeight ?? DEFAULTS.categoryWeight,
        featuredBoost: options.featuredBoost ?? DEFAULTS.featuredBoost,
        minScore: options.minScore ?? DEFAULTS.minScore,
    };
}
