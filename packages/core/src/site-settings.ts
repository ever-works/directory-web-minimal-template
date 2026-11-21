/**
 * Site settings resolver — turns the loosely typed `.works/works.yml` into {@link ResolvedSiteSettings}.
 *
 * Pure and synchronous: safe to call from any page, endpoint, or plugin. Unknown or malformed values fall back to
 * defaults instead of throwing, because data repositories are edited by hand and by AI agents.
 */

import type { SiteConfig } from './types/config.js';
import type {
    ResolvedNavLink,
    ResolvedSiteSettings,
    SiteLayout,
    SitePagination,
    SiteSocialLinks,
    SiteSort,
    SiteTheme,
    SiteView
} from './types/site-settings.js';

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function bool(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
}

function text(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/** Only http(s), mailto and site-relative URLs are accepted from config (no `javascript:` etc.). */
function safeUrl(value: unknown): string | undefined {
    const url = text(value);
    if (!url) return undefined;
    // Site-relative only: reject protocol-relative `//host` and `/\host` (browsers treat `\` as `/`).
    if (url.startsWith('/')) return /^\/(?![\\/])/.test(url) ? url : undefined;
    return /^(https?:|mailto:)/i.test(url) ? url : undefined;
}

/**
 * Map the platform / full-template layout ids to the minimal template layouts.
 *
 * @param value - `settings.header.layout_default` (e.g. `home1`, `home2`, `classic`, `grid`)
 */
export function resolveLayout(value: unknown): SiteLayout {
    const key = text(value)?.toLowerCase();
    if (key === 'home2' || key === 'grid' || key === 'modern' || key === 'modern-grid') return 'grid';
    return 'classic';
}

/** Map `settings.header.pagination_default` to a pagination style. */
export function resolvePagination(value: unknown): SitePagination {
    const key = text(value)?.toLowerCase();
    return key === 'infinite' || key === 'infinite-scroll' || key === 'infinite_scroll' ? 'infinite' : 'standard';
}

/** Map `settings.header.theme_default` to a theme. Missing → `system`. */
export function resolveTheme(value: unknown): SiteTheme {
    const key = text(value)?.toLowerCase();
    if (key === 'light' || key === 'dark') return key;
    return 'system';
}

/** Map `settings.homepage.default_view` (full-template names included) to a card view. */
export function resolveView(value: unknown): SiteView {
    const key = text(value)?.toLowerCase();
    if (key === 'list') return 'list';
    if (key === 'compact') return 'compact';
    return 'grid';
}

/** Map `settings.homepage.default_sort` to a sort order. `popularity` has no static data, so it maps to `featured`. */
export function resolveSort(value: unknown): SiteSort {
    const key = text(value)?.toLowerCase();
    switch (key) {
        case 'name-asc':
        case 'name-desc':
        case 'date-desc':
        case 'date-asc':
            return key;
        case 'newest':
            return 'date-desc';
        case 'oldest':
            return 'date-asc';
        default:
            return 'featured';
    }
}

/**
 * Normalize one navigation entry. Accepts the platform shape `{ label, path, target }` and the legacy shape
 * `{ label, href, external }`. Returns `null` for entries without a label or a safe URL.
 */
export function resolveNavLink(value: unknown): ResolvedNavLink | null {
    const entry = record(value);
    const label = text(entry['label']) ?? text(entry['name']) ?? text(entry['title']);
    const href = safeUrl(entry['href']) ?? safeUrl(entry['path']) ?? safeUrl(entry['url']);
    if (!label || !href) return null;
    const explicit = entry['external'] === true || entry['target'] === '_blank';
    return { label, href, external: explicit || /^https?:/i.test(href) };
}

function navList(...sources: unknown[]): ResolvedNavLink[] {
    const links: ResolvedNavLink[] = [];
    const seen = new Set<string>();
    for (const source of sources) {
        if (!Array.isArray(source)) continue;
        for (const entry of source) {
            const link = resolveNavLink(entry);
            if (!link || seen.has(`${link.label}|${link.href}`)) continue;
            seen.add(`${link.label}|${link.href}`);
            links.push(link);
        }
    }
    return links;
}

const SOCIAL_KEYS: ReadonlyArray<keyof SiteSocialLinks> = [
    'github',
    'x',
    'linkedin',
    'facebook',
    'youtube',
    'discord',
    'website',
    'email'
];

function resolveSocial(value: unknown): SiteSocialLinks {
    const source = record(value);
    const social: SiteSocialLinks = {};
    for (const key of SOCIAL_KEYS) {
        const raw = key === 'x' ? (source['x'] ?? source['twitter']) : source[key];
        if (key === 'email') {
            const email = text(raw);
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.replace(/^mailto:/i, ''))) {
                social.email = email.replace(/^mailto:/i, '');
            }
            continue;
        }
        const url = safeUrl(raw);
        if (url && /^https?:/i.test(url)) social[key] = url;
    }
    return social;
}

/**
 * Resolve `.works/works.yml` into typed, defaulted site settings.
 *
 * @param config - The loaded site configuration
 * @returns Normalized settings (never throws)
 *
 * @example
 * ```typescript
 * const settings = resolveSiteSettings(config);
 * if (settings.header.submitEnabled) { ... }
 * ```
 */
export function resolveSiteSettings(config: SiteConfig): ResolvedSiteSettings {
    const settings = record(config.settings);
    const header = record(settings['header']);
    const homepageSettings = record(settings['homepage']);
    const legacyHomepage = record(config.homepage);
    const footer = record(settings['footer']);
    const customMenu = record(config['custom_menu']);
    const submit = record(config['submit']);
    const pagination = record(config.pagination);

    const perPageRaw = pagination['itemsPerPage'] ?? pagination['items_per_page'];
    const itemsPerPage =
        typeof perPageRaw === 'number' && Number.isFinite(perPageRaw) && perPageRaw >= 1 && perPageRaw <= 200
            ? Math.floor(perPageRaw)
            : 12;

    const newsletterUrl = safeUrl(footer['newsletter_url'] ?? config['newsletter_url']);
    const submitEmail = text(submit['email'])?.replace(/^mailto:/i, '');

    return {
        header: {
            submitEnabled: bool(header['submit_enabled'], true),
            layoutEnabled: bool(header['layout_enabled'], true),
            themeEnabled: bool(header['theme_enabled'], true),
            searchEnabled: bool(header['search_enabled'], true),
            layoutDefault: resolveLayout(header['layout_default']),
            paginationDefault: resolvePagination(header['pagination_default'] ?? pagination['type']),
            themeDefault: resolveTheme(header['theme_default'])
        },
        homepage: {
            heroEnabled: bool(homepageSettings['hero_enabled'], true),
            searchEnabled: bool(homepageSettings['search_enabled'] ?? legacyHomepage['search_enabled'], true),
            defaultView: resolveView(homepageSettings['default_view'] ?? legacyHomepage['default_view']),
            defaultSort: resolveSort(homepageSettings['default_sort'] ?? legacyHomepage['default_sort']),
            heroTitle: text(homepageSettings['hero_title']) ?? text(legacyHomepage['hero_title']),
            heroDescription: text(homepageSettings['hero_description']) ?? text(legacyHomepage['hero_description'])
        },
        footer: {
            themeSelectorEnabled: bool(footer['theme_selector_enabled'], true),
            versionEnabled: bool(footer['version_enabled'], true),
            ...(bool(footer['subscribe_enabled'], false) && newsletterUrl ? { newsletterUrl } : {})
        },
        sections: {
            categories: bool(settings['categories_enabled'], true),
            tags: bool(settings['tags_enabled'], true),
            collections: bool(settings['collections_enabled'], true),
            comparisons: bool(settings['comparisons_enabled'], true),
            featured: bool(settings['featured_enabled'], true)
        },
        nav: {
            header: navList(customMenu['header'], config.custom_header),
            footer: navList(customMenu['footer'], config.custom_footer)
        },
        submit: {
            ...(safeUrl(submit['url']) ? { url: safeUrl(submit['url']) } : {}),
            ...(submitEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitEmail) ? { email: submitEmail } : {}),
            github: bool(submit['github'], true)
        },
        social: resolveSocial(config['social']),
        itemsPerPage,
        version: text(config['version']) ?? (typeof config['version'] === 'number' ? String(config['version']) : undefined),
        description: text(config['description']) ?? text(config['tagline'])
    };
}
