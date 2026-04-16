/**
 * @ever-works/plugin-analytics
 *
 * Privacy-friendly, multi-provider analytics plugin for the
 * Ever Works minimal directory template.
 *
 * @example
 * ```typescript
 * import { analyticsPlugin } from '@ever-works/plugin-analytics';
 * import { definePlugins } from '@ever-works/plugins';
 *
 * export default definePlugins([
 *     analyticsPlugin({
 *         providers: [{ provider: 'plausible', domain: 'example.com' }],
 *     }),
 * ]);
 * ```
 */

export { analyticsPlugin } from './plugin';

export { resolveAnalyticsConfig } from './resolve-config';

export { renderAnalyticsScripts } from './render';

export {
    renderPlausibleScript,
    renderUmamiScript,
    renderFathomScript,
    renderGa4Script,
    renderCustomScript,
    escapeAttr,
} from './renderers';

export type {
    AnalyticsPluginOptions,
    AnalyticsProvider,
    AnalyticsProviderConfig,
    PlausibleConfig,
    UmamiConfig,
    FathomConfig,
    GA4Config,
    CustomConfig,
    ResolvedAnalyticsConfig,
} from './types';
