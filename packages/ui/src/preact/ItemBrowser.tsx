/**
 * ItemBrowser — Interactive Preact island combining FilterBar, SearchInput,
 * SortSelect, and LayoutSwitcher into a single browsing experience.
 *
 * Provides client-side filtering, sorting, search, layout switching,
 * and pagination for directory item listings.
 *
 * @example
 * ```astro
 * <ItemBrowser
 *   client:load
 *   items={items}
 *   categories={categories}
 *   tags={tags}
 *   itemsName="Tools"
 *   perPage={12}
 * />
 * ```
 */
import { useState, useMemo, useCallback } from 'preact/hooks';
import type { ItemBrowserProps, SortOption, LayoutMode } from '../types.js';
import type { ItemData } from '@ever-works/core';
import SearchInput from './SearchInput';
import SortSelect from './SortSelect';
import LayoutSwitcher from './LayoutSwitcher';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { sortItemsByOption } from '../lib/sort-items';
import { getVisiblePages } from '../lib/pagination';
import { handleKeyActivation } from '../lib/keyboard';

export default function ItemBrowser({
	items,
	categories = [],
	tags = [],
	itemsName = 'Items',
	perPage = 12,
	layoutModes = ['grid', 'list'],
	initialLayout = 'grid',
	renderItem,
	class: className,
}: ItemBrowserProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [activeTags, setActiveTags] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<SortOption>('featured');
	const [currentPage, setCurrentPage] = useState(1);
	const [layout, setLayout] = useState<LayoutMode>(initialLayout);

	/* ── Handlers ────────────────────────────────────── */

	const handleSearch = useCallback((query: string) => {
		setSearchQuery(query);
		setCurrentPage(1);
	}, []);

	const handleSortChange = useCallback((sort: SortOption) => {
		setSortBy(sort);
		setCurrentPage(1);
	}, []);

	const handleCategoryClick = useCallback((catId: string) => {
		setActiveCategory((prev) => (prev === catId ? null : catId));
		setCurrentPage(1);
	}, []);

	const handleTagClick = useCallback((tagId: string) => {
		setActiveTags((prev) =>
			prev.includes(tagId)
				? prev.filter((t) => t !== tagId)
				: [...prev, tagId],
		);
		setCurrentPage(1);
	}, []);

	const handleLayoutChange = useCallback((mode: LayoutMode) => {
		setLayout(mode);
	}, []);

	const clearAll = useCallback(() => {
		setSearchQuery('');
		setActiveCategory(null);
		setActiveTags([]);
		setCurrentPage(1);
	}, []);

	/* ── Filtering & sorting ────────────────────────── */

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
				const cats = Array.isArray(item.category)
					? item.category
					: [item.category];
				return cats.includes(activeCategory);
			});
		}

		if (activeTags.length > 0) {
			result = result.filter((item) =>
				activeTags.some((t) => item.tags.includes(t)),
			);
		}

		return sortItemsByOption(result, sortBy);
	}, [items, searchQuery, activeCategory, activeTags, sortBy]);

	/* ── Pagination ──────────────────────────────────── */

	const totalPages = Math.ceil(filteredItems.length / perPage);
	const startIdx = (currentPage - 1) * perPage;
	const pagedItems = filteredItems.slice(startIdx, startIdx + perPage);
	const hasFilters =
		searchQuery.trim() !== '' ||
		activeCategory !== null ||
		activeTags.length > 0;

	/* ── Grid class based on layout ─────────────────── */

	const gridClass =
		layout === 'list'
			? 'flex flex-col gap-3'
			: layout === 'compact'
				? 'grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
				: 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

	return (
		<div
			className={cn('flex flex-col gap-6', className)}
			data-component="item-browser"
		>
			{/* ── Category filter ── */}
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
								{cat.count !== null && cat.count !== undefined && (
									<span className="ml-1 text-xs opacity-60">({cat.count})</span>
								)}
							</Button>
						))}
					</div>
				</fieldset>
			)}

			{/* ── Tag filter ── */}
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
								{tag.count !== null && tag.count !== undefined && (
									<span className="ml-1 text-xs opacity-60">({tag.count})</span>
								)}
							</Badge>
						))}
					</div>
				</fieldset>
			)}

			{/* ── Toolbar: Search + Sort + Layout ── */}
			<div
				data-part="toolbar"
				className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
			>
				<SearchInput
					placeholder={`Search ${itemsName.toLowerCase()}...`}
					debounceMs={200}
					onSearch={handleSearch}
				/>
				<div className="flex items-center gap-3">
					<SortSelect selected={sortBy} onChange={handleSortChange} />
					{layoutModes.length > 1 && (
						<LayoutSwitcher
							modes={layoutModes}
							selected={layout}
							onChange={handleLayoutChange}
							persistKey="ew-item-browser-layout"
						/>
					)}
				</div>
			</div>

			{/* ── Results count + clear ── */}
			<div
				data-part="results-info"
				className="flex items-center justify-between text-sm text-muted-foreground"
			>
				<span>
					{filteredItems.length} {itemsName.toLowerCase()}
					{hasFilters ? ' (filtered)' : ''}
					{totalPages > 1 && ` \u00b7 page ${currentPage} of ${totalPages}`}
				</span>
				{hasFilters && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						data-part="clear-all"
						onClick={clearAll}
					>
						Clear all
					</Button>
				)}
			</div>

			{/* ── Item grid/list ── */}
			{pagedItems.length === 0 ? (
				<div
					data-part="empty-state"
					className="rounded-lg border-2 border-dashed p-12 text-center text-muted-foreground"
				>
					<p>No {itemsName.toLowerCase()} match your filters.</p>
					{hasFilters && (
						<Button
							type="button"
							variant="link"
							size="sm"
							data-part="clear-filters"
							onClick={clearAll}
							className="mt-2"
						>
							Clear filters
						</Button>
					)}
				</div>
			) : (
				<div data-part="item-list" data-layout={layout} className={gridClass}>
					{pagedItems.map((item) =>
						renderItem ? (
							renderItem(item, layout)
						) : (
							<DefaultItemCard key={item.slug} item={item} />
						),
					)}
				</div>
			)}

			{/* ── Pagination ── */}
			{totalPages > 1 && (
				<nav
					data-part="pagination"
					className="flex items-center justify-center gap-1"
					aria-label="Pagination"
				>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={currentPage === 1}
						onClick={() => setCurrentPage(currentPage - 1)}
					>
						Previous
					</Button>
					{getVisiblePages(currentPage, totalPages).map((page, i) =>
						page === '...' ? (
							<span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
						) : (
							<Button
								key={page}
								type="button"
								variant={currentPage === page ? 'default' : 'outline'}
								size="sm"
								onClick={() => setCurrentPage(page as number)}
								aria-current={currentPage === page ? 'page' : undefined}
							>
								{page}
							</Button>
						),
					)}
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage(currentPage + 1)}
					>
						Next
					</Button>
				</nav>
			)}
		</div>
	);
}

/* ── Default item card (used when no renderItem provided) ── */

function DefaultItemCard({ item }: { item: ItemData }) {
	return (
		<a
			href={`/item/${item.slug}`}
			data-part="item-card"
			data-featured={item.featured ? '' : undefined}
			className="flex flex-col gap-2 rounded-lg border p-4 transition-shadow hover:shadow-md"
		>
			<div className="flex items-center gap-2">
				<span className="font-medium">{item.name}</span>
				{item.featured && (
					<Badge variant="default" className="text-xs">
						Featured
					</Badge>
				)}
			</div>
			{item.description && (
				<p className="text-sm text-muted-foreground line-clamp-2">
					{item.description}
				</p>
			)}
			{item.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{item.tags.slice(0, 3).map((tag) => (
						<Badge key={tag} variant="outline" className="text-xs">
							{tag}
						</Badge>
					))}
				</div>
			)}
		</a>
	);
}
