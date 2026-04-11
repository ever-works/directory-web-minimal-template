/**
 * Component prop type definitions.
 * All headless UI components expose these interfaces for type-safe usage.
 *
 * See docs/specs/component-catalog.md for the full catalog.
 */

import type { ItemData, CategoryData, CategoryWithCount, TagData, TagWithCount, CollectionData, ComparisonData, SiteConfig } from '@ever-works/core';

// ─── Base Props ──────────────────────────────────────────────

/** Base props accepted by all components */
export interface BaseComponentProps {
    /** HTML class attribute for custom styling */
    class?: string;
    /** Data attributes for styling hooks */
    [key: `data-${string}`]: string | undefined;
}

// ─── Item Components ─────────────────────────────────────────

export interface ItemCardProps extends BaseComponentProps {
    item: ItemData;
    showCategory?: boolean;
    showTags?: boolean;
    showDescription?: boolean;
}

export interface ItemGridProps extends BaseComponentProps {
    items: ItemData[];
    columns?: 2 | 3 | 4;
}

export interface ItemListProps extends BaseComponentProps {
    items: ItemData[];
}

export interface ItemDetailProps extends BaseComponentProps {
    item: ItemData;
    relatedItems?: ItemData[];
}

// ─── Category Components ─────────────────────────────────────

export interface CategoryListProps extends BaseComponentProps {
    categories: CategoryWithCount[];
    showCounts?: boolean;
}

export interface CategoryBadgeProps extends BaseComponentProps {
    category: CategoryData;
    count?: number;
    href?: string;
}

// ─── Tag Components ──────────────────────────────────────────

export interface TagListProps extends BaseComponentProps {
    tags: TagWithCount[];
    showCounts?: boolean;
}

export interface TagBadgeProps extends BaseComponentProps {
    tag: TagData;
    count?: number;
    href?: string;
}

// ─── Collection Components ───────────────────────────────────

export interface CollectionCardProps extends BaseComponentProps {
    collection: CollectionData;
    itemCount?: number;
}

// ─── Navigation Components ───────────────────────────────────

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbsProps extends BaseComponentProps {
    items: BreadcrumbItem[];
    separator?: string;
}

export interface PaginationProps extends BaseComponentProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    maxVisible?: number;
}

// ─── Layout Components ───────────────────────────────────────

export interface NavItem {
    label: string;
    href: string;
    isActive?: boolean;
}

export interface SiteHeaderProps extends BaseComponentProps {
    config: SiteConfig;
    nav?: NavItem[];
}

export interface SiteFooterProps extends BaseComponentProps {
    config: SiteConfig;
}

export interface HeroProps extends BaseComponentProps {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
}

export interface EmptyStateProps extends BaseComponentProps {
    message: string;
    suggestion?: string;
}

// ─── Comparison Components ───────────────────────────────────

export interface ComparisonTableProps extends BaseComponentProps {
    comparison: ComparisonData;
    showScores?: boolean;
}

// ─── Featured Components ─────────────────────────────────────

export interface FeaturedBadgeProps extends BaseComponentProps {
    /** Label text for the badge */
    label?: string;
}

export interface FeaturedSectionProps extends BaseComponentProps {
    /** Items to display (already filtered to featured=true) */
    items: ItemData[];
    /** Section heading */
    heading?: string;
    /** Maximum items to show */
    limit?: number;
}

// ─── Item Detail Sub-components ──────────────────────────────

export interface ItemContentProps extends BaseComponentProps {
    /** HTML content to render (pre-processed markdown) */
    content: string;
}

export interface ItemMetadataProps extends BaseComponentProps {
    item: ItemData;
}

export interface ItemCTAProps extends BaseComponentProps {
    /** URL to link to */
    href: string;
    /** Button text */
    label?: string;
}

export interface ShareButtonProps extends BaseComponentProps {
    /** URL to share */
    url: string;
    /** Title for sharing */
    title: string;
}

export interface SimilarItemsProps extends BaseComponentProps {
    items: ItemData[];
    heading?: string;
}

// ─── Interactive Components (Preact) ─────────────────────────

export type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'featured';

export interface SearchInputProps {
    placeholder?: string;
    debounceMs?: number;
    onSearch?: (query: string) => void;
    class?: string;
}

export interface FilterBarProps {
    categories?: CategoryData[];
    tags?: TagData[];
    selectedCategory?: string;
    selectedTags?: string[];
    onCategoryChange?: (category: string | null) => void;
    onTagsChange?: (tags: string[]) => void;
    class?: string;
}

export interface SortSelectProps {
    options?: SortOption[];
    selected?: SortOption;
    onChange?: (sort: SortOption) => void;
    class?: string;
}

export interface BackToTopProps {
    showAfterPx?: number;
    class?: string;
}

export interface ThemeToggleProps {
    class?: string;
}
