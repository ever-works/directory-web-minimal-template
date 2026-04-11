/**
 * Badge — Preact-compatible badge component using fulldev/ui variant styles.
 * Used by interactive Preact islands (FilterBar).
 */
import type { ComponentChildren } from 'preact';
import { cn } from '../../lib/utils';
import { badgeVariants } from '../../primitives/badge/badge-variants';

export interface BadgeProps {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | null;
    className?: string;
    children?: ComponentChildren;
    [key: string]: unknown;
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
    return (
        <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
            {children}
        </span>
    );
}
