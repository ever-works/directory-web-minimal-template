/**
 * @ever-works/plugin-related-items
 *
 * Related items plugin for the Ever Works minimal directory template.
 * Computes related items based on shared tags, categories, and featured status.
 *
 * @example
 * ```typescript
 * import { relatedItemsPlugin } from '@ever-works/plugin-related-items';
 * import type { RelatedItemRef } from '@ever-works/plugin-related-items';
 * ```
 */

export { relatedItemsPlugin } from './plugin';
export { computeRelatedItems, computeScore } from './compute-related';
export { resolveRelatedConfig } from './resolve-config';
export type {
    RelatedItemRef,
    RelatedItemsPluginOptions,
    ResolvedRelatedConfig,
} from './types';
