// src/components/ChatMessagesBox.tsx
'use client';
// This component manages saved user and assistant messages with appropriate styling.

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Message } from '@/types';
import { ScrollArea } from '@/components/ui';

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

export const ChatMessagesBox: React.FC<ChatMessagesBoxProps> = ({ id, messages, streamedContent, isStreamingComplete, className }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamedContent]);

    const markdownComponents: Components = {
        h1: ({ node: _node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
        h2: ({ node: _node, ...props }) => <h2 className="text-xl font-semibold my-3" {...props} />,
        h3: ({ node: _node, ...props }) => <h3 className="text-lg font-medium my-2" {...props} />,
        p: ({ node: _node, ...props }) => <p className="my-2" {...props} />,
        ul: ({ node: _node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
        ol: ({ node: _node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
        li: ({ node: _node, ...props }) => <li className="ml-4" {...props} />,
        code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
                <pre className="bg-gray-800 rounded p-2 my-2">
                    <code className={`${match ? `language-${match[1]}` : ''} text-white`} {...props}>
                        {children}
                    </code>
                </pre>
            ) : (
                <code className="bg-gray-800 text-white px-1 py-0.5 rounded" {...props}>
                    {children}
                </code>
            );
        },
    };

    return (
        <div id={id} className={cn('relative flex flex-col h-full rounded-lg overflow-hidden', className)}>
            <ScrollArea className="h-full w-full">
                <div className="p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] p-3 rounded-lg break-words ${
                                    message.type === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-foreground rounded-bl-sm'
                                }`}
                            >
                                {message.type === 'assistant' ? (
                                    <ReactMarkdown components={markdownComponents} skipHtml={true} unwrapDisallowed={true}>
                                        {message.content}
                                    </ReactMarkdown>
                                ) : (
                                    <span className="text-sm">{message.content}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Streaming Content */}
                    {streamedContent && !isStreamingComplete && (
                        <div className="flex w-full justify-start">
                            <div className="max-w-[80%] p-3 rounded-lg rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-foreground break-words">
                                <ReactMarkdown components={markdownComponents} skipHtml={true} unwrapDisallowed={true}>
                                    {streamedContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
        </div>
    );
};
