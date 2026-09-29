/*
 * Wraps @docusaurus/theme-classic's MDXComponents/A, every link written in Markdown content. A
 * link to the root doc (index.md, slug /) renders as a link to the site root, which a deployment
 * that redirects its root (DOCS_HOME_CANONICAL_PATH, see docusaurus.config.ts) answers with a
 * redirect. The wrapper hands upstream the page the root is sent to instead (src/utils/servedUrl
 * useServedRootHref); every other href is passed through exactly as written. With
 * homeCanonicalPath "/" it renders exactly what upstream renders.
 */
/// <reference types="@docusaurus/theme-classic" />
import React, { type ReactNode } from 'react';
import MDXA from '@theme-original/MDXComponents/A';
import type { Props } from '@theme/MDXComponents/A';
import { useServedRootHref } from '../../../utils/servedUrl';

export default function MDXAWrapper(props: Props): ReactNode {
    const servedRootHref = useServedRootHref();
    return <MDXA {...props} href={servedRootHref(props.href)} />;
}
