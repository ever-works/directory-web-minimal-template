/**
 * ItemBrowser — Interactive Preact island combining search, filter, sort.
 *
 * Demonstrates full client-side interactivity using headless components
 * from @ever-works/ui. Items are passed as serializable props, and all
 * filtering/sorting happens client-side.
 */
import { useState, useMemo, useCallback } from 'preact/hooks';
import SearchInput from '@ever-works/ui/preact/SearchInput';
import FilterBar from '@ever-works/ui/preact/FilterBar';
import SortSelect from '@ever-works/ui/preact/SortSelect';
import LayoutSwitcher from '@ever-works/ui/preact/LayoutSwitcher';
import { sortItemsByOption } from '@ever-works/ui/lib/sort-items';
import type { SortOption, LayoutMode } from '@ever-works/ui';

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
}

interface BrowserTag {
  id: string;
  name: string;
}

interface ItemBrowserProps {
  initialItems: BrowserItem[];
  totalItemCount?: number;
  categories: BrowserCategory[];
  tags: BrowserTag[];
  itemName?: string;
  itemsName?: string;
}

export default function ItemBrowser({
  initialItems: items,
  categories,
  tags,
  itemsName = 'Properties',
}: ItemBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [layout, setLayout] = useState<LayoutMode>('grid');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((cat: string | null) => {
    setActiveCategory(cat);
  }, []);

  const handleTagsChange = useCallback((t: string[]) => {
    setActiveTags(t);
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
  }, []);

  const handleLayoutChange = useCallback((mode: LayoutMode) => {
    setLayout(mode);
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

    result = sortItemsByOption(result, sortBy);

    return result;
  }, [items, searchQuery, activeCategory, activeTags, sortBy]);

  const hasFilters = searchQuery.trim() !== '' || activeCategory !== null || activeTags.length > 0;

  return (
    <div data-component="item-browser">
      {/* Controls Bar */}
      <div class="mb-6 space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder={`Search ${itemsName.toLowerCase()}...`}
            debounceMs={200}
            onSearch={handleSearch}
            class="search-input-styled"
          />
          <div class="flex items-center gap-2">
            <LayoutSwitcher
              modes={['grid', 'list']}
              selected={layout}
              onChange={handleLayoutChange}
              persistKey="ew-sample-real-estate-layout"
            />
            <SortSelect
              selected={sortBy}
              onChange={handleSortChange}
              class="sort-select-styled"
            />
          </div>
        </div>

        <FilterBar
          categories={categories}
          tags={tags}
          selectedCategory={activeCategory ?? undefined}
          selectedTags={activeTags}
          onCategoryChange={handleCategoryChange}
          onTagsChange={handleTagsChange}
          class="filter-bar-styled"
        />
      </div>

      {/* Results count */}
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {filteredItems.length} of {items.length} {itemsName.toLowerCase()}
          {hasFilters && ' (filtered)'}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory(null);
              setActiveTags([]);
            }}
            class="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Item Grid */}
      {filteredItems.length === 0 ? (
        <div class="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400">
            No {itemsName.toLowerCase()} match your filters.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory(null);
                setActiveTags([]);
              }}
              class="mt-3 text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div class={layout === 'list' ? 'flex flex-col gap-3' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
          {filteredItems.map((item) => (
            <a
              key={item.slug}
              href={`/item/${item.slug}`}
              class="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
            >
              <div class="min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {item.name}
                </h3>
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
    </div>
  );
}
