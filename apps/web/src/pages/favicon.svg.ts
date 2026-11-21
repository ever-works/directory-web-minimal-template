/**
 * Default favicon — a monogram of the directory's name, rendered at build time (static output).
 *
 * Used only when `.works/works.yml` sets no `logo.favicon`; then BaseLayout links `/favicon.svg`. Without it every
 * generated directory had no icon at all (browser tab blank, `/favicon.ico` 404). "Awesome CRM" → "C".
 */
import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';

/** The first letter or digit of the name, ignoring a leading "Awesome"; "D" when there is none. */
export function monogram(name: string | undefined): string {
    const base = (name ?? '').replace(/^\s*awesome\s+/i, '').trim();
    const match = base.match(/[A-Za-z0-9]/);
    return match ? match[0].toUpperCase() : 'D';
}

export const GET: APIRoute = async () => {
    const { config } = await getContent();
    const letter = monogram(config.company_name);
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<rect width="64" height="64" rx="14" fill="#18181b"/>' +
        '<text x="32" y="44" text-anchor="middle" fill="#fafafa" font-size="36" font-weight="700" ' +
        'font-family="system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">' +
        letter +
        '</text></svg>';
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
