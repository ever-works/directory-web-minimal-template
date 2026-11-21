/**
 * `/favicon.svg` — generated monogram favicon (first letter of the site name), used when works.yml has no
 * `logo.favicon`. Follows the visitor's color scheme.
 */
import type { APIRoute } from 'astro';
import { initialOf, escapeHtml } from '@ever-works/ui/lib/directory-format';
import { getSite } from '../lib/site';

export const GET: APIRoute = async () => {
    const site = await getSite();
    const letter = escapeHtml(initialOf(site.content.config.company_name));
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
        `<style>rect{fill:#171717}text{fill:#fafafa}@media (prefers-color-scheme:dark){rect{fill:#fafafa}text{fill:#171717}}</style>` +
        `<rect width="64" height="64" rx="14"/>` +
        `<text x="32" y="44" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="36" font-weight="800" text-anchor="middle">${letter}</text>` +
        `</svg>`;
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
};
