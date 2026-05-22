/// <reference types="astro/client" />

/**
 * Environment variable type declarations.
 * See .env.example for descriptions of each variable.
 */
interface ImportMetaEnv {
    /** URL of the Git data repository */
    readonly DATA_REPOSITORY?: string;

    /** GitHub Personal Access Token for private repos */
    readonly GH_TOKEN?: string;

    /** Local path to content directory (dev override) */
    readonly CONTENT_PATH?: string;

    /** Deployed site URL for sitemap/canonical */
    readonly SITE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
