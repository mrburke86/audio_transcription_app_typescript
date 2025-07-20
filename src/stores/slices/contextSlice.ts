// src/stores/slices/contextSlice.ts

import { logger } from '@/lib/Logger';
import { validateInterviewContext } from '@/lib/validateInterviewContext';
import { ContextSlice, DEFAULT_INTERVIEW_CONTEXT } from '@/types';
import { StateCreator } from 'zustand';

export const createContextSlice: StateCreator<ContextSlice> = (set, get) => ({
    initialContext: DEFAULT_INTERVIEW_CONTEXT,
    contextLoading: true,

    isContextValid: () => {
        const ctx = get().initialContext;

        const isValid =
            !!ctx.targetRole?.trim() &&
            !!ctx.targetCompany?.trim() &&
            !!ctx.interviewType &&
            ctx.goals.length > 0 &&
            ctx.emphasizedExperiences.length > 0 &&
            ctx.specificChallenges.length > 0 &&
            ctx.companyContext.length > 0 &&
            ctx.contextDepth > 0;

        if (!isValid) {
            logger.warning('[⚠️ Context] Validation failed — context incomplete or malformed:', ctx);
            console.trace('[🔍 Context] Validation stack trace (failed)');
        } else {
            logger.debug('[✅ Context] Validated successfully');
        }

        return isValid;
    },

    setInitialContext: context => {
        logger.info('[🧠 Context] Setting full context:', context);
        set({ initialContext: context, contextLoading: false });
    },

    resetToDefaultContext: () => {
        logger.info('[🔄 Context] Resetting to default context');
        set({
            initialContext: { ...DEFAULT_INTERVIEW_CONTEXT },
            contextLoading: false,
        });
    },

    createNewContext: () => {
        const newContext = { ...DEFAULT_INTERVIEW_CONTEXT };
        logger.info('[➕ Context] Creating new context from defaults');
        set({ initialContext: newContext, contextLoading: false });
        return newContext;
    },

    updateContextWithDefaults: updates => {
        const current = get().initialContext || DEFAULT_INTERVIEW_CONTEXT;
        const updated = { ...current, ...updates };

        logger.info('[✏️ Context] Updating context with diff:', {
            before: current,
            after: updated,
            patch: updates,
        });

        try {
            const isValid = validateInterviewContext(updated);
            if (!isValid) {
                logger.error('[❌ Context] Update failed validation — context is invalid:', updated);
                console.trace('[🔍 Context] Validation failed stack trace');
            } else {
                logger.debug('[✅ Context] Update passed validation');
            }
        } catch (err) {
            logger.error('[🚨 Context] Validation threw an error:', err);
        }

        set({ initialContext: updated, contextLoading: false });
    },

    setContextLoading: loading => {
        logger.debug('[💬 Context] Toggling contextLoading:', loading);
        set({ contextLoading: loading });
    },
});
