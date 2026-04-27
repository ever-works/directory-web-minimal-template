/**
 * LayoutSwitcher — Client-side layout mode toggle.
 *
 * Allows users to switch between different listing view modes
 * (grid, list, compact). Persists selection in localStorage.
 *
 * @example
 * ```astro
 * <LayoutSwitcher client:load selected="grid" onChange={handleLayout} />
 * ```
 */
import { useState, useCallback, useEffect } from 'preact/hooks';
import type { LayoutSwitcherProps, LayoutMode } from '../types.js';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'ew-layout-mode';

// Module-scope frozen sentinel. The default `modes` prop must be a STABLE
// reference across renders — `useEffect([persistKey, modes])` below uses
// reference equality. Fresh `['grid', 'list']` per render would fire that
// effect every render and race the post-click `localStorage.setItem(...)`.
// Same pattern as `EMPTY_TAGS` in `FilterBar.tsx` (iteration 105 / Q22 fix).
// See `docs/questions.md` Q24 for the full diagnostic chain.
const EMPTY_MODES: readonly LayoutMode[] = Object.freeze(['grid', 'list']);

const LAYOUT_ICONS: Record<LayoutMode, { label: string; path: string }> = {
	grid: {
		label: 'Grid view',
		path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
	},
	list: {
		label: 'List view',
		path: 'M3 4h18M3 12h18M3 20h18',
	},
	compact: {
		label: 'Compact view',
		path: 'M3 4h18M3 9h18M3 14h18M3 19h18',
	},
};

export default function LayoutSwitcher({
	modes = EMPTY_MODES as LayoutMode[],
	selected: initialSelected = 'grid',
	onChange,
	persistKey = STORAGE_KEY,
	class: className,
}: LayoutSwitcherProps) {
	const [active, setActive] = useState<LayoutMode>(initialSelected);

	// Read persisted value after mount to avoid SSR/hydration mismatch
	useEffect(() => {
		if (persistKey) {
			const stored = localStorage.getItem(persistKey);
			if (stored && modes.includes(stored as LayoutMode)) {
				setActive(stored as LayoutMode);
			}
		}
	}, [persistKey, modes]);

	useEffect(() => {
		if (persistKey) {
			localStorage.setItem(persistKey, active);
		}
	}, [active, persistKey]);

	const handleClick = useCallback(
		(mode: LayoutMode) => {
			setActive(mode);
			onChange?.(mode);
		},
		[onChange],
	);

	return (
		<div
			className={cn('inline-flex items-center gap-1 rounded-md border p-1', className)}
			data-component="layout-switcher"
			role="radiogroup"
			aria-label="Layout view"
		>
			{modes.map((mode) => {
				const icon = LAYOUT_ICONS[mode];
				return (
					<Button
						key={mode}
						type="button"
						variant={active === mode ? 'default' : 'ghost'}
						size="sm"
						data-part="mode-button"
						data-mode={mode}
						data-selected={active === mode ? '' : undefined}
						onClick={() => handleClick(mode)}
						role="radio"
						aria-checked={active === mode}
						aria-label={icon.label}
						className="h-7 w-7 p-0"
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
							<path d={icon.path} />
						</svg>
					</Button>
				);
			})}
		</div>
	);
}
