/**
 * FilterBar — Client-side filter bar with category and tag selection.
 * Headless — no styling applied. Use class prop or data-* selectors.
 *
 * @example
 * ```astro
 * <FilterBar
 *   client:load
 *   categories={categories}
 *   tags={tags}
 *   onCategoryChange={handleCategory}
 *   onTagsChange={handleTags}
 * />
 * ```
 */
import { useState, useCallback } from 'preact/hooks';
import type { FilterBarProps } from '../types.js';

export default function FilterBar({
  categories = [],
  tags = [],
  selectedCategory: initialCategory,
  selectedTags: initialTags = [],
  onCategoryChange,
  onTagsChange,
  class: className,
}: FilterBarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory ?? null,
  );
  const [activeTags, setActiveTags] = useState<string[]>(initialTags);

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      const next = activeCategory === categoryId ? null : categoryId;
      setActiveCategory(next);
      onCategoryChange?.(next);
    },
    [activeCategory, onCategoryChange],
  );

  const handleTagClick = useCallback(
    (tagId: string) => {
      const next = activeTags.includes(tagId)
        ? activeTags.filter((t) => t !== tagId)
        : [...activeTags, tagId];
      setActiveTags(next);
      onTagsChange?.(next);
    },
    [activeTags, onTagsChange],
  );

  const handleClearAll = useCallback(() => {
    setActiveCategory(null);
    setActiveTags([]);
    onCategoryChange?.(null);
    onTagsChange?.([]);
  }, [onCategoryChange, onTagsChange]);

  const hasActiveFilters = activeCategory !== null || activeTags.length > 0;

  return (
    <div class={className} data-component="filter-bar">
      {categories.length > 0 && (
        <fieldset data-part="categories">
          <legend data-part="legend">Categories</legend>
          <div data-part="category-options">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-part="category-option"
                data-selected={activeCategory === cat.id ? '' : undefined}
                onClick={() => handleCategoryClick(cat.id)}
                aria-pressed={activeCategory === cat.id}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {tags.length > 0 && (
        <fieldset data-part="tags">
          <legend data-part="legend">Tags</legend>
          <div data-part="tag-options">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                data-part="tag-option"
                data-selected={activeTags.includes(tag.id) ? '' : undefined}
                onClick={() => handleTagClick(tag.id)}
                aria-pressed={activeTags.includes(tag.id)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          data-part="clear-all"
          onClick={handleClearAll}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
