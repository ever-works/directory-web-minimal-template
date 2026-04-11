/**
 * Button — Preact-compatible button component using fulldev/ui variant styles.
 * Used by interactive Preact islands (BackToTop, FilterBar, SearchInput, ThemeToggle).
 */
import type { ComponentChildren } from 'preact';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../../primitives/button/button-variants';

export interface ButtonProps {
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link' | null;
    size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-sm' | null;
    className?: string;
    children?: ComponentChildren;
    [key: string]: unknown;
}

export function Button({ className, variant = 'default', size = 'default', children, ...props }: ButtonProps) {
    return (
        <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>
            {children}
        </button>
    );
}
