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
	modes = ['grid', 'list'],
	selected: initialSelected = 'grid',
	onChange,
	persistKey = STORAGE_KEY,
	class: className,
}: LayoutSwitcherProps) {
	const [active, setActive] = useState<LayoutMode>(() => {
		if (typeof window !== 'undefined' && persistKey) {
			const stored = localStorage.getItem(persistKey);
			if (stored && modes.includes(stored as LayoutMode)) {
				return stored as LayoutMode;
			}
		}
		return initialSelected;
	});

	useEffect(() => {
		if (persistKey && typeof window !== 'undefined') {
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
						>
							<path d={icon.path} />
						</svg>
					</Button>
				);
			})}
		</div>
	);
}
