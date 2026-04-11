/**
 * @ever-works/astro-integration
 *
 * Astro integration that bridges the Ever Works plugin system into
 * Astro's build lifecycle. Also provides content sync infrastructure:
 * webhook endpoint injection, sync registry, and ISR support.
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
 *             sync: {
 *                 webhook: true,
 *                 webhookSecret: process.env.WEBHOOK_SECRET,
 *             },
 *         }),
 *     ],
 * });
 * ```
 */

export { everWorksIntegration } from './integration';
export type { EverWorksIntegrationOptions, SyncIntegrationOptions } from './integration';

export {
	registerSync,
	getSyncManager,
	getContentCache,
	getWebhookSecret,
	getDeployHookUrl,
	getTargetBranch,
} from './sync-registry';
export type { SyncManagerLike, DeployHookTriggerLike } from './sync-registry';
