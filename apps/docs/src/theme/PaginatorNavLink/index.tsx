/*
 * Wraps @docusaurus/theme-classic's PaginatorNavLink, the previous / next links under every doc.
 * The page after the root doc links back to the site root, which a deployment that redirects its
 * root (DOCS_HOME_CANONICAL_PATH, see docusaurus.config.ts) answers with a redirect. The wrapper
 * hands upstream the permalink the deployment serves (src/utils/servedUrl) and changes nothing
 * else. With homeCanonicalPath "/" it renders exactly what upstream renders.
 */
/// <reference types="@docusaurus/theme-classic" />
import React, { type ReactNode } from 'react';
import PaginatorNavLink from '@theme-original/PaginatorNavLink';
import type PaginatorNavLinkType from '@theme/PaginatorNavLink';
import type { WrapperProps } from '@docusaurus/types';
import { useServedHref } from '../../utils/servedUrl';

type Props = WrapperProps<typeof PaginatorNavLinkType>;

export default function PaginatorNavLinkWrapper(props: Props): ReactNode {
    const servedHref = useServedHref();
    return <PaginatorNavLink {...props} permalink={servedHref(props.permalink)} />;
}
