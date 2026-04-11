/**
 * @ever-works/plugin-breadcrumbs
 *
 * Breadcrumbs plugin for the Ever Works minimal directory template.
 * Auto-generates breadcrumb navigation trails for all directory pages.
 *
 * @example
 * ```typescript
 * import { breadcrumbsPlugin, generateBreadcrumbs } from '@ever-works/plugin-breadcrumbs';
 * import { definePlugins } from '@ever-works/plugins';
 *
 * export default definePlugins([
 *     breadcrumbsPlugin({ homeLabel: 'Home' }),
 * ]);
 * ```
 */

// Plugin factory
export { breadcrumbsPlugin } from './plugin';

// Pure utility function (can be used without plugin system)
export { generateBreadcrumbs } from './generator';

// Types
export type {
    BreadcrumbEntry,
    BreadcrumbMap,
    BreadcrumbsPluginOptions,
} from './types';
