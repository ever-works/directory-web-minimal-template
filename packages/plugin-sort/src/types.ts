/** Available sort fields */
export type SortField = 'name' | 'updated_at' | 'featured';

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Configuration options for the sort plugin */
export interface SortPluginOptions {
    /** Default sort field (default: 'name') */
    defaultSort?: SortField;
    /** Default sort direction (default: 'asc') */
    defaultDirection?: SortDirection;
    /** Available sort options to expose in UI (default: all) */
    sortOptions?: SortField[];
}

/** Resolved sort configuration (all fields required) */
export interface ResolvedSortConfig {
    defaultSort: SortField;
    defaultDirection: SortDirection;
    sortOptions: SortField[];
}
