import type {
    AnalyticsPluginOptions,
    AnalyticsProviderConfig,
    ResolvedAnalyticsConfig,
} from './types';

export function resolveAnalyticsConfig(
    options: AnalyticsPluginOptions,
): ResolvedAnalyticsConfig {
    if (!options.providers || options.providers.length === 0) {
        throw new Error(
            '[plugin-analytics] "providers" must be a non-empty array.',
        );
    }

    for (const p of options.providers) {
        validateProvider(p);
    }

    return {
        providers: options.providers,
        respectDoNotTrack: options.respectDoNotTrack ?? true,
        disableInDev: options.disableInDev ?? true,
        placement: options.placement ?? 'head',
    };
}

function validateProvider(p: AnalyticsProviderConfig): void {
    switch (p.provider) {
        case 'plausible':
            if (!p.domain || p.domain.trim() === '') {
                throw new Error(
                    '[plugin-analytics] Plausible: "domain" is required.',
                );
            }
            break;
        case 'umami':
            if (!p.websiteId || p.websiteId.trim() === '') {
                throw new Error(
                    '[plugin-analytics] Umami: "websiteId" is required.',
                );
            }
            if (
                !p.scriptUrl ||
                !p.scriptUrl.startsWith('https://')
            ) {
                throw new Error(
                    '[plugin-analytics] Umami: "scriptUrl" must start with https://.',
                );
            }
            break;
        case 'fathom':
            if (!p.siteId || p.siteId.trim() === '') {
                throw new Error(
                    '[plugin-analytics] Fathom: "siteId" is required.',
                );
            }
            break;
        case 'ga4':
            if (
                !p.measurementId ||
                !/^G-[A-Z0-9]+$/.test(p.measurementId)
            ) {
                throw new Error(
                    '[plugin-analytics] GA4: "measurementId" must match G-XXXXXXXXXX.',
                );
            }
            break;
        case 'custom':
            if (!p.html || p.html.trim() === '') {
                throw new Error(
                    '[plugin-analytics] Custom: "html" is required.',
                );
            }
            break;
    }
}
