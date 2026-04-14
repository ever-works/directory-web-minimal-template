/**
 * Compute visible page numbers with ellipsis truncation.
 * Shared between Pagination.astro and ItemBrowser.tsx.
 *
 * @param current - Current active page (1-indexed)
 * @param total - Total number of pages
 * @param max - Maximum number of page buttons to show (default: 7)
 * @returns Array of page numbers and '...' ellipsis markers
 */
export function getVisiblePages(current: number, total: number, max = 7): (number | '...')[] {
	if (total <= max) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}

	const half = Math.floor(max / 2);
	let start = Math.max(1, current - half);
	const end = Math.min(total, start + max - 1);

	if (end - start + 1 < max) {
		start = Math.max(1, end - max + 1);
	}

	const pages: (number | '...')[] = [];

	if (start > 1) {
		pages.push(1);
		if (start > 2) pages.push('...');
	}

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	if (end < total) {
		if (end < total - 1) pages.push('...');
		pages.push(total);
	}

	return pages;
}
