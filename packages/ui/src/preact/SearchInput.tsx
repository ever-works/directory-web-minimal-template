/**
 * SearchInput — Client-side search input with debounce.
 *
 * Built on shadcn/ui Input + Button components.
 * Provides debounced search with a clear button (X icon).
 *
 * @example
 * ```astro
 * <SearchInput client:load placeholder="Search tools..." onSearch={handleSearch} />
 * ```
 */
import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import type { SearchInputProps } from '../types.js';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export default function SearchInput({
  placeholder = 'Search...',
  debounceMs = 300,
  onSearch,
  class: className,
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = useCallback(
    (e: Event) => {
      const target = e.target as HTMLInputElement;
      const newValue = target.value;
      setValue(newValue);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceMs);
    },
    [debounceMs, onSearch],
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch?.('');
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn('relative flex items-center gap-2', className)}
      data-component="search-input"
    >
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-part="input"
        aria-label={placeholder}
        className="pr-8"
      />
      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          data-part="clear"
          aria-label="Clear search"
          className="absolute right-1 h-7 w-7"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      )}
    </div>
  );
}
