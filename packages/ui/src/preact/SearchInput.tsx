/**
 * SearchInput — Client-side search input with debounce.
 * Headless — no styling applied. Use class prop or data-* selectors.
 *
 * @example
 * ```astro
 * <SearchInput client:load placeholder="Search tools..." onSearch={handleSearch} />
 * ```
 */
import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import type { SearchInputProps } from '../types.js';

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
    <div class={className} data-component="search-input">
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-part="input"
        aria-label={placeholder}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          data-part="clear"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  );
}
