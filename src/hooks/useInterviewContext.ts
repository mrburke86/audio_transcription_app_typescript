// src/hooks/useInterviewContext.ts - Updated: Migrated to use Zustand slices (contextSlice for core, uiSlice for navigation).
// Removed local state/logic; now proxies store selectors/actions. Deprecate hook long-term for direct store use.
'use client';

import { logger } from '@/lib/Logger';
// import {
//     clearStoredInterviewContext,
//     getStoredInterviewContext,
//     storeInterviewContext,
//     validateInterviewContext,
// } from '@/lib/contextStorage';
import { validateInterviewContext } from '@/lib/validateInterviewContext';
import { useBoundStore } from '@/stores/chatStore';
import { DEFAULT_INTERVIEW_CONTEXT, InitialInterviewContext } from '@/types';
import { useCallback } from 'react';

export const useInterviewContext = () => {
    /* ---------- selectors & actions ---------- */
    const context = useBoundStore(state => state.initialContext);
    const isContextValid = useBoundStore(state => state.isContextValid);
    const isLoading = useBoundStore(state => state.knowledgeLoading);
    const setInitialContext = useBoundStore(state => state.setInitialContext);
    const navigateToChat = useBoundStore(state => state.navigateToChat);
    const navigateToContextCapture = useBoundStore(state => state.navigateToContextCapture);

    /* ---------- mutations ---------- */
    // Update context in store and sessionStorage
    const updateContext = useCallback(
        (c: InitialInterviewContext) => {
            if (!validateInterviewContext(c)) return false;
            setInitialContext(c);
            return true;
        },
        [setInitialContext]
    );

    logger.debug('[CTX] ⚙️ Zustand context changed', context);

    const resetToDefaults = () => setInitialContext(DEFAULT_INTERVIEW_CONTEXT);

    return {
        context,
        isLoading,
        isContextValid,
        updateContext,
        resetToDefaults,
        navigateToChat,
        navigateToContextCapture,
    };
};
