/*
 * Replaces @docusaurus/theme-classic's BlogPostPage/StructuredData (the BlogPosting JSON-LD).
 * Upstream renders the data from useBlogPostStructuredData() as is, and its "@id", "url" and
 * "mainEntityOfPage" are built from the raw permalink (/blog/welcome), which the nginx serving
 * this `trailingSlash: true` build answers with a 301 to /blog/welcome/. This renders the same
 * data from the same public hook, with every page URL on this site mapped to the served URL
 * (src/utils/servedUrl); nothing else differs. A build with no canonical origin (no DOCS_URL,
 * noindex) has no host to name, so it emits no BlogPosting.
 */
import React, { type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import { useBlogPostStructuredData } from '@docusaurus/plugin-content-blog/client';
import { useHasCanonicalOrigin, useServedStructuredData } from '../../../utils/servedUrl';

export default function BlogPostStructuredData(): ReactNode {
    const hasCanonicalOrigin = useHasCanonicalOrigin();
    const served = useServedStructuredData();
    const structuredData = served(useBlogPostStructuredData());
    if (!hasCanonicalOrigin) {
        return null;
    }
    return (
        <Head>
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Head>
    );
}
