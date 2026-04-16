export type AnalyticsProvider =
    | 'plausible'
    | 'umami'
    | 'fathom'
    | 'ga4'
    | 'custom';

export interface PlausibleConfig {
    provider: 'plausible';
    domain: string;
    scriptHost?: string;
    scriptFile?: string;
}

export interface UmamiConfig {
    provider: 'umami';
    websiteId: string;
    scriptUrl: string;
}

export interface FathomConfig {
    provider: 'fathom';
    siteId: string;
    scriptHost?: string;
}

export interface GA4Config {
    provider: 'ga4';
    measurementId: string;
    anonymizeIp?: boolean;
}

export interface CustomConfig {
    provider: 'custom';
    html: string;
}

export type AnalyticsProviderConfig =
    | PlausibleConfig
    | UmamiConfig
    | FathomConfig
    | GA4Config
    | CustomConfig;

export interface AnalyticsPluginOptions {
    providers: AnalyticsProviderConfig[];
    respectDoNotTrack?: boolean;
    disableInDev?: boolean;
    placement?: 'head' | 'body-end';
}

export interface ResolvedAnalyticsConfig {
    providers: AnalyticsProviderConfig[];
    respectDoNotTrack: boolean;
    disableInDev: boolean;
    placement: 'head' | 'body-end';
}
