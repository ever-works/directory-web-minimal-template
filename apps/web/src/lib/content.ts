/**
 * Content loading utility for the Astro web app.
 *
 * Uses ContentCache for TTL-based caching and SyncManager for
 * content synchronization (polling, webhook-triggered refresh).
 *
 * ISR mode (default): Content cached with TTL, refreshed on demand.
 * Static mode (ENABLE_ISR=false): Content loaded once at build time.
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
import { loadContent, ContentCache } from '@ever-works/core';
import type { ContentData, ContentCacheConfig } from '@ever-works/core';
import { PluginRunner } from '@ever-works/plugins';
import { SyncManager, resolveSyncConfig } from '@ever-works/sync';
import { registerSync } from '@ever-works/astro-integration';
import { plugins } from './plugins.config.js';

/** Resolve sync config from env */
const syncConfig = resolveSyncConfig();

/** Whether ISR is enabled (default: true) */
const isISR = process.env['ENABLE_ISR'] !== 'false';

/** Content cache config: TTL-based for ISR, forever for static */
const cacheConfig: Partial<ContentCacheConfig> = {
	ttlMs: isISR ? syncConfig.cacheTtlMs : 0,
};

/** Content cache instance */
const cache = new ContentCache(cacheConfig);

/** Plugin runner — initialized once */
const runner = new PluginRunner(plugins);

/** Whether plugins have been initialized */
let _initialized = false;

/** Adapter instance (reused across loads) */
let _adapter: Awaited<ReturnType<typeof createAdapter>> | null = null;

/** Sync manager (created after adapter init) */
let _syncManager: SyncManager | null = null;

/**
 * Get or create the adapter instance.
 */
async function getAdapter() {
	if (_adapter) return _adapter;

	const adapterConfig = resolveAdapterConfig();
	_adapter = createAdapter(adapterConfig);
	await _adapter.init(adapterConfig);

	// Create sync manager for polling support
	_syncManager = new SyncManager(_adapter, syncConfig);

	// Listen for content changes to invalidate cache
	_syncManager.on((event) => {
		if (event.type === 'sync:content-changed') {
			cache.invalidate();
		}
	});

	// Start polling if configured
	if (syncConfig.pollIntervalMs > 0) {
		_syncManager.startPolling();
	}

	// Register with astro-integration for webhook endpoint access
	registerSync({
		syncManager: _syncManager,
		contentCache: cache,
		webhookSecret: syncConfig.webhookSecret,
		deployHookUrl: syncConfig.deployHookUrl,
		targetBranch: process.env['GITHUB_BRANCH'] ?? 'main',
	});

	return _adapter;
}

/**
 * Get all content from the data repository.
 * Uses ContentCache for TTL-based caching.
 * Runs the plugin pipeline (onInit, onDataLoaded) on first call.
 */
export async function getContent(): Promise<ContentData> {
	return cache.get(async () => {
		const adapter = await getAdapter();
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
		return data;
	});
}

/**
 * Get the plugin runner for use in build hooks.
 */
export function getPluginRunner(): PluginRunner {
	return runner;
}

/**
 * Get the content cache instance.
 */
export function getContentCache(): ContentCache {
	return cache;
}

/**
 * Get the sync manager instance.
 */
export function getSyncManager(): SyncManager | null {
	return _syncManager;
}

/**
 * Invalidate the content cache.
 */
export function invalidateCache(): void {
	cache.invalidate();
}
