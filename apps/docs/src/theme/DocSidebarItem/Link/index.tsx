/*
 * Wraps @docusaurus/theme-classic's DocSidebarItem/Link. The sidebar's "Home" item is the doc at
 * the site root, and a deployment that redirects its root (DOCS_HOME_CANONICAL_PATH, see
 * docusaurus.config.ts) answers that link with a redirect on every doc page. The wrapper hands
 * upstream the href the deployment serves (src/utils/servedUrl: the site root mapped to the page
 * it is sent to, the trailing slash <Link> would add anyway) and changes nothing else. With
 * homeCanonicalPath "/" it renders exactly what upstream renders.
 */
/// <reference types="@docusaurus/theme-classic" />
import React, { type ReactNode } from 'react';
import DocSidebarItemLink from '@theme-original/DocSidebarItem/Link';
import type DocSidebarItemLinkType from '@theme/DocSidebarItem/Link';
import type { WrapperProps } from '@docusaurus/types';
import { useServedHref } from '../../../utils/servedUrl';

type Props = WrapperProps<typeof DocSidebarItemLinkType>;

export default function DocSidebarItemLinkWrapper(props: Props): ReactNode {
    const servedHref = useServedHref();
    return <DocSidebarItemLink {...props} item={{ ...props.item, href: servedHref(props.item.href) }} />;
}
