// src/hooks/useTranscriptions.ts
"use client";
import { useCallback, useState, useEffect } from 'react';
import { Message } from '../types/Message';
import { logger } from '@/modules/Logger';
import { formatTimestamp } from '@/utils/helpers';

interface UseTranscriptionsProps {
    generateResponse: (message: string) => Promise<void>;
    streamedContent: string;
    isStreamingComplete: boolean;
}

export const useTranscriptions = ({ generateResponse, streamedContent, isStreamingComplete }: UseTranscriptionsProps) => {
    const [interimTranscriptions, setInterimTranscriptions] = useState<Message[]>([]);
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');
    const [userMessages, setUserMessages] = useState<Message[]>([]);

    // Handle the recognition result
    const handleRecognitionResult = useCallback(
        (finalTranscript: string, interimTranscript: string) => {
            if (finalTranscript) {
                setInterimTranscriptions((prev: Message[]) => [
                    ...prev,
                    {
                        content: finalTranscript.trim(),
                        type: 'interim',
                        timestamp: formatTimestamp(new Date()),
                    },
                ]);
            }
            if (interimTranscript) {
                setCurrentInterimTranscript(interimTranscript.trim());
            } else {
                setCurrentInterimTranscript('');
            }
        },
        [setInterimTranscriptions, setCurrentInterimTranscript]
    );

    const handleMove = useCallback(async () => {
        const allTranscriptions = [...interimTranscriptions.map(msg => msg.content), currentInterimTranscript].join(' ').trim();

        if (allTranscriptions === '') return;

        setUserMessages((prev: Message[]) => [
            ...prev,
            {
                content: allTranscriptions,
                type: 'user',
                timestamp: formatTimestamp(new Date()),
            },
        ]);

        try {
            await generateResponse(allTranscriptions);
        } catch (error) {
            logger.error(`Error generating response: ${(error as Error).message}`);
        }

        setInterimTranscriptions([]);
        setCurrentInterimTranscript('');
    }, [interimTranscriptions, currentInterimTranscript, generateResponse]);

    const handleClear = useCallback(() => {
        setInterimTranscriptions([]);
        setCurrentInterimTranscript('');
        setUserMessages([]);
        logger.clearLogs();
    }, []);

    useEffect(() => {
        if (isStreamingComplete && streamedContent.trim()) {
            setUserMessages((prev: Message[]) => [
                ...prev,
                {
                    content: streamedContent,
                    type: 'assistant',
                    timestamp: formatTimestamp(new Date()),
                },
            ]);
        }
    }, [isStreamingComplete, streamedContent]);

    return {
        interimTranscriptions,
        currentInterimTranscript,
        userMessages,
        setUserMessages,
        handleMove,
        handleClear,
        handleRecognitionResult,
    };
};
