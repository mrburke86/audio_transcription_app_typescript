// src/stores/slices/errorSlice.ts
'use client';

import { ClassifiedError, classifyError, reportError } from '@/lib/errorClassification';
import { logger } from '@/lib/Logger';
import { StateCreator } from 'zustand';

export interface ErrorSlice {
    // State
    errors: ClassifiedError[];
    lastError: ClassifiedError | null;
    errorCount: number;
    isErrorModalOpen: boolean;

    // Actions
    reportError: (error: Error, context?: any) => ClassifiedError;
    clearError: (errorId: string) => void;
    clearAllErrors: () => void;
    dismissLastError: () => void;
    setErrorModalOpen: (open: boolean) => void;

    // Selectors
    getErrorsByCategory: (category: string) => ClassifiedError[];
    hasActiveErrors: () => boolean;
    getCriticalErrors: () => ClassifiedError[];
}

export const createErrorSlice: StateCreator<ErrorSlice> = (set, get) => ({
    // ✅ INITIAL STATE
    errors: [],
    lastError: null,
    errorCount: 0,
    isErrorModalOpen: false,

    // ✅ REPORT ERROR
    reportError: (error: Error, context?: any) => {
        const classified = classifyError(error);

        // Add unique ID for tracking
        const errorWithId = {
            ...classified,
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            context,
        } as ClassifiedError & { id: string; timestamp: string; context?: any };

        logger.info(`🚨 Error reported: ${classified.category} - ${classified.userMessage}`);

        // Report to external service
        reportError(classified, context);

        set(state => ({
            errors: [...state.errors, errorWithId],
            lastError: errorWithId,
            errorCount: state.errorCount + 1,
        }));

        return classified;
    },

    // ✅ CLEAR ERROR
    clearError: (errorId: string) => {
        set(state => ({
            errors: state.errors.filter((e: any) => e.id !== errorId),
        }));
    },

    // ✅ CLEAR ALL ERRORS
    clearAllErrors: () => {
        logger.info('🧹 Clearing all errors');
        set({
            errors: [],
            lastError: null,
            errorCount: 0,
        });
    },

    // ✅ DISMISS LAST ERROR
    dismissLastError: () => {
        set({ lastError: null });
    },

    // ✅ ERROR MODAL CONTROL
    setErrorModalOpen: (open: boolean) => {
        set({ isErrorModalOpen: open });
    },

    // ✅ SELECTORS
    getErrorsByCategory: (category: string) => {
        return get().errors.filter(error => error.category === category);
    },

    hasActiveErrors: () => {
        return get().errors.length > 0;
    },

    getCriticalErrors: () => {
        return get().errors.filter(error => error.severity === 'critical' || error.severity === 'high');
    },
});
