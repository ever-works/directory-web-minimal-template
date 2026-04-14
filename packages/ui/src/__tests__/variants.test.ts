/**
 * Tests for CVA variant definitions (badge + button).
 *
 * Ensures variant classes are generated correctly and default variants apply.
 */
import { describe, it, expect } from 'vitest';
import { badgeVariants } from '../primitives/badge/badge-variants';
import { buttonVariants } from '../primitives/button/button-variants';

describe('badgeVariants', () => {
    it('returns default variant classes when no options specified', () => {
        const classes = badgeVariants();
        expect(classes).toContain('bg-primary');
        expect(classes).toContain('text-primary-foreground');
    });

    it('returns outline variant classes', () => {
        const classes = badgeVariants({ variant: 'outline' });
        expect(classes).toContain('border-border');
        expect(classes).toContain('text-foreground');
    });

    it('returns secondary variant classes', () => {
        const classes = badgeVariants({ variant: 'secondary' });
        expect(classes).toContain('bg-secondary');
        expect(classes).toContain('text-secondary-foreground');
    });

    it('returns destructive variant classes', () => {
        const classes = badgeVariants({ variant: 'destructive' });
        expect(classes).toContain('text-destructive');
    });

    it('returns ghost variant classes', () => {
        const classes = badgeVariants({ variant: 'ghost' });
        expect(classes).toContain('hover:bg-muted');
    });

    it('returns link variant classes', () => {
        const classes = badgeVariants({ variant: 'link' });
        expect(classes).toContain('text-primary');
        expect(classes).toContain('hover:underline');
    });

    it('always includes base focus-visible classes', () => {
        const classes = badgeVariants({ variant: 'default' });
        expect(classes).toContain('focus-visible:border-ring');
        expect(classes).toContain('inline-flex');
    });
});

describe('buttonVariants', () => {
    it('returns default variant + size classes when no options specified', () => {
        const classes = buttonVariants();
        expect(classes).toContain('bg-primary');
        expect(classes).toContain('text-primary-foreground');
        expect(classes).toContain('h-9');
    });

    it('returns outline variant classes', () => {
        const classes = buttonVariants({ variant: 'outline' });
        expect(classes).toContain('border-border');
        expect(classes).toContain('bg-background');
    });

    it('returns ghost variant classes', () => {
        const classes = buttonVariants({ variant: 'ghost' });
        expect(classes).toContain('hover:bg-muted');
    });

    it('returns sm size classes', () => {
        const classes = buttonVariants({ size: 'sm' });
        expect(classes).toContain('h-8');
    });

    it('returns lg size classes', () => {
        const classes = buttonVariants({ size: 'lg' });
        expect(classes).toContain('h-10');
    });

    it('returns icon size classes', () => {
        const classes = buttonVariants({ size: 'icon' });
        expect(classes).toContain('size-9');
    });

    it('returns xs size classes', () => {
        const classes = buttonVariants({ size: 'xs' });
        expect(classes).toContain('h-6');
    });

    it('combines variant + size correctly', () => {
        const classes = buttonVariants({ variant: 'secondary', size: 'lg' });
        expect(classes).toContain('bg-secondary');
        expect(classes).toContain('h-10');
    });

    it('always includes base disabled + focus classes', () => {
        const classes = buttonVariants();
        expect(classes).toContain('disabled:pointer-events-none');
        expect(classes).toContain('disabled:opacity-50');
        expect(classes).toContain('focus-visible:ring-3');
    });

    it('returns destructive variant classes', () => {
        const classes = buttonVariants({ variant: 'destructive' });
        expect(classes).toContain('text-destructive');
    });

    it('returns link variant classes', () => {
        const classes = buttonVariants({ variant: 'link' });
        expect(classes).toContain('text-primary');
        expect(classes).toContain('hover:underline');
    });
});
