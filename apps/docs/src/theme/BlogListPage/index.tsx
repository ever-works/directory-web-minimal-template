/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
 * Ejected from @docusaurus/theme-classic 3.10.0 (theme/BlogListPage). Re-diff it against the
 * upstream component on every Docusaurus upgrade (docusaurus.config.ts stops the build when
 * theme-classic leaves the minor it was ejected from).
 *
 * The one change: upstream renders the blog index (/blog/ and /blog/page/N/) with no h1 at all -
 * only each post's title as an h2 - so the page had no top-level heading. This renders the blog
 * title (blogTitle, "Blog" by default) as its h1, in the same header markup upstream uses for the
 * tag and author post lists (BlogTagsPostsPage). Nothing else differs.
 */
/// <reference types="@docusaurus/theme-classic" />
import React, { type ReactNode } from 'react';
import clsx from 'clsx';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { PageMetadata, HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogListPage';
import BlogPostItems from '@theme/BlogPostItems';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import Heading from '@theme/Heading';

function BlogListPageMetadata(props: Props): ReactNode {
    const { metadata } = props;
    const {
        siteConfig: { title: siteTitle }
    } = useDocusaurusContext();
    const { blogDescription, blogTitle, permalink } = metadata;
    const isBlogOnlyMode = permalink === '/';
    const title = isBlogOnlyMode ? siteTitle : blogTitle;
    return (
        <>
            <PageMetadata title={title} description={blogDescription} />
            <SearchMetadata tag="blog_posts_list" />
        </>
    );
}

function BlogListPageContent(props: Props): ReactNode {
    const { metadata, items, sidebar } = props;
    return (
        <BlogLayout sidebar={sidebar}>
            <header className="margin-bottom--xl">
                <Heading as="h1">{metadata.blogTitle}</Heading>
            </header>
            <BlogPostItems items={items} />
            <BlogListPaginator metadata={metadata} />
        </BlogLayout>
    );
}

export default function BlogListPage(props: Props): ReactNode {
    return (
        <HtmlClassNameProvider className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage)}>
            <BlogListPageMetadata {...props} />
            <BlogListPageStructuredData {...props} />
            <BlogListPageContent {...props} />
        </HtmlClassNameProvider>
    );
}
