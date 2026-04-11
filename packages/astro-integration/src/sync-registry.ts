/**
 * Sync Registry — Module-level singleton registry for SyncManager and ContentCache.
 *
 * Apps register their instances here during startup. The webhook endpoint
 * reads from this registry to access the sync manager and content cache
 * without needing to pass instances through Astro's config system.
 *
 * @example
 * ```typescript
 * // In your app's content.ts:
 * import { registerSync } from '@ever-works/astro-integration';
 * registerSync(syncManager, contentCache);
 *
 * // In the webhook endpoint (auto-injected):
 * import { getSyncManager, getContentCache } from '@ever-works/astro-integration';
 * const manager = getSyncManager();
 * ```
 */

import type { ContentCache } from '@ever-works/core';

/** Generic sync manager interface (avoids hard dep on @ever-works/sync) */
export interface SyncManagerLike {
	sync(): Promise<{ success: boolean; contentChanged: boolean; message: string }>;
	getStatus(): { isRunning: boolean; lastSyncTime: number | null };
}

/** Generic deploy hook trigger interface */
export interface DeployHookTriggerLike {
	trigger(hookUrl: string): Promise<{ success: boolean; message: string }>;
}

let _syncManager: SyncManagerLike | null = null;
let _contentCache: ContentCache | null = null;
let _webhookSecret: string | undefined;
let _deployHookUrl: string | undefined;
let _targetBranch: string | undefined;

/**
 * Register sync infrastructure instances.
 * Called once during app startup from content.ts.
 */
export function registerSync(options: {
	syncManager?: SyncManagerLike;
	contentCache?: ContentCache;
	webhookSecret?: string;
	deployHookUrl?: string;
	targetBranch?: string;
}): void {
	if (options.syncManager) _syncManager = options.syncManager;
	if (options.contentCache) _contentCache = options.contentCache;
	if (options.webhookSecret) _webhookSecret = options.webhookSecret;
	if (options.deployHookUrl) _deployHookUrl = options.deployHookUrl;
	if (options.targetBranch) _targetBranch = options.targetBranch;
}

/** Get the registered SyncManager, or null if not registered */
export function getSyncManager(): SyncManagerLike | null {
	return _syncManager;
}

/** Get the registered ContentCache, or null if not registered */
export function getContentCache(): ContentCache | null {
	return _contentCache;
}

/** Get the configured webhook secret */
export function getWebhookSecret(): string | undefined {
	return _webhookSecret;
}

/** Get the configured deploy hook URL */
export function getDeployHookUrl(): string | undefined {
	return _deployHookUrl;
}

/** Get the configured target branch */
export function getTargetBranch(): string | undefined {
	return _targetBranch;
}
