// src/hooks/useTranscriptions.ts
import { useCallback, useState, useEffect } from 'react';
import { Message } from '../types/Message';
import { logger } from '@/modules/Logger';
import { formatTimestamp } from '@/utils/helpers';
import { useLLM } from '@/stores/hooks/useSelectors';

interface UseTranscriptionsProps {
    generateResponse: (message: string) => Promise<void>;
    // ✅ FIXED: Prefix unused parameters with underscore or remove if not needed
    _streamedContent?: string;
    _isStreamingComplete?: boolean;
}

// ✅ UPDATED: Enhanced transcriptions hook that integrates with Zustand store
export const useTranscriptions = ({
    generateResponse,
    _streamedContent,
    _isStreamingComplete,
}: UseTranscriptionsProps) => {
    // Local state for interim transcriptions (real-time speech recognition)
    const [interimTranscriptions, setInterimTranscriptions] = useState<Message[]>([]);
    const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');

    // ✅ NEW: Get conversation messages from Zustand store
    const { conversations } = useLLM();
    const mainConversation = conversations.get('main');
    const userMessages = mainConversation?.messages || [];

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

    // ✅ UPDATED: Enhanced move function that works with Zustand
    const handleMove = useCallback(async () => {
        const allTranscriptions = [...interimTranscriptions.map(msg => msg.content), currentInterimTranscript]
            .join(' ')
            .trim();

        if (allTranscriptions === '') {
            logger.warning('No transcriptions to move');
            return;
        }

        logger.info(`Moving transcriptions to conversation: "${allTranscriptions.substring(0, 100)}..."`);

        try {
            // ✅ NEW: Use Zustand store's generateResponse method
            await generateResponse(allTranscriptions);

            // Clear local transcription state after successful move
            setInterimTranscriptions([]);
            setCurrentInterimTranscript('');

            logger.info('Transcriptions moved successfully and response generated');
        } catch (error) {
            logger.error(`Error in handleMove: ${(error as Error).message}`);
            throw error; // Re-throw to let parent handle notifications
        }
    }, [interimTranscriptions, currentInterimTranscript, generateResponse]);

    // ✅ UPDATED: Enhanced clear function
    const handleClear = useCallback(() => {
        setInterimTranscriptions([]);
        setCurrentInterimTranscript('');
        logger.info('Transcriptions cleared');

        // Optionally clear conversation history as well
        // You could add a clearConversation call here if needed
    }, []);

    // ✅ NEW: Auto-save transcriptions to prevent data loss
    useEffect(() => {
        // Save transcriptions to localStorage as backup
        if (interimTranscriptions.length > 0 || currentInterimTranscript) {
            const backup = {
                interimTranscriptions,
                currentInterimTranscript,
                timestamp: Date.now(),
            };

            try {
                localStorage.setItem('transcription_backup', JSON.stringify(backup));
            } catch (error) {
                logger.warning('Could not save transcription backup:', error);
            }
        }
    }, [interimTranscriptions, currentInterimTranscript]);

    // ✅ NEW: Restore transcriptions on mount if available
    useEffect(() => {
        try {
            const backup = localStorage.getItem('transcription_backup');
            if (backup) {
                const parsed = JSON.parse(backup);

                // Only restore if recent (within last 30 minutes)
                if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                    setInterimTranscriptions(parsed.interimTranscriptions || []);
                    setCurrentInterimTranscript(parsed.currentInterimTranscript || '');
                    logger.info('Restored transcription backup');
                } else {
                    localStorage.removeItem('transcription_backup');
                }
            }
        } catch (error) {
            logger.warning('Could not restore transcription backup:', error);
            localStorage.removeItem('transcription_backup');
        }
    }, []);

    // ✅ NEW: Clean up backup when transcriptions are moved
    useEffect(() => {
        if (interimTranscriptions.length === 0 && !currentInterimTranscript) {
            localStorage.removeItem('transcription_backup');
        }
    }, [interimTranscriptions.length, currentInterimTranscript]);

    // ✅ FIXED: Get transcription statistics with proper variable scoping
    const getTranscriptionStats = useCallback(() => {
        const totalInterimChars = interimTranscriptions.reduce((sum, msg) => sum + msg.content.length, 0);
        const currentChars = currentInterimTranscript.length;
        const totalItems = interimTranscriptions.length + (currentInterimTranscript ? 1 : 0);
        const totalCharacters = totalInterimChars + currentChars;

        return {
            totalCharacters,
            totalItems,
            hasContent: totalItems > 0,
            isReady: totalCharacters > 10, // ✅ FIXED: Now properly references the local totalCharacters variable
        };
    }, [interimTranscriptions, currentInterimTranscript]);

    return {
        // ✅ UPDATED: Return conversation messages from store instead of local state
        userMessages,

        // Real-time transcription state (still local)
        interimTranscriptions,
        currentInterimTranscript,

        // Enhanced methods
        handleMove,
        handleClear,
        handleRecognitionResult,

        // ✅ NEW: Additional utilities
        getTranscriptionStats,

        // ✅ NEW: Computed properties for UI
        hasTranscriptions: interimTranscriptions.length > 0 || currentInterimTranscript.length > 0,
        isReadyToMove: getTranscriptionStats().isReady,
    };
};
