// src/hooks/useSpeechErrorHandler.ts

import { useCallback, useRef } from 'react';
import { logger } from '@/modules/Logger';

export interface CustomSpeechError {
    code: string;
    message: string;
}

interface ErrorClassification {
    message: string;
    retryable: boolean;
    severity: 'low' | 'medium' | 'high';
}

interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
};

export const useSpeechErrorHandler = (onUserError: (error: CustomSpeechError) => void, retryCallback: () => void) => {
    const retryAttempts = useRef(0);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const classifyError = useCallback((errorCode: string): ErrorClassification => {
        const errorMap = {
            network: {
                message: 'Network issue. Please check your internet connection.',
                retryable: true,
                severity: 'medium' as const,
            },
            'not-allowed': {
                message: 'Microphone permission denied. Please allow access in browser settings.',
                retryable: false,
                severity: 'high' as const,
            },
            'audio-capture': {
                message: 'Audio capture failed. Check microphone connection.',
                retryable: true,
                severity: 'medium' as const,
            },
            'no-speech': {
                message: 'No speech detected. Please try speaking again.',
                retryable: true,
                severity: 'low' as const,
            },
        };

        return (
            errorMap[errorCode as keyof typeof errorMap] || {
                message: `Unknown speech recognition error: ${errorCode}`,
                retryable: false,
                severity: 'medium' as const,
            }
        );
    }, []);

    const scheduleRetry = useCallback(
        (errorCode: string, attempt: number) => {
            const { retryable } = classifyError(errorCode);

            if (!retryable || attempt >= DEFAULT_RETRY_CONFIG.maxRetries) {
                logger.info(`🛑 No retry scheduled for ${errorCode} (attempt ${attempt}/${DEFAULT_RETRY_CONFIG.maxRetries})`);
                return;
            }

            const baseDelay = DEFAULT_RETRY_CONFIG.baseDelay;
            const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), DEFAULT_RETRY_CONFIG.maxDelay);
            const jitter = Math.random() * 500;
            const delay = exponentialDelay + jitter;

            logger.info(`🔄 Scheduling retry ${attempt + 1}/${DEFAULT_RETRY_CONFIG.maxRetries} in ${Math.round(delay)}ms`);

            retryTimeoutRef.current = setTimeout(() => {
                logger.debug(`🚀 Executing retry ${attempt + 1}`);
                retryCallback();
            }, delay);
        },
        [classifyError, retryCallback]
    );

    const handleError = useCallback(
        (event: SpeechRecognitionErrorEvent) => {
            const errorCode = event.error;
            const errorInfo = classifyError(errorCode);
            const currentAttempt = retryAttempts.current;

            logger[errorInfo.severity === 'high' ? 'error' : 'warning'](`🎙️ Speech error [${errorCode}]: ${errorInfo.message}`);

            // Special handling for no-speech
            if (errorCode === 'no-speech') {
                scheduleRetry(errorCode, currentAttempt);
                retryAttempts.current = currentAttempt + 1;
                return; // Don't notify user for no-speech
            }

            // Notify user
            onUserError({
                code: errorCode,
                message: errorInfo.message,
            });

            // Schedule retry if appropriate
            if (errorInfo.retryable) {
                scheduleRetry(errorCode, currentAttempt);
                retryAttempts.current = currentAttempt + 1;
            }
        },
        [classifyError, scheduleRetry, onUserError]
    );

    const cleanup = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        retryAttempts.current = 0;
    }, []);

    return {
        handleError,
        cleanup,
        resetRetries: () => {
            retryAttempts.current = 0;
        },
    };
};
