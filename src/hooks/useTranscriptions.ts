// src/hooks/useTranscriptions.ts
'use client';
import { logger } from '@/modules/Logger';
import { formatTimestamp } from '@/utils/helpers';
import { useCallback, useEffect, useState } from 'react';
import { Message } from '../types/Message';

interface UseTranscriptionsProps {
    generateResponse: any;
    streamedContent: string;
    isStreamingComplete: boolean;
    // ✅ NEW: Accept isolated transcription functions
    isolatedTranscriptions?: {
        updateInterimTranscript: (transcript: string) => void;
        addInterimTranscription: (message: any) => void;
        clearInterimTranscriptions: () => void;
    };
}

export const useTranscriptions = ({
    generateResponse,
    streamedContent,
    isStreamingComplete,
    isolatedTranscriptions,
}: UseTranscriptionsProps) => {
    const [interimTranscriptions, setInterimTranscriptions] = useState<Message[]>([]);
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');
    const [userMessages, setUserMessages] = useState<Message[]>([]);

    // Handle the recognition result
    const handleRecognitionResult = useCallback(
        (finalTranscript: string, interimTranscript: string) => {
            if (finalTranscript) {
                const message: Message = {
                    content: finalTranscript.trim(),
                    type: 'interim' as const, // ✅ FIXED: Cast as const to match MessageType
                    timestamp: formatTimestamp(new Date()),
                };

                // ✅ FIXED: Update both isolated and internal state
                if (isolatedTranscriptions) {
                    isolatedTranscriptions.addInterimTranscription(message);
                }
                setInterimTranscriptions((prev: Message[]) => [...prev, message]);
            }

            if (interimTranscript) {
                const trimmedTranscript = interimTranscript.trim();
                // ✅ FIXED: Update both isolated and internal state
                if (isolatedTranscriptions) {
                    isolatedTranscriptions.updateInterimTranscript(trimmedTranscript);
                }
                setCurrentInterimTranscript(trimmedTranscript);
            } else {
                // ✅ FIXED: Clear both isolated and internal state
                if (isolatedTranscriptions) {
                    isolatedTranscriptions.updateInterimTranscript('');
                }
                setCurrentInterimTranscript('');
            }
        },
        [isolatedTranscriptions] // ✅ FIXED: Update dependencies
    );

    const handleMove = useCallback(async () => {
        const allTranscriptions = [...interimTranscriptions.map(msg => msg.content), currentInterimTranscript]
            .join(' ')
            .trim();

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

        // ✅ FIXED: Clear both isolated and internal state
        if (isolatedTranscriptions) {
            isolatedTranscriptions.clearInterimTranscriptions();
        }
        setInterimTranscriptions([]);
        setCurrentInterimTranscript('');
    }, [interimTranscriptions, currentInterimTranscript, generateResponse, isolatedTranscriptions]); // ✅ FIXED: Add isolatedTranscriptions to deps

    const handleClear = useCallback(() => {
        // ✅ FIXED: Clear both isolated and internal state
        if (isolatedTranscriptions) {
            isolatedTranscriptions.clearInterimTranscriptions();
        }
        setInterimTranscriptions([]);
        setCurrentInterimTranscript('');
        setUserMessages([]);
        logger.clearSessionLogs();
    }, [isolatedTranscriptions]); // ✅ FIXED: Add isolatedTranscriptions to deps

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
