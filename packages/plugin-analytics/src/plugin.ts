import type { Plugin } from '@ever-works/plugins';
import type { ContentData } from '@ever-works/core';
import type { PluginContext } from '@ever-works/plugins';
import type { AnalyticsPluginOptions } from './types';
import { resolveAnalyticsConfig } from './resolve-config';

const PLUGIN_ID = 'analytics';

export function analyticsPlugin(options: AnalyticsPluginOptions): Plugin {
    return {
        id: PLUGIN_ID,
        name: 'Analytics Plugin',
        version: '0.1.0',
        description: 'Emits privacy-friendly analytics tracking scripts.',

        hooks: {
            async onInit(context: PluginContext): Promise<void> {
                const resolved = resolveAnalyticsConfig(options);
                const names = resolved.providers
                    .map((p) => p.provider)
                    .join(', ');
                context.log.info(
                    `analytics: ${resolved.providers.length} provider(s) [${names}], placement=${resolved.placement}`,
                );
                if (resolved.respectDoNotTrack) {
                    context.log.debug('Do-Not-Track: honored');
                }
                if (resolved.disableInDev) {
                    context.log.debug('Dev mode: tracking disabled');
                }
            },

            async onDataLoaded(
                data: ContentData,
                _context: PluginContext,
            ): Promise<ContentData> {
                return {
                    ...data,
                    _analytics: resolveAnalyticsConfig(options),
                };
            },
        },
    };
}
