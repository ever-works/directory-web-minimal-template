/**
 * Astro integration that calls Ever Works plugin lifecycle hooks
 * at the correct points in Astro's build pipeline.
 *
 * Hooks called:
 * - `onBeforeBuild` — via Astro's `astro:build:start` hook
 * - `onAfterBuild` — via Astro's `astro:build:done` hook
 *
 * Note: `onInit` and `onDataLoaded` are called during content loading
 * (in content.ts), not here.
 */

import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';
import type { PluginRunner } from '@ever-works/plugins';
import type { ContentData } from '@ever-works/core';

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
}

/**
 * Creates an Astro integration that bridges plugin build lifecycle hooks.
 *
 * @param options - Configuration for the integration.
 * @returns An Astro integration that runs plugin hooks during build.
 */
export function everWorksIntegration(options: EverWorksIntegrationOptions): AstroIntegration {
    const { getRunner, getContent, contentPath } = options;

    return {
        name: '@ever-works/astro-integration',

        hooks: {
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
