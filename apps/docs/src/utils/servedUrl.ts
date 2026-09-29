/*
 * Every URL this docs build hands to crawlers - canonical, og:url, hreflang (src/theme/SiteMetadata)
 * and the structured data (BreadcrumbList, BlogPosting, Blog: the components under src/theme that
 * emit JSON-LD) - must be one the deployment answers with a 200, never with a redirect. Three
 * things stand in the way, and all are settled in docusaurus.config.ts and published through
 * customFields:
 *
 * - hasCanonicalOrigin: false when the build has no DOCS_URL. Such a build is noindex and must
 *   not name any host, so these components emit no canonical, hreflang or JSON-LD URLs at all.
 * - homeCanonicalPath: the page a deployment redirects its site root to (DOCS_HOME_CANONICAL_PATH),
 *   "/" when the root serves itself. The default locale's root is mapped to that page.
 * - trailingSlash: every page is served at /foo/ and the nginx in front of the build answers /foo
 *   with a 301 to /foo/. Docusaurus applies the slash to canonical, og:url, hreflang and sitemap
 *   URLs and to <Link>, but its structured data is built from raw permalinks that never carry it.
 *
 * The 404 page is not a page crawlers should be pointed at either: with trailingSlash its upstream
 * canonical, og:url and hreflang named /404.html/, which the nginx-static-serve fallback answers
 * with the home page (a 200 soft 404). It emits none of them.
 */
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';

type CustomFields = Record<string, unknown> | undefined;

function homeCanonicalPathOf(customFields: CustomFields): string {
    return typeof customFields?.homeCanonicalPath === 'string' ? customFields.homeCanonicalPath : '/';
}

// True unless docusaurus.config.ts says this build has no canonical origin (no DOCS_URL).
export function useHasCanonicalOrigin(): boolean {
    const {
        siteConfig: { customFields }
    } = useDocusaurusContext();
    return customFields?.hasCanonicalOrigin !== false;
}

// True while rendering the 404 page (404.html under the current locale's baseUrl).
export function useIsNotFoundPage(): boolean {
    const {
        siteConfig: { baseUrl }
    } = useDocusaurusContext();
    const { pathname } = useLocation();
    return pathname.replace(/\/+$/, '') === `${baseUrl}404.html`;
}

// True while rendering one of the pages docusaurus.config.ts lists as not documentation
// (customFields.noIndexPaths, paths relative to the current locale's baseUrl; one ending in "/**"
// covers that page and every page under it).
export function useIsNoIndexPage(): boolean {
    const {
        siteConfig: { baseUrl, customFields }
    } = useDocusaurusContext();
    const { pathname } = useLocation();
    const noIndexPaths = Array.isArray(customFields?.noIndexPaths) ? (customFields.noIndexPaths as unknown[]) : [];
    const current = `${pathname.replace(/\/+$/, '')}/`;
    return noIndexPaths.some((noIndexPath) => {
        if (typeof noIndexPath !== 'string') {
            return false;
        }
        const target = `${baseUrl}${noIndexPath.replace(/^\/+/, '')}`;
        return target.endsWith('/**') ? current.startsWith(target.slice(0, -2)) : current === target;
    });
}

// The site-relative path of the home page as the deployment serves it: the current locale's
// root, or - when the deployment redirects its root - the page it redirects to.
export function useHomePath(): string {
    const {
        siteConfig: { baseUrl, customFields }
    } = useDocusaurusContext();
    return `${baseUrl}${homeCanonicalPathOf(customFields).replace(/^\/+/, '')}`;
}

// Maps the default locale's root URL (fully qualified) to the served home page URL; every other
// URL passes through unchanged.
export function useServedUrl(): (url: string) => string {
    const {
        siteConfig: { customFields },
        i18n: { defaultLocale, localeConfigs }
    } = useDocusaurusContext();
    const { url, baseUrl } = localeConfigs[defaultLocale]!;
    const rootUrl = `${url}${baseUrl}`;
    const homeUrl = `${rootUrl}${homeCanonicalPathOf(customFields).replace(/^\/+/, '')}`;
    return (candidate) => (candidate === rootUrl ? homeUrl : candidate);
}

// Maps a site-relative href ("/architecture/overview", as sidebars and permalinks carry it) to
// the path the deployment serves: the trailing slash applied the way Docusaurus's own <Link>
// applies `trailingSlash`, and the default locale's root mapped to the served home page. Hrefs
// that are not site-relative (external, protocol-relative, hash-only) and links to files (a last
// segment with an extension, such as /img/logo.png) pass through unchanged.
export function useServedHref(): (href: string) => string {
    const {
        siteConfig: { customFields, trailingSlash },
        i18n: { defaultLocale, localeConfigs }
    } = useDocusaurusContext();
    const { baseUrl: rootPath } = localeConfigs[defaultLocale]!;
    const homePath = `${rootPath}${homeCanonicalPathOf(customFields).replace(/^\/+/, '')}`;
    return (href) => {
        if (!href.startsWith('/') || href.startsWith('//')) {
            return href;
        }
        const [pathname = href] = href.split(/[#?]/);
        const rest = href.slice(pathname.length);
        if (pathname === rootPath || pathname === rootPath.replace(/\/+$/, '')) {
            return `${homePath}${rest}`;
        }
        if (/\.[A-Za-z0-9]{1,5}$/.test(pathname.split('/').pop() ?? '')) {
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

// Maps a link to the default locale's root ("/", "/#section") to the served home page and leaves
// every other href exactly as written - for links whose other hrefs <Link> already handles, such
// as the ones in Markdown content.
export function useServedRootHref(): (href: string | undefined) => string | undefined {
    const {
        siteConfig: { customFields },
        i18n: { defaultLocale, localeConfigs }
    } = useDocusaurusContext();
    const { baseUrl: rootPath } = localeConfigs[defaultLocale]!;
    const homePath = `${rootPath}${homeCanonicalPathOf(customFields).replace(/^\/+/, '')}`;
    return (href) => {
        if (href === undefined || homePath === rootPath) {
            return href;
        }
        const [pathname = href] = href.split(/[#?]/);
        return pathname === rootPath ? `${homePath}${href.slice(pathname.length)}` : href;
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
