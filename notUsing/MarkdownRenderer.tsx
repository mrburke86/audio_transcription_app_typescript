// // src/components/MarkdownRenderer.tsx
// import React from 'react';
// import ReactMarkdown, { Components } from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
// // import { Components } from "react-markdown/lib/ast-to-react";

// const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
//     return (
//         <ReactMarkdown
//             remarkPlugins={[remarkGfm]}
//             components={
//                 {
//                     h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 dark:text-gray-200">{children}</h1>,
//                     h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 dark:text-gray-200">{children}</h2>,
//                     h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 dark:text-gray-200">{children}</h3>,
//                     p: ({ children }) => <p className="text-base mb-4 dark:text-gray-300">{children}</p>,
//                     ul: ({ children }) => <ul className="list-disc list-inside mb-4 dark:text-gray-300">{children}</ul>,
//                     ol: ({ children }) => <ol className="list-decimal list-inside mb-4 dark:text-gray-300">{children}</ol>,
//                     li: ({ children }) => <li className="mb-1 dark:text-gray-300">{children}</li>,
//                     code: ({ inline, className, children }: { inline?: boolean; className?: string; children: React.ReactNode }) => {
//                         const match = /language-(\w+)/.exec(className || '');
//                         return !inline && match ? (
//                             <SyntaxHighlighter
//                                 id="SyntaxHighlighter"
//                                 style={codeStyle}
//                                 language={match[1]}
//                                 PreTag="div"
//                                 className="my-0 !mt-0 !mb-0" // Apply the custom class
//                             >
//                                 {String(children).replace(/\n$/, '')}
//                             </SyntaxHighlighter>
//                         ) : (
//                             <code className="bg-gray-200 text-sm rounded px-1 py-0.5 dark:bg-gray-700 dark:text-gray-300">{children}</code>
//                         );
//                     },
//                     blockquote: ({ children }) => (
//                         <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400">
//                             {children}
//                         </blockquote>
//                     ),
//                 } as Components
//             }
//         >
//             {content}
//         </ReactMarkdown>
//     );
// };

// export default MarkdownRenderer;
