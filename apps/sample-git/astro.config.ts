import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { everWorksIntegration } from '@ever-works/astro-integration';
import { getPluginRunner, getContent } from './src/lib/content';

/**
 * Sample Git — Time Tracking Directory (Git Data Adapter)
 *
 * A reference implementation that loads content from a remote Git repository
 * (awesome-time-tracking-data) via the Git data adapter.
 * Static output only — no SSR.
 * Includes Ever Works integration for plugin build lifecycle hooks.
 */
export default defineConfig({
    output: 'static',
    site: process.env.SITE_URL || 'https://time-tracking.example.com',

    integrations: [
        preact(),
        sitemap(),

        // Ever Works plugin build hooks (onBeforeBuild, onAfterBuild)
        everWorksIntegration({
            getRunner: () => getPluginRunner(),
            getContent: () => getContent(),
        }),
    ],

    vite: {
        plugins: [
            tailwindcss(),
        ],
        optimizeDeps: {
            include: ['preact', 'yaml'],
        },
        // Bundle workspace packages through Vite instead of Node's ESM resolver
        ssr: {
            noExternal: [/^@ever-works\//],
        },
    },
});
