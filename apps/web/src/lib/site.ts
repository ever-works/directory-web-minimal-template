/**
 * Site context — everything pages need besides raw content, computed once per build:
 * normalized settings, absolute site URL, description, navigation, footer columns, card data, and the data
 * repository / submission targets.
 *
 * Pages call `await getSite()` instead of re-implementing fallbacks.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { firstMarkdownParagraph, resolveSiteSettings } from '@ever-works/core';
import type { ContentData, ItemData, ResolvedSiteSettings } from '@ever-works/core';
import { createTaxonomyIndex, itemCategoryRefs, itemLogo, itemTagRefs } from '@ever-works/agent-api';
import type { TaxonomyIndex } from '@ever-works/agent-api';
import type { DirectoryCardData } from '@ever-works/ui/lib/directory-format';
import { getContent } from './content';

/** A navigation / footer link. */
export interface SiteLink {
    label: string;
    href: string;
    external?: boolean;
}

/** Public GitHub data repository details (only when the repository is public). */
export interface DataRepositoryInfo {
    /** `https://github.com/<owner>/<repo>` */
    url: string;
    /** `<owner>/<repo>` */
    slug: string;
    branch: string;
}

/** The computed site context. */
export interface SiteContext {
    content: ContentData;
    settings: ResolvedSiteSettings;
    /** Absolute site URL without trailing slash */
    siteUrl: string;
    /** One-paragraph site description */
    description: string;
    /** Hero subtitle (works.yml override, else description) */
    heroSubtitle: string;
    nav: SiteLink[];
    footerColumns: Array<{ title: string; links: SiteLink[] }>;
    taxonomy: TaxonomyIndex;
    dataRepository: DataRepositoryInfo | null;
    /** Submit page / external form URL, or null when submissions are off or have no target */
    submitHref: string | null;
    /** Whether `/mcp` is served on this deployment */
    mcpEnabled: boolean;
    /** Card data for an item */
    card(item: ItemData): DirectoryCardData;
    /** Absolute URL for a site path */
    absolute(path: string): string;
}

const DEFAULT_SITE = 'https://example.com';

/** Resolve the absolute site URL: SITE_URL (Astro `site`) unless it is the placeholder, else `app_url`. */
function resolveSiteUrl(content: ContentData): string {
    const fromEnv = (import.meta.env.SITE ?? process.env['SITE_URL'] ?? '').replace(/\/+$/, '');
    const fromConfig = typeof content.config.app_url === 'string' ? content.config.app_url.replace(/\/+$/, '') : '';
    if (fromEnv && fromEnv !== DEFAULT_SITE) return fromEnv;
    return fromConfig || fromEnv || DEFAULT_SITE;
}

function parseGitHubRepository(raw: string | undefined): { owner: string; repo: string } | null {
    if (!raw) return null;
    const match = raw.trim().match(/^(?:https?:\/\/|git@)github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
    return match && match[1] && match[2] ? { owner: match[1], repo: match[2] } : null;
}

function branchFromHead(): string | null {
    const contentPath = process.env['CONTENT_PATH'] ? resolve(process.env['CONTENT_PATH']) : resolve(process.cwd(), '.content');
    try {
        const head = readFileSync(join(contentPath, '.git', 'HEAD'), 'utf8').trim();
        const match = head.match(/^ref: refs\/heads\/(.+)$/);
        return match?.[1] ?? null;
    } catch {
        return null;
    }
}

/**
 * Detect the public GitHub data repository from `DATA_REPOSITORY`. One GitHub API call per build (4s timeout,
 * `GH_TOKEN` or the workflow's `GITHUB_TOKEN` when available).
 *
 * Fails closed: the repository is treated as public only when GitHub answers `private: false`. A 401/403 (bad
 * token, rate limit), 404, 5xx, timeout or offline build all mean "no public links", so a private repository never
 * gets "Suggest an edit", pull-request or "Data on GitHub" links. `DATA_REPOSITORY_PUBLIC=true|false` overrides the
 * check (no API call).
 */
async function detectDataRepository(): Promise<DataRepositoryInfo | null> {
    const override = process.env['DATA_REPOSITORY_PUBLIC'];
    if (override === 'false') return null;
    const parsed = parseGitHubRepository(process.env['DATA_REPOSITORY']);
    if (!parsed) return null;
    const slug = `${parsed.owner}/${parsed.repo}`;
    let branch = process.env['DATA_REPOSITORY_BRANCH'] || branchFromHead() || 'main';
    if (override !== 'true') {
        try {
            const token = process.env['GH_TOKEN'] || process.env['GITHUB_TOKEN'];
            const response = await fetch(`https://api.github.com/repos/${slug}`, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'ever-works-minimal-template',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                signal: AbortSignal.timeout(4000)
            });
            if (!response.ok) return null;
            const repo = (await response.json()) as { private?: boolean; default_branch?: string };
            if (repo.private !== false) return null;
            if (!process.env['DATA_REPOSITORY_BRANCH'] && repo.default_branch) branch = repo.default_branch;
        } catch {
            return null;
        }
    }
    return { url: `https://github.com/${slug}`, slug, branch };
}

let cached: Promise<SiteContext> | null = null;
let cachedFor: ContentData | null = null;
let repositoryPromise: Promise<DataRepositoryInfo | null> | null = null;

async function build(content: ContentData): Promise<SiteContext> {
    const { config, categories, tags, collections, comparisons, pages } = content;
    const settings = resolveSiteSettings(config);
    const siteUrl = resolveSiteUrl(content);
    const absolute = (path: string) => `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const noun = config.items_name.toLowerCase();

    const description =
        settings.description ??
        settings.homepage.heroDescription ??
        firstMarkdownParagraph(content.blocks?.header) ??
        `A curated directory of ${content.items.length} ${content.items.length === 1 ? config.item_name.toLowerCase() : noun}, organized by category and tag.`;

    repositoryPromise ??= detectDataRepository();
    const dataRepository = await repositoryPromise;
    const submitTarget = settings.submit.url ?? (settings.submit.github && dataRepository ? '/submit' : settings.submit.email ? '/submit' : null);
    const submitHref = settings.header.submitEnabled && submitTarget ? (settings.submit.url ? settings.submit.url : '/submit') : null;

    const showCategories = settings.sections.categories && categories.some((c) => c.count > 0);
    const showTags = settings.sections.tags && tags.some((t) => t.count > 0);
    const showCollections = settings.sections.collections && collections.length > 0;
    const showComparisons = settings.sections.comparisons && comparisons.length > 0;

    const nav: SiteLink[] = [
        { label: 'Home', href: '/' },
        ...(showCategories ? [{ label: 'Categories', href: '/categories' }] : []),
        ...(showTags ? [{ label: 'Tags', href: '/tags' }] : []),
        ...(showCollections ? [{ label: 'Collections', href: '/collections' }] : []),
        ...(showComparisons ? [{ label: 'Comparisons', href: '/comparisons' }] : []),
        ...settings.nav.header
    ];

    const topCategories = [...categories]
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, 6);

    const footerColumns = [
        {
            title: 'Browse',
            links: [
                ...topCategories.map((c) => ({ label: c.name, href: `/category/${c.id}` })),
                ...(showCategories ? [{ label: 'All categories', href: '/categories' }] : [])
            ]
        },
        {
            title: 'Explore',
            links: [
                { label: `All ${noun}`, href: '/' },
                ...(showTags ? [{ label: 'Tags', href: '/tags' }] : []),
                ...(showCollections ? [{ label: 'Collections', href: '/collections' }] : []),
                ...(showComparisons ? [{ label: 'Comparisons', href: '/comparisons' }] : []),
                ...(submitHref ? [{ label: `Submit ${config.item_name.toLowerCase()}`, href: submitHref, external: /^https?:/.test(submitHref) }] : []),
                ...pages.map((page) => ({ label: page.title, href: `/pages/${page.slug}` })),
                ...settings.nav.footer
            ]
        },
        {
            title: 'For developers & AI',
            links: [
                { label: 'llms.txt', href: '/llms.txt' },
                { label: 'Data API (JSON)', href: '/data/directory.json' },
                { label: 'OpenAPI', href: '/data/openapi.json' },
                ...(isMcpEnabled() ? [{ label: 'MCP server', href: '/.well-known/mcp.json' }] : []),
                { label: 'RSS feed', href: '/rss.xml' },
                { label: 'Sitemap', href: '/sitemap-index.xml' },
                ...(dataRepository ? [{ label: 'Data on GitHub', href: dataRepository.url, external: true }] : []),
                ...(content.blocks?.footer ? [{ label: 'Legal & license', href: '/legal' }] : [])
            ]
        }
    ];

    const taxonomy = createTaxonomyIndex(categories, tags);
    const cardCache = new WeakMap<ItemData, DirectoryCardData>();
    const buildCard = (item: ItemData): DirectoryCardData => ({
        slug: item.slug,
        name: item.name,
        description: item.description ?? '',
        logo: itemLogo(item),
        website: typeof item.source_url === 'string' && /^https?:\/\//i.test(item.source_url) ? item.source_url : null,
        featured: item.featured === true,
        categories: itemCategoryRefs(item, taxonomy),
        tags: itemTagRefs(item, taxonomy),
        updated: typeof item.updated_at === 'string' ? item.updated_at : null
    });
    const card = (item: ItemData): DirectoryCardData => {
        let cached = cardCache.get(item);
        if (!cached) {
            cached = buildCard(item);
            cardCache.set(item, cached);
        }
        return cached;
    };

    return {
        content,
        settings,
        siteUrl,
        description,
        heroSubtitle: settings.homepage.heroDescription ?? description,
        nav,
        footerColumns,
        taxonomy,
        dataRepository,
        submitHref,
        mcpEnabled: isMcpEnabled(),
        card,
        absolute
    };
}

/**
 * Whether this deployment serves `/mcp`: Cloudflare deploys run the MCP Worker (`DEPLOY_TARGET=cloudflare`) and ISR
 * builds mount the on-demand endpoint. `MCP_ENABLED=true|false` overrides.
 */
export function isMcpEnabled(): boolean {
    const flag = process.env['MCP_ENABLED'];
    if (flag === 'true') return true;
    if (flag === 'false') return false;
    return process.env['DEPLOY_TARGET'] === 'cloudflare' || process.env['ENABLE_ISR'] !== 'false';
}

/** Get the site context (rebuilt only when the content cache hands out new content, e.g. after an ISR refresh). */
export async function getSite(): Promise<SiteContext> {
    const content = await getContent();
    if (!cached || cachedFor !== content) {
        cachedFor = content;
        cached = build(content);
    }
    return cached;
}

/** Trim text to a meta-description length on a word boundary. */
export function metaDescription(value: string, max = 158): string {
    const clean = value.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max - 1);
    const space = cut.lastIndexOf(' ');
    return `${(space > 100 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, '')}…`;
}
