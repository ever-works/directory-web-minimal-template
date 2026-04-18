/**
 * Content loading utility for the sample-git app.
 *
 * Uses ContentCache for TTL-based caching and SyncManager for
 * content synchronization. Defaults to the awesome-time-tracking-data repo.
 * Override via DATA_REPOSITORY / GITHUB_BRANCH env vars or .env file.
 */

import { createAdapter, resolveAdapterConfig } from '@ever-works/adapters';
import { loadContent, ContentCache } from '@ever-works/core';
import type { ContentData, ContentCacheConfig } from '@ever-works/core';
import { PluginRunner } from '@ever-works/plugins';
import { SyncManager, resolveSyncConfig } from '@ever-works/sync';
import { registerSync } from '@ever-works/astro-integration';
import { plugins } from './plugins.config';

/** Default data source for this sample */
const DEFAULT_REPOSITORY = 'https://github.com/ever-works/awesome-time-tracking-data';
const DEFAULT_BRANCH = 'master';

/** Resolve sync config from env */
const syncConfig = resolveSyncConfig();

/** Whether ISR is enabled (default: true) */
const isISR = process.env['ENABLE_ISR'] !== 'false';

/** Content cache config */
const cacheConfig: Partial<ContentCacheConfig> = {
	ttlMs: isISR ? syncConfig.cacheTtlMs : 0,
};

const cache = new ContentCache(cacheConfig);
const runner = new PluginRunner(plugins);
let _initPromise: Promise<void> | null = null;
let _adapter: Awaited<ReturnType<typeof createAdapter>> | null = null;
let _syncManager: SyncManager | null = null;

async function getAdapter() {
	if (_adapter) return _adapter;

	const adapterConfig = resolveAdapterConfig({
		repository: process.env['DATA_REPOSITORY'] || DEFAULT_REPOSITORY,
		branch: process.env['GITHUB_BRANCH'] || DEFAULT_BRANCH,
		token: process.env['GH_TOKEN'],
	});
	_adapter = createAdapter(adapterConfig);
	await _adapter.init(adapterConfig);

	_syncManager = new SyncManager(_adapter, syncConfig);

	_syncManager.on((event) => {
		if (event.type === 'sync:content-changed') {
			cache.invalidate();
		}
	});

	if (syncConfig.pollIntervalMs > 0) {
		_syncManager.startPolling();
	}

	registerSync({
		syncManager: _syncManager,
		contentCache: cache,
		webhookSecret: syncConfig.webhookSecret,
		deployHookUrl: syncConfig.deployHookUrl,
		targetBranch: process.env['GITHUB_BRANCH'] || DEFAULT_BRANCH,
	});

	return _adapter;
}

export async function getContent(): Promise<ContentData> {
	return cache.get(async () => {
		const adapter = await getAdapter();
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
		return data;
	});
}

export function getPluginRunner(): PluginRunner {
	return runner;
}

export function getContentCache(): ContentCache {
	return cache;
}

export function getSyncManager(): SyncManager | null {
	return _syncManager;
}

export function invalidateCache(): void {
	cache.invalidate();
}
