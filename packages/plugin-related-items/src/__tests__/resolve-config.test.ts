import { describe, it, expect } from 'vitest';
import { resolveRelatedConfig } from '../resolve-config';

describe('resolveRelatedConfig', () => {
    it('returns defaults when no options provided', () => {
        const config = resolveRelatedConfig();
        expect(config).toEqual({
            maxItems: 5,
            tagWeight: 1,
            categoryWeight: 2,
            featuredBoost: 0.5,
            minScore: 0,
        });
    });

    it('returns defaults for empty object', () => {
        const config = resolveRelatedConfig({});
        expect(config.maxItems).toBe(5);
        expect(config.tagWeight).toBe(1);
        expect(config.categoryWeight).toBe(2);
        expect(config.featuredBoost).toBe(0.5);
        expect(config.minScore).toBe(0);
    });

    it('overrides maxItems', () => {
        const config = resolveRelatedConfig({ maxItems: 10 });
        expect(config.maxItems).toBe(10);
        expect(config.tagWeight).toBe(1);
    });

    it('overrides tagWeight', () => {
        const config = resolveRelatedConfig({ tagWeight: 3 });
        expect(config.tagWeight).toBe(3);
    });

    it('overrides categoryWeight', () => {
        const config = resolveRelatedConfig({ categoryWeight: 5 });
        expect(config.categoryWeight).toBe(5);
    });

    it('overrides featuredBoost', () => {
        const config = resolveRelatedConfig({ featuredBoost: 0 });
        expect(config.featuredBoost).toBe(0);
    });

    it('overrides minScore', () => {
        const config = resolveRelatedConfig({ minScore: 2 });
        expect(config.minScore).toBe(2);
    });

    it('overrides all options at once', () => {
        const config = resolveRelatedConfig({
            maxItems: 3,
            tagWeight: 2,
            categoryWeight: 4,
            featuredBoost: 1,
            minScore: 1,
        });
        expect(config).toEqual({
            maxItems: 3,
            tagWeight: 2,
            categoryWeight: 4,
            featuredBoost: 1,
            minScore: 1,
        });
    });
});
