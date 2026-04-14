/**
 * Tests for the cn() utility function.
 *
 * cn() merges Tailwind CSS classes with proper conflict resolution
 * using clsx + tailwind-merge.
 */
import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn()', () => {
    it('merges simple class strings', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('returns empty string for no input', () => {
        expect(cn()).toBe('');
    });

    it('handles undefined and null values', () => {
        expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
        const isActive = true;
        const isDisabled = false;
        expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });

    it('resolves Tailwind conflicts (last wins)', () => {
        // tailwind-merge resolves p-4 vs p-2 → p-2 (last wins)
        expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('resolves Tailwind color conflicts', () => {
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('preserves non-conflicting Tailwind classes', () => {
        expect(cn('p-4', 'mx-2', 'text-sm')).toBe('p-4 mx-2 text-sm');
    });

    it('handles array inputs', () => {
        expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
    });

    it('handles object inputs (clsx style)', () => {
        expect(cn({ active: true, disabled: false, 'text-sm': true })).toBe('active text-sm');
    });

    it('does not deduplicate non-Tailwind classes (tailwind-merge only resolves Tailwind conflicts)', () => {
        // tailwind-merge only deduplicates Tailwind utility classes, not arbitrary strings
        expect(cn('foo', 'bar', 'foo')).toBe('foo bar foo');
    });

    it('handles mixed Tailwind responsive and base classes', () => {
        expect(cn('text-sm', 'md:text-lg', 'text-base')).toBe('md:text-lg text-base');
    });

    it('resolves flex direction conflicts', () => {
        expect(cn('flex-col', 'flex-row')).toBe('flex-row');
    });
});
