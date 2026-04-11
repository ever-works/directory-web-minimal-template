/**
 * Type declarations for Docusaurus virtual theme modules.
 * These modules are provided by Docusaurus at runtime but TypeScript
 * cannot resolve them without these declarations.
 */

declare module '@theme/Heading' {
    import type { ComponentProps } from 'react';
    export default function Heading(
        props: ComponentProps<'h1'> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
    ): JSX.Element;
}

declare module '@theme/Tabs' {
    import type { ReactNode } from 'react';
    export interface TabsProps {
        children: ReactNode;
        defaultValue?: string;
        values?: Array<{ label: string; value: string }>;
        groupId?: string;
        className?: string;
        queryString?: string | boolean;
        lazy?: boolean;
    }
    export default function Tabs(props: TabsProps): JSX.Element;
}

declare module '@theme/TabItem' {
    import type { ReactNode } from 'react';
    export interface TabItemProps {
        children: ReactNode;
        value: string;
        label?: string;
        default?: boolean;
        className?: string;
        attributes?: Record<string, unknown>;
    }
    export default function TabItem(props: TabItemProps): JSX.Element;
}

declare module '@theme/CodeBlock' {
    import type { ReactNode } from 'react';
    export interface CodeBlockProps {
        children: ReactNode;
        className?: string;
        language?: string;
        title?: string;
        showLineNumbers?: boolean;
        metastring?: string;
    }
    export default function CodeBlock(props: CodeBlockProps): JSX.Element;
}

declare module '@theme/SearchBar' {
    export default function SearchBar(): JSX.Element;
}

declare module '@theme/Footer/Copyright' {
    export interface Props {
        copyright: string;
    }
    export default function Copyright(props: Props): JSX.Element;
}

declare module '@theme/Layout' {
    import type { ReactNode } from 'react';
    export interface LayoutProps {
        children: ReactNode;
        title?: string;
        description?: string;
        noFooter?: boolean;
        wrapperClassName?: string;
    }
    export default function Layout(props: LayoutProps): JSX.Element;
}
