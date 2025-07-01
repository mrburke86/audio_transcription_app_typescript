// src/components/ChatMessagesBox.tsx
'use client';
// This component manages saved user and assistant messages with appropriate styling.

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
// import type { Components } from 'react-markdown';
import { Message } from '@/types';
import { ScrollArea } from '@/components/ui';
import { markdownComponents } from '@/components/markdownComponents';

interface ChatMessagesBoxProps {
    id?: string;
    title?: string;
    messages: Message[];
    streamedContent?: string;
    isStreamingComplete?: boolean;
    className?: string;
}

export const ChatMessagesBox: React.FC<ChatMessagesBoxProps> = ({ id, messages, streamedContent, isStreamingComplete, className }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamedContent]);

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
