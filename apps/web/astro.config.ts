import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { everWorksIntegration } from '@ever-works/astro-integration';
import { getPluginRunner, getContent } from './src/lib/content';

/**
 * Astro Configuration
 *
 * ISR mode (default): static output with Vercel adapter for on-demand page regeneration.
 * Static mode (ENABLE_ISR=false): pure static output, no server runtime (Cloudflare, nginx, S3).
 *
 * Preact for interactive islands (compat: true enables react → preact aliasing for shadcn).
 * Tailwind v4 via Vite plugin (not @astrojs/tailwind which is v3-only).
 * Sitemap for SEO (with `lastmod` from item `updated_at`; alias / empty taxonomy URLs left out).
 * Ever Works integration for plugin build lifecycle hooks (Pagefind, etc.).
 * MCP endpoint: in ISR mode `/mcp` is an on-demand route; static Cloudflare deploys serve it from a Worker
 * (src/worker/mcp-worker.ts).
 */

const isISR = process.env['ENABLE_ISR'] !== 'false';

/** Per-build lookup used by the sitemap: canonical taxonomy ids and item last-modified dates. */
let sitemapLookup: Promise<{ categories: Set<string>; tags: Set<string>; items: Map<string, string> }> | null = null;
function getSitemapLookup() {
	sitemapLookup ??= getContent().then(({ categories, tags, items }) => ({
		categories: new Set(categories.filter((c) => c.count > 0).map((c) => c.id)),
		tags: new Set(tags.filter((t) => t.count > 0).map((t) => t.id)),
		items: new Map(
			items
				.map((item) => {
					const match = typeof item.updated_at === 'string' ? item.updated_at.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/) : null;
					return [item.slug, match ? `${match[1]}T${match[2] ?? '00:00'}:00Z` : ''] as [string, string];
				})
				.filter(([, date]) => date !== '')
		)
	}));
	return sitemapLookup;
}

/** Mounts `/mcp` as an on-demand endpoint when a server adapter is present. */
function mcpEndpoint(): AstroIntegration {
	return {
		name: 'ever-works-mcp-endpoint',
		hooks: {
			'astro:config:setup': ({ injectRoute }) => {
				if (!isISR || process.env['MCP_ENABLED'] === 'false') return;
				injectRoute({ pattern: '/mcp', entrypoint: new URL('./src/endpoints/mcp.ts', import.meta.url), prerender: false });
			},
		},
	};
}

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

		// Auto-generate sitemap.xml. Alias taxonomy URLs (they canonicalize to /category/<id>, /tag/<id>), empty
		// tags and the 404 page are left out; item URLs get `lastmod` from `updated_at`.
		sitemap({
			filter: (page) => !/\/404\/?$/.test(page),
			serialize: async (entry) => {
				const lookup = await getSitemapLookup();
				const path = new URL(entry.url).pathname;
				const category = path.match(/^\/category\/([^/]+)\/?$/);
				if (category?.[1] && !lookup.categories.has(decodeURIComponent(category[1]))) return undefined;
				const tag = path.match(/^\/tag\/([^/]+)\/?$/);
				if (tag?.[1] && !lookup.tags.has(decodeURIComponent(tag[1]))) return undefined;
				const item = path.match(/^\/item\/([^/]+)\/?$/);
				const lastmod = item?.[1] ? lookup.items.get(decodeURIComponent(item[1])) : undefined;
				return lastmod ? { ...entry, lastmod } : entry;
			},
		}),

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

		mcpEndpoint(),
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
		// so extensionless TypeScript imports resolve correctly during SSR.
		// Externalize isomorphic-git to avoid Vite module runner timeout on Windows
		// (Vite 7.3.x bug — deep dependency chain resolution exceeds 60s timeout).
		ssr: {
			noExternal: [/^@ever-works\//],
			external: ['isomorphic-git'],
		},
	},
});
