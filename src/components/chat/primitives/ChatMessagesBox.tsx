// src/components/chat/primitives/ChatMessagesBox.tsx

'use client';
import { markdownComponents } from '@/components/markdownComponents';
import { cn } from '@/lib/utils';
import { useBoundStore } from '@/stores/chatStore';
import { Message } from '@/types';
import { ChevronDown } from 'lucide-react';
import React, { memo, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessagesBoxProps {
    id?: string;
    messages: Message[];
    streamedContent?: string;
    isStreamingComplete?: boolean;
    className?: string;
}

export const ChatMessagesBox: React.FC<ChatMessagesBoxProps> = ({ id, messages, className }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const { streamedContent, isStreamingComplete, moveClickTimestamp } = useBoundStore(); // MODIFIED: Get timestamp
    useEffect(() => {
        if (streamedContent && streamedContent.length > 0 && moveClickTimestamp > 0) {
            const firstChunkTime = Date.now();
            const latency = firstChunkTime - moveClickTimestamp;
            console.log(`⏱️ [TIMING] First chunk render latency: ${latency}ms`);
        }
    }, [streamedContent, moveClickTimestamp]);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom && messages.length > 0);
        }
    };

    useEffect(() => {
        handleScroll();
    }, [messages.length]);

    return (
        <div id={id} className={cn('relative flex flex-col h-full rounded-lg overflow-hidden bg-white', className)}>
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="absolute inset-0 overflow-y-auto overscroll-contain"
                style={{
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="p-4 space-y-4 min-h-full">
                    {messages.length === 0 && !streamedContent && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <p className="text-lg mb-2">💬</p>
                                <p>No messages yet.</p>
                                <p className="text-sm">Start a conversation!</p>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={message.id || index}
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

                    {streamedContent && !isStreamingComplete && (
                        <div className="flex w-full justify-start">
                            <div className="max-w-[80%] p-3 rounded-lg rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-foreground break-words">
                                <ReactMarkdown components={markdownComponents} skipHtml={true} unwrapDisallowed={true}>
                                    {streamedContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    title="Scroll to bottom"
                    aria-label="Scroll to bottom of chat"
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
            )}

            {messages.length > 0 && (
                <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-60">
                    {messages.length} messages
                </div>
            )}
        </div>
    );
};

export const MemoizedChatMessagesBox = memo(ChatMessagesBox);
MemoizedChatMessagesBox.displayName = 'ChatMessagesBox';
