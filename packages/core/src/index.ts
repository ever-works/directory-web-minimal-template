/**
 * @ever-works/core
 *
 * Core data layer for the Ever Works minimal directory template.
 * Provides typed content loading from Git-backed YAML data repositories.
 *
 * @example
 * ```typescript
 * import { loadContent, loadConfig } from '@ever-works/core';
 * import type { DataAdapter } from '@ever-works/adapters';
 *
 * const content = await loadContent(adapter);
 * const config = await loadConfig(adapter);
 * ```
 */

// Types
export type {
    ItemData,
    CategoryData,
    CategoryWithCount,
    TagData,
    TagWithCount,
    CollectionData,
    ComparisonData,
    ComparisonDimension,
    SiteConfig,
    LogoConfig,
    PaginationConfig,
    SettingsConfig,
    ContentData
} from './types/index.js';

// Loaders
export { loadConfig } from './loaders/config-loader.js';
export { loadCategories } from './loaders/category-loader.js';
export { loadTags } from './loaders/tag-loader.js';
export { loadCollections } from './loaders/collection-loader.js';
export { loadItems, loadItem } from './loaders/item-loader.js';
export { loadComparisons, loadComparison } from './loaders/comparison-loader.js';

// Content reader
export { loadContent } from './content-reader.js';
