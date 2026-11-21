import { describe, it, expect } from 'vitest';
import {
    resolveSiteSettings,
    resolveLayout,
    resolvePagination,
    resolveTheme,
    resolveView,
    resolveSort,
    resolveNavLink
} from '../site-settings.js';
import type { SiteConfig } from '../types/index.js';

const base: SiteConfig = { company_name: 'Acme', item_name: 'Tool', items_name: 'Tools', copyright_year: 2026 };

describe('resolveSiteSettings', () => {
    it('applies safe defaults for a bare config', () => {
        const s = resolveSiteSettings(base);
        expect(s.header).toEqual({
            submitEnabled: true,
            layoutEnabled: true,
            themeEnabled: true,
            searchEnabled: true,
            layoutDefault: 'classic',
            paginationDefault: 'standard',
            themeDefault: 'system'
        });
        expect(s.homepage.heroEnabled).toBe(true);
        expect(s.homepage.defaultView).toBe('grid');
        expect(s.homepage.defaultSort).toBe('featured');
        expect(s.footer).toEqual({ themeSelectorEnabled: true, versionEnabled: true });
        expect(s.sections).toEqual({
            categories: true,
            tags: true,
            collections: true,
            comparisons: true,
            featured: true
        });
        expect(s.nav).toEqual({ header: [], footer: [] });
        expect(s.submit).toEqual({ github: true });
        expect(s.social).toEqual({});
        expect(s.itemsPerPage).toBe(12);
        expect(s.version).toBeUndefined();
    });

    it('reads the platform-written works.yml shape', () => {
        const s = resolveSiteSettings({
            ...base,
            version: '0.1.0',
            settings: {
                tags_enabled: false,
                header: {
                    submit_enabled: false,
                    layout_enabled: true,
                    theme_enabled: false,
                    layout_default: 'home2',
                    pagination_default: 'infinite',
                    theme_default: 'dark'
                },
                homepage: { hero_enabled: false, search_enabled: true, default_view: 'classic', default_sort: 'popularity' },
                footer: { subscribe_enabled: true, version_enabled: false, theme_selector_enabled: false }
            },
            pagination: { type: 'standard', itemsPerPage: 24 },
            custom_menu: {
                header: [{ label: 'Blog', path: 'https://blog.example.com', target: '_blank' }],
                footer: [{ label: 'About', path: '/pages/about' }]
            }
        });
        expect(s.header.submitEnabled).toBe(false);
        expect(s.header.themeEnabled).toBe(false);
        expect(s.header.layoutDefault).toBe('grid');
        expect(s.header.paginationDefault).toBe('infinite');
        expect(s.header.themeDefault).toBe('dark');
        expect(s.homepage.heroEnabled).toBe(false);
        expect(s.homepage.defaultView).toBe('grid');
        expect(s.homepage.defaultSort).toBe('featured');
        expect(s.footer.versionEnabled).toBe(false);
        expect(s.footer.themeSelectorEnabled).toBe(false);
        // subscribe_enabled without a newsletter_url never renders a dead form
        expect(s.footer.newsletterUrl).toBeUndefined();
        expect(s.sections.tags).toBe(false);
        expect(s.itemsPerPage).toBe(24);
        expect(s.version).toBe('0.1.0');
        expect(s.nav.header).toEqual([{ label: 'Blog', href: 'https://blog.example.com', external: true }]);
        expect(s.nav.footer).toEqual([{ label: 'About', href: '/pages/about', external: false }]);
    });

    it('merges legacy custom_header/custom_footer and de-duplicates', () => {
        const s = resolveSiteSettings({
            ...base,
            custom_menu: { header: [{ label: 'Docs', path: '/docs' }] },
            custom_header: [
                { label: 'Docs', href: '/docs' },
                { label: 'GitHub', href: 'https://github.com/acme', external: true }
            ],
            custom_footer: [{ label: 'Privacy', href: '/pages/privacy' }]
        });
        expect(s.nav.header.map((l) => l.label)).toEqual(['Docs', 'GitHub']);
        expect(s.nav.footer).toEqual([{ label: 'Privacy', href: '/pages/privacy', external: false }]);
    });

    it('drops unsafe or incomplete links', () => {
        const s = resolveSiteSettings({
            ...base,
            custom_header: [
                { label: 'XSS', href: 'javascript:alert(1)' },
                { label: '', href: '/x' },
                { label: 'Proto', href: '//evil.example' }
            ]
        });
        expect(s.nav.header).toEqual([]);
    });

    it('enables the newsletter only with subscribe_enabled and a safe URL', () => {
        const on = resolveSiteSettings({
            ...base,
            settings: { footer: { subscribe_enabled: true, newsletter_url: 'https://news.example.com/subscribe' } }
        });
        expect(on.footer.newsletterUrl).toBe('https://news.example.com/subscribe');
        const unsafe = resolveSiteSettings({
            ...base,
            settings: { footer: { subscribe_enabled: true, newsletter_url: 'javascript:void(0)' } }
        });
        expect(unsafe.footer.newsletterUrl).toBeUndefined();
    });

    it('reads submit, social, description and clamps itemsPerPage', () => {
        const s = resolveSiteSettings({
            ...base,
            description: 'Best tools',
            submit: { url: 'https://forms.example.com/add', email: 'mailto:hi@example.com', github: false },
            social: {
                github: 'https://github.com/acme',
                twitter: 'https://x.com/acme',
                email: 'team@example.com',
                linkedin: 'javascript:alert(1)'
            },
            pagination: { type: 'standard', itemsPerPage: 5000 }
        });
        expect(s.submit).toEqual({ url: 'https://forms.example.com/add', email: 'hi@example.com', github: false });
        expect(s.social).toEqual({ github: 'https://github.com/acme', x: 'https://x.com/acme', email: 'team@example.com' });
        expect(s.description).toBe('Best tools');
        expect(s.itemsPerPage).toBe(12);
    });

    it('never throws on malformed settings', () => {
        const s = resolveSiteSettings({
            ...base,
            settings: 'nope' as unknown as SiteConfig['settings'],
            custom_menu: 42,
            pagination: null as unknown as SiteConfig['pagination']
        });
        expect(s.header.layoutDefault).toBe('classic');
        expect(s.itemsPerPage).toBe(12);
    });
});

describe('individual resolvers', () => {
    it('maps layouts', () => {
        expect(resolveLayout('home1')).toBe('classic');
        expect(resolveLayout('HOME2')).toBe('grid');
        expect(resolveLayout('modern')).toBe('grid');
        expect(resolveLayout(undefined)).toBe('classic');
    });
    it('maps pagination', () => {
        expect(resolvePagination('infinite')).toBe('infinite');
        expect(resolvePagination('paging')).toBe('standard');
    });
    it('maps themes', () => {
        expect(resolveTheme('light')).toBe('light');
        expect(resolveTheme('dark')).toBe('dark');
        expect(resolveTheme('auto')).toBe('system');
    });
    it('maps views', () => {
        expect(resolveView('list')).toBe('list');
        expect(resolveView('compact')).toBe('compact');
        expect(resolveView('masonry')).toBe('grid');
    });
    it('maps sorts', () => {
        expect(resolveSort('name-desc')).toBe('name-desc');
        expect(resolveSort('newest')).toBe('date-desc');
        expect(resolveSort('oldest')).toBe('date-asc');
        expect(resolveSort('popularity')).toBe('featured');
    });
    it('normalizes nav links', () => {
        expect(resolveNavLink({ label: 'A', path: '/a', target: '_blank' })).toEqual({
            label: 'A',
            href: '/a',
            external: true
        });
        expect(resolveNavLink({ label: 'Mail', href: 'mailto:a@b.co' })).toEqual({
            label: 'Mail',
            href: 'mailto:a@b.co',
            external: false
        });
        expect(resolveNavLink(null)).toBeNull();
    });
});

describe('site-relative URL safety', () => {
    it('rejects /\host and //host navigation links', () => {
        const s = resolveSiteSettings({
            ...base,
            custom_header: [
                { label: 'Backslash', href: `/${String.fromCharCode(92)}evil.example` },
                { label: 'Proto', href: '//evil.example' },
                { label: 'Ok', href: '/pages/about' }
            ]
        });
        expect(s.nav.header.map((l) => l.label)).toEqual(['Ok']);
    });
});
