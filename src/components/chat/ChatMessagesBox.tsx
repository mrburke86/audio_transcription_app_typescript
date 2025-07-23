// src\components\chat\ChatMessagesBox.tsx

'use client';
import { markdownComponents } from '@/components/markdownComponents';
import { cn } from '@/lib/utils';
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

const ChatMessagesBox: React.FC<ChatMessagesBoxProps> = ({
    id,
    messages,
    streamedContent,
    isStreamingComplete,
    className,
}) => {
    // Render Counter for diagnostics
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`🧮 [DIAG] ChatMessagesBox Component rendered ${renderCount.current} times`);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    // Check if user has scrolled up and show/hide scroll button
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
            setShowScrollButton(!isNearBottom && messages.length > 0);
        }
    };

    // ✅ REMOVED: Auto-scroll on message changes
    // Only show/hide scroll button based on scroll position
    useEffect(() => {
        handleScroll(); // Check initial scroll position
    }, [messages.length]);

    return (
        <div id={id} className={cn('relative flex flex-col h-full rounded-lg overflow-hidden bg-white', className)}>
            {/* ✅ FIXED: Scroll container with absolute height */}
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
                    {/* Empty state */}
                    {messages.length === 0 && !streamedContent && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <p className="text-lg mb-2">💬</p>
                                <p>No messages yet.</p>
                                <p className="text-sm">Start a conversation!</p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
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

                    {/* Bottom anchor (for manual scroll target) */}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* ✅ IMPROVED: Scroll to bottom button - only shows when scrolled up */}
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

            {/* Message count indicator */}
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
