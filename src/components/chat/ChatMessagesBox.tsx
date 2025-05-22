// src/components/ChatMessagesBox.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Message } from "@/types/Message";
import { logger } from "@/modules/Logger";

interface ChatMessagesBoxProps {
    id?: string;
    title?: string;
    messages: Message[];
    streamedContent?: string;
    isStreamingComplete?: boolean;
    className?: string;
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const ChatMessagesBox: React.FC<ChatMessagesBoxProps> = ({
    id,
    messages,
    streamedContent,
    isStreamingComplete,
    className,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessageCountRef = useRef(messages.length);

    const scrollToBottom = () => {
        try {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            logger.debug("📜 Auto-scrolled to bottom of chat messages");
        } catch (error) {
            logger.error(
                `❌ Failed to scroll to bottom: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    // Component initialization logging
    useEffect(() => {
        try {
            logger.info(
                `💬 ChatMessagesBox component mounted (id: ${id || "unnamed"})`,
            );
            logger.debug(`📊 Initial message count: ${messages.length}`);
        } catch (error) {
            logger.error(
                `❌ Error during ChatMessagesBox mount: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }

        return () => {
            try {
                logger.info(
                    `🧹 ChatMessagesBox component unmounting (id: ${
                        id || "unnamed"
                    })`,
                );
            } catch (error) {
                logger.error(
                    `❌ Error during ChatMessagesBox cleanup: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
            }
        };
    }, [messages, streamedContent, messages.length, id]);

    // Message changes logging and scrolling
    useEffect(() => {
        try {
            const currentMessageCount = messages.length;
            const previousMessageCount = prevMessageCountRef.current;

            if (currentMessageCount !== previousMessageCount) {
                logger.info(
                    `📈 Message count changed: ${previousMessageCount} → ${currentMessageCount}`,
                );

                // Log new messages
                if (currentMessageCount > previousMessageCount) {
                    const newMessages = messages.slice(previousMessageCount);
                    newMessages.forEach((message, _index) => {
                        logger.debug(
                            `➕ New ${
                                message.type
                            } message added: "${message.content.substring(
                                0,
                                50,
                            )}${message.content.length > 50 ? "..." : ""}"`,
                        );
                    });
                }

                prevMessageCountRef.current = currentMessageCount;
            }

            scrollToBottom();
        } catch (error) {
            logger.error(
                `❌ Error processing message changes: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }, [messages, streamedContent, messages.length]);

    // Streaming content logging
    useEffect(() => {
        if (streamedContent) {
            logger.debug(
                `📤 Streaming content update: ${streamedContent.length} characters`,
            );
        }

        if (isStreamingComplete) {
            logger.info("✅ Message streaming completed");
        }
    }, [streamedContent, isStreamingComplete]);

    const markdownComponents: Components = {
        h1: ({ node: _node, ...props }) => {
            try {
                return <h1 className="text-2xl font-bold my-4" {...props} />;
            } catch (error) {
                logger.error(
                    `❌ Error rendering h1 element: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return <div {...props} />;
            }
        },
        h2: ({ node: _node, ...props }) => {
            try {
                return <h2 className="text-xl font-semibold my-3" {...props} />;
            } catch (error) {
                logger.error(
                    `❌ Error rendering h2 element: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return <div {...props} />;
            }
        },
        h3: ({ node: _node, ...props }) => {
            try {
                return <h3 className="text-lg font-medium my-2" {...props} />;
            } catch (error) {
                logger.error(
                    `❌ Error rendering h3 element: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return <div {...props} />;
            }
        },
        p: ({ node: _node, ...props }) => {
            try {
                return <p className="my-2" {...props} />;
            } catch (error) {
                logger.error(
                    `❌ Error rendering paragraph: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return <div {...props} />;
            }
        },
        ul: ({ node: _node, ...props }) => {
            try {
                return <ul className="list-disc list-inside my-2" {...props} />;
            } catch (error) {
                logger.error(
                    `❌ Error rendering unordered list: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return <ul className="list-disc list-inside my-2" {...props} />;
            }
        },
        ol: ({ node: _node, ...props }) => {
            try {
                return (
                    <ol className="list-decimal list-inside my-2" {...props} />
                );
            } catch (error) {
                logger.error(
                    `❌ Error rendering ordered list: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return (
                    <ol className="list-decimal list-inside my-2" {...props} />
                );
            }
        },
        li: ({ node: _node, ...props }) => {
            try {
                return <li className="ml-4" {...props} />;
            } catch (error) {
                logger.error(
                    `❌ Error rendering list item: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return <li className="ml-4" {...props} />;
            }
        },
        code: ({ inline, className, children, ...props }: CodeProps) => {
            try {
                const match = /language-(\w+)/.exec(className || "");

                if (!inline) {
                    logger.debug(
                        `🔧 Rendering code block (language: ${
                            match?.[1] || "unknown"
                        })`,
                    );
                }

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
            } catch (error) {
                logger.error(
                    `❌ Error rendering code element: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                );
                return <span {...props}>{children}</span>;
            }
        },
    };

    try {
        return (
            <div
                id={id}
                className={cn(
                    "relative flex flex-col h-full rounded-lg overflow-hidden",
                    className,
                )}
            >
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((message, index) => {
                        try {
                            return (
                                <div
                                    key={index}
                                    className={`message ${message.type} ${
                                        message.type === "user"
                                            ? "bg-[#e0e0e0] dark:bg-[#27262b] text-foreground"
                                            : "bg-[#007bff] dark:bg-[#0a85ff] text-white text-base"
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
                            );
                        } catch (error) {
                            logger.error(
                                `❌ Error rendering message ${index}: ${
                                    error instanceof Error
                                        ? error.message
                                        : "Unknown error"
                                }`,
                            );
                            return (
                                <div
                                    key={index}
                                    className="message error bg-red-100 text-red-800 p-2 rounded-lg mb-2"
                                >
                                    Error displaying message
                                </div>
                            );
                        }
                    })}

                    {/* Streaming content */}
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
                    <div ref={messagesEndRef} />
                </div>
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering ChatMessagesBox: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div
                className={cn(
                    "relative flex flex-col h-full rounded-lg overflow-hidden bg-red-50",
                    className,
                )}
            >
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-red-600 text-center">
                        <p className="font-semibold">Chat display error</p>
                        <p className="text-sm">Unable to render messages</p>
                    </div>
                </div>
            </div>
        );
    }
};

export default ChatMessagesBox;
