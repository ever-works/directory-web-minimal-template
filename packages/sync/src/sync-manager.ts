/**
 * SyncManager — Orchestrates content synchronization.
 * Handles polling, change detection, and event notification.
 * Uses the adapter's refresh() method for actual content updates.
 */

import type { DataAdapter } from '@ever-works/adapters';
import type { SyncConfig, SyncResult, SyncStatus, SyncEvent, SyncEventListener } from './types.js';

export class SyncManager {
    private readonly adapter: DataAdapter;
    private readonly config: SyncConfig;
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private syncing = false;
    private lastSyncTime: number | null = null;
    private lastSyncResult: SyncResult | null = null;
    private listeners: SyncEventListener[] = [];

    constructor(adapter: DataAdapter, config: SyncConfig) {
        this.adapter = adapter;
        this.config = config;
    }

    /**
     * Perform a single sync: call adapter.refresh() and return result.
     * Protected by a mutex — concurrent calls return early.
     */
    async sync(): Promise<SyncResult> {
        if (this.syncing) {
            return { success: true, message: 'Sync already in progress', contentChanged: false };
        }

        this.syncing = true;
        this.emit({ type: 'sync:start' });

        const startTime = Date.now();
        let retries = 0;

        while (retries <= this.config.maxRetries) {
            try {
                const result = await this.syncWithTimeout();
                const durationMs = Date.now() - startTime;

                const syncResult: SyncResult = {
                    success: true,
                    message: result ? 'Content updated' : 'Already up to date',
                    contentChanged: result,
                    durationMs,
                };

                this.lastSyncTime = Date.now();
                this.lastSyncResult = syncResult;
                this.syncing = false;

                this.emit({ type: 'sync:complete', result: syncResult });
                if (result) {
                    this.emit({ type: 'sync:content-changed', result: syncResult });
                }

                return syncResult;
            } catch (error) {
                retries++;
                if (retries > this.config.maxRetries) {
                    const durationMs = Date.now() - startTime;
                    const syncResult: SyncResult = {
                        success: false,
                        message: `Sync failed after ${retries} attempts: ${error instanceof Error ? error.message : String(error)}`,
                        contentChanged: false,
                        durationMs,
                    };

                    this.lastSyncTime = Date.now();
                    this.lastSyncResult = syncResult;
                    this.syncing = false;

                    this.emit({ type: 'sync:error', result: syncResult, error: error instanceof Error ? error : new Error(String(error)) });
                    return syncResult;
                }

                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        // Should never reach here, but TypeScript needs it
        this.syncing = false;
        return { success: false, message: 'Unexpected sync state', contentChanged: false };
    }

    /** Start periodic polling (if pollIntervalMs > 0) */
    startPolling(): void {
        if (this.config.pollIntervalMs <= 0) return;
        if (this.pollTimer) return; // Already polling

        this.pollTimer = setInterval(() => {
            this.sync().catch((err) => {
                console.warn('[sync] Polling sync failed:', err);
            });
        }, this.config.pollIntervalMs);
    }

    /** Stop periodic polling */
    stopPolling(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    /** Get current sync status */
    getStatus(): SyncStatus {
        return {
            isRunning: this.syncing,
            lastSyncTime: this.lastSyncTime,
            lastSyncResult: this.lastSyncResult,
            pollIntervalMs: this.config.pollIntervalMs,
            isPolling: this.pollTimer !== null,
        };
    }

    /** Subscribe to sync events. Returns unsubscribe function. */
    on(listener: SyncEventListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /** Cleanup: stop polling and remove all listeners */
    destroy(): void {
        this.stopPolling();
        this.listeners = [];
    }

    /** Call adapter.refresh() with timeout protection */
    private async syncWithTimeout(): Promise<boolean> {
        const timeoutMs = this.config.syncTimeoutMs;
        let timer: ReturnType<typeof setTimeout> | undefined;

        try {
            return await Promise.race([
                this.adapter.refresh(),
                new Promise<never>((_, reject) => {
                    timer = setTimeout(() => reject(new Error(`Sync timed out after ${timeoutMs}ms`)), timeoutMs);
                }),
            ]);
        } finally {
            if (timer !== undefined) clearTimeout(timer);
        }
    }

    /** Emit event to all listeners */
    private emit(event: SyncEvent): void {
        for (const listener of this.listeners) {
            try {
                listener(event);
            } catch (err) {
                console.warn('[sync] Event listener error:', err);
            }
        }
    }
}
