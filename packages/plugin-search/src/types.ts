/** Configuration options for the search plugin */
export interface SearchPluginOptions {
    /** Pagefind bundle path (default: '/pagefind') */
    bundlePath?: string;
    /** Additional fields to index (default: ['name', 'description']) */
    indexFields?: string[];
    /** Language for stemming (default: 'en') */
    language?: string;
}

/** Resolved search configuration with all defaults applied */
export interface ResolvedSearchConfig {
    /** Pagefind bundle path */
    bundlePath: string;
    /** Fields to index */
    indexFields: string[];
    /** Language for stemming */
    language: string;
}
