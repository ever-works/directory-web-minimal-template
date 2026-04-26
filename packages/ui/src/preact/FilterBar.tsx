/**
 * FilterBar — Client-side filter bar with category and tag selection.
 *
 * Built on shadcn/ui Button + Badge components.
 * Categories are single-select, tags are multi-select.
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
import { useState, useCallback, useEffect } from 'preact/hooks';
import type { FilterBarProps } from '../types.js';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { handleKeyActivation } from '../lib/keyboard';

// Stable empty-array sentinel so the `selectedTags` default keeps a fixed
// reference across renders. Without this, the default `[]` would create a
// fresh array each call and the `useEffect([initialTags])` below would
// fire on every render, resetting `activeTags` to `[]` and silently
// discarding user clicks. Caught by Q22 Playwright CT (iteration 105).
const EMPTY_TAGS: readonly string[] = Object.freeze([]);

export default function FilterBar({
  categories = [],
  tags = [],
  selectedCategory: initialCategory,
  selectedTags: initialTags = EMPTY_TAGS as string[],
  onCategoryChange,
  onTagsChange,
  class: className,
}: FilterBarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory ?? null,
  );
  const [activeTags, setActiveTags] = useState<string[]>(initialTags);

  // Sync internal state when parent changes props (controlled mode)
  useEffect(() => {
    setActiveCategory(initialCategory ?? null);
  }, [initialCategory]);

  useEffect(() => {
    setActiveTags(initialTags);
  }, [initialTags]);

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
    <div
      className={cn('flex flex-col gap-4', className)}
      data-component="filter-bar"
    >
      {categories.length > 0 && (
        <fieldset data-part="categories" className="flex flex-col gap-2">
          <legend
            data-part="legend"
            className="text-sm font-medium text-muted-foreground"
          >
            Categories
          </legend>
          <div data-part="category-options" className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                type="button"
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                data-part="category-option"
                data-selected={activeCategory === cat.id ? '' : undefined}
                onClick={() => handleCategoryClick(cat.id)}
                aria-pressed={activeCategory === cat.id}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </fieldset>
      )}

      {tags.length > 0 && (
        <fieldset data-part="tags" className="flex flex-col gap-2">
          <legend
            data-part="legend"
            className="text-sm font-medium text-muted-foreground"
          >
            Tags
          </legend>
          <div data-part="tag-options" className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={activeTags.includes(tag.id) ? 'default' : 'outline'}
                data-part="tag-option"
                data-selected={activeTags.includes(tag.id) ? '' : undefined}
                onClick={() => handleTagClick(tag.id)}
                onKeyDown={handleKeyActivation(() => handleTagClick(tag.id))}
                aria-pressed={activeTags.includes(tag.id)}
                role="button"
                tabIndex={0}
                className="cursor-pointer"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </fieldset>
      )}

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-part="clear-all"
          onClick={handleClearAll}
          className="self-start"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="mr-1"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          Clear filters
        </Button>
      )}
    </div>
  );
}
