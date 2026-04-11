/**
 * Astro integration that calls Ever Works plugin lifecycle hooks
 * at the correct points in Astro's build pipeline.
 *
 * Hooks called:
 * - `onBeforeBuild` — via Astro's `astro:build:start` hook
 * - `onAfterBuild` — via Astro's `astro:build:done` hook
 *
 * When sync is configured:
 * - Injects `/api/webhook` endpoint for GitHub webhook handling
 * - Supports ISR mode (hybrid output) and static mode (deploy hooks)
 *
 * Note: `onInit` and `onDataLoaded` are called during content loading
 * (in content.ts), not here.
 */

import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';
import type { PluginRunner } from '@ever-works/plugins';
import type { ContentData } from '@ever-works/core';

/** Sync-specific integration options */
export interface SyncIntegrationOptions {
	/** Enable ISR mode. When true, expects output to be 'hybrid' or 'server'. */
	isr?: boolean;

	/** ISR revalidation interval in seconds. Default: 600 (10 min) */
	revalidateSeconds?: number;

	/** Enable /api/webhook endpoint for GitHub webhook handling. */
	webhook?: boolean;

	/** Secret for webhook HMAC-SHA256 validation. */
	webhookSecret?: string;
}

/** Options for the Ever Works Astro integration */
export interface EverWorksIntegrationOptions {
	/**
	 * Returns the PluginRunner instance. Called lazily so that plugins
	 * are fully registered before we invoke build hooks.
	 */
	getRunner: () => PluginRunner;

	/**
	 * Returns the loaded content data. Used to extract config and
	 * content path for the plugin context.
	 */
	getContent: () => Promise<ContentData>;

	/**
	 * Override the content path passed to plugin context.
	 * Defaults to `.content` relative to the project root.
	 */
	contentPath?: string;

	/**
	 * Content synchronization and ISR configuration.
	 * When provided, enables webhook endpoint and/or ISR support.
	 */
	sync?: SyncIntegrationOptions;
}

/**
 * Creates an Astro integration that bridges plugin build lifecycle hooks
 * and optionally enables content sync/ISR features.
 *
 * @param options - Configuration for the integration.
 * @returns An Astro integration that runs plugin hooks during build.
 */
export function everWorksIntegration(options: EverWorksIntegrationOptions): AstroIntegration {
	const { getRunner, getContent, contentPath, sync } = options;

	return {
		name: '@ever-works/astro-integration',

		hooks: {
			'astro:config:setup': ({ injectRoute, config, logger }) => {
				// Inject webhook API endpoint when sync.webhook is enabled
				if (sync?.webhook) {
					// In Astro 5 with Vercel adapter, endpoints with `prerender = false`
					// become serverless functions even in static output mode
					const hasAdapter = !!config.adapter;
					if (!hasAdapter) {
						logger.warn(
							'Webhook endpoint requires a server adapter (e.g., @astrojs/vercel). ' +
							'Set ENABLE_ISR=true to enable the Vercel adapter. ' +
							'Skipping webhook route injection.',
						);
					} else {
						injectRoute({
							pattern: '/api/webhook',
							entrypoint: '@ever-works/astro-integration/webhook-endpoint',
						});
						logger.info('Injected /api/webhook endpoint for content sync');
					}
				}
			},

			'astro:build:start': async () => {
				try {
					const runner = getRunner();
					const data = await getContent();

					const context = {
						config: data.config,
						contentPath: contentPath ?? '.content',
						outDir: 'dist',
					};

					await runner.runBeforeBuild(context);
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : String(err);
					console.warn(`[@ever-works/astro-integration] onBeforeBuild failed: ${msg}`);
				}
			},

			'astro:build:done': async ({ dir }) => {
				try {
					const runner = getRunner();
					const data = await getContent();

					// Use fileURLToPath for proper OS path (handles spaces, Windows drives)
					const normalizedOutDir = fileURLToPath(dir);

					const context = {
						config: data.config,
						contentPath: contentPath ?? '.content',
						outDir: normalizedOutDir,
					};

					await runner.runAfterBuild(context);
				} catch (err: unknown) {
					const msg = err instanceof Error ? err.message : String(err);
					console.warn(`[@ever-works/astro-integration] onAfterBuild failed: ${msg}`);
				}
			},
		},
	};
}
