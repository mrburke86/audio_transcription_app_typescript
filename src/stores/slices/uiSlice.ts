import { StateCreator } from 'zustand';
import { AppState, UISlice } from '@/types/store';
import { logger } from '@/modules';
import { v4 as uuidv4 } from 'uuid';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set, get) => ({
    // Initialize state - centralizes all UI state management
    theme: 'dark',
    notifications: [],
    modals: {},
    isLoading: false,
    loadingMessage: undefined,

    // Theme management
    setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        logger.info(`🎨 Theme changed to: ${theme}`);

        // Apply theme to document if in browser
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    },

    // Notification management - replaces scattered notification logic
    addNotification: notification => {
        const id = uuidv4();
        const fullNotification = {
            ...notification,
            id,
            timestamp: Date.now(),
        };

        set(state => ({
            notifications: [...state.notifications, fullNotification],
        }));

        logger.debug(`🔔 Added notification: ${notification.type} - ${notification.message}`);

        // Auto-remove notification after duration
        const duration = notification.duration || 5000;
        setTimeout(() => {
            get().removeNotification(id);
        }, duration);
    },

    removeNotification: (id: string) => {
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
        }));

        logger.debug(`🗑️ Removed notification: ${id}`);
    },

    // Modal management - replaces individual modal state
    openModal: (modalId: string, props?: any) => {
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: { isOpen: true, props },
            },
        }));

        logger.debug(`📋 Opened modal: ${modalId}`);
    },

    closeModal: (modalId: string) => {
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: { isOpen: false, props: undefined },
            },
        }));

        logger.debug(`❌ Closed modal: ${modalId}`);
    },

    // Loading state management - replaces scattered loading states
    setLoading: (isLoading: boolean, message?: string) => {
        set({
            isLoading,
            loadingMessage: isLoading ? message : undefined,
        });

        if (isLoading) {
            logger.debug(`⏳ Loading started: ${message || 'Loading...'}`);
        } else {
            logger.debug('✅ Loading completed');
        }
    },
});
