/**
 * Content loading utility for the sample-git app.
 * Loads content from a remote Git repository via the Git data adapter.
 */

import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';
import { loadContent } from '@ever-works/core';
import type { ContentData } from '@ever-works/core';
import { PluginRunner } from '@ever-works/plugins';
import { plugins } from './plugins.config';

let _cached: ContentData | null = null;
const runner = new PluginRunner(plugins);
let _initialized = false;

export async function getContent(): Promise<ContentData> {
    if (_cached) return _cached;

    const adapterConfig = resolveAdapterConfig();
    const adapter = createAdapter(adapterConfig);
    await adapter.init(adapterConfig);

    let data = await loadContent(adapter);

    const baseContext = {
        config: data.config,
        contentPath: adapter.getContentPath(),
        outDir: 'dist',
    };

    if (!_initialized) {
        await runner.runInit(baseContext);
        _initialized = true;
    }

    data = await runner.runDataLoaded(data, baseContext);

    _cached = data;
    return _cached;
}

export function getPluginRunner(): PluginRunner {
    return runner;
}

export function invalidateCache(): void {
    _cached = null;
}
