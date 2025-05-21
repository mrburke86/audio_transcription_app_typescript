// src/components/TranscriptionBox.tsx
"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

interface Message {
    content: string;
    type: "user" | "assistant" | "interim";
    timestamp: string;
}

interface TranscriptionBoxProps {
    id?: string;
    title: string;
    messages: Message[];
    variant: "live" | "saved";
    audioVisualizer?: React.ReactNode;
    streamedContent?: string;
    isStreamingComplete?: boolean; // Added prop
    className?: string;
}

// Custom type for the code component props
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({
    id,
    messages,
    streamedContent,
    isStreamingComplete, // Destructure the new prop
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isAtBottom =
            container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
            50;

        if (isAtBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, streamedContent]);

    const processedMessages = messages.reduce((acc: Message[], message) => {
        if (message.type === "user") {
            // If it's a user message and the previous message is an interim one, we remove that interim message.
            if (acc.length > 0 && acc[acc.length - 1].type === "interim") {
                acc.pop(); // Remove the interim message
            }
            acc.push(message); // Add the user message to the array
        } else if (message.type === "interim") {
            if (acc.length > 0 && acc[acc.length - 1].type === "interim") {
                acc[acc.length - 1] = message;
            } else {
                acc.push(message);
            }
        } else {
            acc.push(message);
        }
        return acc;
    }, []);

    const markdownComponents: Components = {
        h1: ({ node: _node, ...props }) => (
            <h1 className="text-2xl font-bold my-4" {...props} />
        ),
        h2: ({ node: _node, ...props }) => (
            <h2 className="text-xl font-semibold my-3" {...props} />
        ),
        h3: ({ node: _node, ...props }) => (
            <h3 className="text-lg font-medium my-2" {...props} />
        ),
        p: ({ node: _node, ...props }) => <p className="my-2" {...props} />,
        ul: ({ node: _node, ...props }) => (
            <ul className="list-disc list-inside my-2" {...props} />
        ),
        ol: ({ node: _node, ...props }) => (
            <ol className="list-decimal list-inside my-2" {...props} />
        ),
        li: ({ node: _node, ...props }) => <li className="ml-4" {...props} />,
        code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
                <pre className="bg-gray-800 rounded p-2 my-2">
                    <code
                        className={`${
                            match ? `language-${match[1]}` : ""
                        } text-white`}
                        {...props}
                    >
                        {children}
                    </code>
                </pre>
            ) : (
                <code
                    className="bg-gray-800 text-white px-1 py-0.5 rounded"
                    {...props}
                >
                    {children}
                </code>
            );
        },
    };

    return (
        <div
            id={id}
            className={cn(
                "relative flex flex-col h-full  rounded-lg overflow-hidden",
                className,
            )}
        >
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
                {processedMessages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.type} ${
                            message.type === "user"
                                ? "bg-[#e0e0e0] dark:bg-[#27262b] text-foreground"
                                : message.type === "assistant"
                                ? "bg-[#007bff] dark:bg-[#0a85ff] text-white"
                                : ""
                        } p-2 rounded-lg mb-2 break-words`}
                    >
                        {message.type === "assistant" ? (
                            <ReactMarkdown
                                components={markdownComponents}
                                skipHtml={true}
                                unwrapDisallowed={true}
                            >
                                {message.content}
                            </ReactMarkdown>
                        ) : (
                            <span>{message.content}</span>
                        )}
                    </div>
                ))}
                {streamedContent && !isStreamingComplete && (
                    <div className="message assistant bg-[#007bff] dark:bg-[#0a85ff] text-white p-2 rounded-lg mb-2 break-words">
                        <ReactMarkdown
                            components={markdownComponents}
                            skipHtml={true}
                            unwrapDisallowed={true}
                        >
                            {streamedContent}
                        </ReactMarkdown>
                    </div>
                )}
                {/* <div ref={messagesEndRef} /> */}
            </div>
        </div>
    );
};

export default TranscriptionBox;
