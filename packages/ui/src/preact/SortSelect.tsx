/**
 * SortSelect — Client-side sort selector component.
 *
 * Built on shadcn/ui Select + Label components.
 * Uses a native select styled to match shadcn conventions.
 *
 * @example
 * ```astro
 * <SortSelect client:load selected="name-asc" onChange={handleSort} />
 * ```
 */
import { useCallback } from 'preact/hooks';
import type { SortSelectProps, SortOption } from '../types.js';
import { Select, SelectOption } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { cn } from '../lib/utils';

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
    <div
      className={cn('flex items-center gap-2', className)}
      data-component="sort-select"
    >
      <Label htmlFor="sort-select" data-part="label">
        Sort by
      </Label>
      <Select
        id="sort-select"
        data-part="select"
        value={selected}
        onChange={handleChange}
      >
        {options.map((option) => (
          <SelectOption key={option} value={option}>
            {LABELS[option]}
          </SelectOption>
        ))}
      </Select>
    </div>
  );
}
