/**
 * Resolves SyncConfig from environment variables with sensible defaults.
 */

import type { SyncConfig } from './types.js';

/** Default values for SyncConfig */
const DEFAULTS: SyncConfig = {
    pollIntervalMs: 0,
    syncTimeoutMs: 60_000,
    maxRetries: 3,
    webhookSecret: undefined,
    deployHookUrl: undefined,
    cacheTtlMs: 300_000, // 5 minutes
};

/**
 * Resolve sync configuration from environment variables.
 * Environment variables override defaults. Explicit overrides take highest priority.
 *
 * @param overrides - Explicit overrides (highest priority)
 * @returns Resolved SyncConfig
 */
export function resolveSyncConfig(overrides?: Partial<SyncConfig>): SyncConfig {
    return {
        pollIntervalMs:
            overrides?.pollIntervalMs
            ?? parseIntEnv('SYNC_POLL_INTERVAL_MS')
            ?? DEFAULTS.pollIntervalMs,

        syncTimeoutMs:
            overrides?.syncTimeoutMs
            ?? parseIntEnv('SYNC_TIMEOUT_MS')
            ?? DEFAULTS.syncTimeoutMs,

        maxRetries:
            overrides?.maxRetries
            ?? parseIntEnv('SYNC_MAX_RETRIES')
            ?? DEFAULTS.maxRetries,

        webhookSecret:
            overrides?.webhookSecret
            ?? process.env['WEBHOOK_SECRET']
            ?? DEFAULTS.webhookSecret,

        deployHookUrl:
            overrides?.deployHookUrl
            ?? process.env['VERCEL_DEPLOY_HOOK_URL']
            ?? DEFAULTS.deployHookUrl,

        cacheTtlMs:
            overrides?.cacheTtlMs
            ?? parseIntEnv('CONTENT_CACHE_TTL_MS')
            ?? DEFAULTS.cacheTtlMs,
    };
}

/** Parse an integer from an environment variable, returning undefined if not set or invalid */
function parseIntEnv(name: string): number | undefined {
    const value = process.env[name];
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
}
