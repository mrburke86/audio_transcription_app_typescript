// src/hooks/useInterviewContext.ts
// FIXED: Stripped excessive descriptive logging (debug/info/emojis); added stack traces to errors; clean deps/effects.
'use client';

import {
    clearStoredInterviewContext,
    getStoredInterviewContext,
    storeInterviewContext,
    validateInterviewContext,
} from '@/lib/contextStorage';
import { logger } from '@/modules';
import { useChatStore } from '@/stores/chatStore';
import { InitialInterviewContext } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface UseInterviewContextReturn {
    initialContext: InitialInterviewContext | null;
    isLoading: boolean;
    isContextValid: boolean;
    updateInitialContext: (context: InitialInterviewContext) => void;
    clearContext: () => void;
    refreshContext: () => void;
    navigateToChat: () => void;
    navigateToContextCapture: () => void;
}

export const useInterviewContext = (): UseInterviewContextReturn => {
    const router = useRouter();
    const initialContext = useChatStore(state => state.initialContext);
    const setInitialContext = useChatStore(state => state.setInitialContext);
    const isLoading = useChatStore(state => state.isLoading);

    useEffect(() => {
        const loadStoredContext = () => {
            const storedContext = getStoredInterviewContext();
            setInitialContext(storedContext);
        };

        loadStoredContext();
    }, []);

    const updateInitialContext = useCallback((newContext: InitialInterviewContext) => {
        if (!validateInterviewContext(newContext)) {
            const err = new Error('Invalid interview context provided');
            logger.error(`Cannot store invalid interview context: ${err.message}\nStack: ${err.stack}`);
            throw err;
        }

        const success = storeInterviewContext(newContext);
        if (success) {
            setInitialContext(newContext);
        } else {
            const err = new Error('Failed to store interview context');
            logger.error(`${err.message}\nStack: ${err.stack}`);
            throw err;
        }
    }, []);

    const clearContext = useCallback(() => {
        clearStoredInterviewContext();
        setInitialContext(null);
    }, []);

    const refreshContext = useCallback(() => {
        const storedContext = getStoredInterviewContext();
        setInitialContext(storedContext);
    }, []);

    const navigateToChat = useCallback(() => {
        if (!initialContext || !validateInterviewContext(initialContext)) {
            router.push('/capture-context');
            return;
        }

        router.push('/chat');
    }, [initialContext, router]);

    const navigateToContextCapture = useCallback(() => {
        router.push('/capture-context');
    }, [router]);

    const isContextValid = initialContext !== null && validateInterviewContext(initialContext);

    return {
        initialContext,
        isLoading,
        isContextValid,
        updateInitialContext,
        clearContext,
        refreshContext,
        navigateToChat,
        navigateToContextCapture,
    };
};
