import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Astro Configuration
 *
 * Static output only — no SSR.
 * Preact for interactive islands.
 * Tailwind v4 via Vite plugin (not @astrojs/tailwind which is v3-only).
 * Sitemap for SEO.
 */
export default defineConfig({
    // Fully static output — no server runtime
    output: 'static',

    // Site URL for sitemap and canonical links
    site: process.env.SITE_URL || 'https://example.com',

    integrations: [
        // Preact for lightweight interactive islands
        preact(),

        // Auto-generate sitemap.xml
        sitemap(),
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
