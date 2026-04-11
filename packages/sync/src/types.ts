/**
 * Types for the content synchronization system.
 */

/** Configuration for content sync behavior */
export interface SyncConfig {
    /** Polling interval in milliseconds. 0 = disabled. Default: 0 */
    pollIntervalMs: number;

    /** Sync operation timeout in milliseconds. Default: 60000 */
    syncTimeoutMs: number;

    /** Max retry attempts on sync failure. Default: 3 */
    maxRetries: number;

    /** GitHub webhook HMAC-SHA256 secret for signature validation */
    webhookSecret?: string;

    /** Vercel Deploy Hook URL (for static mode rebuilds) */
    deployHookUrl?: string;

    /** Content cache TTL in milliseconds. Default: 300000 (5 min) */
    cacheTtlMs: number;
}

/** Result of a sync operation */
export interface SyncResult {
    /** Whether the sync completed successfully */
    success: boolean;

    /** Human-readable status message */
    message: string;

    /** Whether content actually changed (new commits, file modifications) */
    contentChanged: boolean;

    /** Duration of the sync in milliseconds */
    durationMs?: number;
}

/** Current sync system status */
export interface SyncStatus {
    /** Whether a sync is currently in progress */
    isRunning: boolean;

    /** Timestamp of last completed sync (ms since epoch), null if never synced */
    lastSyncTime: number | null;

    /** Result of the last sync, null if never synced */
    lastSyncResult: SyncResult | null;

    /** Configured polling interval in ms */
    pollIntervalMs: number;

    /** Whether polling is currently active */
    isPolling: boolean;
}

/** Sync event types */
export type SyncEventType =
    | 'sync:start'
    | 'sync:complete'
    | 'sync:error'
    | 'sync:content-changed';

/** Sync event payload */
export interface SyncEvent {
    type: SyncEventType;
    result?: SyncResult;
    error?: Error;
}

/** Listener for sync events */
export type SyncEventListener = (event: SyncEvent) => void;
