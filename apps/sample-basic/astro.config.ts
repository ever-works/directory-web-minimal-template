import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { everWorksIntegration } from '@ever-works/astro-integration';
import { getPluginRunner, getContent } from './src/lib/content';

/**
 * Sample Basic — React UI Components Directory
 *
 * A reference implementation built by AI from the minimal template.
 * Static output only — no SSR.
 * Includes Ever Works integration for plugin build lifecycle hooks.
 */
export default defineConfig({
    output: 'static',
    site: process.env.SITE_URL || 'https://react-components.example.com',

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
            external: ['isomorphic-git'],
        },
    },
});
