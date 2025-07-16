// src/hooks/useTranscriptions.ts
// FIXED: Stripped perf (measureAPICall, trackConversationGrowth, getConversationStats, statsInterval, console.log stats); removed streamedContent/isStreamingComplete (unused—discomfort noted); enhanced error logging with stack traces; clean deps/effects. Descriptive names unchanged.
'use client';

import { logger } from '@/lib/Logger';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/types';
import { formatTimestamp } from '@/utils/helpers';
import { debounce } from 'lodash';
import React, { useCallback } from 'react';

export const useTranscriptions = () => {
    // Store selectors/actions
    const interimTranscriptMessages = useChatStore(state => state.interimTranscriptMessages);
    const currentInterimTranscript = useChatStore(state => state.currentInterimTranscript);
    const userMessages = useChatStore(state => state.conversationHistory.filter(msg => msg.type === 'user'));
    const addInterimTranscriptMessage = useChatStore(state => state.addInterimTranscriptMessage);
    const updateCurrentInterimTranscript = useChatStore(state => state.updateCurrentInterimTranscript);
    const addMessage = useChatStore(state => state.addMessage);
    const clearInterimTranscripts = useChatStore(state => state.clearInterimTranscripts);
    const clearAllTranscripts = useChatStore(state => state.clearAllTranscripts);
    const generateResponse = useChatStore(state => state.generateResponse);

    // Handle recognition results
    const handleRecognitionResult = useCallback(
        debounce(
            (finalTranscript: string, interimTranscript: string) => {
                React.startTransition(() => {
                    if (finalTranscript) {
                        const message: Message = {
                            content: finalTranscript.trim(),
                            type: 'interim' as const,
                            timestamp: formatTimestamp(new Date()),
                        };

                        addInterimTranscriptMessage(message);
                    }

                    if (interimTranscript) {
                        const trimmedTranscript = interimTranscript.trim();
                        updateCurrentInterimTranscript(trimmedTranscript);
                    } else {
                        updateCurrentInterimTranscript('');
                    }
                });
            },
            300,
            { leading: false, trailing: true }
        ),
        [addInterimTranscriptMessage, updateCurrentInterimTranscript]
    );

    // Submit Transcripts
    const submitTranscripts = useCallback(async () => {
        const combinedTranscriptText = [...interimTranscriptMessages.map(msg => msg.content), currentInterimTranscript]
            .join(' ')
            .trim();

        if (combinedTranscriptText === '') return;

        const userMessage: Message = {
            content: combinedTranscriptText,
            type: 'user',
            timestamp: formatTimestamp(new Date()),
        };

        addMessage(userMessage);

        try {
            await generateResponse(combinedTranscriptText);
        } catch (error) {
            logger.error(`Error generating response: ${(error as Error).message}\nStack: ${(error as Error).stack}`);
        }

        clearInterimTranscripts();
    }, [interimTranscriptMessages, currentInterimTranscript, addMessage, generateResponse, clearInterimTranscripts]);

    // Clear transcripts
    const resetTranscripts = useCallback(() => {
        clearAllTranscripts();
        logger.clearSessionLogs();
    }, [clearAllTranscripts]);

    return {
        interimTranscriptMessages,
        currentInterimTranscript,
        userMessages,
        submitTranscripts,
        resetTranscripts,
        handleRecognitionResult,
    };
};
