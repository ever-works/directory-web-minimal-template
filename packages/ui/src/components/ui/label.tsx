/**
 * Label — Preact-compatible label component with fulldev/ui styling.
 * Used by interactive Preact islands (SortSelect).
 */
import type { ComponentChildren } from 'preact';
import { cn } from '../../lib/utils';

export interface LabelProps {
    className?: string;
    htmlFor?: string;
    for?: string;
    children?: ComponentChildren;
    [key: string]: unknown;
}

export function Label({ className, children, ...props }: LabelProps) {
    return (
        <label
            data-slot="label"
            className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                className,
            )}
            {...props}
        >
            {children}
        </label>
    );
}
