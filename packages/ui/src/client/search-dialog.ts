/**
 * Site-wide quick search (`/` or `Ctrl/⌘+K`, or any `[data-open-search]` button).
 *
 * Uses a native `<dialog>` (focus trap, Escape and backdrop handled by the browser) and the shared compact index.
 * Results: ranked items, plus matching categories and tags. Arrow keys move the selection, Enter opens it, and the
 * footer link opens the full listing filtered by the query (`/?q=`).
 */

import { normalizeText, rankItems, tokenize } from '@ever-works/agent-api/search';
import { escapeHtml, initialOf, logoSources, LOGO_ONERROR } from '../lib/directory-format';
import { loadSearchIndex, type DecodedIndex } from './search-index';

const MAX_ITEMS = 8;
const MAX_TAXONOMY = 4;

function option(id: string, href: string, inner: string): string {
    return `<a role="option" id="${id}" href="${escapeHtml(href)}" class="dw-dialog-option" aria-selected="false">${inner}</a>`;
}

function renderResults(index: DecodedIndex, query: string, listingPath: string): { html: string; count: number } {
    const q = normalizeText(query.trim());
    let html = '';
    let count = 0;
    // A query without letters or digits (e.g. "!!!") would match everything: show the browse state instead.
    if (!q || tokenize(query).length === 0) {
        const top = index.categories.slice(0, 8);
        if (top.length) {
            html += '<div class="dw-dialog-group" role="presentation">Browse categories</div>';
            html += top
                .map((c, i) =>
                    option(
                        `dw-sr-${count + i}`,
                        `/category/${encodeURIComponent(c.id)}`,
                        `<span class="dw-category-icon" data-initial="${escapeHtml(initialOf(c.name))}" aria-hidden="true"></span><span class="dw-dialog-option-text"><strong>${escapeHtml(c.name)}</strong></span>`
                    )
                )
                .join('');
            count += top.length;
        }
        return { html, count };
    }

    const items = rankItems(index.items, query, (item) => ({
        name: item.name,
        description: item.description,
        taxonomy: item.taxonomy,
        featured: item.featured
    })).slice(0, MAX_ITEMS);
    if (items.length) {
        html += '<div class="dw-dialog-group" role="presentation">Results</div>';
        html += items
            .map((item, i) => {
                const [logo, fallback] = logoSources(item.logo, item.website);
                const img = logo
                    ? `<img src="${escapeHtml(logo)}"${fallback ? ` data-fallback="${escapeHtml(fallback)}"` : ''} alt="" width="32" height="32" loading="lazy" referrerpolicy="no-referrer" onerror="${escapeHtml(LOGO_ONERROR)}">`
                    : '';
                return option(
                    `dw-sr-${count + i}`,
                    `/item/${encodeURIComponent(item.slug)}`,
                    `<span class="dw-logo" data-initial="${escapeHtml(initialOf(item.name))}" aria-hidden="true">${img}</span>` +
                        `<span class="dw-dialog-option-text"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></span>`
                );
            })
            .join('');
        count += items.length;
    }

    const match = (name: string) => normalizeText(name).includes(q);
    const categories = index.categories.filter((c) => match(c.name)).slice(0, MAX_TAXONOMY);
    const tags = index.tags.filter((t) => match(t.name)).slice(0, MAX_TAXONOMY);
    if (categories.length || tags.length) {
        html += '<div class="dw-dialog-group" role="presentation">Categories &amp; tags</div>';
        html += [
            ...categories.map((c) => ({ href: `/category/${encodeURIComponent(c.id)}`, label: c.name, kind: 'Category' })),
            ...tags.map((t) => ({ href: `/tag/${encodeURIComponent(t.id)}`, label: `#${t.name}`, kind: 'Tag' }))
        ]
            .map((entry, i) =>
                option(
                    `dw-sr-${count + i}`,
                    entry.href,
                    `<span class="dw-category-icon" data-initial="${escapeHtml(initialOf(entry.label.replace('#', '')))}" aria-hidden="true"></span><span class="dw-dialog-option-text"><strong>${escapeHtml(entry.label)}</strong><small>${entry.kind}</small></span>`
                )
            )
            .join('');
        count += categories.length + tags.length;
    }

    if (count === 0) {
        html = `<p class="dw-dialog-empty">No results for “${escapeHtml(query.trim())}”. <a href="${escapeHtml(listingPath)}?q=${encodeURIComponent(query.trim())}" style="text-decoration:underline">Search the full listing</a></p>`;
    }
    return { html, count };
}

/** Wire up the search dialog. Idempotent. */
export function initSearchDialog(): void {
    const dialog = document.querySelector<HTMLDialogElement>('dialog[data-component="search-dialog"]');
    if (!dialog || dialog.dataset['ready']) return;
    dialog.dataset['ready'] = 'true';
    const input = dialog.querySelector<HTMLInputElement>('[data-part="search-input"]');
    const results = dialog.querySelector<HTMLElement>('[data-part="search-results"]');
    const seeAll = dialog.querySelector<HTMLAnchorElement>('[data-part="see-all"]');
    if (!input || !results) return;
    const listingPath = dialog.dataset['listingPath'] || '/';
    let index: DecodedIndex | null = null;
    let selected = -1;
    let timer: number | undefined;

    const options = () => Array.from(results.querySelectorAll<HTMLAnchorElement>('[role="option"]'));
    const select = (next: number) => {
        const all = options();
        if (!all.length) return;
        selected = (next + all.length) % all.length;
        all.forEach((el, i) => el.setAttribute('aria-selected', String(i === selected)));
        const active = all[selected];
        if (active) {
            input.setAttribute('aria-activedescendant', active.id);
            active.scrollIntoView({ block: 'nearest' });
        }
    };

    const render = () => {
        if (!index) return;
        const { html } = renderResults(index, input.value, listingPath);
        results.innerHTML = html;
        selected = -1;
        input.removeAttribute('aria-activedescendant');
        if (input.value.trim()) select(0);
        if (seeAll) seeAll.href = `${listingPath}${input.value.trim() ? `?q=${encodeURIComponent(input.value.trim())}` : ''}`;
    };

    const open = () => {
        if (!dialog.open) dialog.showModal();
        input.focus();
        input.select();
        if (!index) {
            results.innerHTML = '<p class="dw-dialog-empty">Loading…</p>';
            loadSearchIndex()
                .then((loaded) => {
                    index = loaded;
                    render();
                })
                .catch(() => {
                    results.innerHTML = `<p class="dw-dialog-empty">Search is unavailable right now. <a href="${escapeHtml(listingPath)}" style="text-decoration:underline">Browse the listing</a></p>`;
                });
        } else {
            render();
        }
    };

    document.addEventListener('click', (event) => {
        if ((event.target as HTMLElement).closest('[data-open-search]')) {
            event.preventDefault();
            open();
        }
    });

    document.addEventListener('keydown', (event) => {
        const target = event.target as HTMLElement;
        const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
        if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            open();
        } else if (event.key === '/' && !typing && !dialog.open) {
            event.preventDefault();
            open();
        }
    });

    input.addEventListener('input', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(render, 40);
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            select(selected + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            select(selected - 1);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const target = options()[selected];
            window.location.href = target
                ? target.href
                : `${listingPath}${input.value.trim() ? `?q=${encodeURIComponent(input.value.trim())}` : ''}`;
        }
    });

    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
        if ((event.target as HTMLElement).closest('[data-close-search]')) dialog.close();
    });
}
