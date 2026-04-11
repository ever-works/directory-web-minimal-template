/**
 * @ever-works/sync
 *
 * Content synchronization system for the Ever Works directory template.
 * Handles polling, webhook validation, deploy hooks, and configuration.
 */

export type {
    SyncConfig,
    SyncResult,
    SyncStatus,
    SyncEvent,
    SyncEventType,
    SyncEventListener,
} from './types.js';

export { SyncManager } from './sync-manager.js';
export { WebhookHandler } from './webhook-handler.js';
export type { GitHubPushData } from './webhook-handler.js';
export { DeployHookTrigger } from './deploy-hook.js';
export type { DeployHookResult } from './deploy-hook.js';
export { resolveSyncConfig } from './resolve-config.js';
