import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Sample Basic — React UI Components Directory
 *
 * A reference implementation built by AI from the minimal template.
 * Static output only — no SSR.
 */
export default defineConfig({
    output: 'static',
    site: process.env.SITE_URL || 'https://react-components.example.com',

    integrations: [
        preact(),
        sitemap(),
    ],

    vite: {
        plugins: [
            tailwindcss(),
        ],
        optimizeDeps: {
            include: ['preact', 'yaml'],
        },
    },
});
