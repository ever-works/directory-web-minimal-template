/**
 * Utility functions for shadcn/ui components.
 *
 * cn() merges Tailwind classes with proper conflict resolution.
 * This is the standard shadcn utility — same as every shadcn project.
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
