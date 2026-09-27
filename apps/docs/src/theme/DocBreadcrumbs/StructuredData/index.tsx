/*
 * Wraps @docusaurus/theme-classic's DocBreadcrumbs/StructuredData, the BreadcrumbList JSON-LD on
 * every doc page. Upstream builds each "item" as siteConfig.url + the sidebar href, and sidebar
 * hrefs never carry the trailing slash that `trailingSlash: true` gives every served URL, so the
 * items named /architecture/overview - which the nginx serving the build answers with a 301 to
 * /architecture/overview/ - instead of the page. The wrapper hands upstream each href with the
 * trailing slash applied the way Docusaurus's own <Link> applies `trailingSlash` (the site root
 * and hrefs that are not site-relative are left alone) and changes nothing else.
 */
import React, { type ReactNode } from 'react';
import StructuredData from '@theme-original/DocBreadcrumbs/StructuredData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { PropSidebarBreadcrumbsItem } from '@docusaurus/plugin-content-docs';

type Props = { readonly breadcrumbs: PropSidebarBreadcrumbsItem[] };

function useServedHref(): (href: string) => string {
    const {
        siteConfig: { baseUrl, trailingSlash }
    } = useDocusaurusContext();
    return (href) => {
        if (!href.startsWith('/')) {
            return href;
        }
        const [pathname = href] = href.split(/[#?]/);
        const rest = href.slice(pathname.length);
        if (pathname === baseUrl || pathname === '/') {
            return href;
        }
        if (trailingSlash === true && !pathname.endsWith('/')) {
            return `${pathname}/${rest}`;
        }
        if (trailingSlash === false && pathname.endsWith('/')) {
            return `${pathname.replace(/\/+$/, '')}${rest}`;
        }
        return href;
    };
}

export default function StructuredDataWrapper(props: Props): ReactNode {
    const servedHref = useServedHref();
    const breadcrumbs = props.breadcrumbs.map((breadcrumb) =>
        breadcrumb.href ? { ...breadcrumb, href: servedHref(breadcrumb.href) } : breadcrumb
    );
    return <StructuredData {...props} breadcrumbs={breadcrumbs} />;
}
