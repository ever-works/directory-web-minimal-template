/**
 * Button variant styles — from fulldev/ui
 * @see https://github.com/fulldotdev/ui
 */
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
    "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/80",
                outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
                destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 gap-1.5 px-2.5",
                xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
                sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5",
                lg: "h-10 gap-1.5 px-2.5",
                icon: "size-9",
                "icon-sm": "size-8 rounded-[min(var(--radius-md),10px)]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
