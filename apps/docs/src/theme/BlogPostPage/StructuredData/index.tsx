/*
 * Replaces @docusaurus/theme-classic's BlogPostPage/StructuredData (the BlogPosting JSON-LD).
 * Upstream renders the data from useBlogPostStructuredData() as is, and its "@id", "url" and
 * "mainEntityOfPage" are built from the raw permalink (/blog/welcome), which the nginx serving
 * this `trailingSlash: true` build answers with a 301 to /blog/welcome/. This renders the same
 * data from the same public hook, with every page URL on this site mapped to the served URL
 * (src/utils/servedUrl); nothing else differs.
 */
import React, { type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import { useBlogPostStructuredData } from '@docusaurus/plugin-content-blog/client';
import { useServedStructuredData } from '../../../utils/servedUrl';

export default function BlogPostStructuredData(): ReactNode {
    const served = useServedStructuredData();
    const structuredData = served(useBlogPostStructuredData());
    return (
        <Head>
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Head>
    );
}
