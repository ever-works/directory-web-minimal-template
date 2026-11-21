import { describe, it, expect } from 'vitest';
import { normalizeText, rankItems, scoreItem, sortItems, taxonomySlug, tokenize } from '../search';

const text = (name: string, description = '', taxonomy: string[] = [], featured = false) => ({
    name,
    description,
    taxonomy,
    featured
});

describe('tokenize / normalize', () => {
    it('lowercases, strips accents and splits on punctuation', () => {
        expect(normalizeText('Café CRM')).toBe('cafe crm');
        expect(tokenize('  Open-Source, CRM!! crm ')).toEqual(['open', 'source', 'crm']);
        expect(tokenize('   ')).toEqual([]);
    });

    it('keeps non-Latin scripts', () => {
        expect(tokenize('CRM для бизнеса')).toEqual(['crm', 'для', 'бизнеса']);
    });

    it('slugifies taxonomy values', () => {
        expect(taxonomySlug('Open-Source & Self-Hosted CRM')).toBe('open-source-self-hosted-crm');
    });
});

describe('scoreItem', () => {
    it('ranks exact > prefix > contains on the name', () => {
        const tokens = tokenize('twenty');
        expect(scoreItem(tokens, text('Twenty'))).toBe(8);
        expect(scoreItem(tokens, text('Twenty CRM'))).toBe(5);
        expect(scoreItem(tokens, text('Plentytwenty'))).toBe(3);
    });

    it('adds taxonomy and description matches', () => {
        expect(scoreItem(tokenize('open'), text('X', 'an open tool', ['Open Source']))).toBe(3);
    });

    it('requires every token to match', () => {
        expect(scoreItem(tokenize('crm zebra'), text('Some CRM'))).toBe(0);
    });

    it('adds whole-name and featured bonuses', () => {
        const tokens = tokenize('hubspot crm');
        expect(scoreItem(tokens, text('HubSpot CRM', '', [], true), normalizeText('hubspot crm'))).toBe(5 + 5 + 10 + 0.5);
    });

    it('returns 0 for no tokens', () => {
        expect(scoreItem([], text('A'))).toBe(0);
    });
});

describe('rankItems', () => {
    const items = [
        { name: 'Zoho CRM', d: 'Cloud CRM', t: ['Sales'] },
        { name: 'Twenty', d: 'Open source CRM', t: ['Open Source'] },
        { name: 'Close', d: 'Sales CRM for startups', t: ['Sales'] },
        { name: 'Notion', d: 'Docs', t: [] }
    ];
    const toText = (i: (typeof items)[number]) => text(i.name, i.d, i.t);

    it('returns matches best first and drops non-matches', () => {
        expect(rankItems(items, 'crm', toText).map((i) => i.name)).toEqual(['Zoho CRM', 'Close', 'Twenty']);
        expect(rankItems(items, 'open source', toText).map((i) => i.name)).toEqual(['Twenty']);
    });

    it('returns all items for an empty query', () => {
        expect(rankItems(items, '', toText)).toHaveLength(4);
    });
});

describe('sortItems', () => {
    const items = [
        { name: 'b', featured: false, updated: '2026-01-02' },
        { name: 'a', featured: false, updated: '2026-01-03' },
        { name: 'c', featured: true, updated: null }
    ];
    const id = (i: (typeof items)[number]) => i;
    it('sorts by each order', () => {
        expect(sortItems(items, 'featured', id).map((i) => i.name)).toEqual(['c', 'a', 'b']);
        expect(sortItems(items, 'name-asc', id).map((i) => i.name)).toEqual(['a', 'b', 'c']);
        expect(sortItems(items, 'name-desc', id).map((i) => i.name)).toEqual(['c', 'b', 'a']);
        expect(sortItems(items, 'date-desc', id).map((i) => i.name)).toEqual(['a', 'b', 'c']);
        expect(sortItems(items, 'date-asc', id).map((i) => i.name)).toEqual(['c', 'b', 'a']);
    });
});
