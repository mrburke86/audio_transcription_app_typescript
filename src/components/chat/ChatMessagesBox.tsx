// src/components/ChatMessagesBox.tsx - Enhanced with scroll control

'use client';

import { cn } from '@/lib/utils';
import { logger } from '@/modules/Logger';
import { Message } from '@/types';
import React, { useEffect, useRef } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessagesBoxProps {
    id?: string;
    title?: string;
    messages: Message[];
    streamedContent?: string;
    isStreamingComplete?: boolean;
    className?: string;
    // enableAutoScroll?: boolean;
}

const ChatMessagesBox: React.FC<ChatMessagesBoxProps> = ({
    id,
    messages,
    streamedContent,
    isStreamingComplete,
    className,
    // enableAutoScroll = true,
}) => {
    // const messagesEndRef = useRef<HTMLDivElement>(null);
    // const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevMessageCountRef = useRef(messages.length);

    // ✅ ISSUE 2 FIX: Enhanced markdown components for proper rendering
    const markdownComponents: Components = {
        h1: ({ node: _node, ...props }) => <h1 className="text-3xl font-bold mb-4 dark:text-gray-200" {...props} />,
        h2: ({ node: _node, ...props }) => <h2 className="text-2xl font-bold mb-3 dark:text-gray-200" {...props} />,
        h3: ({ node: _node, ...props }) => <h3 className="text-xl font-semibold mb-2 dark:text-gray-200" {...props} />,
        p: ({ node: _node, ...props }) => <p className="text-base mb-4 dark:text-gray-300" {...props} />,
        ul: ({ node: _node, ...props }) => <ul className="list-disc list-inside mb-4 dark:text-gray-300" {...props} />,
        ol: ({ node: _node, ...props }) => <ol className="list-decimal list-inside mb-4 dark:text-gray-300" {...props} />,
        li: ({ node: _node, ...props }) => <li className="mb-1 dark:text-gray-300" {...props} />,
        blockquote: ({ node: _node, ...props }) => (
            <blockquote
                className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400 my-4"
                {...props}
            />
        ),
        code: ({ node: _node, ...props }) => (
            <code className="bg-gray-200 text-sm rounded px-1 py-0.5 dark:bg-gray-700 dark:text-gray-300" {...props} />
        ),
        pre: ({ node: _node, ...props }) => <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 my-2 overflow-x-auto" {...props} />,
        strong: ({ node: _node, ...props }) => <strong className="font-bold dark:text-gray-200" {...props} />,
        em: ({ node: _node, ...props }) => <em className="italic dark:text-gray-300" {...props} />,
        a: ({ node: _node, ...props }) => (
            <a className="text-blue-500 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300" {...props} />
        ),
    };

    // // Track user scroll behavior
    // const [isUserScrolled, setIsUserScrolled] = useState(false);
    // const [showScrollButton, setShowScrollButton] = useState(false);
    // const isScrollingProgrammatically = useRef(false);

    // // Check if user is near bottom of scroll area
    // const isNearBottom = useCallback(() => {
    //     if (!scrollContainerRef.current) return true;

    //     const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    //     const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    //     return distanceFromBottom < 100; // Within 100px of bottom
    // }, []);

    // // Handle user scroll events
    // const handleScroll = useCallback(() => {
    //     if (isScrollingProgrammatically.current) {
    //         return; // Ignore programmatic scrolls
    //     }

    //     const nearBottom = isNearBottom();
    //     setIsUserScrolled(!nearBottom);
    //     setShowScrollButton(!nearBottom);

    //     if (nearBottom) {
    //         logger.debug('📜 User scrolled near bottom - enabling auto-scroll');
    //     } else {
    //         logger.debug('📜 User scrolled up - disabling auto-scroll');
    //     }
    // }, [isNearBottom]);

    // // Smooth scroll to bottom function
    // const scrollToBottom = useCallback(
    //     (force = false) => {
    //         if (!enableAutoScroll && !force) {
    //             logger.debug('📜 Auto-scroll disabled, skipping scroll to bottom');
    //             return;
    //         }

    //         if (isUserScrolled && !force) {
    //             logger.debug('📜 User has scrolled up, skipping auto-scroll');
    //             return;
    //         }

    //         try {
    //             isScrollingProgrammatically.current = true;
    //             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    //             logger.debug('📜 Auto-scrolled to bottom of chat messages');

    //             // Reset flags after scroll completes
    //             setTimeout(() => {
    //                 isScrollingProgrammatically.current = false;
    //                 setIsUserScrolled(false);
    //                 setShowScrollButton(false);
    //             }, 500);
    //         } catch (error) {
    //             logger.error(`❌ Failed to scroll to bottom: ${error instanceof Error ? error.message : 'Unknown error'}`);
    //             isScrollingProgrammatically.current = false;
    //         }
    //     },
    //     [enableAutoScroll, isUserScrolled]
    // );

    // // Manual scroll to bottom (for button click)
    // const handleScrollToBottomClick = useCallback(() => {
    //     scrollToBottom(true); // Force scroll even if user has scrolled up
    // }, [scrollToBottom]);

    // // Use a ref to track messages and avoid dependency issues
    // const messagesRef = useRef(messages);

    // // Update ref whenever messages change (no effect needed)
    // messagesRef.current = messages;

    // // ✅ Component Initialization & Cleanup (No dependency warnings)
    // // Purpose: Log component lifecycle events and initial state
    // // Trigger: Only on mount/unmount and ID changes
    // useEffect(() => {
    //     logger.info(`💬 ChatMessagesBox component mounted (id: ${id || 'unnamed'})`);
    //     logger.debug(`📊 Initial message count: ${messagesRef.current.length}`);

    //     return () => {
    //         logger.info(`🧹 ChatMessagesBox component unmounting (id: ${id || 'unnamed'})`);
    //     };
    // }, [id]); // Clean dependency array

    // Component lifecycle logging
    useEffect(() => {
        logger.info(`💬 ChatMessagesBox component mounted (id: ${id || 'unnamed'})`);
        logger.debug(`📊 Initial message count: ${messages.length}`);

        return () => {
            logger.info(`🧹 ChatMessagesBox component unmounting (id: ${id || 'unnamed'})`);
        };
    }, [id, messages.length]);

    // Message count change detection
    useEffect(() => {
        const currentMessageCount = messages.length;
        const previousMessageCount = prevMessageCountRef.current;

        if (currentMessageCount > previousMessageCount) {
            logger.info(`📈 New messages added: ${previousMessageCount} → ${currentMessageCount}`);

            // Use ref to access current messages without dependency
            const newMessages = messages.slice(previousMessageCount);
            newMessages.forEach(message => {
                logger.debug(
                    `➕ New ${message.role} message: "${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}"`
                );
            });

            prevMessageCountRef.current = currentMessageCount;
        }
    }, [messages.length, messages]);

    // // Handle streaming completion (scroll to bottom when streaming finishes)
    // useEffect(() => {
    //     if (isStreamingComplete && (!isUserScrolled || isNearBottom())) {
    //         logger.info('✅ Message streaming completed - scrolling to bottom');
    //         setTimeout(() => scrollToBottom(), 100);
    //     }
    // }, [isStreamingComplete, scrollToBottom, isUserScrolled, isNearBottom]);

    // Streaming content logging
    useEffect(() => {
        if (streamedContent) {
            logger.debug(`📤 Streaming content update: ${streamedContent.length} characters`);
        }
    }, [streamedContent]);

    // // Your existing markdown components...
    // const markdownComponents: Components = {
    //     // ... (keep your existing markdown components unchanged)
    //     h1: ({ node: _node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
    //     h2: ({ node: _node, ...props }) => <h2 className="text-xl font-semibold my-3" {...props} />,
    //     h3: ({ node: _node, ...props }) => <h3 className="text-lg font-medium my-2" {...props} />,
    //     p: ({ node: _node, ...props }) => <p className="my-2" {...props} />,
    //     // ... rest of your components
    // };

    try {
        return (
            <div id={id} className={cn('relative flex flex-col h-full rounded-lg overflow-hidden', className)}>
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.role} ${
                                message.role === 'user'
                                    ? 'bg-[#e0e0e0] dark:bg-[#27262b] text-foreground'
                                    : 'bg-[#007bff] dark:bg-[#0a85ff] text-white text-base'
                            } p-2 rounded-lg mb-2 break-words`}
                        >
                            {message.role === 'assistant' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
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

                    {/* Streaming content */}
                    {streamedContent && !isStreamingComplete && (
                        <div className="message assistant bg-[#007bff] dark:bg-[#0a85ff] text-white p-2 rounded-lg mb-2 break-words">
                            {/* ✅ ISSUE 2 FIX: Added remarkGfm plugin for streaming content markdown */}
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                                skipHtml={true}
                                unwrapDisallowed={true}
                            >
                                {streamedContent}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        logger.error(`❌ Critical error rendering ChatMessagesBox: ${error}`);
        return (
            <div className="relative flex flex-col h-full rounded-lg overflow-hidden bg-red-50">
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
