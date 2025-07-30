// src/hooks/speech/useSpeechAPI.ts - FIX UNDEFINED CALLBACK ISSUE
'use client';

import { logger } from '@/lib/Logger';
import { useCallback, useRef, useState } from 'react';
import { useAudioVisualization } from './useAudioVisualization';
import { useBrowserSpeechRecognition } from './useBrowserSpeechRecognition';

export interface SpeechAPIState {
    isRecognitionActive: boolean;
    isVisualizationActive: boolean;
    error: string | null;
}

export interface SpeechAPICallbacks {
    onRecognitionStart?: () => void;
    onRecognitionEnd?: () => void;
    onRecognitionError?: (error: string) => void;
    onRecognitionResult?: (finalTranscript: string, interimTranscript: string) => void;
}

export const useSpeechAPI = (callbacks: SpeechAPICallbacks = {}) => {
    const [state, setState] = useState<SpeechAPIState>({
        isRecognitionActive: false,
        isVisualizationActive: false,
        error: null,
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ✅ FILTER OUT UNDEFINED CALLBACKS - Fix exactOptionalPropertyTypes issue
    const speechRecognitionCallbacks = {
        ...(callbacks.onRecognitionStart && {
            onStart: () => {
                logger.info('🎤 Speech recognition started (API layer)');
                setState(prev => ({ ...prev, isRecognitionActive: true, error: null }));
                // ✅ Additional null check for safety
                if (callbacks.onRecognitionStart) {
                    callbacks.onRecognitionStart();
                }
            },
        }),
        ...(callbacks.onRecognitionEnd && {
            onEnd: () => {
                logger.info('🎤 Speech recognition ended (API layer)');
                setState(prev => ({ ...prev, isRecognitionActive: false }));
                // ✅ Additional null check for safety
                if (callbacks.onRecognitionEnd) {
                    callbacks.onRecognitionEnd();
                }
            },
        }),
        ...(callbacks.onRecognitionError && {
            onError: (error: SpeechRecognitionErrorEvent) => {
                const errorMessage = error.message || 'Unknown speech recognition error';
                logger.error(`🚨 Speech recognition error (API layer): ${errorMessage}`);
                setState(prev => ({
                    ...prev,
                    isRecognitionActive: false,
                    error: errorMessage,
                }));
                // ✅ Additional null check for safety
                if (callbacks.onRecognitionError) {
                    callbacks.onRecognitionError(errorMessage);
                }
            },
        }),
        ...(callbacks.onRecognitionResult && {
            onResult: (finalTranscript: string, interimTranscript: string) => {
                // ✅ Additional null check for safety
                if (callbacks.onRecognitionResult) {
                    callbacks.onRecognitionResult(finalTranscript, interimTranscript);
                }
            },
        }),
    };

    // ✅ SEPARATED HOOKS
    const speechRecognition = useBrowserSpeechRecognition(speechRecognitionCallbacks);

    const audioVisualization = useAudioVisualization({
        fftSize: 128,
        smoothingTimeConstant: 0.8,
    });

    // ✅ COMBINED OPERATIONS
    const startSpeechWithVisualization = useCallback(
        async (canvas?: HTMLCanvasElement) => {
            const targetCanvas = canvas || canvasRef.current;

            try {
                // Start visualization first
                if (targetCanvas) {
                    await audioVisualization.startAudioVisualization(targetCanvas);
                    setState(prev => ({ ...prev, isVisualizationActive: true }));
                }

                // Then start speech recognition
                await speechRecognition.startSpeechRecognition();

                logger.info('✅ Speech recognition with visualization started');
            } catch (error) {
                logger.error('❌ Failed to start speech with visualization');
                setState(prev => ({ ...prev, error: (error as Error).message }));
                throw error;
            }
        },
        [audioVisualization, speechRecognition]
    );

    const stopSpeechWithVisualization = useCallback(() => {
        logger.info('⏹️ Stopping speech recognition with visualization');
        speechRecognition.stopSpeechRecognition();
        audioVisualization.stopAudioVisualization();
        setState(prev => ({ ...prev, isRecognitionActive: false, isVisualizationActive: false }));
    }, [speechRecognition, audioVisualization]);

    return {
        ...state,
        canvasRef,
        startSpeechRecognition: speechRecognition.startSpeechRecognition,
        stopSpeechRecognition: speechRecognition.stopSpeechRecognition,
        startAudioVisualization: audioVisualization.startAudioVisualization,
        stopAudioVisualization: audioVisualization.stopAudioVisualization,
        startSpeechWithVisualization,
        stopSpeechWithVisualization,
        clearError: () => setState(prev => ({ ...prev, error: null })),
    };
};
