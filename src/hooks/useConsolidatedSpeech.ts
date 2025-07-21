// src/hooks/useConsolidatedSpeech.ts - SINGLE SPEECH HOOK
// Replaces: useSpeechManager, useAudioVisualization, useTranscriptions
// Combines: Speech recognition, audio visualization, transcription management, and AI integration
// Direct Zustand integration eliminates the need for multiple hook layers

'use client';

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { logger } from '@/lib/Logger';
import { useBoundStore } from '@/stores/chatStore';
import { debounce } from 'lodash';
import React, { useCallback, useRef } from 'react';

export const useConsolidatedSpeech = () => {
    // ✅ ZUSTAND STATE - All speech-related state in one place
    const {
        // Consolidated Speech slice
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
        isRecording,
        hasTranscriptions,
        getAllTranscriptionText,

        // Consolidated Chat slice
        addUserMessage,

        // LLM slice
        generateResponse,
    } = useBoundStore();

    // ✅ CANVAS REF for audio visualization
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ✅ DEBOUNCED SPEECH RESULT HANDLER
    const handleRecognitionResult = useCallback(
        debounce(
            (finalTranscript: string, interimTranscript: string) => {
                React.startTransition(() => {
                    if (finalTranscript) {
                        addInterimTranscriptMessage({
                            content: finalTranscript.trim(),
                            type: 'interim',
                            timestamp: new Date().toISOString(),
                        });
                    }

                    if (interimTranscript) {
                        updateCurrentInterimTranscript(interimTranscript.trim());
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

    // ✅ CORE SPEECH RECOGNITION (browser APIs only)
    const speechRecognition = useSpeechRecognition({
        onStart: () => {
            logger.info('🎤 Speech recognition started');
            setRecognitionStatus('active');
        },
        onEnd: () => {
            logger.info('🎤 Speech recognition ended');
            setRecognitionStatus('inactive');
        },
        onError: error => {
            logger.error(`🚨 Speech recognition error: ${error.message}`);
            logger.error(
                '🚨 Speech recognition error (full object):',
                JSON.stringify(error, Object.getOwnPropertyNames(error))
            );

            setSpeechError(error.message || 'Unknown error');
        },
        onResult: handleRecognitionResult,
    });

    // ✅ HIGH-LEVEL SPEECH ACTIONS
    const startSpeechWithVisualization = useCallback(
        async (canvas?: HTMLCanvasElement) => {
            try {
                logger.info('🚀 Starting speech session with visualization');

                // Start Zustand session tracking
                startSpeechSession();

                // Start audio visualization if canvas provided
                const targetCanvas = canvas || canvasRef.current;
                if (targetCanvas) {
                    await speechRecognition.startAudioVisualization(targetCanvas);
                    setVisualizationActive(true);
                }

                // Start speech recognition
                await speechRecognition.startSpeechRecognition();
            } catch (error) {
                logger.error(`Failed to start speech session: ${(error as Error).message}`);
                setSpeechError((error as Error).message);
                stopSpeechSession(); // Reset state on failure
            }
        },
        [speechRecognition, startSpeechSession, setVisualizationActive, setSpeechError, stopSpeechSession]
    );

    const stopSpeechWithVisualization = useCallback(() => {
        logger.info('⏹️ Stopping speech session');

        // Stop speech recognition
        speechRecognition.stopSpeechRecognition();

        // Update Zustand state
        stopSpeechSession();
    }, [speechRecognition, stopSpeechSession]);

    // ✅ TRANSCRIPTION SUBMISSION (Speech → Chat → AI)
    const submitTranscriptionToChat = useCallback(async () => {
        const combinedText = getAllTranscriptionText();

        if (!combinedText) {
            logger.warning('🚫 No transcription content to submit');
            return;
        }

        try {
            logger.info(`📤 Submitting transcription to chat: "${combinedText.slice(0, 50)}..."`);

            // Add user message to chat
            addUserMessage(combinedText);

            // Generate AI response
            await generateResponse(combinedText);

            // Clear transcriptions after successful submission
            clearInterimTranscripts();

            logger.info('✅ Transcription submission completed');
        } catch (error) {
            logger.error(`❌ Transcription submission failed: ${(error as Error).message}`);
            setSpeechError('Failed to process transcription');
        }
    }, [getAllTranscriptionText, addUserMessage, generateResponse, clearInterimTranscripts, setSpeechError]);

    // ✅ CONVENIENCE ACTIONS
    const clearAll = useCallback(() => {
        logger.info('🧼 Clearing all speech data');
        resetSpeechState();
    }, [resetSpeechState]);

    const startRecording = useCallback(async () => {
        await startSpeechWithVisualization();
    }, [startSpeechWithVisualization]);

    const stopRecording = useCallback(() => {
        stopSpeechWithVisualization();
    }, [stopSpeechWithVisualization]);

    // ✅ COMPUTED STATE (derived from Zustand)
    const isActivelyRecording = isRecording();
    const hasAnyTranscriptions = hasTranscriptions();
    const allTranscriptionText = getAllTranscriptionText();

    return {
        // ✅ STATE
        recognitionStatus,
        speechErrorMessage,
        isVisualizationActive,
        interimTranscriptMessages,
        currentInterimTranscript,
        isRecording: isActivelyRecording,
        hasTranscriptions: hasAnyTranscriptions,
        transcriptionText: allTranscriptionText,

        // ✅ BASIC ACTIONS
        startRecording,
        stopRecording,
        clearTranscriptions: clearInterimTranscripts,
        clearAll,

        // ✅ ADVANCED ACTIONS
        startSpeechWithVisualization,
        stopSpeechWithVisualization,
        submitTranscriptionToChat,

        // ✅ CANVAS REF (for components that need direct canvas access)
        canvasRef,

        // ✅ LOW-LEVEL ACCESS (if needed for advanced use cases)
        speechRecognition,

        // ✅ CONVENIENCE ALIASES (backward compatibility)
        start: startRecording,
        stop: stopRecording,
        submit: submitTranscriptionToChat,
        clear: clearInterimTranscripts,
        reset: clearAll,
    };
};
