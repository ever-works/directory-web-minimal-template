/**
 * Search ranking shared by the browser search dialog, the listing filters, and the MCP `search_items` tool.
 *
 * Dependency-free and allocation-light so it can run in the browser over thousands of items per keystroke.
 *
 * Ranking (Agent Access Contract v1): the query is split into tokens on non-alphanumerics. For each token the item
 * scores `+8` when its whole name equals the token, `+5` when a word of the name starts with it, `+3` when the name
 * contains it, plus `+2` when a category/tag name contains it and `+1` when the description contains it. Every token
 * must match somewhere, otherwise the item is excluded. A query equal to the whole name adds `+10`; featured items
 * add `+0.5`. Ties sort by name.
 */

/** The text fields ranking looks at. */
export interface SearchableText {
    name: string;
    description: string;
    /** Category and tag display names */
    taxonomy: readonly string[];
    featured?: boolean;
}

/**
 * Normalize text for matching: lowercase, accents stripped.
 *
 * @param value - Any text
 */
export function normalizeText(value: string): string {
    return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

/**
 * Split a query into normalized tokens (letters and digits of any script).
 *
 * @param query - Raw search query
 * @returns Unique, non-empty tokens
 */
export function tokenize(query: string): string[] {
    const tokens = normalizeText(query)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((token) => token.length > 0);
    return [...new Set(tokens)];
}

/**
 * Normalize a taxonomy value (id, name or slug) to a comparison key.
 *
 * @param value - Category/tag id, name or slug
 */
export function taxonomySlug(value: string): string {
    return normalizeText(String(value).trim())
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Score one item against pre-tokenized query tokens.
 *
 * @param tokens - Output of {@link tokenize}
 * @param item - Item text
 * @param fullQuery - Normalized full query (for the whole-name bonus); optional
 * @returns Score, or 0 when any token does not match
 */
export function scoreItem(tokens: readonly string[], item: SearchableText, fullQuery?: string): number {
    if (tokens.length === 0) return 0;
    const name = normalizeText(item.name);
    const words = name.split(/[^\p{L}\p{N}]+/u);
    const description = normalizeText(item.description ?? '');
    const taxonomy = item.taxonomy.map(normalizeText);
    let total = 0;

    for (const token of tokens) {
        let tokenScore = 0;
        if (name === token) tokenScore += 8;
        else if (words.some((word) => word.startsWith(token))) tokenScore += 5;
        else if (name.includes(token)) tokenScore += 3;
        if (taxonomy.some((value) => value.includes(token))) tokenScore += 2;
        if (description.includes(token)) tokenScore += 1;
        if (tokenScore === 0) return 0;
        total += tokenScore;
    }

    if (fullQuery && name === fullQuery.trim()) total += 10;
    if (item.featured) total += 0.5;
    return total;
}

/**
 * Rank items for a query. Items that do not match every token are dropped.
 *
 * @param items - Candidate items
 * @param query - Raw query
 * @param toText - Maps an item to its searchable text
 * @returns Matching items, best first (ties by name)
 *
 * @example
 * ```typescript
 * const hits = rankItems(summaries, 'open source crm', (i) => ({
 *     name: i.name, description: i.description, taxonomy: [...i.categories, ...i.tags], featured: i.featured,
 * }));
 * ```
 */
export function rankItems<T>(items: readonly T[], query: string, toText: (item: T) => SearchableText): T[] {
    const tokens = tokenize(query);
    if (tokens.length === 0) return [...items];
    const fullQuery = normalizeText(query);
    const scored: Array<{ item: T; score: number; name: string }> = [];
    for (const item of items) {
        const text = toText(item);
        const score = scoreItem(tokens, text, fullQuery);
        if (score > 0) scored.push({ item, score, name: text.name });
    }
    scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    return scored.map((entry) => entry.item);
}

/** Sort orders supported by listings and `list_items`. */
export type ItemSort = 'featured' | 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc';

/** Minimal shape needed for sorting. */
export interface SortableItem {
    name: string;
    featured?: boolean;
    /** Date string that sorts lexicographically (`YYYY-MM-DD …`) */
    updated?: string | null;
}

/**
 * Sort items (returns a new array). `featured` = featured first, then name A–Z.
 *
 * @param items - Items to sort
 * @param sort - Sort order
 * @param toSortable - Maps an item to its sortable fields
 */
export function sortItems<T>(items: readonly T[], sort: ItemSort, toSortable: (item: T) => SortableItem): T[] {
    const decorated = items.map((item) => ({ item, key: toSortable(item) }));
    const byName = (a: SortableItem, b: SortableItem) => a.name.localeCompare(b.name);
    decorated.sort((x, y) => {
        const a = x.key;
        const b = y.key;
        switch (sort) {
            case 'name-asc':
                return byName(a, b);
            case 'name-desc':
                return byName(b, a);
            case 'date-desc':
                return (b.updated ?? '').localeCompare(a.updated ?? '') || byName(a, b);
            case 'date-asc':
                return (a.updated ?? '').localeCompare(b.updated ?? '') || byName(a, b);
            default:
                return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || byName(a, b);
        }
    });
    return decorated.map((entry) => entry.item);
}
