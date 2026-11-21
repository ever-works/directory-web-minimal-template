/**
 * Directory browser — progressive enhancement for listing pages (homepage, `/page/N`, category and tag pages).
 *
 * The server renders the first page of cards plus static pagination links, so the page is complete without
 * JavaScript. This script adds search, multi-select category/tag filters, sorting, standard or infinite pagination and
 * shareable URL state (`?q=`, `?category=a,b`, `?tag=a,b`, `?sort=`, `?page=`). It does nothing until the visitor
 * interacts (or the URL already carries filter state); only then is the compact search index fetched.
 *
 * DOM contract (rendered by `DirectoryBrowser.astro`): see the `data-*` selectors below.
 */

import { rankItems, sortItems, type ItemSort } from '@ever-works/agent-api/search';
import { escapeHtml, renderDirectoryCard } from '../lib/directory-format';
import { loadSearchIndex, type DecodedIndex, type IndexedItem } from './search-index';

const SORTS: readonly ItemSort[] = ['featured', 'name-asc', 'name-desc', 'date-desc', 'date-asc'];

interface BrowserState {
    q: string;
    categories: string[];
    tags: string[];
    sort: ItemSort;
    page: number;
}

function list(value: string | null): string[] {
    return value ? value.split(',').map((part) => part.trim()).filter(Boolean) : [];
}

function toggle(values: string[], value: string): string[] {
    return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

class DirectoryBrowser {
    private readonly root: HTMLElement;
    private readonly results: HTMLElement;
    private readonly perPage: number;
    private readonly defaultSort: ItemSort;
    private readonly scopeCategory: string | null;
    private readonly scopeTag: string | null;
    private readonly basePath: string;
    private readonly itemsName: string;
    private state: BrowserState;
    private index: DecodedIndex | null = null;
    private loading: Promise<void> | null = null;
    private active = false;
    private debounce: number | undefined;
    private lastCount = 0;

    constructor(root: HTMLElement) {
        this.root = root;
        this.results = root.querySelector<HTMLElement>('[data-part="results"]') ?? root;
        this.perPage = Number(root.dataset['perPage']) || 12;
        const sort = root.dataset['defaultSort'] as ItemSort | undefined;
        this.defaultSort = sort && SORTS.includes(sort) ? sort : 'featured';
        this.scopeCategory = root.dataset['scopeCategory'] || null;
        this.scopeTag = root.dataset['scopeTag'] || null;
        this.basePath = root.dataset['basePath'] || window.location.pathname;
        this.itemsName = root.dataset['itemsName'] || 'items';
        this.state = this.readUrl();
        this.bind();
        this.syncControls();
        if (this.hasFilterState() || new URL(window.location.href).searchParams.has('page')) {
            void this.activate();
        }
        this.observeSentinel();
    }

    private readUrl(): BrowserState {
        const params = new URL(window.location.href).searchParams;
        const sort = params.get('sort') as ItemSort | null;
        return {
            q: params.get('q')?.trim() ?? '',
            categories: list(params.get('category')),
            tags: list(params.get('tag')),
            sort: sort && SORTS.includes(sort) ? sort : this.defaultSort,
            page: Math.max(1, Number(params.get('page')) || Number(this.root.dataset['initialPage']) || 1)
        };
    }

    private hasFilterState(): boolean {
        const s = this.state;
        return s.q !== '' || s.categories.length > 0 || s.tags.length > 0 || s.sort !== this.defaultSort;
    }

    private pagination(): 'standard' | 'infinite' {
        return document.documentElement.dataset['pagination'] === 'infinite' ? 'infinite' : 'standard';
    }

    private bind(): void {
        const root = this.root;

        // Search inputs inside the browser and anywhere on the page that opt in (e.g. the hero search box).
        document.querySelectorAll<HTMLInputElement>('[data-browser-search]').forEach((input) => {
            input.addEventListener('input', () => {
                window.clearTimeout(this.debounce);
                this.debounce = window.setTimeout(() => {
                    this.update({ q: input.value.trim(), page: 1 });
                }, 180);
            });
            input.form?.addEventListener('submit', (event) => {
                event.preventDefault();
                window.clearTimeout(this.debounce);
                this.update({ q: input.value.trim(), page: 1 });
                if (!root.contains(input)) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        root.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const categoryButton = target.closest<HTMLElement>('[data-filter-category]');
            if (categoryButton) {
                event.preventDefault();
                const id = categoryButton.dataset['filterCategory'] ?? '';
                const multi = event instanceof MouseEvent && (event.ctrlKey || event.metaKey || event.shiftKey);
                const categories = multi
                    ? toggle(this.state.categories, id)
                    : this.state.categories.length === 1 && this.state.categories[0] === id
                      ? []
                      : [id];
                this.update({ categories, page: 1 });
                return;
            }
            const tagButton = target.closest<HTMLElement>('[data-filter-tag]');
            if (tagButton) {
                event.preventDefault();
                this.update({ tags: toggle(this.state.tags, tagButton.dataset['filterTag'] ?? ''), page: 1 });
                return;
            }
            const remove = target.closest<HTMLElement>('[data-remove-filter]');
            if (remove) {
                const [kind, value] = (remove.dataset['removeFilter'] ?? '').split(':');
                if (kind === 'q') this.update({ q: '', page: 1 });
                if (kind === 'category' && value) this.update({ categories: this.state.categories.filter((c) => c !== value), page: 1 });
                if (kind === 'tag' && value) this.update({ tags: this.state.tags.filter((t) => t !== value), page: 1 });
                return;
            }
            if (target.closest('[data-clear-filters]')) {
                event.preventDefault();
                this.update({ q: '', categories: [], tags: [], sort: this.defaultSort, page: 1 });
                return;
            }
            const pageButton = target.closest<HTMLElement>('[data-page]');
            if (pageButton && this.active) {
                event.preventDefault();
                this.update({ page: Number(pageButton.dataset['page']) || 1 });
                root.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        root.addEventListener('change', (event) => {
            const target = event.target as HTMLElement;
            if (target.matches('[data-browser-sort]')) {
                this.update({ sort: (target as HTMLSelectElement).value as ItemSort, page: 1 });
            } else if (target.matches('[data-filter-tag-checkbox]')) {
                this.update({ tags: toggle(this.state.tags, (target as HTMLInputElement).value), page: 1 });
            }
        });

        document.addEventListener('ew:prefchange', ((event: CustomEvent<{ key: string }>) => {
            if (event.detail?.key === 'pagination' && this.active) this.render();
        }) as EventListener);
    }

    private observeSentinel(): void {
        const sentinel = this.root.querySelector<HTMLElement>('[data-part="sentinel"]');
        if (!sentinel || !('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting) || this.pagination() !== 'infinite') return;
                // Every item is already on the page (taxonomy pages): nothing to load until the visitor filters.
                if (!this.active && this.root.hasAttribute('data-complete')) return;
                if (!this.active) {
                    void this.activate().then(() => this.loadMore());
                } else {
                    this.loadMore();
                }
            },
            { rootMargin: '800px 0px' }
        );
        observer.observe(sentinel);
    }

    private loadMore(): void {
        if (this.state.page * this.perPage >= this.lastCount) return;
        this.state = { ...this.state, page: this.state.page + 1 };
        this.render(true);
    }

    private async activate(): Promise<void> {
        if (this.index) {
            this.active = true;
            return;
        }
        if (!this.loading) {
            this.root.toggleAttribute('data-loading-more', true);
            this.results.setAttribute('aria-busy', 'true');
            this.loading = loadSearchIndex()
                .then((index) => {
                    this.index = index;
                    this.active = true;
                    this.render();
                })
                .catch(() => {
                    // Index unavailable: keep the static page and its links working.
                    this.loading = null;
                })
                .finally(() => {
                    this.root.toggleAttribute('data-loading-more', false);
                    this.results.removeAttribute('aria-busy');
                });
        }
        return this.loading;
    }

    private update(patch: Partial<BrowserState>): void {
        this.state = { ...this.state, ...patch };
        this.syncControls();
        if (this.active) {
            this.render();
        } else {
            void this.activate();
        }
    }

    private filtered(): IndexedItem[] {
        if (!this.index) return [];
        const { categories, tags, q, sort } = this.state;
        let items = this.index.items.filter(
            (item) =>
                (!this.scopeCategory || item.categoryIds.includes(this.scopeCategory)) &&
                (!this.scopeTag || item.tagIds.includes(this.scopeTag)) &&
                (categories.length === 0 || categories.some((id) => item.categoryIds.includes(id))) &&
                (tags.length === 0 || tags.some((id) => item.tagIds.includes(id)))
        );
        const toSortable = (item: IndexedItem) => ({ name: item.name, featured: item.featured, updated: item.updated });
        if (q) {
            const ranked = rankItems(items, q, (item) => ({
                name: item.name,
                description: item.description,
                taxonomy: item.taxonomy,
                featured: item.featured
            }));
            // Relevance order unless the visitor explicitly picked another sort.
            items = sort === this.defaultSort ? ranked : sortItems(ranked, sort, toSortable);
        } else {
            items = sortItems(items, sort, toSortable);
        }
        return items;
    }

    private render(append = false): void {
        if (!this.index) return;
        const items = this.filtered();
        this.lastCount = items.length;
        const totalPages = Math.max(1, Math.ceil(items.length / this.perPage));
        if (this.state.page > totalPages) this.state = { ...this.state, page: totalPages };
        const infinite = this.pagination() === 'infinite';
        const start = infinite ? 0 : (this.state.page - 1) * this.perPage;
        const end = this.state.page * this.perPage;
        const visible = items.slice(start, end);

        if (visible.length === 0) {
            this.results.innerHTML =
                `<div class="dw-empty" data-part="empty-state"><p>No ${escapeHtml(this.itemsName.toLowerCase())} match these filters</p>` +
                `<button type="button" class="dw-btn dw-btn-outline" style="margin-top:1rem" data-clear-filters>Clear filters</button></div>`;
        } else if (append && infinite) {
            const already = this.results.querySelectorAll('[data-component="item-card"]').length;
            this.results.insertAdjacentHTML('beforeend', visible.slice(already).map((item) => renderDirectoryCard(item)).join(''));
        } else {
            this.results.innerHTML = visible.map((item) => renderDirectoryCard(item)).join('');
        }

        this.renderCount(items.length, start, Math.min(end, items.length), infinite);
        this.renderPagination(totalPages, infinite);
        this.renderActiveFilters();
        this.writeUrl();
    }

    private renderCount(total: number, start: number, end: number, infinite: boolean): void {
        const count = this.root.querySelector<HTMLElement>('[data-part="result-count"]');
        if (!count) return;
        const noun = this.itemsName.toLowerCase();
        count.textContent =
            total === 0
                ? `No ${noun} found`
                : infinite || total <= this.perPage
                  ? `Showing ${end} of ${total} ${noun}`
                  : `Showing ${start + 1}–${end} of ${total} ${noun}`;
    }

    private renderPagination(totalPages: number, infinite: boolean): void {
        const nav = this.root.querySelector<HTMLElement>('[data-part="pagination"]');
        if (!nav) return;
        if (infinite || totalPages <= 1) {
            nav.innerHTML = '';
            nav.hidden = true;
            return;
        }
        nav.hidden = false;
        const page = this.state.page;
        const pages: Array<number | '…'> = [];
        for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
            else if (pages[pages.length - 1] !== '…') pages.push('…');
        }
        const link = (p: number, label: string, extra = '') =>
            `<a href="?page=${p}" data-page="${p}"${extra}>${label}</a>`;
        nav.innerHTML =
            (page > 1 ? link(page - 1, '<span aria-hidden="true">←</span><span class="sr-only">Previous page</span>') : '') +
            pages
                .map((p) => (p === '…' ? '<span>…</span>' : link(p, String(p), p === page ? ' aria-current="page"' : '')))
                .join('') +
            (page < totalPages ? link(page + 1, '<span aria-hidden="true">→</span><span class="sr-only">Next page</span>') : '');
    }

    private renderActiveFilters(): void {
        const box = this.root.querySelector<HTMLElement>('[data-part="active-filters"]');
        if (!box || !this.index) return;
        const name = (items: Array<{ id: string; name: string }>, id: string) => items.find((entry) => entry.id === id)?.name ?? id;
        const chip = (key: string, label: string) =>
            `<button type="button" class="dw-chip" aria-pressed="true" data-remove-filter="${escapeHtml(key)}">${escapeHtml(label)}<span aria-hidden="true"> ×</span><span class="sr-only"> (remove filter)</span></button>`;
        const chips = [
            ...(this.state.q ? [chip('q:', `“${this.state.q}”`)] : []),
            ...this.state.categories.map((id) => chip(`category:${id}`, name(this.index!.categories, id))),
            ...this.state.tags.map((id) => chip(`tag:${id}`, `#${name(this.index!.tags, id)}`))
        ];
        box.innerHTML = chips.length
            ? `${chips.join('')}<button type="button" class="dw-chip" data-clear-filters>Clear all</button>`
            : '';
    }

    private syncControls(): void {
        const { q, categories, tags, sort } = this.state;
        document.querySelectorAll<HTMLInputElement>('[data-browser-search]').forEach((input) => {
            if (input.value.trim() !== q && document.activeElement !== input) input.value = q;
        });
        this.root.querySelectorAll<HTMLElement>('[data-filter-category]').forEach((button) => {
            button.setAttribute('aria-pressed', String(categories.includes(button.dataset['filterCategory'] ?? '')));
        });
        this.root.querySelectorAll<HTMLElement>('[data-filter-tag]').forEach((button) => {
            button.setAttribute('aria-pressed', String(tags.includes(button.dataset['filterTag'] ?? '')));
        });
        this.root.querySelectorAll<HTMLInputElement>('[data-filter-tag-checkbox]').forEach((box) => {
            box.checked = tags.includes(box.value);
        });
        const tagCount = this.root.querySelector<HTMLElement>('[data-part="tag-filter-count"]');
        if (tagCount) tagCount.textContent = tags.length ? String(tags.length) : '';
        this.root.querySelectorAll<HTMLSelectElement>('[data-browser-sort]').forEach((select) => {
            select.value = sort;
        });
    }

    private writeUrl(): void {
        const params = new URLSearchParams();
        const { q, categories, tags, sort, page } = this.state;
        if (q) params.set('q', q);
        if (categories.length) params.set('category', categories.join(','));
        if (tags.length) params.set('tag', tags.join(','));
        if (sort !== this.defaultSort) params.set('sort', sort);
        if (page > 1 && this.pagination() === 'standard') params.set('page', String(page));
        const query = params.toString();
        const next = `${this.basePath}${query ? `?${query}` : ''}${window.location.hash}`;
        if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
            window.history.replaceState(window.history.state, '', next);
        }
    }
}

/** Enhance every `[data-component="directory-browser"]` on the page. */
export function initDirectoryBrowsers(): void {
    document.querySelectorAll<HTMLElement>('[data-component="directory-browser"]').forEach((root) => {
        if (root.dataset['enhanced']) return;
        root.dataset['enhanced'] = 'true';
        new DirectoryBrowser(root);
    });
}
