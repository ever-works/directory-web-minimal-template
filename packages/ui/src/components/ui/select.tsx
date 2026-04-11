/**
 * Select — Preact-compatible select component with fulldev/ui styling.
 * Used by interactive Preact islands (SortSelect).
 */
import type { ComponentChildren } from 'preact';
import { cn } from '../../lib/utils';

export interface SelectProps {
    className?: string;
    children?: ComponentChildren;
    [key: string]: unknown;
}

export function Select({ className, children, ...props }: SelectProps) {
    return (
        <select
            data-slot="select"
            className={cn(
                'border-input bg-background ring-ring/10 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export interface SelectOptionProps {
    value: string;
    children?: ComponentChildren;
    [key: string]: unknown;
}

export function SelectOption({ children, ...props }: SelectOptionProps) {
    return <option {...props}>{children}</option>;
}
