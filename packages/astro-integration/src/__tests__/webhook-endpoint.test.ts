/**
 * Tests for the webhook API endpoint.
 *
 * Verifies POST (GitHub webhook) and GET (health check) handlers,
 * including signature validation, branch filtering, ISR sync,
 * deploy hook fallback, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { APIContext } from 'astro';
import type { SyncManagerLike } from '../sync-registry.js';
import type { ContentCache } from '@ever-works/core';

// ── Mock the sync-registry module ──────────────────────────────────
// These mutable values let each test control what the registry returns.
let mockSyncManager: SyncManagerLike | null = null;
let mockContentCache: ContentCache | null = null;
let mockWebhookSecret: string | undefined;
let mockDeployHookUrl: string | undefined;
let mockTargetBranch: string | undefined;

vi.mock('../sync-registry.js', () => ({
    getSyncManager: () => mockSyncManager,
    getContentCache: () => mockContentCache,
    getWebhookSecret: () => mockWebhookSecret,
    getDeployHookUrl: () => mockDeployHookUrl,
    getTargetBranch: () => mockTargetBranch,
}));

// ── Mock @ever-works/sync ──────────────────────────────────────────
const mockValidateSignature = vi.fn();
const mockParseGitHubPush = vi.fn();
const mockIsRelevantPush = vi.fn();
const mockDeployHookTrigger = vi.fn();

vi.mock('@ever-works/sync', () => ({
    WebhookHandler: {
        validateSignature: (...args: unknown[]) => mockValidateSignature(...args),
        parseGitHubPush: (...args: unknown[]) => mockParseGitHubPush(...args),
        isRelevantPush: (...args: unknown[]) => mockIsRelevantPush(...args),
    },
    DeployHookTrigger: {
        trigger: (...args: unknown[]) => mockDeployHookTrigger(...args),
    },
}));

/** Helper: build a minimal Request for the POST handler */
function makePostRequest(
    body: string,
    signature?: string,
): Request {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (signature) {
        headers.set('x-hub-signature-256', signature);
    }
    return new Request('https://example.com/api/webhook', {
        method: 'POST',
        headers,
        body,
    });
}

/** Helper: build a minimal Request for the GET handler */
function makeGetRequest(): Request {
    return new Request('https://example.com/api/webhook', { method: 'GET' });
}

/** Helper: parse JSON response body */
async function parseResponse(response: Response): Promise<Record<string, unknown>> {
    return JSON.parse(await response.text()) as Record<string, unknown>;
}

/** Create a minimal mock SyncManager */
function createMockSyncManager(overrides?: Partial<SyncManagerLike>): SyncManagerLike {
    return {
        sync: vi.fn(async () => ({ success: true, contentChanged: false, message: 'Sync complete' })),
        getStatus: vi.fn(() => ({ isRunning: false, lastSyncTime: null })),
        ...overrides,
    };
}

/** Create a minimal mock ContentCache */
function createMockContentCache(): ContentCache {
    return {
        invalidate: vi.fn(),
        isValid: () => false,
        getStatus: () => ({ cached: false, loadedAt: null, ageMs: null, ttlMs: 0 }),
        get: async (loader: () => Promise<unknown>) => loader(),
    } as unknown as ContentCache;
}

// ── Import the handlers under test ─────────────────────────────────
// Must be imported AFTER vi.mock() calls so mocks are resolved.
import { POST, GET } from '../webhook-endpoint.js';

describe('webhook-endpoint', () => {
    beforeEach(() => {
        // Reset all mutable state
        mockSyncManager = null;
        mockContentCache = null;
        mockWebhookSecret = undefined;
        mockDeployHookUrl = undefined;
        mockTargetBranch = undefined;

        // Reset all mock implementations
        mockValidateSignature.mockReset();
        mockParseGitHubPush.mockReset();
        mockIsRelevantPush.mockReset();
        mockDeployHookTrigger.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ── POST handler ───────────────────────────────────────────────

    describe('POST handler', () => {
        describe('secret validation', () => {
            it('should return 500 when webhook secret is not configured', async () => {
                mockWebhookSecret = undefined;
                const request = makePostRequest('{}');

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(500);
                expect(body['error']).toBe('Webhook secret not configured');
            });
        });

        describe('signature validation', () => {
            it('should return 401 when signature is invalid', async () => {
                mockWebhookSecret = 'test-secret';
                mockValidateSignature.mockReturnValue(false);

                const request = makePostRequest('{}', 'sha256=invalid');

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(401);
                expect(body['error']).toBe('Invalid webhook signature');
                expect(mockValidateSignature).toHaveBeenCalledWith('{}', 'sha256=invalid', 'test-secret');
            });

            it('should pass empty string when signature header is missing', async () => {
                mockWebhookSecret = 'test-secret';
                mockValidateSignature.mockReturnValue(false);

                const request = makePostRequest('{}');

                await POST({ request } as unknown as APIContext);

                expect(mockValidateSignature).toHaveBeenCalledWith('{}', '', 'test-secret');
            });
        });

        describe('push event parsing', () => {
            it('should return 200 with ignore message when not a push event', async () => {
                mockWebhookSecret = 'test-secret';
                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue(null);

                const request = makePostRequest('{}', 'sha256=valid');

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(200);
                expect(body['message']).toBe('Not a push event, ignoring');
            });
        });

        describe('branch filtering', () => {
            it('should ignore pushes to non-tracked branches', async () => {
                mockWebhookSecret = 'test-secret';
                mockTargetBranch = 'main';
                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'feature/test', commits: 1 });
                mockIsRelevantPush.mockReturnValue(false);

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/feature/test' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(200);
                expect(body['message']).toBe('Push to feature/test, ignoring (tracking main)');
                expect(mockIsRelevantPush).toHaveBeenCalledWith('feature/test', 'main');
            });

            it('should not filter by branch when targetBranch is not configured', async () => {
                mockWebhookSecret = 'test-secret';
                mockTargetBranch = undefined;
                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'develop', commits: 1 });

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/develop' }),
                    'sha256=valid',
                );

                await POST({ request } as unknown as APIContext);

                expect(mockIsRelevantPush).not.toHaveBeenCalled();
            });
        });

        describe('ISR mode (sync manager present)', () => {
            it('should call sync and return result when syncManager is registered', async () => {
                mockWebhookSecret = 'test-secret';
                const syncManager = createMockSyncManager({
                    sync: vi.fn(async () => ({
                        success: true,
                        contentChanged: false,
                        message: 'No changes detected',
                    })),
                });
                mockSyncManager = syncManager;

                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 2 });
                mockIsRelevantPush.mockReturnValue(true);

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(200);
                expect(body['message']).toBe('No changes detected');
                expect(body['contentChanged']).toBe(false);
                expect(body['branch']).toBe('main');
                expect(body['commits']).toBe(2);
                expect(syncManager.sync).toHaveBeenCalledOnce();
            });

            it('should invalidate cache when content changed', async () => {
                mockWebhookSecret = 'test-secret';
                const cache = createMockContentCache();
                const syncManager = createMockSyncManager({
                    sync: vi.fn(async () => ({
                        success: true,
                        contentChanged: true,
                        message: 'Content updated',
                    })),
                });
                mockSyncManager = syncManager;
                mockContentCache = cache;

                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(200);
                expect(body['contentChanged']).toBe(true);
                expect(cache.invalidate).toHaveBeenCalledOnce();
            });

            it('should not invalidate cache when content did not change', async () => {
                mockWebhookSecret = 'test-secret';
                const cache = createMockContentCache();
                const syncManager = createMockSyncManager({
                    sync: vi.fn(async () => ({
                        success: true,
                        contentChanged: false,
                        message: 'No changes',
                    })),
                });
                mockSyncManager = syncManager;
                mockContentCache = cache;

                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                await POST({ request } as unknown as APIContext);

                expect(cache.invalidate).not.toHaveBeenCalled();
            });

            it('should not call cache.invalidate if contentCache is not registered', async () => {
                mockWebhookSecret = 'test-secret';
                const syncManager = createMockSyncManager({
                    sync: vi.fn(async () => ({
                        success: true,
                        contentChanged: true,
                        message: 'Content updated',
                    })),
                });
                mockSyncManager = syncManager;
                mockContentCache = null; // no cache registered

                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                // Should not throw even though contentChanged is true and cache is null
                const response = await POST({ request } as unknown as APIContext);
                expect(response.status).toBe(200);
            });
        });

        describe('static mode (deploy hook fallback)', () => {
            it('should trigger deploy hook when no sync manager but deploy hook is configured', async () => {
                mockWebhookSecret = 'test-secret';
                mockDeployHookUrl = 'https://api.vercel.com/deploy/hook123';
                mockSyncManager = null;

                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);
                mockDeployHookTrigger.mockResolvedValue({
                    success: true,
                    message: 'Deploy triggered',
                });

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(200);
                expect(body['message']).toBe('Deploy triggered');
                expect(body['mode']).toBe('deploy-hook');
                expect(body['branch']).toBe('main');
                expect(mockDeployHookTrigger).toHaveBeenCalledWith('https://api.vercel.com/deploy/hook123');
            });

            it('should return 502 when deploy hook trigger fails', async () => {
                mockWebhookSecret = 'test-secret';
                mockDeployHookUrl = 'https://api.vercel.com/deploy/hook123';
                mockSyncManager = null;

                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);
                mockDeployHookTrigger.mockResolvedValue({
                    success: false,
                    message: 'Deploy hook failed: HTTP 500',
                });

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(502);
                expect(body['message']).toBe('Deploy hook failed: HTTP 500');
                expect(body['mode']).toBe('deploy-hook');
            });
        });

        describe('no sync manager and no deploy hook', () => {
            it('should return 200 with informational message', async () => {
                mockWebhookSecret = 'test-secret';
                mockSyncManager = null;
                mockDeployHookUrl = undefined;

                mockValidateSignature.mockReturnValue(true);
                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(200);
                expect(body['message']).toBe(
                    'Webhook received but no sync manager or deploy hook configured',
                );
                expect(body['branch']).toBe('main');
            });
        });

        describe('error handling', () => {
            it('should return 500 on unexpected errors', async () => {
                mockWebhookSecret = 'test-secret';
                mockValidateSignature.mockReturnValue(true);
                // Make JSON.parse fail by returning a body that parseGitHubPush chokes on
                // Actually, we can make the sync manager throw
                const syncManager = createMockSyncManager({
                    sync: vi.fn(async () => { throw new Error('Sync engine crashed'); }),
                });
                mockSyncManager = syncManager;

                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);

                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(500);
                expect(body['error']).toBe('Internal webhook processing error');
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('[webhook]'),
                    expect.stringContaining('Sync engine crashed'),
                );

                consoleSpy.mockRestore();
            });

            it('should handle non-Error thrown objects gracefully', async () => {
                mockWebhookSecret = 'test-secret';
                mockValidateSignature.mockReturnValue(true);
                const syncManager = createMockSyncManager({
                    sync: vi.fn(async () => { throw 'string error'; }),
                });
                mockSyncManager = syncManager;

                mockParseGitHubPush.mockReturnValue({ branch: 'main', commits: 1 });
                mockIsRelevantPush.mockReturnValue(true);

                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

                const request = makePostRequest(
                    JSON.stringify({ ref: 'refs/heads/main' }),
                    'sha256=valid',
                );

                const response = await POST({ request } as unknown as APIContext);
                const body = await parseResponse(response);

                expect(response.status).toBe(500);
                expect(body['error']).toBe('Internal webhook processing error');
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('[webhook]'),
                    'string error',
                );

                consoleSpy.mockRestore();
            });
        });

        describe('response format', () => {
            it('should return JSON content type on all responses', async () => {
                mockWebhookSecret = undefined;
                const request = makePostRequest('{}');

                const response = await POST({ request } as unknown as APIContext);

                expect(response.headers.get('Content-Type')).toBe('application/json');
            });
        });
    });

    // ── GET handler (health check) ─────────────────────────────────

    describe('GET handler', () => {
        it('should return status ok with sync status when manager is registered', async () => {
            mockSyncManager = createMockSyncManager({
                getStatus: () => ({ isRunning: true, lastSyncTime: 1700000000000 }),
            });

            const response = await GET({ request: makeGetRequest() } as unknown as APIContext);
            const body = await parseResponse(response);

            expect(response.status).toBe(200);
            expect(body['status']).toBe('ok');
            expect(body['sync']).toEqual({ isRunning: true, lastSyncTime: 1700000000000 });
        });

        it('should return default sync status when no manager is registered', async () => {
            mockSyncManager = null;

            const response = await GET({ request: makeGetRequest() } as unknown as APIContext);
            const body = await parseResponse(response);

            expect(response.status).toBe(200);
            expect(body['status']).toBe('ok');
            expect(body['sync']).toEqual({ isRunning: false, lastSyncTime: null });
        });

        it('should return JSON content type', async () => {
            mockSyncManager = null;

            const response = await GET({ request: makeGetRequest() } as unknown as APIContext);

            expect(response.headers.get('Content-Type')).toBe('application/json');
        });
    });
});
