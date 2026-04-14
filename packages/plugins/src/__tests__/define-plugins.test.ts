import { describe, it, expect, vi, beforeEach } from 'vitest';
import { definePlugins } from '../define-plugins.js';
import type { Plugin } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createPlugin(overrides: Partial<Plugin> & { id: string }): Plugin {
    return {
        name: overrides.id,
        version: '0.1.0',
        description: `Test plugin ${overrides.id}`,
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('definePlugins', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // ------------------------------------------------------------------
    // validation
    // ------------------------------------------------------------------
    describe('validation', () => {
        it('accepts an empty array', () => {
            const result = definePlugins([]);
            expect(result).toEqual([]);
        });

        it('accepts a single plugin', () => {
            const plugin = createPlugin({ id: 'only' });
            const result = definePlugins([plugin]);
            expect(result).toHaveLength(1);
            expect(result[0]!.id).toBe('only');
        });

        it('throws on duplicate plugin IDs', () => {
            const a = createPlugin({ id: 'dup' });
            const b = createPlugin({ id: 'dup' });

            expect(() => definePlugins([a, b])).toThrow(
                'Duplicate plugin ID: "dup"',
            );
        });

        it('throws on duplicate IDs even with different names', () => {
            const a = createPlugin({ id: 'same', name: 'First Plugin' });
            const b = createPlugin({ id: 'same', name: 'Second Plugin' });

            expect(() => definePlugins([a, b])).toThrow('Duplicate plugin ID');
        });
    });

    // ------------------------------------------------------------------
    // dependency resolution — ordering
    // ------------------------------------------------------------------
    describe('dependency ordering', () => {
        it('preserves original order when no dependencies', () => {
            const plugins = ['a', 'b', 'c'].map((id) => createPlugin({ id }));
            const result = definePlugins(plugins);
            expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c']);
        });

        it('places dependency before dependent', () => {
            const a = createPlugin({ id: 'a', dependencies: ['b'] });
            const b = createPlugin({ id: 'b' });

            const result = definePlugins([a, b]);
            expect(result.map((p) => p.id)).toEqual(['b', 'a']);
        });

        it('resolves a chain: c -> b -> a', () => {
            const a = createPlugin({ id: 'a' });
            const b = createPlugin({ id: 'b', dependencies: ['a'] });
            const c = createPlugin({ id: 'c', dependencies: ['b'] });

            const result = definePlugins([c, b, a]);
            expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c']);
        });

        it('resolves diamond dependency: d -> b,c; b -> a; c -> a', () => {
            const a = createPlugin({ id: 'a' });
            const b = createPlugin({ id: 'b', dependencies: ['a'] });
            const c = createPlugin({ id: 'c', dependencies: ['a'] });
            const d = createPlugin({ id: 'd', dependencies: ['b', 'c'] });

            const result = definePlugins([d, c, b, a]);
            const ids = result.map((p) => p.id);

            // 'a' must come before 'b' and 'c'; 'b' and 'c' before 'd'
            expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'));
            expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('c'));
            expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('d'));
            expect(ids.indexOf('c')).toBeLessThan(ids.indexOf('d'));
        });

        it('places multiple dependencies before the dependent', () => {
            const a = createPlugin({ id: 'a' });
            const b = createPlugin({ id: 'b' });
            const c = createPlugin({ id: 'c', dependencies: ['a', 'b'] });

            const result = definePlugins([c, a, b]);
            const ids = result.map((p) => p.id);

            expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('c'));
            expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'));
        });
    });

    // ------------------------------------------------------------------
    // circular dependency detection
    // ------------------------------------------------------------------
    describe('circular dependencies', () => {
        it('throws on direct circular dependency (a <-> b)', () => {
            const a = createPlugin({ id: 'a', dependencies: ['b'] });
            const b = createPlugin({ id: 'b', dependencies: ['a'] });

            expect(() => definePlugins([a, b])).toThrow(
                'Circular plugin dependency',
            );
        });

        it('throws on transitive circular dependency (a -> b -> c -> a)', () => {
            const a = createPlugin({ id: 'a', dependencies: ['c'] });
            const b = createPlugin({ id: 'b', dependencies: ['a'] });
            const c = createPlugin({ id: 'c', dependencies: ['b'] });

            expect(() => definePlugins([a, b, c])).toThrow(
                'Circular plugin dependency',
            );
        });

        it('throws on self-dependency', () => {
            const a = createPlugin({ id: 'a', dependencies: ['a'] });

            expect(() => definePlugins([a])).toThrow(
                'Circular plugin dependency',
            );
        });
    });

    // ------------------------------------------------------------------
    // missing dependency handling
    // ------------------------------------------------------------------
    describe('missing dependencies', () => {
        it('throws when a dependency is not registered', () => {
            const plugin = createPlugin({ id: 'consumer', dependencies: ['missing-dep'] });

            expect(() => definePlugins([plugin])).toThrow('missing-dep');
            expect(() => definePlugins([plugin])).toThrow('not registered');
        });

        it('throws for the first missing dependency encountered', () => {
            const plugin = createPlugin({ id: 'multi', dependencies: ['missing-a', 'missing-b'] });

            expect(() => definePlugins([plugin])).toThrow('missing-a');
        });

        it('throws when one dependency exists but another does not', () => {
            const a = createPlugin({ id: 'a' });
            const b = createPlugin({ id: 'b', dependencies: ['a', 'nonexistent'] });

            expect(() => definePlugins([b, a])).toThrow('nonexistent');
        });
    });

    // ------------------------------------------------------------------
    // plugins without dependencies field
    // ------------------------------------------------------------------
    describe('no dependencies field', () => {
        it('handles plugins with undefined dependencies', () => {
            const plugin = createPlugin({ id: 'no-deps' });
            // dependencies is not set
            expect(plugin.dependencies).toBeUndefined();

            const result = definePlugins([plugin]);
            expect(result).toHaveLength(1);
            expect(result[0]!.id).toBe('no-deps');
        });

        it('handles plugins with empty dependencies array', () => {
            const plugin = createPlugin({ id: 'empty-deps', dependencies: [] });

            const result = definePlugins([plugin]);
            expect(result).toHaveLength(1);
        });
    });

    // ------------------------------------------------------------------
    // returned array identity
    // ------------------------------------------------------------------
    describe('return value', () => {
        it('returns a new array (not the original input)', () => {
            const plugins = [createPlugin({ id: 'a' })];
            const result = definePlugins(plugins);

            expect(result).not.toBe(plugins);
            expect(result).toHaveLength(1);
        });

        it('returns the same plugin object references', () => {
            const a = createPlugin({ id: 'a' });
            const b = createPlugin({ id: 'b' });

            const result = definePlugins([a, b]);
            expect(result[0]).toBe(a);
            expect(result[1]).toBe(b);
        });
    });
});
