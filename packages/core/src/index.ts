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
    ContentData,
    MarkdownBlocks,
    ResolvedSiteSettings,
    ResolvedNavLink,
    SiteLayout,
    SitePagination,
    SiteTheme,
    SiteView,
    SiteSort,
    SiteSocialLinks
} from './types/index';

// Site settings (normalized works.yml)
export {
    resolveSiteSettings,
    resolveLayout,
    resolvePagination,
    resolveTheme,
    resolveView,
    resolveSort,
    resolveNavLink
} from './site-settings';

// Markdown blocks (markdown/header.md, markdown/footer.md)
export { loadMarkdownBlocks, firstMarkdownParagraph, MARKDOWN_BLOCK_PATHS } from './loaders/markdown-block-loader';

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

// Content cache
export { ContentCache } from './content-cache';
export type { ContentCacheConfig, CacheStatus } from './content-cache';

// Logger
export { coreLogger, createCoreLogger } from './logger';
export type { CoreLogger } from './logger';

// Markdown rendering (item bodies)
export { renderMarkdown, isSafeMarkdownUrl, prepareItemMarkdown } from './markdown';
