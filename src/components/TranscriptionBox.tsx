// src/components/TranscriptionBox.tsx
"use client";
import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

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
}

// Custom type for the code component props
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({
    id,
    title,
    messages,
    variant,
    audioVisualizer,
    streamedContent,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamedContent]);

    const processedMessages = messages.reduce((acc: Message[], message) => {
        if (message.type === "user") {
            if (acc.length > 0 && acc[acc.length - 1].type === "interim") {
                acc.pop();
            }
            acc.push(message);
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
        h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold my-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold my-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium my-2" {...props} />
        ),
        p: ({ node, ...props }) => <p className="my-2" {...props} />,
        ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-2" {...props} />
        ),
        li: ({ node, ...props }) => <li className="ml-4" {...props} />,
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
            className="flex flex-col h-full bg-transcription-box rounded-lg overflow-hidden"
        >
            <div className="bg-gray-800 p-2">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                {audioVisualizer && variant === "live" && (
                    <div className="mt-2">{audioVisualizer}</div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {processedMessages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.type} ${
                            variant === "saved"
                                ? message.type === "user"
                                    ? "bg-saved-user-message"
                                    : message.type === "assistant"
                                    ? "bg-saved-assistant-message"
                                    : ""
                                : ""
                        }`}
                    >
                        {message.type === "assistant" ? (
                            <ReactMarkdown components={markdownComponents}>
                                {message.content}
                            </ReactMarkdown>
                        ) : (
                            message.content
                        )}
                    </div>
                ))}
                {streamedContent && (
                    <div className="message assistant bg-saved-assistant-message">
                        <ReactMarkdown components={markdownComponents}>
                            {streamedContent}
                        </ReactMarkdown>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default TranscriptionBox;
