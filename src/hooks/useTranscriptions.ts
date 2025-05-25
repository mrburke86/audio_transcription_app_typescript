// src/hooks/useTranscriptions.ts
import { useCallback, useState, useEffect } from 'react';
import { Message, InterimMessage } from '@/types/openai';
import { logger } from '@/modules/Logger';
// import { formatTimestamp } from '@/utils/helpers';

interface UseTranscriptionsProps {
    generateResponse: (message: string) => Promise<void>;
    streamedContent: string;
    isStreamingComplete: boolean;
}

export const useTranscriptions = ({ generateResponse, streamedContent, isStreamingComplete }: UseTranscriptionsProps) => {
    const [interimTranscriptions, setInterimTranscriptions] = useState<InterimMessage[]>([]);
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    // Handle the recognition result
    const handleRecognitionResult = useCallback(
        (finalTranscript: string, interimTranscript: string) => {
            if (finalTranscript) {
                setInterimTranscriptions(prev => [
                    ...prev,
                    {
                        content: finalTranscript.trim(),
                        role: 'interim',
                        // timestamp: formatTimestamp(new Date()),
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

        const userMessage: Message = {
            content: allTranscriptions,
            role: 'user',
        };

        setMessages(prev => [...prev, userMessage]);

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
        setMessages([]);
        logger.clearLogs();
    }, []);

    useEffect(() => {
        if (isStreamingComplete && streamedContent.trim()) {
            const assistantMessage: Message = {
                content: streamedContent,
                role: 'assistant',
            };
            setMessages(prev => [...prev, assistantMessage]);
        }
    }, [isStreamingComplete, streamedContent]);

    return {
        interimTranscriptions,
        currentInterimTranscript,
        messages,
        setMessages,
        handleMove,
        handleClear,
        handleRecognitionResult,
    };
};
