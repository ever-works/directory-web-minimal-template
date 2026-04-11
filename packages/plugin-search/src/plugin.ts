/**
 * Search plugin implementation.
 *
 * Integrates Pagefind static search indexing into the build pipeline.
 * Runs the Pagefind CLI after Astro generates static HTML output.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import type { Plugin } from '@ever-works/plugins';

import type { ResolvedSearchConfig, SearchPluginOptions } from './types.js';

const execAsync = promisify(exec);

/** Default values for search plugin options */
const DEFAULTS: ResolvedSearchConfig = {
    bundlePath: '/pagefind',
    indexFields: ['name', 'description'],
    language: 'en',
};

/**
 * Resolve user-provided options with defaults.
 *
 * @param options - Partial options from the user.
 * @returns Fully resolved configuration with all defaults applied.
 */
function resolveConfig(options: SearchPluginOptions): ResolvedSearchConfig {
    return {
        bundlePath: options.bundlePath ?? DEFAULTS.bundlePath,
        indexFields: options.indexFields ?? [...DEFAULTS.indexFields],
        language: options.language ?? DEFAULTS.language,
    };
}

/**
 * Create the search plugin.
 *
 * Runs Pagefind CLI on the build output to generate a static search index.
 *
 * @param options - Optional configuration for search indexing.
 * @returns A {@link Plugin} instance for the search feature.
 *
 * @example
 * ```typescript
 * import { definePlugins } from '@ever-works/plugins';
 * import { searchPlugin } from '@ever-works/plugin-search';
 *
 * export default definePlugins([
 *     searchPlugin({ indexFields: ['name', 'description', 'category'] }),
 * ]);
 * ```
 */
export function searchPlugin(options: SearchPluginOptions = {}): Plugin {
    const config = resolveConfig(options);

    return {
        id: 'search',
        name: 'Search Plugin',
        version: '0.1.0',
        description: 'Adds static search via Pagefind. Indexes build output after Astro generates HTML.',

        hooks: {
            async onInit(context) {
                context.log.info(
                    `Search plugin initialized — language=${config.language}, ` +
                    `bundlePath=${config.bundlePath}, ` +
                    `indexFields=[${config.indexFields.join(', ')}]`,
                );
            },

            async onAfterBuild(context) {
                context.log.info(`Running Pagefind on output directory: ${context.outDir}`);

                try {
                    // Use quoted path to handle spaces in directory names
                    const { stdout, stderr } = await execAsync(
                        `npx pagefind --site "${context.outDir}"`,
                    );

                    if (stderr) {
                        context.log.debug(stderr);
                    }
                    if (stdout) {
                        context.log.debug(stdout);
                    }

                    context.log.info('Pagefind indexing completed successfully');
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : String(err);
                    context.log.warn(
                        `Pagefind indexing failed — search will not be available. ` +
                        `Ensure pagefind is installed (npx pagefind). Error: ${message}`,
                    );
                }
            },
        },
    };
}
