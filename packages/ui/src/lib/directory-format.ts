/**
 * Formatting helpers shared by the server-rendered directory components (Astro) and their vanilla client scripts,
 * so a card rendered at build time and a card rendered in the browser after filtering are identical.
 *
 * Dependency-free; safe in the browser.
 */

/**
 * Escape text for safe insertion into HTML (text nodes and double-quoted attributes).
 *
 * @param value - Untrusted text
 */
export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Hostname of a URL without `www.`, or `null` for invalid / non-http(s) URLs.
 *
 * @param url - Absolute URL
 */
export function hostOf(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
        return parsed.hostname.replace(/^www\./, '') || null;
    } catch {
        return null;
    }
}

/**
 * Favicon URL for a website, used when an item has no logo. Uses DuckDuckGo's icon service (no cookies, returns 404
 * for unknown sites so the monogram fallback shows instead of a generic globe).
 *
 * @param website - Item website URL
 */
export function faviconUrl(website: string | null | undefined): string | null {
    const host = hostOf(website);
    return host ? `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico` : null;
}

/**
 * First letter (or digit) of a name, upper-cased, for monogram fallbacks.
 *
 * @param name - Display name
 */
export function initialOf(name: string): string {
    const match = name.trim().match(/[\p{L}\p{N}]/u);
    return match ? match[0].toUpperCase() : '•';
}

/**
 * Logo sources in fallback order: explicit logo, then the website favicon. Duplicates removed.
 *
 * @param logo - `icon_url` / `brand_logo_url`
 * @param website - `source_url`
 * @returns `[primary, fallback]` (either may be undefined)
 */
export function logoSources(
    logo: string | null | undefined,
    website: string | null | undefined
): [string | undefined, string | undefined] {
    const safeLogo = logo && /^(https?:)?\/\//i.test(logo) ? logo : logo && logo.startsWith('/') ? logo : undefined;
    const favicon = faviconUrl(website) ?? undefined;
    if (safeLogo) return [safeLogo, favicon && favicon !== safeLogo ? favicon : undefined];
    return [favicon, undefined];
}

/**
 * Inline `onerror` handler for logo images: try `data-fallback` once, then remove the image so the monogram shows.
 * Inline (not a module listener) because image errors can fire before deferred scripts run.
 */
export const LOGO_ONERROR =
    "var f=this.getAttribute('data-fallback');if(f){this.removeAttribute('data-fallback');this.src=f}else{this.remove()}";

/**
 * Format `YYYY-MM-DD[ HH:mm]` as a short, locale-independent date like `Nov 20, 2026`.
 *
 * @param value - Date string from item data
 */
export function formatShortDate(value: string | null | undefined): string | null {
    if (!value) return null;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[Number(match[2]) - 1];
    return month ? `${month} ${Number(match[3])}, ${match[1]}` : null;
}

/** Truncate text to `max` characters on a word boundary, with an ellipsis. */
export function truncateText(value: string, max: number): string {
    const clean = value.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max - 1);
    const space = cut.lastIndexOf(' ');
    return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** Data a directory card needs (both renderers). */
export interface DirectoryCardData {
    slug: string;
    name: string;
    description: string;
    logo?: string | null;
    website?: string | null;
    featured?: boolean;
    categories: Array<{ id: string; name: string }>;
    tags: Array<{ id: string; name: string }>;
    updated?: string | null;
}

/** Max tags shown on a card. */
export const CARD_TAG_LIMIT = 3;

/**
 * Render a directory card to an HTML string. Used by the browser after filtering; the Astro `DirectoryCard`
 * component renders the same markup at build time. Keep both in sync (same classes and data hooks).
 *
 * @param item - Card data
 * @param itemPath - Item URL builder (default `/item/<slug>`)
 */
export function renderDirectoryCard(item: DirectoryCardData, itemPath = (slug: string) => `/item/${slug}`): string {
    const [logo, fallback] = logoSources(item.logo, item.website);
    const host = hostOf(item.website);
    const date = formatShortDate(item.updated);
    const img = logo
        ? `<img src="${escapeHtml(logo)}"${fallback ? ` data-fallback="${escapeHtml(fallback)}"` : ''} alt="" width="40" height="40" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="${escapeHtml(LOGO_ONERROR)}">`
        : '';
    const categories = item.categories
        .map(
            (c) =>
                `<a href="/category/${encodeURIComponent(c.id)}" data-part="category" class="dw-chip dw-chip-category">${escapeHtml(c.name)}</a>`
        )
        .join('');
    const tags = item.tags
        .slice(0, CARD_TAG_LIMIT)
        .map(
            (t) =>
                `<a href="/tag/${encodeURIComponent(t.id)}" data-part="tag" class="dw-chip dw-chip-tag">#${escapeHtml(t.name)}</a>`
        )
        .join('');
    return (
        `<article data-component="item-card" class="dw-card"${item.featured ? ' data-featured=""' : ''} data-slug="${escapeHtml(item.slug)}">` +
        `<div data-part="header" class="dw-card-header">` +
        `<span data-part="icon" class="dw-logo" data-initial="${escapeHtml(initialOf(item.name))}">${img}</span>` +
        `<div class="dw-card-heading">` +
        `<h3 data-part="title" class="dw-card-title"><a href="${escapeHtml(itemPath(item.slug))}" data-part="name" class="dw-card-link">${escapeHtml(item.name)}</a></h3>` +
        (host ? `<p data-part="host" class="dw-card-host">${escapeHtml(host)}</p>` : '') +
        `</div>` +
        (item.featured ? `<span data-part="featured-badge" class="dw-badge-featured">Featured</span>` : '') +
        `</div>` +
        (item.description ? `<p data-part="description" class="dw-card-description">${escapeHtml(item.description)}</p>` : '') +
        (categories || tags ? `<div data-part="taxonomy" class="dw-card-taxonomy">${categories}${tags}</div>` : '') +
        `<div data-part="footer" class="dw-card-footer">` +
        (date ? `<span data-part="updated">${escapeHtml(date)}</span>` : '<span></span>') +
        (item.website
            ? `<a href="${escapeHtml(item.website)}" data-part="source-link" class="dw-card-visit" target="_blank" rel="noopener nofollow">Visit<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg><span class="sr-only"> ${escapeHtml(item.name)} website (opens in a new tab)</span></a>`
            : '') +
        `</div>` +
        `</article>`
    );
}
