// src/hooks/useSpeechManager.ts
import { useSpeechRecognition } from '@/hooks';
import { logger } from '@/lib/Logger'; // ✅ FIXED: Correct path
import { CustomSpeechError, RecognitionStatus } from '@/types'; // ✅ FIXED: Import from types
import { useCallback, useRef, useState } from 'react';

const SPEECH_ERROR_MESSAGES = {
    network: 'Network error. Please check your internet connection.',
    'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
    'service-not-allowed': 'Speech recognition service not allowed. Please check your browser settings.',
    'no-speech': '',
    'audio-capture': 'Audio capture failed. Please check your microphone.',
    aborted: 'Speech recognition was aborted.',
    'language-not-supported': 'Language not supported. Please try a different language.',
    'bad-grammar': 'Grammar configuration issue. Please contact support.',
} as const;

export const useSpeechManager = (
    handleRecognitionResult: (finalTranscript: string, interimTranscript: string) => void
) => {
    // ✅ Isolated speech state - only speech-related components re-render
    const [recognitionStatus, setRecognitionStatus] = useState<RecognitionStatus>('inactive');
    const [speechErrorMessage, setSpeechErrorMessage] = useState<string | null>(null);

    // ✅ Debounce error messages to prevent spam re-renders
    const errorTimeoutRef = useRef<NodeJS.Timeout>();

    const getUserFriendlyError = useCallback((errorCode: string): string => {
        return (
            SPEECH_ERROR_MESSAGES[errorCode as keyof typeof SPEECH_ERROR_MESSAGES] ||
            'An unexpected error occurred with speech recognition.'
        );
    }, []);

    const handleRecognitionStart = useCallback(() => {
        logger.info('Speech recognition started');
        setRecognitionStatus('active');
        setSpeechErrorMessage(null);

        // Clear any pending error timeout
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
    }, []);

    const handleRecognitionEnd = useCallback(() => {
        logger.info('Speech recognition ended');
        setRecognitionStatus('inactive');
    }, []);

    const handleRecognitionError = useCallback(
        (speechError: SpeechRecognitionErrorEvent | CustomSpeechError) => {
            let errorCode: string;
            let detailedMessage: string;

            if ('error' in speechError) {
                errorCode = speechError.error;
                detailedMessage = getUserFriendlyError(speechError.error);
            } else {
                errorCode = speechError.code;
                detailedMessage = speechError.message;
            }

            if (errorCode === 'no-speech') {
                logger.debug(`Speech timeout: no speech detected`);
                return;
            }

            logger.error(`Speech recognition error: ${errorCode} - ${detailedMessage}`);

            // ✅ Debounce error state updates to prevent cascade
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }

            errorTimeoutRef.current = setTimeout(() => {
                setRecognitionStatus('error');
                setSpeechErrorMessage(detailedMessage);
            }, 100);
        },
        [getUserFriendlyError]
    );

    // ✅ FIXED: Use correct property names from useSpeechRecognition return type
    const { startSpeechRecognition, stopSpeechRecognition, startAudioVisualization } = useSpeechRecognition({
        onStart: handleRecognitionStart,
        onEnd: handleRecognitionEnd,
        onError: handleRecognitionError,
        onResult: handleRecognitionResult,
    });

    return {
        recognitionStatus,
        speechErrorMessage,
        start: startSpeechRecognition, // ✅ FIXED: Map to expected property name
        stop: stopSpeechRecognition, // ✅ FIXED: Map to expected property name
        startAudioVisualization,
    };
};
