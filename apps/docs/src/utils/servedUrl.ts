/*
 * Every URL this docs build hands to crawlers must be one the deployment answers with a 200, not
 * a redirect. With `trailingSlash: true` every page is served at /foo/ and the nginx in front of
 * the build answers /foo with a 301 to /foo/. Docusaurus applies the slash to canonical, og:url,
 * hreflang and sitemap URLs and to <Link>, but its structured data (BreadcrumbList, BlogPosting,
 * Blog) is built from raw permalinks that never carry it. These helpers map such URLs to the ones
 * the deployment serves; they are used by the components under src/theme that emit JSON-LD.
 */
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';

// Maps a site-relative href ("/architecture/overview", as sidebars and permalinks carry it) to
// the path the deployment serves: the trailing slash applied the way Docusaurus's own <Link>
// applies `trailingSlash`. The site root and hrefs that are not site-relative pass through.
export function useServedHref(): (href: string) => string {
    const {
        siteConfig: { baseUrl, trailingSlash }
    } = useDocusaurusContext();
    return (href) => {
        if (!href.startsWith('/')) {
            return href;
        }
        const [pathname = href] = href.split(/[#?]/);
        const rest = href.slice(pathname.length);
        if (pathname === baseUrl || pathname === '/') {
            return href;
        }
        if (trailingSlash === true && !pathname.endsWith('/')) {
            return `${pathname}/${rest}`;
        }
        if (trailingSlash === false && pathname.endsWith('/')) {
            return `${pathname.replace(/\/+$/, '')}${rest}`;
        }
        return href;
    };
}

// Returns a function that deep-copies structured data, mapping every absolute URL on this site
// that names a page (not a file such as /img/logo.png) to the URL the deployment serves.
export function useServedStructuredData(): <T>(data: T) => T {
    const {
        siteConfig: { url }
    } = useDocusaurusContext();
    const servedHref = useServedHref();
    const origin = url.replace(/\/+$/, '');
    const mapUrl = (value: string): string => {
        if (!value.startsWith(`${origin}/`)) {
            return value;
        }
        const href = value.slice(origin.length);
        const [pathname = href] = href.split(/[#?]/);
        const lastSegment = pathname.split('/').pop() ?? '';
        return /\.[A-Za-z0-9]{1,5}$/.test(lastSegment) ? value : `${origin}${servedHref(href)}`;
    };
    const map = (value: unknown): unknown => {
        if (typeof value === 'string') {
            return mapUrl(value);
        }
        if (Array.isArray(value)) {
            return value.map(map);
        }
        if (value && typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, map(item)]));
        }
        return value;
    };
    return <T>(data: T): T => map(data) as T;
}

// True while rendering the 404 page (404.html under the current baseUrl).
export function useIsNotFoundPage(): boolean {
    const {
        siteConfig: { baseUrl }
    } = useDocusaurusContext();
    const { pathname } = useLocation();
    return pathname.replace(/\/+$/, '') === `${baseUrl}404.html`;
}
