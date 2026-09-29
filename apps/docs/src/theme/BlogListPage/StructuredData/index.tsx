/*
 * Replaces @docusaurus/theme-classic's BlogListPage/StructuredData (the Blog JSON-LD of the blog
 * index). Upstream renders the data from useBlogListPageStructuredData(props) as is, and its "@id",
 * "url" and each post's "@id" / "url" / "mainEntityOfPage" come from raw permalinks (/blog,
 * /blog/welcome), which the nginx serving this `trailingSlash: true` build answers with a 301 to
 * the slashed URL. This renders the same data from the same public hook, with every page URL on
 * this site mapped to the served URL (src/utils/servedUrl); nothing else differs. A build with no
 * canonical origin (no DOCS_URL, noindex) has no host to name, so it emits no Blog JSON-LD.
 */
import React, { type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import { useBlogListPageStructuredData } from '@docusaurus/plugin-content-blog/client';
import { useHasCanonicalOrigin, useServedStructuredData } from '../../../utils/servedUrl';

type Props = Parameters<typeof useBlogListPageStructuredData>[0];

export default function BlogListPageStructuredData(props: Props): ReactNode {
    const hasCanonicalOrigin = useHasCanonicalOrigin();
    const served = useServedStructuredData();
    const structuredData = served(useBlogListPageStructuredData(props));
    if (!hasCanonicalOrigin) {
        return null;
    }
    return (
        <Head>
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Head>
    );
}
