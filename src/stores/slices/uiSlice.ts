// src/stores/slices/uiSlice.ts
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { logger } from '@/modules/Logger';
import { AppState, UISlice, NotificationEntry } from '@/types/store';

const SLICE = 'UISlice';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
    // ✅ CLARIFIED: Global UI state - affects entire application
    theme: 'light',

    // ✅ CLARIFIED: App-level modals only (domain-specific modals stay in their slices)
    globalModals: {}, // ⚠️ RENAMED: from 'modals' to 'globalModals' for clarity

    // ✅ CLARIFIED: App-level notifications
    notifications: [],

    // ✅ CLARIFIED: Global loading overlay for app-level operations only
    globalLoading: {
        // ⚠️ MODIFIED: More specific structure
        isActive: false,
        message: undefined,
        source: undefined, // ✅ ADDED: Track which feature triggered global loading
    },

    // ✅ CLARIFIED: Global UI errors (not domain-specific errors)
    globalError: null, // ⚠️ RENAMED: from 'uiError' to 'globalError'

    /* ------------------------------------------------------------------ *
     * 🎨 THEME MANAGEMENT
     * ------------------------------------------------------------------ */
    setTheme: theme => {
        try {
            logger.info(`[${SLICE}] setTheme → ${theme}`);
            set({ globalError: null }); // ⚠️ MODIFIED: Use new name

            if (!theme || !['light', 'dark'].includes(theme)) {
                throw new Error(`Invalid theme value: ${theme}. Must be 'light' or 'dark'.`);
            }

            set({ theme });

            if (typeof document !== 'undefined') {
                try {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('app-theme', theme);
                    }
                } catch (domError) {
                    logger.warning(`[${SLICE}] DOM/localStorage operation failed during theme change:`, domError);
                }
            }

            logger.info(`[${SLICE}] ✅ Theme successfully changed to ${theme}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to change theme';
            logger.error(`[${SLICE}] ❌ Theme change failed: ${errorMessage}`, error);
            set({ globalError: errorMessage }); // ⚠️ MODIFIED: Use new name
        }
    },

    /* ------------------------------------------------------------------ *
     * 🔔 NOTIFICATION SYSTEM (App-level only)
     * ------------------------------------------------------------------ */
    addNotification: ({ type, message, duration = 4_000 }) => {
        try {
            if (!message || typeof message !== 'string') {
                throw new Error('Notification message is required and must be a string');
            }

            if (!['success', 'error', 'warning', 'info'].includes(type)) {
                throw new Error(`Invalid notification type: ${type}`);
            }

            logger.debug(
                `[${SLICE}] addNotification → ${type}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
            );

            const toastMap = {
                success: toast.success,
                error: toast.error,
                warning: toast.warning,
                info: toast.info,
            } as const;

            try {
                (toastMap[type] ?? toast.info)(message, { duration });
                set(state => ({
                    notifications: [
                        ...state.notifications,
                        { id: Date.now(), type, message, duration } as NotificationEntry,
                    ],
                }));
            } catch (toastError) {
                logger.error(`[${SLICE}] ❌ Toast display failed:`, toastError);
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add notification';
            logger.error(`[${SLICE}] ❌ Notification failed: ${errorMessage}`, error);
            set({ globalError: errorMessage }); // ⚠️ MODIFIED: Use new name
        }
    },

    removeNotification: (id?: number) => {
        set(state => ({
            notifications: id ? state.notifications.filter(n => n.id !== id) : [],
        }));
    },

    /* ------------------------------------------------------------------ *
     * 🪟 GLOBAL MODAL MANAGEMENT (App-level modals only)
     * ------------------------------------------------------------------ */
    openGlobalModal: (modalId, props) => {
        // ⚠️ RENAMED: from 'openModal'
        try {
            if (!modalId || typeof modalId !== 'string') {
                throw new Error('Modal ID is required and must be a string');
            }

            logger.debug(`[${SLICE}] openGlobalModal → ${modalId}`, props);

            set(state => ({
                globalError: null,
                globalModals: {
                    // ⚠️ MODIFIED: Use new name
                    ...state.globalModals,
                    [modalId]: { isOpen: true, props },
                },
            }));

            logger.debug(`[${SLICE}] ✅ Global modal ${modalId} opened successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to open modal';
            logger.error(`[${SLICE}] ❌ Modal open failed: ${errorMessage}`, error);
            set({ globalError: errorMessage }); // ⚠️ MODIFIED: Use new name
        }
    },

    closeGlobalModal: modalId => {
        // ⚠️ RENAMED: from 'closeModal'
        try {
            if (!modalId || typeof modalId !== 'string') {
                throw new Error('Modal ID is required and must be a string');
            }

            logger.debug(`[${SLICE}] closeGlobalModal → ${modalId}`);

            const currentModals = get().globalModals; // ⚠️ MODIFIED: Use new name

            if (!currentModals[modalId]) {
                logger.warning(`[${SLICE}] ⚠️ Attempted to close non-existent modal: ${modalId}`);
                return;
            }

            set(state => ({
                globalError: null,
                globalModals: {
                    // ⚠️ MODIFIED: Use new name
                    ...state.globalModals,
                    [modalId]: { isOpen: false },
                },
            }));

            logger.debug(`[${SLICE}] ✅ Global modal ${modalId} closed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to close modal';
            logger.error(`[${SLICE}] ❌ Modal close failed: ${errorMessage}`, error);
            set({ globalError: errorMessage }); // ⚠️ MODIFIED: Use new name
        }
    },

    /* ------------------------------------------------------------------ *
     * ⏳ GLOBAL LOADING OVERLAY (App-level operations only)
     * ------------------------------------------------------------------ */
    setGlobalLoading: (isActive, message, source) => {
        // ⚠️ RENAMED: from 'setLoading'
        try {
            if (typeof isActive !== 'boolean') {
                throw new Error('isActive must be a boolean value');
            }

            if (message !== undefined && (typeof message !== 'string' || message.trim().length === 0)) {
                throw new Error('Loading message must be a non-empty string or undefined');
            }

            logger.performance(
                `[${SLICE}] setGlobalLoading → ${isActive ? 'START' : 'STOP'}${message ? ` (${message})` : ''}${
                    source ? ` from ${source}` : ''
                }`
            );

            set({
                globalLoading: {
                    // ⚠️ MODIFIED: Use new structure
                    isActive,
                    message,
                    source,
                },
                globalError: null,
            });

            try {
                if (isActive && message) {
                    toast.loading(message, { id: 'global-loading-toast', duration: Infinity });
                } else {
                    toast.dismiss('global-loading-toast');
                }
            } catch (toastError) {
                logger.warning(`[${SLICE}] ⚠️ Toast operation failed during loading state change:`, toastError);
            }

            logger.debug(`[${SLICE}] ✅ Global loading state updated successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to set loading state';
            logger.error(`[${SLICE}] ❌ Loading state change failed: ${errorMessage}`, error);
            set({ globalError: errorMessage }); // ⚠️ MODIFIED: Use new name
        }
    },

    /* ------------------------------------------------------------------ *
     * 🧹 ERROR MANAGEMENT
     * ------------------------------------------------------------------ */
    clearGlobalError: () => {
        // ⚠️ RENAMED: from 'clearUIError'
        logger.debug(`[${SLICE}] 🧹 Clearing global error`);
        set({ globalError: null }); // ⚠️ MODIFIED: Use new name
    },

    /* ------------------------------------------------------------------ *
     * 🔄 UTILITY METHODS
     * ------------------------------------------------------------------ */
    closeAllGlobalModals: () => {
        // ⚠️ RENAMED: from 'closeAllModals'
        try {
            logger.debug(`[${SLICE}] closeAllGlobalModals`);

            const currentModals = get().globalModals; // ⚠️ MODIFIED: Use new name
            const updatedModals = Object.keys(currentModals).reduce((acc, modalId) => {
                acc[modalId] = { isOpen: false };
                return acc;
            }, {} as typeof currentModals);

            set({
                globalModals: updatedModals, // ⚠️ MODIFIED: Use new name
                globalError: null,
            });

            logger.info(`[${SLICE}] ✅ All global modals closed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to close all modals';
            logger.error(`[${SLICE}] ❌ Close all modals failed: ${errorMessage}`, error);
            set({ globalError: errorMessage }); // ⚠️ MODIFIED: Use new name
        }
    },

    resetGlobalUIState: () => {
        // ⚠️ RENAMED: from 'resetUIState'
        try {
            logger.info(`[${SLICE}] 🔄 Resetting global UI state`);

            try {
                toast.dismiss();
            } catch (toastError) {
                logger.warning(`[${SLICE}] ⚠️ Failed to dismiss toasts during reset:`, toastError);
            }

            set({
                globalModals: {}, // ⚠️ MODIFIED: Use new name
                globalLoading: { isActive: false, message: undefined, source: undefined }, // ⚠️ MODIFIED: Use new structure
                globalError: null,
            });

            logger.info(`[${SLICE}] ✅ Global UI state reset successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reset UI state';
            logger.error(`[${SLICE}] ❌ UI state reset failed: ${errorMessage}`, error);
            set({ globalError: errorMessage }); // ⚠️ MODIFIED: Use new name
        }
    },

    // ✅ ADDED: Helper method to check if any domain loading is active
    isAnyDomainLoading: () => {
        const state = get();
        return (
            state.isLoading || // Knowledge loading
            state.isGenerating || // LLM loading
            state.speechIsProcessing || // Speech loading
            state.globalLoading.isActive // Global loading
        );
    },
});
