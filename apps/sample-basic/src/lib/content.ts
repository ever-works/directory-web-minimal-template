/**
 * Content loading utility for the sample-basic app.
 * Same pattern as apps/web — cached content loading with plugin pipeline.
 */

import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';
import { loadContent } from '@ever-works/core';
import type { ContentData } from '@ever-works/core';
import { PluginRunner } from '@ever-works/plugins';
import { plugins } from './plugins.config.js';

let _cached: ContentData | null = null;
const runner = new PluginRunner(plugins);
let _initPromise: Promise<void> | null = null;

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

    if (!_initPromise) {
        _initPromise = runner.runInit(baseContext);
    }
    await _initPromise;

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
