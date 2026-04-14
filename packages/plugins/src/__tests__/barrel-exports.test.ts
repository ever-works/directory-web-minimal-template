/**
 * Tests for @ever-works/plugins barrel export (index.ts).
 *
 * Validates that all public API symbols are re-exported correctly.
 */
import { describe, it, expect } from 'vitest';
import * as plugins from '../index';

describe('@ever-works/plugins barrel exports', () => {
    it('exports definePlugins', () => {
        expect(plugins.definePlugins).toBeTypeOf('function');
    });

    it('exports PluginRunner class', () => {
        expect(plugins.PluginRunner).toBeTypeOf('function');
    });

    it('exports createPluginLogger', () => {
        expect(plugins.createPluginLogger).toBeTypeOf('function');
    });

    it('does not export unexpected runtime values', () => {
        const expectedExports = [
            'definePlugins', 'PluginRunner', 'createPluginLogger',
        ];
        const actualExports = Object.keys(plugins);
        for (const key of actualExports) {
            expect(expectedExports).toContain(key);
        }
    });
});
