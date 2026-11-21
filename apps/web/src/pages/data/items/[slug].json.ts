/**
 * `/data/items/{slug}.json` — one item with its Markdown write-up, images and related slugs (Agent Access Contract v1).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { createTaxonomyIndex, relatedSlugsOf, toItemDetail } from '@ever-works/agent-api';
import type { ItemData } from '@ever-works/core';
import { getContent } from '../../../lib/content';
import { jsonResponse } from '../../../lib/agent';
import { getSite } from '../../../lib/site';

export const getStaticPaths: GetStaticPaths = async () => {
    const { items } = await getContent();
    return items.map((item) => ({ params: { slug: item.slug }, props: { item } }));
};

export const GET: APIRoute = async ({ props }) => {
    const site = await getSite();
    const item = (props as { item: ItemData }).item;
    const taxonomy = createTaxonomyIndex(site.content.categories, site.content.tags);
    return jsonResponse(toItemDetail(item, taxonomy, site.siteUrl, relatedSlugsOf(item)));
};
