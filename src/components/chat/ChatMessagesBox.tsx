// src/app/chat/_components/ChatMessagesBox.tsx
'use client';
import { markdownComponents } from '@/components/markdownComponents';
import { ScrollArea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import React, { memo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessagesBoxProps {
    id?: string;
    messages: Message[];
    streamedContent?: string;
    isStreamingComplete?: boolean;
    className?: string;
}

const ChatMessagesBox: React.FC<ChatMessagesBoxProps> = ({
    id,
    messages,
    streamedContent,
    isStreamingComplete,
    className,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ✅ SIMPLIFIED: Track streamed content without complex performance measuring
    useEffect(() => {
        if (streamedContent && !isStreamingComplete) {
            scrollToBottom();
        }
    }, [streamedContent, isStreamingComplete]);

    return (
        <div id={id} className={cn('relative flex flex-col h-full rounded-lg overflow-hidden', className)}>
            <ScrollArea className="h-full w-full">
                <div className="p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg break-words ${
                                    message.type === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-foreground rounded-bl-sm'
                                }`}
                            >
                                {message.type === 'assistant' ? (
                                    <ReactMarkdown
                                        components={markdownComponents}
                                        skipHtml={true}
                                        unwrapDisallowed={true}
                                    >
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

export const MemoizedChatMessagesBox = memo(ChatMessagesBox);
MemoizedChatMessagesBox.displayName = 'ChatMessagesBox';
