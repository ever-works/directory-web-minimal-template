/**
 * Input — Preact-compatible input component with fulldev/ui styling.
 * Used by interactive Preact islands (SearchInput).
 */
import { cn } from '../../lib/utils';

export interface InputProps {
    className?: string;
    type?: string;
    [key: string]: unknown;
}

export function Input({ className, type = 'text', ...props }: InputProps) {
    return (
        <input
            data-slot="input"
            type={type}
            className={cn(
                'border-input bg-background ring-ring/10 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}
