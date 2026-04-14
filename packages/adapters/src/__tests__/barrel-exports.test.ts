/**
 * Tests for @ever-works/adapters barrel export (index.ts).
 *
 * Validates that all public API symbols are re-exported correctly.
 */
import { describe, it, expect } from 'vitest';
import * as adapters from '../index';

describe('@ever-works/adapters barrel exports', () => {
    it('exports FilesystemAdapter class', () => {
        expect(adapters.FilesystemAdapter).toBeTypeOf('function');
    });

    it('exports GitAdapter class', () => {
        expect(adapters.GitAdapter).toBeTypeOf('function');
    });

    it('exports createAdapter factory', () => {
        expect(adapters.createAdapter).toBeTypeOf('function');
    });

    it('exports resolveAdapterConfig', () => {
        expect(adapters.resolveAdapterConfig).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'FilesystemAdapter', 'GitAdapter', 'createAdapter', 'resolveAdapterConfig',
        ];
        const actualExports = Object.keys(adapters);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
