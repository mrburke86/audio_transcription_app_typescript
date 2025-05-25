// src/hooks/useSpeechRecognitionCore.ts

import { useCallback, useRef } from 'react';
import { logger } from '@/modules/Logger';

export interface SpeechRecognitionCoreProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (error: SpeechRecognitionErrorEvent) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

export const useSpeechRecognitionCore = ({ onStart, onEnd, onError, onResult }: SpeechRecognitionCoreProps) => {
    const recognition = useRef<SpeechRecognition | null>(null);
    const isActiveRef = useRef(false);
    const isInitializingRef = useRef(false);

    const checkBrowserSupport = useCallback(() => {
        const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
        const hasSpeechRecognition = 'SpeechRecognition' in window;
        return hasWebkitSpeechRecognition || hasSpeechRecognition;
    }, []);

    const initializeRecognition = useCallback(() => {
        if (recognition.current || isInitializingRef.current) {
            return recognition.current;
        }

        isInitializingRef.current = true;

        try {
            const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognitionConstructor();

            // Configure recognition
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.lang = 'en-US';
            recognition.current.maxAlternatives = 1;

            // Set up event handlers
            recognition.current.onstart = onStart;
            recognition.current.onend = onEnd;
            recognition.current.onerror = onError;

            recognition.current.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i][0];
                    const transcript = result.transcript;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                        const confidence = result.confidence || 0;
                        logger.debug(`🎯 Final: "${transcript}" (confidence: ${(confidence * 100).toFixed(0)}%)`);
                    } else {
                        interimTranscript += transcript;
                    }
                }

                onResult(finalTranscript, interimTranscript);
            };

            logger.info('🔧 Speech recognition initialized');
        } catch (error) {
            logger.error(`Init failed: ${(error as Error).message}`);
            throw error;
        } finally {
            isInitializingRef.current = false;
        }

        return recognition.current;
    }, [onStart, onEnd, onError, onResult]);

    const start = useCallback(async () => {
        if (!checkBrowserSupport()) {
            throw new Error('Speech recognition not supported');
        }

        if (isActiveRef.current || isInitializingRef.current) {
            logger.debug('🎙️ Speech recognition already active or initializing');
            return;
        }

        isActiveRef.current = true;

        try {
            const recognitionInstance = initializeRecognition();
            if (recognitionInstance) {
                recognitionInstance.start();
                logger.info('🚀 Speech recognition started');
            }
        } catch (error) {
            isActiveRef.current = false;
            throw error;
        }
    }, [checkBrowserSupport, initializeRecognition]);

    const stop = useCallback(() => {
        logger.info('🛑 Stopping speech recognition');
        isActiveRef.current = false;

        if (recognition.current) {
            try {
                recognition.current.stop();
                logger.debug('✅ Speech recognition stopped');
            } catch (error) {
                logger.error(`Stop error: ${(error as Error).message}`);
                throw error;
            }
        }
    }, []);

    return {
        start,
        stop,
        isActive: isActiveRef.current,
        isSupported: checkBrowserSupport(),
    };
};
