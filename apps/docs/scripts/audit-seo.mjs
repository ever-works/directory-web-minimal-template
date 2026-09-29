#!/usr/bin/env node
/*
 * SEO audit of a BUILT docs site (apps/docs/build), run after `docusaurus build` with the SAME
 * environment the build had:
 *
 *   DOCS_URL=https://docs.example.com DOCS_HOME_CANONICAL_PATH=/getting-started/ \
 *     pnpm --filter @ever-works/docs-minimal audit:seo [buildDir]
 *
 * It reads the emitted HTML the way a crawler meets it behind the nginx that serves the build
 * (/foo/ -> foo/index.html, a slash-less directory URL -> 301, a file -> 200, anything else -> a
 * 404, or a soft 404 where the server falls back to index.html) and fails (exit 1) on any of:
 *
 * With DOCS_URL (an indexable build):
 * - a canonical, og:url, hreflang, og:image or JSON-LD URL, or a sitemap <loc>, that is not
 *   answered with a 200 directly: a slash-less URL (301), the site root when the deployment
 *   redirects it (DOCS_HOME_CANONICAL_PATH is not "/"), another host, or no file at all;
 * - a page whose canonical is missing, not its own served URL (the root: the home path), or
 *   whose og:url differs from it; a sitemap <loc> whose page does not name it as canonical;
 * - a page in docusaurus.config.ts NOINDEX_PATHS (passed as --noindex) that is not noindex or is
 *   in the sitemap, or any other page that is noindex;
 * - robots.txt not naming <DOCS_URL>/sitemap.xml.
 * Without DOCS_URL (a noindex build: Work repos, dev/stage images, Docs CI):
 * - a page that is not noindex, any canonical, og:url, hreflang, og:image or JSON-LD, a
 *   sitemap.xml, or a Sitemap line in robots.txt; any file naming the placeholder host.
 * Either way:
 * - an internal link (<a href>) to a URL the deployment answers with a 404 or a redirect;
 * - a page (other than 404.html) without exactly one <h1>;
 * - a meta description that is just a heading word ("Overview").
 *
 * The external links (other hosts) are listed with their counts, not fetched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (name) => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args.splice(index, 2)[1];
};
const noIndexArg = flag('--noindex');
const jsonOut = flag('--json');
const here = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(args[0] || path.join(here, '..', 'build'));
const DOCS_URL = (process.env.DOCS_URL || '').trim().replace(/\/+$/, '');
const HOME_PATH = (() => {
    const raw = (process.env.DOCS_HOME_CANONICAL_PATH || '').trim();
    return raw === '' || raw === '/' ? '/' : `/${raw.replace(/^\/+|\/+$/g, '')}/`;
})();
// Keep the default in step with NOINDEX_PATHS in docusaurus.config.ts.
const NOINDEX_PATHS = (noIndexArg ?? '/search/,/markdown-page/,/users/,/blog/archive/,/blog/authors/,/blog/tags/**')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
// A NOINDEX_PATHS entry ending in "/**" covers that page and every page under it.
const isNoIndexPathOf = (page) =>
    NOINDEX_PATHS.some((p) => (p.endsWith('/**') ? page.startsWith(p.slice(0, -2)) : page === p));
const PLACEHOLDER_HOST = 'docs.example.invalid';
const ORIGIN = DOCS_URL || `https://${PLACEHOLDER_HOST}`;
const INDEXABLE = DOCS_URL !== '';

if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
    console.error(`No built site at ${buildDir} (index.html missing).`);
    process.exit(2);
}

// ---- the files nginx serves --------------------------------------------------------------
function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}
const files = walk(buildDir);
const fileSet = new Set(files.map((f) => path.relative(buildDir, f).split(path.sep).join('/')));
const htmlFiles = files.filter((f) => f.endsWith('.html'));

// The status nginx answers a site path with (apps/docs/nginx.conf).
function statusOf(pathname) {
    let p;
    try {
        p = decodeURIComponent(pathname);
    } catch {
        p = pathname;
    }
    if (p === '/') return HOME_PATH === '/' ? (fileSet.has('index.html') ? 200 : 404) : 302;
    const rel = p.replace(/^\/+/, '');
    if (rel === '404.html') return 404; // internal
    if (p.endsWith('/')) return fileSet.has(`${rel}index.html`) ? 200 : 404;
    if (fileSet.has(rel)) return 200;
    if (fileSet.has(`${rel}/index.html`)) return 301;
    if (fileSet.has(`${rel}.html`)) return 200;
    return 404;
}
// Status of an absolute URL: another host is "external".
function urlStatus(url) {
    let u;
    try {
        u = new URL(url);
    } catch {
        return 'invalid';
    }
    if (u.origin !== ORIGIN) return 'external';
    return statusOf(u.pathname);
}
function pagePathOf(file) {
    const rel = path.relative(buildDir, file).split(path.sep).join('/');
    if (rel === 'index.html') return '/';
    if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
    return `/${rel}`;
}

// ---- tiny HTML helpers (the build output is machine-written and regular) --------------------
const decode = (s) =>
    s
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
const attr = (tag, name) => {
    const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
    return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : undefined;
};
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];

// ---- audit ---------------------------------------------------------------------------------
const problems = {};
const add = (kind, detail) => {
    (problems[kind] ||= []).push(detail);
};
const external = new Map();
const canonicalOf = new Map();
let pagesWithLinks = 0;
let internalLinks = 0;

for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const page = pagePathOf(file);
    const isNotFound = page === '/404.html';
    const pageUrl = `${ORIGIN}${page}`;
    const head = html.slice(0, html.indexOf('</head>') + 1 || undefined);

    const links = tags(head, 'link');
    const metas = tags(head, 'meta');
    const canonicals = links.filter((t) => /\brel=["']?canonical\b/i.test(t)).map((t) => attr(t, 'href'));
    const hreflangs = links.filter((t) => /\bhreflang=/i.test(t)).map((t) => attr(t, 'href'));
    const metaContent = (key, value) =>
        metas.filter((t) => (attr(t, key) || '').toLowerCase() === value).map((t) => attr(t, 'content') || '');
    const ogUrl = metaContent('property', 'og:url');
    const images = [...metaContent('property', 'og:image'), ...metaContent('name', 'twitter:image')];
    const robots = metaContent('name', 'robots').join(',').toLowerCase();
    const noindex = robots.includes('noindex');
    const descriptions = metaContent('name', 'description');
    const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
        (m) => m[1]
    );
    const jsonLdUrls = [];
    for (const block of jsonLd) {
        const walkJson = (value) => {
            if (typeof value === 'string') {
                if (/^https?:\/\//.test(value)) jsonLdUrls.push(value);
            } else if (value && typeof value === 'object') {
                Object.values(value).forEach(walkJson);
            }
        };
        try {
            walkJson(JSON.parse(block));
        } catch {
            add('json-ld-unparseable', page);
        }
    }

    if (html.includes(PLACEHOLDER_HOST)) add('names-placeholder-host', page);

    if (INDEXABLE) {
        const isNoIndexPath = isNoIndexPathOf(page);
        if (isNotFound) {
            if (canonicals.length || ogUrl.length || hreflangs.length) add('404-names-a-url', page);
        } else {
            const expected = page === '/' ? `${ORIGIN}${HOME_PATH}` : pageUrl;
            if (canonicals.length !== 1) add('canonical-count', `${page} ${canonicals.length}`);
            else {
                canonicalOf.set(page, canonicals[0]);
                if (canonicals[0] !== expected) add('canonical-not-self', `${page} -> ${canonicals[0]}`);
            }
            if (ogUrl.length !== 1 || ogUrl[0] !== canonicals[0])
                add('og-url-not-canonical', `${page} ${ogUrl.join(' ')}`);
            if (isNoIndexPath && !noindex) add('noindex-path-indexable', page);
            if (!isNoIndexPath && noindex) add('page-noindex', page);
        }
        for (const [kind, urls] of [
            ['canonical', canonicals],
            ['og:url', ogUrl],
            ['hreflang', hreflangs],
            ['og:image', images],
            ['json-ld', jsonLdUrls]
        ]) {
            for (const url of urls) {
                const status = urlStatus(url);
                if (status !== 200 && !(kind === 'json-ld' && status === 'external')) {
                    add(`${kind}-not-200`, `${page} ${url} ${status}`);
                }
            }
        }
    } else {
        if (!noindex) add('indexable-without-docs-url', page);
        if (canonicals.length) add('canonical-without-docs-url', page);
        if (ogUrl.length) add('og-url-without-docs-url', page);
        if (hreflangs.length) add('hreflang-without-docs-url', page);
        if (images.length) add('og-image-without-docs-url', page);
        if (jsonLd.length) add('json-ld-without-docs-url', page);
    }

    if (!isNotFound) {
        const h1 = (html.match(/<h1\b/gi) || []).length;
        if (h1 !== 1) add('h1-count', `${page} ${h1}`);
        for (const d of descriptions) if (/^(overview|introduction)$/i.test(d.trim())) add('heading-description', page);
    }

    // Internal links as the deployment answers them.
    let pageHasLink = false;
    for (const a of tags(html, 'a')) {
        const href = attr(a, 'href');
        if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
        let u;
        try {
            u = new URL(href, pageUrl);
        } catch {
            add('link-invalid', `${page} ${href}`);
            continue;
        }
        if (!/^https?:$/.test(u.protocol)) continue;
        if (u.origin !== ORIGIN) {
            const key = `${u.origin}${u.pathname}`;
            external.set(key, (external.get(key) || 0) + 1);
            continue;
        }
        internalLinks++;
        pageHasLink = true;
        const status = statusOf(u.pathname);
        if (status !== 200) add(`link-${status}`, `${page} ${u.pathname}`);
    }
    if (pageHasLink) pagesWithLinks++;
}

// ---- sitemap + robots.txt ---------------------------------------------------------------------
const sitemapFile = path.join(buildDir, 'sitemap.xml');
const locs = fs.existsSync(sitemapFile)
    ? [...fs.readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => decode(m[1]))
    : [];
if (INDEXABLE) {
    if (!fs.existsSync(sitemapFile)) add('sitemap-missing', 'sitemap.xml');
    for (const loc of locs) {
        const status = urlStatus(loc);
        if (status !== 200) {
            add('sitemap-loc-not-200', `${loc} ${status}`);
            continue;
        }
        const locPath = new URL(loc).pathname;
        if (canonicalOf.get(locPath) !== loc)
            add('sitemap-loc-not-canonical', `${loc} canonical=${canonicalOf.get(locPath)}`);
        if (isNoIndexPathOf(locPath)) add('sitemap-lists-noindex-page', loc);
    }
} else if (fs.existsSync(sitemapFile)) {
    add('sitemap-without-docs-url', 'sitemap.xml');
}
const robotsFile = path.join(buildDir, 'robots.txt');
const robots = fs.existsSync(robotsFile) ? fs.readFileSync(robotsFile, 'utf8') : '';
const sitemapLines = robots.split('\n').filter((l) => /^sitemap:/i.test(l.trim()));
if (INDEXABLE) {
    if (sitemapLines.length !== 1 || sitemapLines[0].replace(/^sitemap:\s*/i, '').trim() !== `${ORIGIN}/sitemap.xml`) {
        add('robots-sitemap-line', sitemapLines.join(' | ') || '(none)');
    }
} else if (sitemapLines.length) {
    add('robots-sitemap-without-docs-url', sitemapLines.join(' | '));
}
for (const file of files.filter((f) => /\.(xml|txt|json)$/.test(f))) {
    if (fs.readFileSync(file, 'utf8').includes(PLACEHOLDER_HOST))
        add('names-placeholder-host', path.relative(buildDir, file));
}

// ---- report -------------------------------------------------------------------------------------
const summary = {
    buildDir,
    mode: INDEXABLE ? `indexable (${ORIGIN}, home ${HOME_PATH})` : 'noindex (no DOCS_URL)',
    pages: htmlFiles.length,
    internalLinks,
    pagesWithLinks,
    sitemapLocs: locs.length,
    robotsTxt: robots.trim().split('\n'),
    problems: Object.fromEntries(Object.entries(problems).map(([k, v]) => [k, v.length])),
    examples: Object.fromEntries(Object.entries(problems).map(([k, v]) => [k, v.slice(0, 5)])),
    externalLinks: [...external.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)
};
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ ...summary, all: problems, external: [...external] }, null, 2));
console.log(JSON.stringify(summary, null, 2));
const failed = Object.keys(problems).length > 0;
console.log(failed ? `SEO AUDIT FAILED: ${Object.keys(problems).join(', ')}` : 'SEO AUDIT PASSED');
process.exit(failed ? 1 : 0);
