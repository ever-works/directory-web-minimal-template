/**
 * ItemBrowser — Interactive Preact island with collapsible category/tag
 * filters, search, sort, and pagination.
 *
 * Uses headless components from @ever-works/ui:
 *   - SearchInput for debounced search
 *   - SortSelect for sort dropdown
 *
 * Featured items appear first with a badge and accent background.
 * Pagination limits display to `perPage` items with prev/next controls.
 */
import { useState, useMemo, useCallback } from 'preact/hooks';
import SearchInput from '@ever-works/ui/preact/SearchInput';
import type { SortOption } from '@ever-works/ui';

interface BrowserItem {
  slug: string;
  name: string;
  description: string;
  category: string | string[];
  tags: string[];
  featured?: boolean;
  icon_url?: string;
  updated_at: string;
}

interface BrowserCategory {
  id: string;
  name: string;
  count: number;
}

interface BrowserTag {
  id: string;
  name: string;
  count: number;
}

interface ItemBrowserProps {
  items: BrowserItem[];
  categories: BrowserCategory[];
  tags: BrowserTag[];
  itemName?: string;
  itemsName?: string;
  perPage?: number;
}

const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Featured first',
  'name-asc': 'Name (A → Z)',
  'name-desc': 'Name (Z → A)',
  'date-asc': 'Oldest first',
  'date-desc': 'Newest first',
};
const SORT_OPTIONS: SortOption[] = ['featured', 'name-asc', 'name-desc', 'date-asc', 'date-desc'];

function sortItems(items: BrowserItem[], sort: SortOption): BrowserItem[] {
  const sorted = [...items];
  switch (sort) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'date-asc':
      return sorted.sort((a, b) => a.updated_at.localeCompare(b.updated_at));
    case 'date-desc':
      return sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    case 'featured':
    default:
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });
  }
}

/** Max visible rows before "show more" */
const CAT_MAX_H = 200;  // px — ~2 rows of category cards
const TAG_MAX_H = 80;   // px — ~2 rows of tag pills

export default function ItemBrowser({
  items,
  categories,
  tags,
  itemsName = 'Items',
  perPage = 12,
}: ItemBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [catsExpanded, setCatsExpanded] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  const handleCategoryClick = useCallback((catId: string) => {
    setActiveCategory((prev) => {
      const next = prev === catId ? null : catId;
      setCurrentPage(1);
      return next;
    });
  }, []);

  const handleTagClick = useCallback((tagId: string) => {
    setActiveTags((prev) => {
      const next = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId];
      setCurrentPage(1);
      return next;
    });
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    if (activeCategory) {
      result = result.filter((item) => {
        const cats = Array.isArray(item.category) ? item.category : [item.category];
        return cats.includes(activeCategory);
      });
    }

    if (activeTags.length > 0) {
      result = result.filter((item) =>
        activeTags.some((t) => item.tags.includes(t)),
      );
    }

    result = sortItems(result, sortBy);
    return result;
  }, [items, searchQuery, activeCategory, activeTags, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const pagedItems = filteredItems.slice(startIdx, startIdx + perPage);
  const hasFilters = searchQuery.trim() !== '' || activeCategory !== null || activeTags.length > 0;

  const clearAll = () => {
    setSearchQuery('');
    setActiveCategory(null);
    setActiveTags([]);
    setCurrentPage(1);
  };

  return (
    <div data-component="item-browser">

      {/* ── Categories (collapsible, clickable to filter) ── */}
      {categories.length > 0 && (
        <section class="mb-10">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-5">Categories</h2>
          <div
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 overflow-hidden transition-all duration-300"
            style={{ maxHeight: catsExpanded ? '9999px' : `${CAT_MAX_H}px` }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                class={`group flex items-center gap-3 rounded-xl border p-3.5 shadow-sm transition-all text-left cursor-pointer ${
                  activeCategory === cat.id
                    ? 'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/40 ring-1 ring-brand-500/30'
                    : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-600'
                }`}
              >
                <div class={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                    : 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900'
                }`}>
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white truncate block">{cat.name}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{cat.count} {cat.count === 1 ? 'item' : 'items'}</span>
                </div>
              </button>
            ))}
          </div>
          {categories.length > 8 && (
            <button
              type="button"
              onClick={() => setCatsExpanded(!catsExpanded)}
              class="mt-3 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer"
            >
              {catsExpanded ? 'Show less ↑' : `Show all ${categories.length} categories →`}
            </button>
          )}
        </section>
      )}

      {/* ── Tags (collapsible, clickable to filter) ── */}
      {tags.length > 0 && (
        <section class="mb-10">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-5">Tags</h2>
          <div
            class="flex flex-wrap gap-2 overflow-hidden transition-all duration-300"
            style={{ maxHeight: tagsExpanded ? '9999px' : `${TAG_MAX_H}px` }}
          >
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagClick(tag.id)}
                class={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                  activeTags.includes(tag.id)
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-500/30'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-600 dark:hover:text-brand-400'
                }`}
              >
                <span class="text-xs text-gray-400 dark:text-gray-500">#</span>
                {tag.name}
                <span class="text-xs text-gray-400 dark:text-gray-500">({tag.count})</span>
              </button>
            ))}
          </div>
          {tags.length > 15 && (
            <button
              type="button"
              onClick={() => setTagsExpanded(!tagsExpanded)}
              class="mt-3 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer"
            >
              {tagsExpanded ? 'Show less ↑' : `Show all ${tags.length} tags →`}
            </button>
          )}
        </section>
      )}

      {/* ── Search + Sort bar ── */}
      <div class="mb-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder={`Search ${itemsName.toLowerCase()}...`}
            debounceMs={200}
            onSearch={handleSearch}
            class="search-input-styled"
          />
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange((e.target as HTMLSelectElement).value as SortOption)}
              class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 appearance-none pr-8 cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{SORT_LABELS[opt]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {filteredItems.length} {itemsName.toLowerCase()}
          {hasFilters && ' (filtered)'}
          {totalPages > 1 && ` · page ${currentPage} of ${totalPages}`}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            class="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Item Grid */}
      {pagedItems.length === 0 ? (
        <div class="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400">
            No {itemsName.toLowerCase()} match your filters.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              class="mt-3 text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pagedItems.map((item) => (
            <a
              key={item.slug}
              href={`/item/${item.slug}`}
              class={`group relative flex items-start gap-4 rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                item.featured
                  ? 'border-amber-300/50 bg-amber-50/30 hover:border-amber-400/70 dark:border-amber-700/40 dark:bg-amber-950/20 dark:hover:border-amber-600/60'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              }`}
            >
              {item.icon_url && (
                <img
                  src={item.icon_url}
                  alt=""
                  class="h-10 w-10 shrink-0 rounded-lg object-contain"
                  loading="lazy"
                />
              )}
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {item.name}
                  </h3>
                  {item.featured && (
                    <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 shrink-0">
                      ★ Featured
                    </span>
                  )}
                </div>
                {item.description && (
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div class="mt-2 flex flex-wrap gap-1">
                  {item.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            class="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ← Prev
          </button>

          {(() => {
            const pages: (number | '...')[] = [];
            const maxVisible = 5;
            if (totalPages <= maxVisible + 2) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              const start = Math.max(2, currentPage - 1);
              const end = Math.min(totalPages - 1, currentPage + 1);
              if (start > 2) pages.push('...');
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < totalPages - 1) pages.push('...');
              pages.push(totalPages);
            }
            return pages.map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} class="px-1 text-gray-400 dark:text-gray-500">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p as number)}
                  class={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    currentPage === p
                      ? 'bg-brand-600 text-white dark:bg-brand-500'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              )
            );
          })()}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            class="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
