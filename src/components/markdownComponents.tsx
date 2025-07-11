// src\components\markdownComponents.tsx
import { lazy } from 'react';
import type { Components } from 'react-markdown';
import { tomorrow as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SyntaxHighlighter = lazy(() =>
    import('react-syntax-highlighter').then(module => ({
        default: module.Prism,
    }))
);

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const markdownComponents: Components = {
    h1: ({ node: _node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: ({ node: _node, ...props }) => <h2 className="text-xl font-semibold my-3" {...props} />,
    h3: ({ node: _node, ...props }) => <h3 className="text-lg font-medium my-2" {...props} />,
    p: ({ node: _node, ...props }) => <p className="my-2" {...props} />,
    ul: ({ node: _node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
    ol: ({ node: _node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
    li: ({ node: _node, ...props }) => <li className="ml-4" {...props} />,
    code: ({ inline, className, children }: CodeProps) => {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
            <SyntaxHighlighter
                id="SyntaxHighlighter"
                style={codeStyle}
                language={match[1]}
                PreTag="div"
                className="my-0 !mt-0 !mb-0" // Apply the custom class
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        ) : (
            <code className="bg-gray-200 text-sm rounded px-1 py-0.5 dark:bg-gray-700 dark:text-gray-300">
                {children}
            </code>
        );
    },
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400">
            {children}
        </blockquote>
    ),
};
