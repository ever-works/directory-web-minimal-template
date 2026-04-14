/**
 * Tests for resolveSyncConfig — environment variable parsing, overrides, and defaults.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resolveSyncConfig } from '../resolve-config';

const ENV_KEYS = [
    'SYNC_POLL_INTERVAL_MS',
    'SYNC_TIMEOUT_MS',
    'SYNC_MAX_RETRIES',
    'WEBHOOK_SECRET',
    'VERCEL_DEPLOY_HOOK_URL',
    'CONTENT_CACHE_TTL_MS',
] as const;

describe('resolveSyncConfig', () => {
    beforeEach(() => {
        // Ensure env vars are unset for each test
        for (const key of ENV_KEYS) {
            delete process.env[key];
        }
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('defaults', () => {
        it('returns correct defaults when no env vars or overrides', () => {
            const config = resolveSyncConfig();

            expect(config.pollIntervalMs).toBe(0);
            expect(config.syncTimeoutMs).toBe(60_000);
            expect(config.maxRetries).toBe(3);
            expect(config.webhookSecret).toBeUndefined();
            expect(config.deployHookUrl).toBeUndefined();
            expect(config.cacheTtlMs).toBe(300_000);
        });
    });

    describe('environment variable parsing', () => {
        it('reads pollIntervalMs from SYNC_POLL_INTERVAL_MS', () => {
            process.env['SYNC_POLL_INTERVAL_MS'] = '5000';
            const config = resolveSyncConfig();
            expect(config.pollIntervalMs).toBe(5000);
        });

        it('reads syncTimeoutMs from SYNC_TIMEOUT_MS', () => {
            process.env['SYNC_TIMEOUT_MS'] = '120000';
            const config = resolveSyncConfig();
            expect(config.syncTimeoutMs).toBe(120_000);
        });

        it('reads maxRetries from SYNC_MAX_RETRIES', () => {
            process.env['SYNC_MAX_RETRIES'] = '5';
            const config = resolveSyncConfig();
            expect(config.maxRetries).toBe(5);
        });

        it('reads webhookSecret from WEBHOOK_SECRET', () => {
            process.env['WEBHOOK_SECRET'] = 'my-secret';
            const config = resolveSyncConfig();
            expect(config.webhookSecret).toBe('my-secret');
        });

        it('reads deployHookUrl from VERCEL_DEPLOY_HOOK_URL', () => {
            process.env['VERCEL_DEPLOY_HOOK_URL'] = 'https://api.vercel.com/v1/hooks/xxx';
            const config = resolveSyncConfig();
            expect(config.deployHookUrl).toBe('https://api.vercel.com/v1/hooks/xxx');
        });

        it('reads cacheTtlMs from CONTENT_CACHE_TTL_MS', () => {
            process.env['CONTENT_CACHE_TTL_MS'] = '600000';
            const config = resolveSyncConfig();
            expect(config.cacheTtlMs).toBe(600_000);
        });
    });

    describe('invalid environment values', () => {
        it('falls back to default for non-numeric poll interval', () => {
            process.env['SYNC_POLL_INTERVAL_MS'] = 'not-a-number';
            const config = resolveSyncConfig();
            expect(config.pollIntervalMs).toBe(0);
        });

        it('falls back to default for non-numeric timeout', () => {
            process.env['SYNC_TIMEOUT_MS'] = 'abc';
            const config = resolveSyncConfig();
            expect(config.syncTimeoutMs).toBe(60_000);
        });

        it('falls back to default for non-numeric retries', () => {
            process.env['SYNC_MAX_RETRIES'] = '';
            const config = resolveSyncConfig();
            expect(config.maxRetries).toBe(3);
        });

        it('falls back to default for non-numeric cache TTL', () => {
            process.env['CONTENT_CACHE_TTL_MS'] = 'NaN';
            const config = resolveSyncConfig();
            expect(config.cacheTtlMs).toBe(300_000);
        });
    });

    describe('explicit overrides', () => {
        it('overrides take precedence over env vars', () => {
            process.env['SYNC_POLL_INTERVAL_MS'] = '5000';
            process.env['WEBHOOK_SECRET'] = 'env-secret';

            const config = resolveSyncConfig({
                pollIntervalMs: 10_000,
                webhookSecret: 'override-secret',
            });

            expect(config.pollIntervalMs).toBe(10_000);
            expect(config.webhookSecret).toBe('override-secret');
        });

        it('overrides take precedence over defaults', () => {
            const config = resolveSyncConfig({
                maxRetries: 10,
                cacheTtlMs: 1_000,
            });

            expect(config.maxRetries).toBe(10);
            expect(config.cacheTtlMs).toBe(1_000);
        });

        it('partial overrides leave other fields at env/default', () => {
            process.env['SYNC_TIMEOUT_MS'] = '30000';

            const config = resolveSyncConfig({ pollIntervalMs: 999 });

            expect(config.pollIntervalMs).toBe(999); // override
            expect(config.syncTimeoutMs).toBe(30_000); // from env
            expect(config.maxRetries).toBe(3); // default
        });
    });

    describe('priority order', () => {
        it('follows override > env > default', () => {
            process.env['CONTENT_CACHE_TTL_MS'] = '100';

            // Override wins
            const withOverride = resolveSyncConfig({ cacheTtlMs: 50 });
            expect(withOverride.cacheTtlMs).toBe(50);

            // Env wins over default
            const withoutOverride = resolveSyncConfig();
            expect(withoutOverride.cacheTtlMs).toBe(100);

            // Default when nothing set
            delete process.env['CONTENT_CACHE_TTL_MS'];
            const justDefault = resolveSyncConfig();
            expect(justDefault.cacheTtlMs).toBe(300_000);
        });
    });
});
