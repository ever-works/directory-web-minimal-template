/**
 * Content loading utility for the Astro web app.
 *
 * Initializes the data adapter, loads all content, and runs the plugin
 * pipeline (onInit → onDataLoaded) at build time. Astro's static build
 * calls getStaticPaths / frontmatter at build, so this module caches
 * the loaded content across page generations.
 *
 * @example
 * ```astro
 * ---
 * import { getContent } from '../lib/content';
 * const { items, categories, tags, config } = await getContent();
 * ---
 * ```
 */

import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';
import { loadContent } from '@ever-works/core';
import type { ContentData } from '@ever-works/core';
import { PluginRunner } from '@ever-works/plugins';
import { plugins } from './plugins.config.js';

/** Cached content — loaded once per build */
let _cached: ContentData | null = null;

/** Plugin runner — initialized once */
const runner = new PluginRunner(plugins);

/** Whether plugins have been initialized */
let _initialized = false;

/**
 * Get all content from the data repository.
 * Runs the plugin pipeline (onInit, onDataLoaded) on first call.
 * Results are cached in memory for the duration of the build.
 */
export async function getContent(): Promise<ContentData> {
    if (_cached) return _cached;

    const adapterConfig = resolveAdapterConfig();
    const adapter = createAdapter(adapterConfig);
    await adapter.init(adapterConfig);

    let data = await loadContent(adapter);

    // Build the base plugin context
    const baseContext = {
        config: data.config,
        contentPath: adapter.getContentPath(),
        outDir: 'dist',
    };

    // Run plugin onInit hooks (only once per build)
    if (!_initialized) {
        await runner.runInit(baseContext);
        _initialized = true;
    }

    // Run plugin onDataLoaded pipeline (transform data)
    data = await runner.runDataLoaded(data, baseContext);

    _cached = data;
    return _cached;
}

/**
 * Get the plugin runner for use in build hooks.
 * Used by Astro integration hooks (onBeforeBuild, onAfterBuild).
 */
export function getPluginRunner(): PluginRunner {
    return runner;
}

/**
 * Invalidate the content cache.
 * Useful in dev mode when content changes.
 */
export function invalidateCache(): void {
    _cached = null;
}
