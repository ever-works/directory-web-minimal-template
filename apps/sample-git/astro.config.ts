import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { everWorksIntegration } from '@ever-works/astro-integration';
import { getPluginRunner, getContent } from './src/lib/content';

/**
 * Sample Git — Time Tracking Directory (Git Data Adapter)
 *
 * ISR mode (default): hybrid output with Vercel adapter for on-demand regeneration.
 * Static mode (ENABLE_ISR=false): pure static output, no server runtime.
 *
 * Loads content from a remote Git repository (awesome-time-tracking-data)
 * via the Git data adapter with isomorphic-git.
 */

const isISR = process.env['ENABLE_ISR'] !== 'false';

export default defineConfig({
	// Astro 6: static output with Vercel adapter for ISR support
	output: 'static',
	...(isISR ? { adapter: vercel() } : {}),
	site: process.env.SITE_URL || 'https://time-tracking.example.com',

	integrations: [
		preact(),
		sitemap(),

		everWorksIntegration({
			getRunner: () => getPluginRunner(),
			getContent: () => getContent(),
			sync: {
				isr: isISR,
				webhook: isISR && !!process.env['WEBHOOK_SECRET'],
				webhookSecret: process.env['WEBHOOK_SECRET'],
			},
		}),
	],

	vite: {
		plugins: [
			tailwindcss(),
		],
		optimizeDeps: {
			include: ['preact', 'yaml'],
		},
		ssr: {
			noExternal: [/^@ever-works\//],
		},
	},
});
