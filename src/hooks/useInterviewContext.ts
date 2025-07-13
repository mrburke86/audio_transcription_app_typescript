// src/hooks/useInterviewContext.ts
'use client';

import {
    clearStoredInterviewContext,
    getStoredInterviewContext,
    storeInterviewContext,
    validateInterviewContext,
} from '@/lib/contextStorage';
import { logger } from '@/modules';
import { InitialInterviewContext } from '@/types';
// REMOVE THIS LINE:
// import { useContextStorageMetrics } from '@/utils/performance/measurementHooks';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface UseInterviewContextReturn {
    context: InitialInterviewContext | null;
    isLoading: boolean;
    hasValidContext: boolean;
    setContext: (context: InitialInterviewContext) => void;
    clearContext: () => void;
    refreshContext: () => void;
    navigateToChat: () => void;
    navigateToContextCapture: () => void;
}

export const useInterviewContext = (): UseInterviewContextReturn => {
    // REMOVE THIS LINE:
    // const { measureStorageOperation } = useContextStorageMetrics();

    const router = useRouter();
    const [context, setContextState] = useState<InitialInterviewContext | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load context from storage on mount
    useEffect(() => {
        const loadStoredContext = () => {
            logger.debug('🔄 Loading interview context from storage...');
            const storedContext = getStoredInterviewContext();
            setContextState(storedContext);
            setIsLoading(false);

            if (storedContext) {
                logger.info(
                    `📋 Loaded existing context: ${storedContext.targetRole} at ${storedContext.targetCompany}`
                );
            }
        };

        loadStoredContext();
    }, []);

    // Store context and update state - SIMPLIFIED VERSION
    const setContext = useCallback(
        (newContext: InitialInterviewContext) => {
            logger.info('💾 Storing new interview context...');

            if (!validateInterviewContext(newContext)) {
                logger.error('❌ Cannot store invalid interview context');
                throw new Error('Invalid interview context provided');
            }

            const success = storeInterviewContext(newContext);
            if (success) {
                setContextState(newContext);
                logger.info(`✅ Context updated: ${newContext.targetRole} at ${newContext.targetCompany}`);
            } else {
                throw new Error('Failed to store interview context');
            }
        },
        [] // REMOVED measureStorageOperation dependency
    );

    // Clear context from storage and state
    const clearContext = useCallback(() => {
        logger.info('🧹 Clearing interview context...');
        clearStoredInterviewContext();
        setContextState(null);
    }, []);

    // Refresh context from storage (useful for cross-tab sync)
    const refreshContext = useCallback(() => {
        logger.debug('🔄 Refreshing context from storage...');
        const storedContext = getStoredInterviewContext();
        setContextState(storedContext);
    }, []);

    // Navigate to chat with context validation
    const navigateToChat = useCallback(() => {
        if (!context || !validateInterviewContext(context)) {
            logger.warning('⚠️ Cannot navigate to chat: Invalid or missing context');
            router.push('/capture-context');
            return;
        }

        logger.info('🚀 Navigating to chat with valid context');
        router.push('/chat');
    }, [context, router]);

    // Navigate to context capture page
    const navigateToContextCapture = useCallback(() => {
        logger.info('📝 Navigating to context capture page');
        router.push('/capture-context');
    }, [router]);

    // Computed value for context validity
    const hasValidContext = context !== null && validateInterviewContext(context);

    return {
        context,
        isLoading,
        hasValidContext,
        setContext,
        clearContext,
        refreshContext,
        navigateToChat,
        navigateToContextCapture,
    };
};
