/** Configuration options for the filters plugin */
export interface FiltersPluginOptions {
    /** Which filter types to enable (default: all) */
    enabledFilters?: FilterType[];
    /** Whether to sync filter state with URL params (default: true) */
    urlSync?: boolean;
    /** URL parameter names */
    paramNames?: ParamNames;
}

export type FilterType = 'category' | 'tag' | 'search';

/** URL parameter name mapping */
export interface ParamNames {
    /** Category param name (default: 'category') */
    category?: string;
    /** Tag param name (default: 'tag') */
    tag?: string;
    /** Search param name (default: 'q') */
    search?: string;
}

/** Currently active filters */
export interface ActiveFilters {
    /** Selected category IDs (OR logic) */
    categories: string[];
    /** Selected tag IDs (OR logic) */
    tags: string[];
    /** Search query string */
    search: string;
}

/** Default parameter names */
export const DEFAULT_PARAM_NAMES: Required<ParamNames> = {
    category: 'category',
    tag: 'tag',
    search: 'q',
};
