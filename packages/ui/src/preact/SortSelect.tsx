/**
 * SortSelect — Client-side sort selector component.
 * Headless — no styling applied. Use class prop or data-* selectors.
 *
 * @example
 * ```astro
 * <SortSelect client:load selected="name-asc" onChange={handleSort} />
 * ```
 */
import { useCallback } from 'preact/hooks';
import type { SortSelectProps, SortOption } from '../types.js';

const DEFAULT_OPTIONS: SortOption[] = [
  'featured',
  'name-asc',
  'name-desc',
  'date-asc',
  'date-desc',
];

const LABELS: Record<SortOption, string> = {
  featured: 'Featured',
  'name-asc': 'Name (A-Z)',
  'name-desc': 'Name (Z-A)',
  'date-asc': 'Oldest first',
  'date-desc': 'Newest first',
};

export default function SortSelect({
  options = DEFAULT_OPTIONS,
  selected = 'featured',
  onChange,
  class: className,
}: SortSelectProps) {
  const handleChange = useCallback(
    (e: Event) => {
      const target = e.target as HTMLSelectElement;
      onChange?.(target.value as SortOption);
    },
    [onChange],
  );

  return (
    <div class={className} data-component="sort-select">
      <label data-part="label" for="sort-select">
        Sort by
      </label>
      <select
        id="sort-select"
        data-part="select"
        value={selected}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
