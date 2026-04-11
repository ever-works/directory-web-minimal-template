/**
 * @ever-works/astro-integration
 *
 * Astro integration that bridges the Ever Works plugin system into
 * Astro's build lifecycle. This ensures plugin hooks like `onBeforeBuild`
 * and `onAfterBuild` (e.g., Pagefind search indexing) actually run
 * during `astro build`.
 *
 * @example
 * ```typescript
 * // astro.config.ts
 * import { everWorksIntegration } from '@ever-works/astro-integration';
 * import { getPluginRunner, getContent } from './src/lib/content';
 *
 * export default defineConfig({
 *     integrations: [
 *         everWorksIntegration({
 *             getRunner: () => getPluginRunner(),
 *             getContent: () => getContent(),
 *         }),
 *     ],
 * });
 * ```
 */

export { everWorksIntegration } from './integration';
export type { EverWorksIntegrationOptions } from './integration';
