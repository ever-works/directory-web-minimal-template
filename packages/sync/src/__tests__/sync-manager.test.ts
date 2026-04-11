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
});
