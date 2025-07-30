// src/hooks/speech/useSpeechSession.ts - HIGH-LEVEL BUSINESS LOGIC
'use client';

import { logger } from '@/lib/Logger';
import { useBoundStore } from '@/stores/chatStore';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSpeechAPI } from './useSpeechAPI';

export interface SpeechSessionOptions {
    debounceDelay?: number;
    autoSubmit?: boolean;
    enableVisualization?: boolean;
}

export const useSpeechSession = (options: SpeechSessionOptions = {}) => {
    const { debounceDelay = 300, autoSubmit = false, enableVisualization = true } = options;

    // ✅ STORE ACCESS - Business logic layer
    const {
        // Speech state management
        recognitionStatus,
        speechErrorMessage,
        isVisualizationActive,
        interimTranscriptMessages,
        currentInterimTranscript,
        setRecognitionStatus,
        setSpeechError,
        setVisualizationActive,
        addInterimTranscriptMessage,
        updateCurrentInterimTranscript,
        clearInterimTranscripts,
        startSpeechSession,
        stopSpeechSession,
        resetSpeechState,
        getAllTranscriptionText,

        // Chat integration
        addUserMessage,
        generateResponse,
        conversationHistory,
    } = useBoundStore();

    // ✅ DEBOUNCED RESULT HANDLER - Business logic
    const handleRecognitionResult = useMemo(
        () =>
            debounce(
                (finalTranscript: string, interimTranscript: string) => {
                    React.startTransition(() => {
                        if (finalTranscript) {
                            addInterimTranscriptMessage({
                                content: finalTranscript.trim(),
                                type: 'interim',
                                timestamp: new Date().toISOString(),
                            });
                            logger.info(`📝 Final transcript added: "${finalTranscript.slice(0, 50)}..."`);
                        }

                        if (interimTranscript) {
                            updateCurrentInterimTranscript(interimTranscript.trim());
                        } else {
                            updateCurrentInterimTranscript('');
                        }
                    });
                },
                debounceDelay,
                { leading: false, trailing: true }
            ),
        [addInterimTranscriptMessage, updateCurrentInterimTranscript, debounceDelay]
    );

    // ✅ CLEANUP DEBOUNCED FUNCTION
    useEffect(() => {
        return () => {
            handleRecognitionResult.cancel();
        };
    }, [handleRecognitionResult]);

    // ✅ LOW-LEVEL API INTEGRATION
    const speechAPI = useSpeechAPI({
        onRecognitionStart: () => {
            setRecognitionStatus('active');
            if (enableVisualization) {
                setVisualizationActive(true);
            }
            startSpeechSession();
        },
        onRecognitionEnd: () => {
            setRecognitionStatus('inactive');
            setVisualizationActive(false);
            stopSpeechSession();
        },
        onRecognitionError: error => {
            setSpeechError(error);
            setRecognitionStatus('error');
            setVisualizationActive(false);
            stopSpeechSession();
        },
        onRecognitionResult: handleRecognitionResult,
    });

    // ✅ HIGH-LEVEL SESSION CONTROLS
    const startSession = useCallback(
        async (canvas?: HTMLCanvasElement) => {
            try {
                logger.info('🚀 Starting speech session (business layer)');

                if (enableVisualization && canvas) {
                    await speechAPI.startSpeechWithVisualization(canvas);
                } else {
                    await speechAPI.startSpeechRecognition();
                }
            } catch (error) {
                logger.error(`Failed to start speech session: ${(error as Error).message}`);
                setSpeechError((error as Error).message);
            }
        },
        [speechAPI, enableVisualization, setSpeechError]
    );

    const stopSession = useCallback(() => {
        logger.info('⏹️ Stopping speech session (business layer)');
        speechAPI.stopSpeechWithVisualization();
    }, [speechAPI]);

    const clearSession = useCallback(() => {
        logger.info('🧼 Clearing speech session (business layer)');
        resetSpeechState();
        speechAPI.clearError();
    }, [resetSpeechState, speechAPI]);

    // ✅ CHAT INTEGRATION
    const submitToChat = useCallback(async () => {
        const transcriptionText = getAllTranscriptionText();

        if (!transcriptionText.trim()) {
            logger.warning('🚫 No transcription content to submit');
            return false;
        }

        try {
            logger.info(`📤 Submitting transcription to chat: "${transcriptionText.slice(0, 50)}..."`);

            // Add user message to chat
            addUserMessage(transcriptionText);

            // Auto-generate response if enabled
            if (autoSubmit) {
                await generateResponse(transcriptionText);
            }

            // Clear transcriptions after successful submission
            clearInterimTranscripts();

            logger.info('✅ Transcription submission completed');
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit transcription';
            logger.error(`❌ Transcription submission failed: ${errorMessage}`);
            setSpeechError(errorMessage);
            return false;
        }
    }, [
        getAllTranscriptionText,
        addUserMessage,
        generateResponse,
        clearInterimTranscripts,
        autoSubmit,
        setSpeechError,
    ]);

    const submitAndRespond = useCallback(async () => {
        const success = await submitToChat();

        if (success && !autoSubmit) {
            // Manually trigger response generation
            const lastUserMessage = conversationHistory.filter(m => m.type === 'user').pop();
            if (lastUserMessage) {
                await generateResponse(lastUserMessage.content);
            }
        }

        return success;
    }, [submitToChat, autoSubmit, conversationHistory, generateResponse]);

    // ✅ COMPUTED STATE
    const isActivelyRecording = recognitionStatus === 'active';
    const hasTranscriptions = interimTranscriptMessages.length > 0 || currentInterimTranscript.trim().length > 0;
    const transcriptionText = getAllTranscriptionText();

    return {
        // ✅ STATE (from store)
        recognitionStatus,
        speechErrorMessage,
        isVisualizationActive,
        interimTranscriptMessages,
        currentInterimTranscript,

        // ✅ COMPUTED STATE
        isRecording: isActivelyRecording,
        hasTranscriptions,
        transcriptionText,

        // ✅ SESSION CONTROLS
        startSession,
        stopSession,
        clearSession,

        // ✅ CHAT INTEGRATION
        submitToChat,
        submitAndRespond,

        // ✅ CANVAS REF (from API layer)
        canvasRef: speechAPI.canvasRef,

        // ✅ INDIVIDUAL ACTIONS (for fine control)
        clearTranscriptions: clearInterimTranscripts,

        // ✅ LOW-LEVEL ACCESS (if needed)
        speechAPI,
    };
};
