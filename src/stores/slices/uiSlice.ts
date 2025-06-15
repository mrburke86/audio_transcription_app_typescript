// src/stores/slices/uiSlice.ts
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { logger } from '@/modules/Logger';
import { AppState, UISlice, NotificationEntry } from '@/types/store';

const SLICE = 'UISlice';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
    // 🌑 Initial UI state
    theme: 'light',
    modals: {},
    notifications: [],
    isLoading: false,
    loadingMessage: undefined,
    uiError: null,

    /* ------------------------------------------------------------------ *
     * 🎨 THEME
     * ------------------------------------------------------------------ */
    setTheme: theme => {
        try {
            logger.info(`[${SLICE}] setTheme → ${theme}`);
            set({ uiError: null });

            // Validate theme input
            if (!theme || !['light', 'dark'].includes(theme)) {
                throw new Error(`Invalid theme value: ${theme}. Must be 'light' or 'dark'.`);
            }

            set({ theme });

            // DOM manipulation with error handling
            if (typeof document !== 'undefined') {
                try {
                    document.documentElement.classList.toggle('dark', theme === 'dark');

                    // Optional: Persist theme to localStorage
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('app-theme', theme);
                    }
                } catch (domError) {
                    logger.warning(`[${SLICE}] DOM/localStorage operation failed during theme change:`, domError);
                    // Don't throw - theme state was updated successfully
                }
            }

            logger.info(`[${SLICE}] ✅ Theme successfully changed to ${theme}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to change theme';

            logger.error(`[${SLICE}] ❌ Theme change failed: ${errorMessage}`, error);

            set({ uiError: errorMessage });

            get().addNotification?.({
                type: 'error',
                message: `Theme change failed: ${errorMessage}`,
                duration: 5000,
            });
        }
    },

    /* ------------------------------------------------------------------ *
     * 🔔 NOTIFICATIONS
     * ------------------------------------------------------------------ */
    addNotification: ({ type, message, duration = 4_000 }) => {
        try {
            // Input validation
            if (!message || typeof message !== 'string') {
                throw new Error('Notification message is required and must be a string');
            }

            if (!['success', 'error', 'warning', 'info'].includes(type)) {
                throw new Error(`Invalid notification type: ${type}`);
            }

            if (duration && (typeof duration !== 'number' || duration < 0)) {
                throw new Error('Duration must be a positive number');
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

            // Execute toast with error handling
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
                // Fallback: try basic console output
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add notification';

            logger.error(`[${SLICE}] ❌ Notification failed: ${errorMessage}`, error);

            set({ uiError: errorMessage });

            // Fallback notification attempt
            try {
                console.error(`UI Notification Error: ${errorMessage}`);
            } catch {
                // Silent fail - nothing more we can do
            }
        }
    },

    removeNotification: (id?: number) => {
        set(state => ({
            notifications: id ? state.notifications.filter(n => n.id !== id) : [],
        }));
    },

    /* ------------------------------------------------------------------ *
     * 🪟 MODALS
     * ------------------------------------------------------------------ */
    openModal: (modalId, props) => {
        try {
            // Input validation
            if (!modalId || typeof modalId !== 'string') {
                throw new Error('Modal ID is required and must be a string');
            }

            if (modalId.trim().length === 0) {
                throw new Error('Modal ID cannot be empty');
            }

            logger.debug(`[${SLICE}] openModal → ${modalId}`, props);

            set(state => ({
                uiError: null,
                modals: {
                    ...state.modals,
                    [modalId]: { isOpen: true, props },
                },
            }));

            logger.debug(`[${SLICE}] ✅ Modal ${modalId} opened successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to open modal';

            logger.error(`[${SLICE}] ❌ Modal open failed: ${errorMessage}`, error);

            set({ uiError: errorMessage });

            get().addNotification?.({
                type: 'error',
                message: `Failed to open modal: ${errorMessage}`,
                duration: 5000,
            });
        }
    },

    closeModal: modalId => {
        try {
            // Input validation
            if (!modalId || typeof modalId !== 'string') {
                throw new Error('Modal ID is required and must be a string');
            }

            if (modalId.trim().length === 0) {
                throw new Error('Modal ID cannot be empty');
            }

            logger.debug(`[${SLICE}] closeModal → ${modalId}`);

            const currentModals = get().modals;

            // Check if modal exists
            if (!currentModals[modalId]) {
                logger.warning(`[${SLICE}] ⚠️ Attempted to close non-existent modal: ${modalId}`);
                return; // Graceful handling - not an error
            }

            set(state => ({
                uiError: null,
                modals: {
                    ...state.modals,
                    [modalId]: { isOpen: false },
                },
            }));

            logger.debug(`[${SLICE}] ✅ Modal ${modalId} closed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to close modal';

            logger.error(`[${SLICE}] ❌ Modal close failed: ${errorMessage}`, error);

            set({ uiError: errorMessage });

            get().addNotification?.({
                type: 'error',
                message: `Failed to close modal: ${errorMessage}`,
                duration: 5000,
            });
        }
    },

    /* ------------------------------------------------------------------ *
     * ⏳ GLOBAL LOADING
     * ------------------------------------------------------------------ */
    setLoading: (isLoading, message) => {
        try {
            // Input validation
            if (typeof isLoading !== 'boolean') {
                throw new Error('isLoading must be a boolean value');
            }

            if (message !== undefined && (typeof message !== 'string' || message.trim().length === 0)) {
                throw new Error('Loading message must be a non-empty string or undefined');
            }

            logger.performance(
                `[${SLICE}] setLoading → ${isLoading ? 'START' : 'STOP'}${message ? ` (${message})` : ''}`
            );

            set({
                isLoading,
                loadingMessage: message,
                uiError: null,
            });

            // Handle toast operations with error handling
            try {
                if (isLoading && message) {
                    toast.loading(message, { id: 'global-loading-toast', duration: Infinity });
                } else {
                    toast.dismiss('global-loading-toast');
                }
            } catch (toastError) {
                logger.warning(`[${SLICE}] ⚠️ Toast operation failed during loading state change:`, toastError);
                // Don't throw - loading state was updated successfully
            }

            logger.debug(`[${SLICE}] ✅ Loading state updated successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to set loading state';

            logger.error(`[${SLICE}] ❌ Loading state change failed: ${errorMessage}`, error);

            set({ uiError: errorMessage });

            // Try to dismiss any existing loading toast
            try {
                toast.dismiss('global-loading-toast');
            } catch {
                // Silent fail
            }

            get().addNotification?.({
                type: 'error',
                message: `Loading state error: ${errorMessage}`,
                duration: 5000,
            });
        }
    },

    /* ------------------------------------------------------------------ *
     * 🧹 ERROR MANAGEMENT
     * ------------------------------------------------------------------ */
    clearUIError: () => {
        logger.debug(`[${SLICE}] 🧹 Clearing UI error`);
        set({ uiError: null });
    },

    /* ------------------------------------------------------------------ *
     * 🔄 UTILITY METHODS
     * ------------------------------------------------------------------ */
    closeAllModals: () => {
        try {
            logger.debug(`[${SLICE}] closeAllModals`);

            const currentModals = get().modals;
            const updatedModals = Object.keys(currentModals).reduce((acc, modalId) => {
                acc[modalId] = { isOpen: false };
                return acc;
            }, {} as typeof currentModals);

            set({
                modals: updatedModals,
                uiError: null,
            });

            logger.info(`[${SLICE}] ✅ All modals closed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to close all modals';

            logger.error(`[${SLICE}] ❌ Close all modals failed: ${errorMessage}`, error);

            set({ uiError: errorMessage });

            get().addNotification?.({
                type: 'error',
                message: `Failed to close modals: ${errorMessage}`,
                duration: 5000,
            });
        }
    },

    resetUIState: () => {
        try {
            logger.info(`[${SLICE}] 🔄 Resetting UI state`);

            // Dismiss any active toasts
            try {
                toast.dismiss();
            } catch (toastError) {
                logger.warning(`[${SLICE}] ⚠️ Failed to dismiss toasts during reset:`, toastError);
            }

            set({
                modals: {},
                isLoading: false,
                loadingMessage: undefined,
                uiError: null,
            });

            logger.info(`[${SLICE}] ✅ UI state reset successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reset UI state';

            logger.error(`[${SLICE}] ❌ UI state reset failed: ${errorMessage}`, error);

            // Set minimal error state
            set({ uiError: errorMessage });
        }
    },
});
