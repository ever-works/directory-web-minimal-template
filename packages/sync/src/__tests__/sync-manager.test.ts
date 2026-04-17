import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DataAdapter } from '@ever-works/adapters';
import { SyncManager } from '../sync-manager.js';
import type { SyncConfig } from '../types.js';

function createMockAdapter(refreshResult = false): DataAdapter {
	return {
		id: 'mock',
		name: 'Mock Adapter',
		init: vi.fn(),
		readFile: vi.fn(),
		listFiles: vi.fn(),
		listDirectories: vi.fn(),
		exists: vi.fn(),
		getContentPath: vi.fn().mockReturnValue('/mock'),
		refresh: vi.fn().mockResolvedValue(refreshResult),
		getHeadRef: vi.fn().mockResolvedValue('abc123'),
	};
}

const defaultConfig: SyncConfig = {
	pollIntervalMs: 0,
	syncTimeoutMs: 5000,
	maxRetries: 1,
	cacheTtlMs: 300000,
};

describe('SyncManager', () => {
	let adapter: DataAdapter;

	beforeEach(() => {
		adapter = createMockAdapter(false);
	});

	it('should sync successfully when no changes', async () => {
		const manager = new SyncManager(adapter, defaultConfig);
		const result = await manager.sync();

		expect(result.success).toBe(true);
		expect(result.contentChanged).toBe(false);
		expect(result.message).toBe('Already up to date');
		expect(adapter.refresh).toHaveBeenCalledOnce();
	});

	it('should detect content changes', async () => {
		adapter = createMockAdapter(true);
		const manager = new SyncManager(adapter, defaultConfig);
		const result = await manager.sync();

		expect(result.success).toBe(true);
		expect(result.contentChanged).toBe(true);
		expect(result.message).toBe('Content updated');
	});

	it('should emit events on sync', async () => {
		const manager = new SyncManager(adapter, defaultConfig);
		const events: string[] = [];
		manager.on((e) => events.push(e.type));

		await manager.sync();

		expect(events).toContain('sync:start');
		expect(events).toContain('sync:complete');
	});

	it('should emit content-changed event when content changes', async () => {
		adapter = createMockAdapter(true);
		const manager = new SyncManager(adapter, defaultConfig);
		const events: string[] = [];
		manager.on((e) => events.push(e.type));

		await manager.sync();

		expect(events).toContain('sync:content-changed');
	});

	it('should prevent concurrent syncs', async () => {
		const slow = vi.fn().mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve(false), 100)),
		);
		adapter.refresh = slow;
		const manager = new SyncManager(adapter, defaultConfig);

		const [r1, r2] = await Promise.all([manager.sync(), manager.sync()]);

		expect(r1.success).toBe(true);
		expect(r2.message).toBe('Sync already in progress');
		expect(slow).toHaveBeenCalledOnce();
	});

	it('should track status', async () => {
		const manager = new SyncManager(adapter, defaultConfig);

		expect(manager.getStatus().lastSyncTime).toBeNull();

		await manager.sync();

		const status = manager.getStatus();
		expect(status.lastSyncTime).toBeTypeOf('number');
		expect(status.isRunning).toBe(false);
	});

	it('should handle refresh errors with retry', async () => {
		adapter.refresh = vi.fn().mockRejectedValue(new Error('Network error'));
		const manager = new SyncManager(adapter, { ...defaultConfig, maxRetries: 2 });

		const result = await manager.sync();

		expect(result.success).toBe(false);
		expect(result.message).toContain('Network error');
		// Called 3 times: initial + 2 retries
		expect(adapter.refresh).toHaveBeenCalledTimes(3);
	});

	it('should cleanup on destroy', () => {
		const manager = new SyncManager(adapter, { ...defaultConfig, pollIntervalMs: 1000 });
		manager.startPolling();

		expect(manager.getStatus().isPolling).toBe(true);

		manager.destroy();

		expect(manager.getStatus().isPolling).toBe(false);
	});

	it('should handle sync timeout correctly', async () => {
		vi.useFakeTimers();
		// adapter.refresh() never resolves — hangs forever
		adapter.refresh = vi.fn().mockImplementation(() => new Promise(() => {}));
		const manager = new SyncManager(adapter, {
			...defaultConfig,
			syncTimeoutMs: 3000,
			maxRetries: 0,
		});

		const syncPromise = manager.sync();

		// Advance past the timeout
		await vi.advanceTimersByTimeAsync(3500);

		const result = await syncPromise;
		expect(result.success).toBe(false);
		expect(result.message).toContain('Sync timed out after 3000ms');
		vi.useRealTimers();
	});

	it('should apply exponential backoff delays', async () => {
		vi.useFakeTimers();
		adapter.refresh = vi.fn().mockRejectedValue(new Error('fail'));
		const manager = new SyncManager(adapter, {
			...defaultConfig,
			syncTimeoutMs: 60000,
			maxRetries: 3,
		});

		const syncPromise = manager.sync();

		// First call happens immediately, then backoff: 1s, 2s, 4s
		// After first failure, wait 1s for retry #1
		await vi.advanceTimersByTimeAsync(1000);
		expect(adapter.refresh).toHaveBeenCalledTimes(2);

		// After retry #1 failure, wait 2s for retry #2
		await vi.advanceTimersByTimeAsync(2000);
		expect(adapter.refresh).toHaveBeenCalledTimes(3);

		// After retry #2 failure, wait 4s for retry #3
		await vi.advanceTimersByTimeAsync(4000);
		expect(adapter.refresh).toHaveBeenCalledTimes(4);

		const result = await syncPromise;
		expect(result.success).toBe(false);
		expect(result.message).toContain('4 attempts');
		vi.useRealTimers();
	});

	it('should unsubscribe listeners correctly', async () => {
		const manager = new SyncManager(adapter, defaultConfig);
		const events: string[] = [];
		const unsubscribe = manager.on((e) => events.push(e.type));

		await manager.sync();
		expect(events.length).toBeGreaterThan(0);

		const countBefore = events.length;
		unsubscribe();

		await manager.sync();
		// No new events after unsubscribe
		expect(events.length).toBe(countBefore);
	});

	it('should not start polling when pollIntervalMs is 0', () => {
		const manager = new SyncManager(adapter, { ...defaultConfig, pollIntervalMs: 0 });
		manager.startPolling();

		expect(manager.getStatus().isPolling).toBe(false);
	});

	it('should handle listener errors gracefully', async () => {
		const manager = new SyncManager(adapter, defaultConfig);
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		// First listener throws
		manager.on(() => {
			throw new Error('listener boom');
		});

		// Second listener should still be called
		const events: string[] = [];
		manager.on((e) => events.push(e.type));

		const result = await manager.sync();

		expect(result.success).toBe(true);
		expect(events).toContain('sync:start');
		expect(events).toContain('sync:complete');
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it('should not poll when already polling', () => {
		vi.useFakeTimers();
		const manager = new SyncManager(adapter, { ...defaultConfig, pollIntervalMs: 5000 });

		manager.startPolling();
		expect(manager.getStatus().isPolling).toBe(true);

		// Call startPolling again — should be idempotent
		manager.startPolling();
		expect(manager.getStatus().isPolling).toBe(true);

		// Only one interval should exist — verify by stopping and checking
		manager.stopPolling();
		expect(manager.getStatus().isPolling).toBe(false);
		vi.useRealTimers();
	});

	it('should track durationMs in sync results', async () => {
		vi.useFakeTimers();
		adapter.refresh = vi.fn().mockImplementation(async () => {
			await new Promise((r) => setTimeout(r, 250));
			return true;
		});
		const manager = new SyncManager(adapter, defaultConfig);

		const syncPromise = manager.sync();
		await vi.advanceTimersByTimeAsync(250);

		const result = await syncPromise;
		expect(result.success).toBe(true);
		expect(result.durationMs).toBeDefined();
		expect(typeof result.durationMs).toBe('number');
		expect(result.durationMs).toBeGreaterThanOrEqual(0);
		vi.useRealTimers();
	});

	it('should handle polling sync rejection without crashing', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		adapter.refresh = vi.fn().mockRejectedValue(new Error('poll failure'));

		const manager = new SyncManager(adapter, {
			...defaultConfig,
			pollIntervalMs: 50,
			maxRetries: 0,
		});

		manager.startPolling();
		expect(manager.getStatus().isPolling).toBe(true);

		// Wait for at least one poll cycle
		await new Promise((r) => setTimeout(r, 120));

		manager.stopPolling();
		expect(manager.getStatus().isPolling).toBe(false);
		warnSpy.mockRestore();
	});

	it('should handle non-Error thrown values in sync error path', async () => {
		adapter.refresh = vi.fn().mockRejectedValue('string error');
		const manager = new SyncManager(adapter, { ...defaultConfig, maxRetries: 0 });

		const result = await manager.sync();

		expect(result.success).toBe(false);
		expect(result.message).toContain('string error');
	});

	it('should handle stopPolling when no polling is active', () => {
		const manager = new SyncManager(adapter, defaultConfig);

		// pollTimer is null — stopPolling should be a no-op without errors
		expect(manager.getStatus().isPolling).toBe(false);
		manager.stopPolling();
		expect(manager.getStatus().isPolling).toBe(false);
	});

	it('should emit sync:error with Error object wrapping non-Error thrown values', async () => {
		adapter.refresh = vi.fn().mockRejectedValue('raw string error');
		const manager = new SyncManager(adapter, { ...defaultConfig, maxRetries: 0 });
		const errors: unknown[] = [];
		manager.on((e) => {
			if (e.type === 'sync:error') {
				errors.push(e.error);
			}
		});

		await manager.sync();

		expect(errors).toHaveLength(1);
		expect(errors[0]).toBeInstanceOf(Error);
		expect((errors[0] as Error).message).toBe('raw string error');
	});

	it('should emit sync:error with original Error when Error is thrown', async () => {
		const originalError = new Error('real error');
		adapter.refresh = vi.fn().mockRejectedValue(originalError);
		const manager = new SyncManager(adapter, { ...defaultConfig, maxRetries: 0 });
		const errors: unknown[] = [];
		manager.on((e) => {
			if (e.type === 'sync:error') {
				errors.push(e.error);
			}
		});

		await manager.sync();

		expect(errors).toHaveLength(1);
		expect(errors[0]).toBe(originalError);
	});
});
