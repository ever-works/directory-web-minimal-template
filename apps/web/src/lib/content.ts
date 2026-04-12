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
 *
 * Wraps adapter initialization with actionable error messages so
 * developers know what to fix when the data repository is missing
 * or misconfigured.
 *
 * @throws {Error} With guidance on setting DATA_REPOSITORY / GH_TOKEN env vars
 */
async function getAdapter() {
	if (_adapter) return _adapter;

	let adapterConfig;
	try {
		adapterConfig = resolveAdapterConfig();
	} catch (err) {
		throw new Error(
			`[content] Failed to resolve adapter config. ` +
			`Ensure the DATA_REPOSITORY environment variable is set to a valid GitHub repo URL ` +
			`(e.g. "https://github.com/org/data-repo"). ` +
			`For private repos, also set GH_TOKEN.\n` +
			`Original error: ${err instanceof Error ? err.message : String(err)}`
		);
	}

	try {
		_adapter = createAdapter(adapterConfig);
		await _adapter.init(adapterConfig);
	} catch (err) {
		_adapter = null;
		throw new Error(
			`[content] Failed to initialize data adapter. ` +
			`Could not clone or access the data repository. Check that:\n` +
			`  1. DATA_REPOSITORY points to a valid Git repo\n` +
			`  2. GH_TOKEN is set for private repositories\n` +
			`  3. GITHUB_BRANCH (default: "main") exists in the repo\n` +
			`  4. The repo contains a config.yml at its root\n` +
			`Original error: ${err instanceof Error ? err.message : String(err)}`
		);
	}

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
 *
 * Wraps loading with error handling so malformed YAML files or
 * missing content directories produce actionable developer messages
 * instead of raw stack traces.
 */
export async function getContent(): Promise<ContentData> {
	return cache.get(async () => {
		const adapter = await getAdapter();

		let data: ContentData;
		try {
			data = await loadContent(adapter);
		} catch (err) {
			throw new Error(
				`[content] Failed to load content from the data repository. ` +
				`This usually means YAML files are malformed or required files are missing. Check that:\n` +
				`  1. config.yml exists and is valid YAML\n` +
				`  2. categories.yml, tags.yml are valid YAML arrays\n` +
				`  3. Item files in data/<slug>/<slug>.yml are valid YAML\n` +
				`  4. No syntax errors (tabs vs spaces, unclosed quotes, etc.)\n` +
				`Original error: ${err instanceof Error ? err.message : String(err)}`
			);
		}

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
