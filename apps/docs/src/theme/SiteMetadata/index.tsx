/*
 * Wraps @docusaurus/theme-classic's SiteMetadata. On every page but 404.html it renders upstream
 * unchanged. On 404.html upstream names the page's own URL as canonical, og:url and hreflang, and
 * with `trailingSlash: true` that URL is /404.html/, which the nginx-static-serve fallback in
 * front of this build answers with the home page: a 200 soft 404 handed to crawlers as the page's
 * URL. The 404 page is not a page crawlers should be pointed at, so it renders no site metadata
 * (it keeps its title and content, which are rendered elsewhere).
 */
import React, { type ReactNode } from 'react';
import SiteMetadata from '@theme-original/SiteMetadata';
import { useIsNotFoundPage } from '../../utils/servedUrl';

export default function SiteMetadataWrapper(props: Record<string, never>): ReactNode {
    const isNotFoundPage = useIsNotFoundPage();
    if (isNotFoundPage) {
        return null;
    }
    return <SiteMetadata {...props} />;
}
