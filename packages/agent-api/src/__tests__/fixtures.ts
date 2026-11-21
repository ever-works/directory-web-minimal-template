import type { ContentData, ItemData } from '@ever-works/core';

export function item(overrides: Partial<ItemData> & { slug: string; name: string }): ItemData {
    return {
        id: overrides.slug,
        description: `${overrides.name} description`,
        source_url: `https://${overrides.slug}.example.com`,
        category: 'Sales CRM',
        tags: [],
        updated_at: '2026-01-01 10:00',
        status: 'approved',
        ...overrides
    };
}

export function content(): ContentData {
    const items = [
        item({
            slug: 'hubspot',
            name: 'HubSpot CRM',
            description: 'Free CRM with marketing automation.',
            tags: ['Freemium', 'API'],
            featured: true,
            updated_at: '2026-03-01 09:00',
            brand_logo_url: 'https://hubspot.example.com/logo.png',
            markdown: '## Overview\n\nHubSpot.',
            images: ['https://hubspot.example.com/shot.png', 'javascript:alert(1)'],
            _relatedItems: [{ slug: 'twenty', name: 'Twenty', score: 1 }]
        }),
        item({
            slug: 'twenty',
            name: 'Twenty',
            description: 'Open source CRM built with TypeScript.',
            category: 'Open-Source & Self-Hosted CRM',
            tags: ['Open Source', 'Self Hosted'],
            updated_at: '2026-05-01 09:00',
            icon_url: 'https://twenty.example.com/icon.svg'
        }),
        item({
            slug: 'espocrm',
            name: 'EspoCRM',
            description: 'Self-hosted CRM in PHP.',
            category: ['open-source-self-hosted-crm', 'Sales CRM'],
            tags: ['open-source'],
            updated_at: '2025-12-01 09:00',
            source_url: 'not a url'
        })
    ];
    return {
        items,
        categories: [
            { id: 'sales-crm', name: 'Sales CRM', count: 2 },
            { id: 'open-source-self-hosted-crm', name: 'Open Source & Self Hosted CRM', count: 2, description: 'OSS' }
        ],
        tags: [
            { id: 'open-source', name: 'Open Source', count: 2 },
            { id: 'api', name: 'API', count: 1 },
            { id: 'freemium', name: 'Freemium', count: 1 },
            { id: 'self-hosted', name: 'Self Hosted', count: 1 }
        ],
        collections: [],
        comparisons: [],
        pages: [],
        config: { company_name: 'Awesome CRM', item_name: 'Tool', items_name: 'Tools', copyright_year: 2026 },
        total: items.length
    };
}
