// src/stores/slices/contextSlice.ts - UPDATED CONTEXT SLICE
// Eliminates validation duplication by using the centralized validation function from lib
// Removes the need for useInterviewContext hook proxy

import { logger } from '@/lib/Logger';
import { validateInterviewContext } from '@/lib/validateInterviewContext';
import { ContextSlice, DEFAULT_INTERVIEW_CONTEXT } from '@/types';
import { StateCreator } from 'zustand';

export const createContextSlice: StateCreator<ContextSlice> = (set, get) => ({
    initialContext: DEFAULT_INTERVIEW_CONTEXT,
    contextLoading: false,

    // ✅ CENTRALIZED VALIDATION using lib function (eliminates duplication)
    isContextValid: (() => {
        let lastContext: any = null;
        let lastResult = false;

        return () => {
            const ctx = get().initialContext;

            // ✅ CRITICAL: Only validate if context actually changed
            if (ctx === lastContext) {
                return lastResult;
            }

            lastContext = ctx;

            // ✅ USE CENTRALIZED VALIDATION from lib (eliminates custom validation logic)
            lastResult = validateInterviewContext(ctx);

            // ✅ SAFE LOGGING: Only on client, no excessive logging
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                console.log(`🔍 Context validation: ${lastResult ? 'VALID' : 'INVALID'}`, {
                    hasRole: !!ctx?.targetRole?.trim(),
                    hasCompany: !!ctx?.targetCompany?.trim(),
                    hasGoals: ctx?.goals?.length > 0,
                });
            }

            return lastResult;
        };
    })(),

    setInitialContext: context => {
        // ✅ CRITICAL: Prevent setting the same context
        const current = get().initialContext;
        if (current === context) return;

        // ✅ VALIDATE before setting
        if (!validateInterviewContext(context)) {
            logger.warning('[🧠 Context] Attempted to set invalid context', {
                hasRole: !!context?.targetRole?.trim(),
                hasCompany: !!context?.targetCompany?.trim(),
                hasGoals: context?.goals?.length > 0,
            });
            return;
        }

        logger.info('[🧠 Context] Setting valid context', {
            role: context.targetRole,
            company: context.targetCompany,
            goalCount: context.goals?.length || 0,
        });

        set({ initialContext: context, contextLoading: false });
    },

    resetToDefaultContext: () => {
        const current = get().initialContext;
        // ✅ CRITICAL: Prevent resetting to same context
        if (JSON.stringify(current) === JSON.stringify(DEFAULT_INTERVIEW_CONTEXT)) {
            logger.debug('[🔄 Context] Already at default context, skipping reset');
            return;
        }

        logger.info('[🔄 Context] Resetting to defaults');
        set({
            initialContext: { ...DEFAULT_INTERVIEW_CONTEXT },
            contextLoading: false,
        });
    },

    createNewContext: () => {
        const newContext = { ...DEFAULT_INTERVIEW_CONTEXT };
        logger.info('[🆕 Context] Creating new context');
        set({ initialContext: newContext, contextLoading: false });
        return newContext;
    },

    updateContextWithDefaults: updates => {
        const current = get().initialContext || DEFAULT_INTERVIEW_CONTEXT;
        const updated = { ...current, ...updates };

        // ✅ CRITICAL: Only update if actually different
        if (JSON.stringify(current) === JSON.stringify(updated)) {
            logger.debug('[🔄 Context] No changes detected, skipping update');
            return;
        }

        // ✅ VALIDATE the updated context
        if (!validateInterviewContext(updated)) {
            logger.warning('[🚫 Context] Update would create invalid context', {
                updates,
                hasRole: !!updated?.targetRole?.trim(),
                hasCompany: !!updated?.targetCompany?.trim(),
            });
            return;
        }

        logger.info('[🔄 Context] Updating context with defaults', {
            updateKeys: Object.keys(updates),
            role: updated.targetRole,
            company: updated.targetCompany,
        });

        set({ initialContext: updated, contextLoading: false });
    },

    setContextLoading: loading => {
        const current = get().contextLoading;
        // ✅ CRITICAL: Prevent setting same loading state
        if (current === loading) return;

        logger.debug(`[⏳ Context] Loading state: ${current} → ${loading}`);
        set({ contextLoading: loading });
    },

    // ✅ NEW: Direct context field updates with validation
    updateTargetRole: (role: string) => {
        const current = get().initialContext;
        const updated = { ...current, targetRole: role.trim() };

        if (validateInterviewContext(updated)) {
            logger.info(`[🎯 Context] Target role updated: "${role}"`);
            set({ initialContext: updated });
        } else {
            logger.warning(`[🚫 Context] Invalid role update: "${role}"`);
        }
    },

    updateTargetCompany: (company: string) => {
        const current = get().initialContext;
        const updated = { ...current, targetCompany: company.trim() };

        if (validateInterviewContext(updated)) {
            logger.info(`[🏢 Context] Target company updated: "${company}"`);
            set({ initialContext: updated });
        } else {
            logger.warning(`[🚫 Context] Invalid company update: "${company}"`);
        }
    },

    addGoal: (goal: string) => {
        const current = get().initialContext;
        const trimmedGoal = goal.trim();

        if (!trimmedGoal) {
            logger.warning('[🚫 Context] Cannot add empty goal');
            return;
        }

        const currentGoals = current.goals || [];
        if (currentGoals.includes(trimmedGoal)) {
            logger.warning(`[🚫 Context] Goal already exists: "${trimmedGoal}"`);
            return;
        }

        const updated = { ...current, goals: [...currentGoals, trimmedGoal] };
        logger.info(`[🎯 Context] Goal added: "${trimmedGoal}"`);
        set({ initialContext: updated });
    },

    removeGoal: (goalToRemove: string) => {
        const current = get().initialContext;
        const currentGoals = current.goals || [];
        const updatedGoals = currentGoals.filter(goal => goal !== goalToRemove);

        if (currentGoals.length === updatedGoals.length) {
            logger.warning(`[🚫 Context] Goal not found to remove: "${goalToRemove}"`);
            return;
        }

        const updated = { ...current, goals: updatedGoals };
        logger.info(`[🗑️ Context] Goal removed: "${goalToRemove}"`);
        set({ initialContext: updated });
    },
});
