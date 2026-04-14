/**
 * Tests for @ever-works/sync barrel export (index.ts).
 *
 * Validates that all public API symbols are re-exported correctly.
 */
import { describe, it, expect } from 'vitest';
import * as sync from '../index.js';

describe('@ever-works/sync barrel exports', () => {
    it('exports SyncManager class', () => {
        expect(sync.SyncManager).toBeTypeOf('function');
    });

    it('exports WebhookHandler class', () => {
        expect(sync.WebhookHandler).toBeTypeOf('function');
    });

    it('exports DeployHookTrigger class', () => {
        expect(sync.DeployHookTrigger).toBeTypeOf('function');
    });

    it('exports resolveSyncConfig', () => {
        expect(sync.resolveSyncConfig).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'SyncManager', 'WebhookHandler', 'DeployHookTrigger', 'resolveSyncConfig',
        ];
        const actualExports = Object.keys(sync);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
