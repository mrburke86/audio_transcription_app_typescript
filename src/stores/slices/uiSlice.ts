// src\stores\slices\uiSlice.ts
import { AppState, UISlice } from '@/types/store';
import { toast } from 'sonner';
import { StateCreator } from 'zustand';

/**
 * 🧩 UI Slice — Centralized Zustand slice for user interface and feedback management
 *
 * ✅ Responsibilities:
 * - Show toast notifications (via Sonner)
 * - Manage modal open/close state and props
 * - Track loading state and messages
 * - Handle theme switching (light/dark mode)
 * - Enable consistent UI feedback across the app
 */

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
    // Initialize state - centralizes all UI state management
    theme: 'dark',
    // notifications: [],
    modals: {},
    isLoading: false,
    loadingMessage: undefined,

    /**
     * 🎨 Set app theme mode (light or dark)
     */
    setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        // logger.info(`🎨 Theme changed to: ${theme}`);

        // Optional DOM-side theme handling
        // if (typeof window !== 'undefined') {
        //     document.documentElement.classList.toggle('dark', theme === 'dark');
        // }
    },

    /**
     * 📣 Display toast notification using Sonner
     */
    addNotification: ({ type, message, duration = 4000 }) => {
        switch (type) {
            case 'success':
                toast.success(message, { duration });
                break;
            case 'error':
                toast.error(message, { duration });
                break;
            case 'warning':
                toast.warning(message, { duration });
                break;
            case 'info':
            default:
                toast.info(message, { duration });
                break;
        }
    },

    /**
     * ❌ Deprecated — Sonner auto-dismisses notifications
     */
    removeNotification: () => {
        // This method can be removed or kept as no-op for compatibility
        console.warn('removeNotification is deprecated - Sonner handles auto-dismissal');
    },

    /**
     * 📥 Opens a modal by ID and optionally passes props
     */
    openModal: (modalId: string, props?: any) => {
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: { isOpen: true, props },
            },
        }));
    },

    /**
     * 📤 Closes a modal by ID
     */
    closeModal: (modalId: string) => {
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: { isOpen: false },
            },
        }));
    },

    /**
     * 🔄 Manage global loading state and display loading message via toast
     */
    setLoading: (isLoading: boolean, message?: string) => {
        set({ isLoading, loadingMessage: message });

        // Optional: Show loading toast for long operations
        if (isLoading && message) {
            toast.loading(message, { id: 'loading-toast' });
        } else {
            toast.dismiss('loading-toast');
        }
    },
});
