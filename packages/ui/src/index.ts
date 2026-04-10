/**
 * @ever-works/ui
 *
 * Headless, unstyled UI components for the Ever Works minimal directory template.
 * Astro components for static rendering, Preact components for interactive islands.
 *
 * ## Usage
 *
 * Import Astro components directly:
 * ```astro
 * ---
 * import ItemCard from '@ever-works/ui/astro/ItemCard.astro';
 * import ItemGrid from '@ever-works/ui/astro/ItemGrid.astro';
 * ---
 * <ItemGrid items={items} />
 * ```
 *
 * Import Preact components for interactive islands:
 * ```astro
 * ---
 * import SearchInput from '@ever-works/ui/preact/SearchInput';
 * ---
 * <SearchInput client:load placeholder="Search..." />
 * ```
 */

// Re-export all component prop types for TypeScript consumers
export type * from './types.js';
