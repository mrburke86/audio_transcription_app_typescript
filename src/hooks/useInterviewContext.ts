// src/hooks/useInterviewContext.ts - FIXED TYPES, REMOVED NULL HANDLING SINCE DEFAULTS ALWAYS RETURNED
'use client';

import {
    clearStoredInterviewContext,
    getStoredInterviewContext,
    storeInterviewContext,
    validateInterviewContext,
} from '@/lib/contextStorage';
import { logger } from '@/lib/Logger';
import { useChatStore } from '@/stores/chatStore';
import { InitialInterviewContext, UseInterviewContextReturn } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export const useInterviewContext = (): UseInterviewContextReturn => {
    const router = useRouter();
    const context = useChatStore(state => state.initialContext);
    const setInitialContext = useChatStore(state => state.setInitialContext);
    const resetToDefaultContext = useChatStore(state => state.resetToDefaultContext);
    const isLoading = useChatStore(state => state.isLoading);

    // ✅ Load stored context on mount - always returns InitialInterviewContext with defaults
    useEffect(() => {
        const storedContext = getStoredInterviewContext();
        setInitialContext(storedContext);
    }, [setInitialContext]);

    // ✅ Update context with validation
    const updateContext = useCallback(
        (newContext: InitialInterviewContext) => {
            if (!validateInterviewContext(newContext)) {
                const err = new Error('Invalid interview context provided');
                logger.error(`Cannot store invalid interview context: ${err.message}`);
                throw err;
            }

            const success = storeInterviewContext(newContext);
            if (success) {
                setInitialContext(newContext);
            } else {
                const err = new Error('Failed to store interview context');
                logger.error(`Failed to store context: ${err.message}`);
                throw err;
            }
        },
        [setInitialContext]
    );

    // ✅ Clear context (resets to defaults)
    const clearContext = useCallback(() => {
        clearStoredInterviewContext();
        resetToDefaultContext();
    }, [resetToDefaultContext]);

    // ✅ Refresh from storage
    const refreshContext = useCallback(() => {
        const storedContext = getStoredInterviewContext();
        setInitialContext(storedContext);
    }, [setInitialContext]);

    // ✅ NAVIGATION
    const navigateToChat = useCallback(() => {
        if (!validateInterviewContext(context)) {
            router.push('/capture-context');
            return;
        }
        router.push('/chat');
    }, [context, router]);

    const navigateToContextCapture = useCallback(() => {
        router.push('/capture-context');
    }, [router]);

    // ✅ Form field updates
    const updateField = useCallback(
        <K extends keyof InitialInterviewContext>(field: K, value: InitialInterviewContext[K]) => {
            const updated = { ...context, [field]: value };
            updateContext(updated);
        },
        [context, updateContext]
    );

    // ✅ Array toggling
    const toggleInArray = useCallback(
        <K extends keyof InitialInterviewContext>(field: K, value: string) => {
            const array = context[field] as string[];
            const updated = {
                ...context,
                [field]: array.includes(value) ? array.filter(item => item !== value) : [...array, value],
            };
            updateContext(updated);
        },
        [context, updateContext]
    );

    // ✅ Reset to defaults
    const resetToDefaults = useCallback(() => {
        clearStoredInterviewContext();
        resetToDefaultContext();
    }, [resetToDefaultContext]);

    // ✅ Validation
    const isContextValid = validateInterviewContext(context);

    return {
        context,
        isLoading,
        isContextValid,
        updateContext,
        updateField,
        toggleInArray,
        clearContext,
        refreshContext,
        resetToDefaults,
        navigateToChat,
        navigateToContextCapture,
    };
};
