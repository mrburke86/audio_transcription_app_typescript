// src/hooks/speech/useBrowserSpeechRecognition.ts - PURE SPEECH RECOGNITION
'use client';

import { logger } from '@/lib/Logger';
import { useCallback, useRef } from 'react';

interface SpeechRecognitionCallbacks {
    onStart?: (() => void) | undefined;
    onEnd?: (() => void) | undefined;
    onError?: ((error: SpeechRecognitionErrorEvent) => void) | undefined;
    onResult?: ((finalTranscript: string, interimTranscript: string) => void) | undefined;
}

interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    autoRestart?: boolean;
    restartDelay?: number;
    maxRestarts?: number;
}

export const useBrowserSpeechRecognition = (
    callbacks: SpeechRecognitionCallbacks = {},
    options: SpeechRecognitionOptions = {}
) => {
    const {
        continuous = true,
        interimResults = true,
        autoRestart = true,
        restartDelay = 500,
        maxRestarts = 3,
    } = options;

    // Speech recognition refs
    const recognition = useRef<SpeechRecognition | null>(null);
    const shouldRestart = useRef(false);
    const isRestartingRef = useRef(false);
    const lastSpeechTime = useRef<number>(0);
    const restartCount = useRef<number>(0);
    const lastRestartTime = useRef<number>(0);

    // ✅ ERROR HANDLING
    const handleRecognitionError = useCallback((error: Error, context: string) => {
        logger.error(`Speech recognition ${context}: ${error.message}`);
    }, []);

    // ✅ RESTART LOGIC
    const attemptRestart = useCallback(
        (delay = restartDelay) => {
            if (!shouldRestart.current || isRestartingRef.current || !autoRestart) return;

            const now = Date.now();
            const silenceDuration = now - lastSpeechTime.current;
            const timeSinceLastRestart = now - lastRestartTime.current;

            // Rate limiting
            if (restartCount.current >= maxRestarts && timeSinceLastRestart < 60000) {
                setTimeout(() => {
                    restartCount.current = 0;
                }, 10000);
                return;
            }

            if (silenceDuration > 1000) {
                restartCount.current++;
                lastRestartTime.current = now;
                isRestartingRef.current = true;

                setTimeout(() => {
                    try {
                        recognition.current?.start();
                    } catch (error) {
                        isRestartingRef.current = false;
                        handleRecognitionError(error as Error, 'restart failed');
                    }
                }, delay);
            }
        },
        [handleRecognitionError, restartDelay, autoRestart, maxRestarts]
    );

    // ✅ START SPEECH RECOGNITION
    const startSpeechRecognition = useCallback(async () => {
        shouldRestart.current = true;
        lastSpeechTime.current = Date.now();

        if (!recognition.current) {
            recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.current.continuous = continuous;
            recognition.current.interimResults = interimResults;

            recognition.current.onstart = () => {
                callbacks.onStart?.();
                isRestartingRef.current = false;
                lastSpeechTime.current = Date.now();
            };

            recognition.current.onend = () => {
                callbacks.onEnd?.();
                attemptRestart();
            };

            recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                callbacks.onError?.(event);

                const delay = event.error === 'network' ? 2000 : restartDelay;

                try {
                    recognition.current?.stop();
                } catch (error) {
                    handleRecognitionError(error as Error, 'stop during error recovery');
                }

                attemptRestart(delay);
            };

            recognition.current.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                lastSpeechTime.current = Date.now();
                callbacks.onResult?.(finalTranscript, interimTranscript);
            };
        }

        if (!isRestartingRef.current) {
            isRestartingRef.current = true;

            setTimeout(() => {
                try {
                    recognition.current?.start();
                } catch (error) {
                    isRestartingRef.current = false;
                    handleRecognitionError(error as Error, 'initial start failed');
                }
            }, 100);
        }
    }, [callbacks, continuous, interimResults, attemptRestart, handleRecognitionError, restartDelay]);

    // ✅ STOP SPEECH RECOGNITION
    const stopSpeechRecognition = useCallback(() => {
        shouldRestart.current = false;
        isRestartingRef.current = false;

        if (recognition.current) {
            try {
                recognition.current.stop();
            } catch (error) {
                handleRecognitionError(error as Error, 'recognition stop');
            }
        }
    }, [handleRecognitionError]);

    return {
        startSpeechRecognition,
        stopSpeechRecognition,
    };
};
