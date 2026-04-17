import { describe, it, expect } from 'vitest';
import { resolveAnalyticsConfig } from '../resolve-config';
import type { AnalyticsPluginOptions } from '../types';

describe('resolveAnalyticsConfig', () => {
    const plausible: AnalyticsPluginOptions = {
        providers: [{ provider: 'plausible', domain: 'example.com' }],
    };

    it('applies default values', () => {
        const resolved = resolveAnalyticsConfig(plausible);
        expect(resolved.respectDoNotTrack).toBe(true);
        expect(resolved.disableInDev).toBe(true);
        expect(resolved.placement).toBe('head');
    });

    it('preserves explicit values', () => {
        const resolved = resolveAnalyticsConfig({
            ...plausible,
            respectDoNotTrack: false,
            disableInDev: false,
            placement: 'body-end',
        });
        expect(resolved.respectDoNotTrack).toBe(false);
        expect(resolved.disableInDev).toBe(false);
        expect(resolved.placement).toBe('body-end');
    });

    it('throws on empty providers array', () => {
        expect(() => resolveAnalyticsConfig({ providers: [] })).toThrow(
            '"providers" must be a non-empty array',
        );
    });

    it('throws on missing providers', () => {
        expect(() =>
            resolveAnalyticsConfig({} as AnalyticsPluginOptions),
        ).toThrow('"providers" must be a non-empty array');
    });

    it('validates plausible: domain required', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'plausible', domain: '' }],
            }),
        ).toThrow('Plausible: "domain" is required');
    });

    it('validates umami: websiteId required', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [
                    {
                        provider: 'umami',
                        websiteId: '',
                        scriptUrl: 'https://a.com/script.js',
                    },
                ],
            }),
        ).toThrow('Umami: "websiteId" is required');
    });

    it('validates umami: scriptUrl must be https', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [
                    {
                        provider: 'umami',
                        websiteId: 'abc-123',
                        scriptUrl: 'http://a.com/script.js',
                    },
                ],
            }),
        ).toThrow('Umami: "scriptUrl" must start with https://');
    });

    it('validates fathom: siteId required', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'fathom', siteId: '' }],
            }),
        ).toThrow('Fathom: "siteId" is required');
    });

    it('validates ga4: measurementId format', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'ga4', measurementId: 'INVALID' }],
            }),
        ).toThrow('GA4: "measurementId" must match');
    });

    it('validates ga4: accepts valid id', () => {
        const resolved = resolveAnalyticsConfig({
            providers: [{ provider: 'ga4', measurementId: 'G-ABC123' }],
        });
        expect(resolved.providers).toHaveLength(1);
    });

    it('validates custom: html required', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'custom', html: '' }],
            }),
        ).toThrow('Custom: "html" is required');
    });

    it('validates umami: accepts valid config', () => {
        const resolved = resolveAnalyticsConfig({
            providers: [
                {
                    provider: 'umami',
                    websiteId: 'abc-123',
                    scriptUrl: 'https://analytics.umami.is/script.js',
                },
            ],
        });
        expect(resolved.providers).toHaveLength(1);
    });

    it('validates umami: missing scriptUrl', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [
                    {
                        provider: 'umami',
                        websiteId: 'abc-123',
                    } as never,
                ],
            }),
        ).toThrow('Umami: "scriptUrl" must start with https://');
    });

    it('validates custom: accepts valid config', () => {
        const resolved = resolveAnalyticsConfig({
            providers: [
                { provider: 'custom', html: '<script>track()</script>' },
            ],
        });
        expect(resolved.providers).toHaveLength(1);
    });

    it('validates plausible: missing domain', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'plausible' } as never],
            }),
        ).toThrow('Plausible: "domain" is required');
    });

    it('validates fathom: missing siteId', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'fathom' } as never],
            }),
        ).toThrow('Fathom: "siteId" is required');
    });

    it('validates ga4: missing measurementId', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'ga4' } as never],
            }),
        ).toThrow('GA4: "measurementId" must match');
    });

    it('validates custom: missing html property', () => {
        expect(() =>
            resolveAnalyticsConfig({
                providers: [{ provider: 'custom' } as never],
            }),
        ).toThrow('Custom: "html" is required');
    });

    it('supports multiple providers', () => {
        const resolved = resolveAnalyticsConfig({
            providers: [
                { provider: 'plausible', domain: 'example.com' },
                { provider: 'ga4', measurementId: 'G-TEST1' },
            ],
        });
        expect(resolved.providers).toHaveLength(2);
    });
});
