import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { everWorksIntegration } from '@ever-works/astro-integration';
import { getPluginRunner, getContent } from './src/lib/content';

/**
 * Astro Configuration
 *
 * ISR mode (default): hybrid output with Vercel adapter for on-demand page regeneration.
 * Static mode (ENABLE_ISR=false): pure static output, no server runtime.
 *
 * Preact for interactive islands (compat: true enables react → preact aliasing for shadcn).
 * Tailwind v4 via Vite plugin (not @astrojs/tailwind which is v3-only).
 * Sitemap for SEO.
 * Ever Works integration for plugin build lifecycle hooks (Pagefind, etc.).
 */

const isISR = process.env['ENABLE_ISR'] !== 'false';

export default defineConfig({
	// In Astro 6, output: 'static' is the default and supports per-page opt-out
	// via `export const prerender = false`. The Vercel adapter enables ISR
	// for prerendered pages automatically.
	// Set ENABLE_ISR=false to skip the Vercel adapter entirely (pure static).
	output: 'static',

	// Vercel adapter enables ISR for prerendered pages
	...(isISR ? { adapter: vercel() } : {}),

	// Site URL for sitemap and canonical links
	site: process.env.SITE_URL || 'https://example.com',

	integrations: [
		// Preact for lightweight interactive islands
		// compat: true aliases react → preact/compat so shadcn/ui components work as-is
		preact({ compat: true }),

		// Auto-generate sitemap.xml
		sitemap(),

		// Ever Works plugin build hooks (onBeforeBuild, onAfterBuild)
		// + webhook endpoint injection when ISR is enabled
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
		// Bundle workspace packages through Vite instead of Node's ESM resolver
		// so extensionless TypeScript imports resolve correctly during SSR
		ssr: {
			noExternal: [/^@ever-works\//],
		},
	},
});
