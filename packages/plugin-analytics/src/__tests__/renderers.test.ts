import { describe, it, expect } from 'vitest';
import { renderPlausibleScript } from '../renderers/plausible';
import { renderUmamiScript } from '../renderers/umami';
import { renderFathomScript } from '../renderers/fathom';
import { renderGa4Script } from '../renderers/ga4';
import { renderCustomScript } from '../renderers/custom';
import { escapeAttr } from '../renderers/escape';
import { renderAnalyticsScripts } from '../render';

describe('escapeAttr', () => {
    it('escapes double quotes', () => {
        expect(escapeAttr('a"b')).toBe('a&quot;b');
    });

    it('escapes angle brackets', () => {
        expect(escapeAttr('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes ampersands', () => {
        expect(escapeAttr('a&b')).toBe('a&amp;b');
    });

    it('passes through clean strings', () => {
        expect(escapeAttr('example.com')).toBe('example.com');
    });
});

describe('renderPlausibleScript', () => {
    it('renders default plausible script', () => {
        const html = renderPlausibleScript({
            provider: 'plausible',
            domain: 'example.com',
        });
        expect(html).toContain('defer');
        expect(html).toContain('data-domain="example.com"');
        expect(html).toContain('plausible.io/js/script.js');
    });

    it('uses custom host and file', () => {
        const html = renderPlausibleScript({
            provider: 'plausible',
            domain: 'test.com',
            scriptHost: 'https://analytics.test.com',
            scriptFile: 'script.outbound-links.js',
        });
        expect(html).toContain('analytics.test.com/js/script.outbound-links.js');
    });

    it('escapes domain with special chars', () => {
        const html = renderPlausibleScript({
            provider: 'plausible',
            domain: 'a"<b',
        });
        expect(html).toContain('a&quot;&lt;b');
        expect(html).not.toContain('a"<b');
    });
});

describe('renderUmamiScript', () => {
    it('renders umami script', () => {
        const html = renderUmamiScript({
            provider: 'umami',
            websiteId: 'abc-123',
            scriptUrl: 'https://analytics.umami.is/script.js',
        });
        expect(html).toContain('defer');
        expect(html).toContain('data-website-id="abc-123"');
        expect(html).toContain('src="https://analytics.umami.is/script.js"');
    });
});

describe('renderFathomScript', () => {
    it('renders default fathom script', () => {
        const html = renderFathomScript({
            provider: 'fathom',
            siteId: 'ABCDEF',
        });
        expect(html).toContain('defer');
        expect(html).toContain('data-site="ABCDEF"');
        expect(html).toContain('cdn.usefathom.com/script.js');
    });

    it('uses custom host', () => {
        const html = renderFathomScript({
            provider: 'fathom',
            siteId: 'XYZ',
            scriptHost: 'https://my.fathom.com',
        });
        expect(html).toContain('my.fathom.com/script.js');
    });
});

describe('renderGa4Script', () => {
    it('renders ga4 with default anonymize', () => {
        const html = renderGa4Script({
            provider: 'ga4',
            measurementId: 'G-TEST123',
        });
        expect(html).toContain('googletagmanager.com/gtag/js?id=G-TEST123');
        expect(html).toContain('anonymize_ip: true');
        expect(html).toContain("gtag('config','G-TEST123'");
    });

    it('disables anonymize when set to false', () => {
        const html = renderGa4Script({
            provider: 'ga4',
            measurementId: 'G-TEST123',
            anonymizeIp: false,
        });
        expect(html).not.toContain('anonymize_ip');
        expect(html).toContain('{}');
    });
});

describe('renderCustomScript', () => {
    it('returns html verbatim', () => {
        const html = renderCustomScript({
            provider: 'custom',
            html: '<script src="https://example.com/t.js"></script>',
        });
        expect(html).toBe(
            '<script src="https://example.com/t.js"></script>',
        );
    });
});

describe('renderAnalyticsScripts', () => {
    it('renders single provider without DNT', () => {
        const html = renderAnalyticsScripts({
            providers: [{ provider: 'plausible', domain: 'example.com' }],
            respectDoNotTrack: false,
            disableInDev: true,
            placement: 'head',
        });
        expect(html).toContain('data-domain="example.com"');
        expect(html).not.toContain('doNotTrack');
    });

    it('wraps with DNT guard when enabled', () => {
        const html = renderAnalyticsScripts({
            providers: [{ provider: 'plausible', domain: 'example.com' }],
            respectDoNotTrack: true,
            disableInDev: true,
            placement: 'head',
        });
        expect(html).toContain('doNotTrack');
        expect(html).toContain('<script>');
    });

    it('renders multiple providers', () => {
        const html = renderAnalyticsScripts({
            providers: [
                { provider: 'plausible', domain: 'example.com' },
                { provider: 'ga4', measurementId: 'G-ABC123' },
            ],
            respectDoNotTrack: false,
            disableInDev: true,
            placement: 'head',
        });
        expect(html).toContain('plausible.io');
        expect(html).toContain('googletagmanager.com');
    });
});
