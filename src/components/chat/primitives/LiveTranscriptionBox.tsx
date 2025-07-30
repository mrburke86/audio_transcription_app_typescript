// src/components/chat/primitives/LiveTranscriptionBox.tsx
'use client';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import React, { useEffect, useRef } from 'react';

interface LiveTranscriptionBoxProps {
    id?: string;
    interimTranscriptions: Message[];
    currentInterimTranscript: string;
    className?: string;
}

export const LiveTranscriptionBox: React.FC<LiveTranscriptionBoxProps> = ({
    id,
    interimTranscriptions,
    currentInterimTranscript,
    className,
}) => {
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`🧮 [DIAG] LiveTranscriptionBox rendered ${renderCount.current} times`);

    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [interimTranscriptions, currentInterimTranscript]);

    return (
        <div id={id} className={cn('relative flex flex-col h-full rounded-lg overflow-hidden', className)}>
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
                {interimTranscriptions.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.type} text-foreground p-2 rounded-lg mb-2 break-words`}
                    >
                        <span>{message.content}</span>
                    </div>
                ))}
                {currentInterimTranscript && (
                    <div className={`message interim text-foreground p-2 rounded-lg mb-2 break-words`}>
                        <span>{currentInterimTranscript}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
