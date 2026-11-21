/**
 * Normalized site settings.
 *
 * `.works/works.yml` is written by the Ever Works platform (and by hand) in several historical shapes:
 * `settings.header.*`, `settings.homepage.*`, `settings.footer.*`, `custom_menu.{header,footer}` (platform) and
 * `custom_header` / `custom_footer` / `homepage.*` (older minimal-template docs). {@link resolveSiteSettings} folds all
 * of them into this one typed object with safe defaults, so pages never re-implement the fallbacks.
 */

/** Homepage layout. `classic` = sidebar + results (full template "home1"); `grid` = filter bar + results ("home2"). */
export type SiteLayout = 'classic' | 'grid';

/** Listing pagination style. */
export type SitePagination = 'standard' | 'infinite';

/** Color theme. `system` follows `prefers-color-scheme`. */
export type SiteTheme = 'light' | 'dark' | 'system';

/** Card view inside a listing. */
export type SiteView = 'grid' | 'list' | 'compact';

/** Listing sort order. `featured` = featured first, then name A–Z. */
export type SiteSort = 'featured' | 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc';

/** A navigation link after normalization (`path`/`href` and `target`/`external` unified). */
export interface ResolvedNavLink {
    /** Visible label */
    label: string;

    /** Absolute URL or site-relative path */
    href: string;

    /** True when the link should open in a new tab (explicit `_blank`/`external`, or an absolute http(s) URL) */
    external: boolean;
}

/** Social profile links shown in the footer. Every key is optional. */
export interface SiteSocialLinks {
    github?: string;
    x?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    discord?: string;
    website?: string;
    email?: string;
}

/** The fully resolved, typed site settings used by the minimal template's pages and components. */
export interface ResolvedSiteSettings {
    header: {
        /** Show the "Submit" button and build the `/submit` page */
        submitEnabled: boolean;
        /** Show the display-settings menu (layout, width, pagination, view) */
        layoutEnabled: boolean;
        /** Show the light/dark toggle in the header */
        themeEnabled: boolean;
        /** Show the search button (opens the search dialog) */
        searchEnabled: boolean;
        /** Default homepage layout before the visitor chooses one */
        layoutDefault: SiteLayout;
        /** Default pagination style before the visitor chooses one */
        paginationDefault: SitePagination;
        /** Default theme before the visitor chooses one */
        themeDefault: SiteTheme;
    };
    homepage: {
        /** Show the hero block */
        heroEnabled: boolean;
        /** Show search inputs (hero + listing toolbar) */
        searchEnabled: boolean;
        /** Default card view */
        defaultView: SiteView;
        /** Default sort order */
        defaultSort: SiteSort;
        /** Hero title override */
        heroTitle?: string;
        /** Hero description override */
        heroDescription?: string;
    };
    footer: {
        /** Show the Light/Dark/System selector */
        themeSelectorEnabled: boolean;
        /** Show `version` in the footer */
        versionEnabled: boolean;
        /** Newsletter form action URL (only set when `subscribe_enabled` is on AND a URL is configured) */
        newsletterUrl?: string;
    };
    /** Section toggles (a section is also hidden when it has no content) */
    sections: {
        categories: boolean;
        tags: boolean;
        collections: boolean;
        comparisons: boolean;
        featured: boolean;
    };
    /** Extra navigation links from config */
    nav: {
        header: ResolvedNavLink[];
        footer: ResolvedNavLink[];
    };
    /** Submission targets from the `submit` config block */
    submit: {
        /** External submission form URL (takes precedence over the GitHub flow) */
        url?: string;
        /** Email address for mailto submissions */
        email?: string;
        /** Whether the GitHub pull-request / issue flow may be offered (default true) */
        github: boolean;
    };
    /** Footer social links */
    social: SiteSocialLinks;
    /** Items per listing page */
    itemsPerPage: number;
    /** Site version (`version` key) */
    version?: string;
    /** Explicit site description (`description` / `tagline`), if any */
    description?: string;
}
