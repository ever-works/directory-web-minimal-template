/**
 * Content loading utility for the sample-git app.
 *
 * Defaults to the awesome-time-tracking-data repository.
 * Override via DATA_REPOSITORY / GITHUB_BRANCH env vars or .env file.
 */

import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';
import { loadContent } from '@ever-works/core';
import type { ContentData } from '@ever-works/core';
import { PluginRunner } from '@ever-works/plugins';
import { plugins } from './plugins.config';

/** Default data source for this sample */
const DEFAULT_REPOSITORY = 'https://github.com/ever-works/awesome-time-tracking-data';
const DEFAULT_BRANCH = 'master';

let _cached: ContentData | null = null;
const runner = new PluginRunner(plugins);
let _initialized = false;

export async function getContent(): Promise<ContentData> {
    if (_cached) return _cached;

    // Resolve adapter config — env vars override these defaults
    const adapterConfig = resolveAdapterConfig({
        repository: process.env['DATA_REPOSITORY'] || DEFAULT_REPOSITORY,
        branch: process.env['GITHUB_BRANCH'] || DEFAULT_BRANCH,
        token: process.env['GH_TOKEN'],
    });
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
