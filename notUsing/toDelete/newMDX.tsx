// import { highlight } from "sugar-high";
// import type { MDXComponents } from "mdx/types";
// import React from "react";

// // Define the Level type to represent heading levels
// type Level = 1 | 2 | 3 | 4 | 5 | 6;

// // Define props for the Code component
// // interface CodeProps {
// //     children: React.ReactNode; // Allow any valid React child node
// //     className?: string;
// //     [key: string]: unknown; // Using 'unknown' instead of 'any' for better type safety
// // }

// // Code component to handle syntax highlighting
// function Code({
//     children,
//     className = "",
//     ...props
// }: React.HTMLAttributes<HTMLElement>) {
//     // Ensure that children is a string before processing
//     const codeContent = typeof children === "string" ? children.trim() : "";
//     const highlightedCode = highlight(codeContent); // Highlight the code content
//     return (
//         <code
//             className={className}
//             dangerouslySetInnerHTML={{ __html: highlightedCode }}
//             {...props}
//         />
//     );
// }

// // Helper function to create heading components with className
// function createHeading(level: Level) {
//     const HeadingComponent = React.forwardRef<
//         HTMLHeadingElement,
//         React.HTMLAttributes<HTMLHeadingElement>
//     >(({ children, ...props }, ref) => {
//         return React.createElement(
//             `h${level}`,
//             {
//                 ref,
//                 className: `heading-${level} text-${
//                     level === 1 ? "4xl" : level === 2 ? "3xl" : "2xl"
//                 } font-${
//                     level === 1
//                         ? "extrabold"
//                         : level === 2
//                         ? "bold"
//                         : "semibold"
//                 } leading-tight my-${
//                     level === 1 ? "6" : level === 2 ? "5" : "4"
//                 } text-${
//                     level === 1
//                         ? "primary"
//                         : level === 2
//                         ? "secondary"
//                         : "tertiary"
//                 }-foreground dark:text-${
//                     level === 1
//                         ? "primary"
//                         : level === 2
//                         ? "secondary"
//                         : "tertiary"
//                 }-foreground`,
//                 ...props,
//             },
//             children,
//         );
//     });
//     HeadingComponent.displayName = `Heading${level}`;
//     return HeadingComponent;
// }
// // Define MDX components with custom styles
// export const mdxComponents: MDXComponents = {
//     h1: createHeading(1),
//     h2: createHeading(2),
//     h3: createHeading(3),
//     h4: createHeading(4),
//     h5: createHeading(5),
//     h6: createHeading(6),
//     code: Code,
//     // Add more components as needed
// };

// // Use custom MDX components
// export function useMDXComponents(components: MDXComponents): MDXComponents {
//     return {
//         ...mdxComponents,
//         ...components,
//     };
// }
