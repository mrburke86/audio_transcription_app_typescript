// src/stores/slices/uiSlice.ts
import { StateCreator } from 'zustand';
import { toast } from 'sonner';

import { logger } from '@/modules/Logger';
import { AppState, UISlice } from '@/types/store';

const SLICE = 'UISlice';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, _get) => ({
    // 🌑 Initial UI state
    theme: 'dark',
    modals: {},
    isLoading: false,
    loadingMessage: undefined,

    /* ------------------------------------------------------------------ *
     * 🎨 THEME
     * ------------------------------------------------------------------ */
    setTheme: theme => {
        logger.info(`[${SLICE}] setTheme → ${theme}`);
        set({ theme });

        // Optional DOM toggle
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    },

    /* ------------------------------------------------------------------ *
     * 🔔 NOTIFICATIONS
     * ------------------------------------------------------------------ */
    addNotification: ({ type, message, duration = 4_000 }) => {
        logger.debug(`[${SLICE}] addNotification → ${type}: ${message}`);

        const toastMap = {
            success: toast.success,
            error: toast.error,
            warning: toast.warning,
            info: toast.info,
        } as const;

        (toastMap[type] ?? toast.info)(message, { duration });
    },

    removeNotification: () => {
        logger.warning(`[${SLICE}] removeNotification is deprecated — Sonner auto-dismisses notifications`);
    },

    /* ------------------------------------------------------------------ *
     * 🪟 MODALS
     * ------------------------------------------------------------------ */
    openModal: (modalId, props) => {
        logger.debug(`[${SLICE}] openModal → ${modalId}`, props);
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: { isOpen: true, props },
            },
        }));
    },

    closeModal: modalId => {
        logger.debug(`[${SLICE}] closeModal → ${modalId}`);
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: { isOpen: false },
            },
        }));
    },

    /* ------------------------------------------------------------------ *
     * ⏳ GLOBAL LOADING
     * ------------------------------------------------------------------ */
    setLoading: (isLoading, message) => {
        logger.performance(`[${SLICE}] setLoading → ${isLoading ? 'START' : 'STOP'}${message ? ` (${message})` : ''}`);
        set({ isLoading, loadingMessage: message });

        if (isLoading && message) {
            toast.loading(message, { id: 'global-loading-toast', duration: Infinity });
        } else {
            toast.dismiss('global-loading-toast');
        }
    },
});
