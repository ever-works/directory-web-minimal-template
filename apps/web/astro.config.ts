import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { everWorksIntegration } from '@ever-works/astro-integration';
import { getPluginRunner, getContent } from './src/lib/content.js';

/**
 * Astro Configuration
 *
 * Static output only — no SSR.
 * Preact for interactive islands (compat: true enables react → preact aliasing for shadcn).
 * Tailwind v4 via Vite plugin (not @astrojs/tailwind which is v3-only).
 * Sitemap for SEO.
 * Ever Works integration for plugin build lifecycle hooks (Pagefind, etc.).
 */
export default defineConfig({
    // Fully static output — no server runtime
    output: 'static',

    // Site URL for sitemap and canonical links
    site: process.env.SITE_URL || 'https://example.com',

    integrations: [
        // Preact for lightweight interactive islands
        // compat: true aliases react → preact/compat so shadcn/ui components work as-is
        preact({ compat: true }),

        // Auto-generate sitemap.xml
        sitemap(),

        // Ever Works plugin build hooks (onBeforeBuild, onAfterBuild)
        // Runs Pagefind indexing, sitemap generation, etc. after build
        everWorksIntegration({
            getRunner: () => getPluginRunner(),
            getContent: () => getContent(),
        }),
    ],

    // Vite configuration
    vite: {
        plugins: [
            // Tailwind CSS v4 via Vite plugin
            tailwindcss(),
        ],
        // Optimize dependency pre-bundling
        optimizeDeps: {
            include: ['preact', 'yaml'],
        },
    },
});
