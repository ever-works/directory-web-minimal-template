/**
 * Tests for the sync registry module.
 *
 * Verifies that the module-level singleton registry correctly stores
 * and retrieves SyncManager, ContentCache, and configuration values.
 *
 * Since sync-registry uses module-level singletons, we use
 * vi.resetModules() + dynamic import to get a clean module per test.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SyncManagerLike } from '../sync-registry.js';
import type { ContentCache } from '@ever-works/core';

/** Create a minimal mock SyncManager */
function createMockSyncManager(overrides?: Partial<SyncManagerLike>): SyncManagerLike {
    return {
        sync: async () => ({ success: true, contentChanged: false, message: 'ok' }),
        getStatus: () => ({ isRunning: false, lastSyncTime: null }),
        ...overrides,
    };
}

/** Create a minimal mock ContentCache */
function createMockContentCache(): ContentCache {
    return {
        invalidate: () => {},
        isValid: () => false,
        getStatus: () => ({ cached: false, loadedAt: null, ageMs: null, ttlMs: 0 }),
        get: async (loader: () => Promise<unknown>) => loader(),
    } as unknown as ContentCache;
}

/** Import a fresh copy of the sync-registry module (resets singletons) */
async function freshRegistry() {
    vi.resetModules();
    return import('../sync-registry.js');
}

describe('sync-registry', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    describe('registerSync', () => {
        it('should register a syncManager', async () => {
            const registry = await freshRegistry();
            const mockManager = createMockSyncManager();

            registry.registerSync({ syncManager: mockManager });

            expect(registry.getSyncManager()).toBe(mockManager);
        });

        it('should register a contentCache', async () => {
            const registry = await freshRegistry();
            const mockCache = createMockContentCache();

            registry.registerSync({ contentCache: mockCache });

            expect(registry.getContentCache()).toBe(mockCache);
        });

        it('should register webhookSecret', async () => {
            const registry = await freshRegistry();

            registry.registerSync({ webhookSecret: 'my-secret-123' });

            expect(registry.getWebhookSecret()).toBe('my-secret-123');
        });

        it('should register deployHookUrl', async () => {
            const registry = await freshRegistry();

            registry.registerSync({ deployHookUrl: 'https://api.vercel.com/deploy/hook123' });

            expect(registry.getDeployHookUrl()).toBe('https://api.vercel.com/deploy/hook123');
        });

        it('should register targetBranch', async () => {
            const registry = await freshRegistry();

            registry.registerSync({ targetBranch: 'production' });

            expect(registry.getTargetBranch()).toBe('production');
        });

        it('should register all options at once', async () => {
            const registry = await freshRegistry();
            const mockManager = createMockSyncManager();
            const mockCache = createMockContentCache();

            registry.registerSync({
                syncManager: mockManager,
                contentCache: mockCache,
                webhookSecret: 'secret',
                deployHookUrl: 'https://hook.url',
                targetBranch: 'develop',
            });

            expect(registry.getSyncManager()).toBe(mockManager);
            expect(registry.getContentCache()).toBe(mockCache);
            expect(registry.getWebhookSecret()).toBe('secret');
            expect(registry.getDeployHookUrl()).toBe('https://hook.url');
            expect(registry.getTargetBranch()).toBe('develop');
        });

        it('should allow partial registration without overwriting existing values', async () => {
            const registry = await freshRegistry();
            const mockManager = createMockSyncManager();

            registry.registerSync({ syncManager: mockManager, webhookSecret: 'first-secret' });
            registry.registerSync({ targetBranch: 'main' });

            // Original registrations should still be there
            expect(registry.getSyncManager()).toBe(mockManager);
            expect(registry.getWebhookSecret()).toBe('first-secret');
            // New registration should work
            expect(registry.getTargetBranch()).toBe('main');
        });

        it('should overwrite previously registered syncManager', async () => {
            const registry = await freshRegistry();
            const first = createMockSyncManager();
            const second = createMockSyncManager();

            registry.registerSync({ syncManager: first });
            registry.registerSync({ syncManager: second });

            expect(registry.getSyncManager()).toBe(second);
            expect(registry.getSyncManager()).not.toBe(first);
        });

        it('should overwrite previously registered contentCache', async () => {
            const registry = await freshRegistry();
            const first = createMockContentCache();
            const second = createMockContentCache();

            registry.registerSync({ contentCache: first });
            registry.registerSync({ contentCache: second });

            expect(registry.getContentCache()).toBe(second);
        });

        it('should not overwrite values when called with empty options', async () => {
            const registry = await freshRegistry();
            const mockManager = createMockSyncManager();

            registry.registerSync({ syncManager: mockManager, webhookSecret: 'secret' });
            registry.registerSync({});

            expect(registry.getSyncManager()).toBe(mockManager);
            expect(registry.getWebhookSecret()).toBe('secret');
        });
    });

    describe('getters return null/undefined before registration', () => {
        it('should return null for getSyncManager before registration', async () => {
            const registry = await freshRegistry();
            expect(registry.getSyncManager()).toBeNull();
        });

        it('should return null for getContentCache before registration', async () => {
            const registry = await freshRegistry();
            expect(registry.getContentCache()).toBeNull();
        });

        it('should return undefined for getWebhookSecret before registration', async () => {
            const registry = await freshRegistry();
            expect(registry.getWebhookSecret()).toBeUndefined();
        });

        it('should return undefined for getDeployHookUrl before registration', async () => {
            const registry = await freshRegistry();
            expect(registry.getDeployHookUrl()).toBeUndefined();
        });

        it('should return undefined for getTargetBranch before registration', async () => {
            const registry = await freshRegistry();
            expect(registry.getTargetBranch()).toBeUndefined();
        });
    });

    describe('SyncManagerLike interface compliance', () => {
        it('should store a sync manager that implements sync()', async () => {
            const registry = await freshRegistry();
            const manager = createMockSyncManager({
                sync: async () => ({
                    success: true,
                    contentChanged: true,
                    message: 'Content updated',
                }),
            });

            registry.registerSync({ syncManager: manager });

            const retrieved = registry.getSyncManager();
            expect(retrieved).not.toBeNull();
            const result = await retrieved!.sync();
            expect(result.success).toBe(true);
            expect(result.contentChanged).toBe(true);
            expect(result.message).toBe('Content updated');
        });

        it('should store a sync manager that implements getStatus()', async () => {
            const registry = await freshRegistry();
            const manager = createMockSyncManager({
                getStatus: () => ({ isRunning: true, lastSyncTime: 1234567890 }),
            });

            registry.registerSync({ syncManager: manager });

            const retrieved = registry.getSyncManager();
            expect(retrieved).not.toBeNull();
            const status = retrieved!.getStatus();
            expect(status.isRunning).toBe(true);
            expect(status.lastSyncTime).toBe(1234567890);
        });
    });
});
