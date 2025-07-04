// src/hooks/useInterviewContext.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InitialInterviewContext } from '@/types';
import { 
    storeInterviewContext, 
    getStoredInterviewContext, 
    clearStoredInterviewContext,
    hasValidStoredContext,
    validateInterviewContext 
} from '@/lib/contextStorage';
import { logger } from '@/modules';

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

/**
 * Custom hook for managing interview context throughout the application
 * Provides a clean interface for storing, retrieving, and managing interview context
 * with automatic navigation and validation
 */
export const useInterviewContext = (): UseInterviewContextReturn => {
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
                logger.info(`📋 Loaded existing context: ${storedContext.targetRole} at ${storedContext.targetCompany}`);
            }
        };

        loadStoredContext();
    }, []);

    // Store context and update state
    const setContext = useCallback((newContext: InitialInterviewContext) => {
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
    }, []);

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