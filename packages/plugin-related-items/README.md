# @ever-works/plugin-related-items

Computes related items for each directory item based on shared tags, categories, and featured status. Injects `_relatedItems` into each item's data at build time — zero runtime JS.

## Usage

```typescript
import { definePlugins } from '@ever-works/plugins';
import { relatedItemsPlugin } from '@ever-works/plugin-related-items';

export default definePlugins([
    relatedItemsPlugin({
        maxItems: 5,       // Max related items per item (default: 5)
        tagWeight: 1,      // Score per shared tag (default: 1)
        categoryWeight: 2, // Score for shared category (default: 2)
        featuredBoost: 0.5, // Bonus for featured items (default: 0.5)
        minScore: 0,       // Minimum score threshold (default: 0)
    }),
]);
```

## Scoring

For each pair of items (A, B):
1. Count shared tags × `tagWeight`
2. Same category → `+ categoryWeight`
3. B is featured → `+ featuredBoost`
4. Filter by `minScore`, sort descending, take top `maxItems`

## Output

Each item receives a `_relatedItems` array:

```typescript
item._relatedItems = [
    { slug: 'related-item', name: 'Related Item', score: 3.5, ... },
];
```

Use with the `SimilarItems` Astro component from `@ever-works/ui`.
