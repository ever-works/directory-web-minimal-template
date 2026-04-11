/**
 * @ever-works/plugin-search
 *
 * Search plugin for the Ever Works minimal directory template.
 * Integrates Pagefind static search indexing into the build pipeline.
 *
 * @example
 * ```typescript
 * import { searchPlugin } from '@ever-works/plugin-search';
 *
 * searchPlugin({ language: 'en', indexFields: ['name', 'description'] });
 * ```
 */

export { searchPlugin } from './plugin';
export type { SearchPluginOptions, ResolvedSearchConfig } from './types';
