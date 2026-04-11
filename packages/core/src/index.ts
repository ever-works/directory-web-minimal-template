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
    PageData,
    SiteConfig,
    LogoConfig,
    PaginationConfig,
    SettingsConfig,
    NavLinkItem,
    HomepageConfig,
    ContentData
} from './types/index';

// Loaders
export { loadConfig } from './loaders/config-loader';
export { loadCategories } from './loaders/category-loader';
export { loadTags } from './loaders/tag-loader';
export { loadCollections } from './loaders/collection-loader';
export { loadItems, loadItem } from './loaders/item-loader';
export { loadComparisons, loadComparison } from './loaders/comparison-loader';
export { loadPages, loadPage } from './loaders/page-loader';

// Content reader
export { loadContent } from './content-reader';
