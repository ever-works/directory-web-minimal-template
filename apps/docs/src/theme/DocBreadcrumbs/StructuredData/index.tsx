/*
 * Wraps @docusaurus/theme-classic's DocBreadcrumbs/StructuredData, the BreadcrumbList JSON-LD on
 * every doc page. Upstream builds each "item" as siteConfig.url + the sidebar href, and sidebar
 * hrefs never carry the trailing slash that `trailingSlash: true` gives every served URL, so the
 * items named /architecture/overview - which the nginx serving the build answers with a 301 to
 * /architecture/overview/ - instead of the page. The wrapper hands upstream each href as the
 * deployment serves it (src/utils/servedUrl) and changes nothing else.
 */
import React, { type ReactNode } from 'react';
import StructuredData from '@theme-original/DocBreadcrumbs/StructuredData';
import type { PropSidebarBreadcrumbsItem } from '@docusaurus/plugin-content-docs';
import { useServedHref } from '../../../utils/servedUrl';

type Props = { readonly breadcrumbs: PropSidebarBreadcrumbsItem[] };

export default function StructuredDataWrapper(props: Props): ReactNode {
    const servedHref = useServedHref();
    const breadcrumbs = props.breadcrumbs.map((breadcrumb) =>
        breadcrumb.href ? { ...breadcrumb, href: servedHref(breadcrumb.href) } : breadcrumb
    );
    return <StructuredData {...props} breadcrumbs={breadcrumbs} />;
}
