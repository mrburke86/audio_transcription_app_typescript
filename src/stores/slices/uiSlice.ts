// src/stores/slices/uiSlice.ts
import { logger } from '@/lib/Logger';
import { UISlice, UseRouteProtectionOptions } from '@/types';
import { StateCreator } from 'zustand';
import { shallow } from 'zustand/shallow';

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
    activeTab: 'interview',
    protectionState: {
        isAccessAllowed: false,
        isValidating: false,
        isRedirecting: false,
    },
    routeOptions: undefined,

    getProtectionStatus: () => {
        const { protectionState, routeOptions } = get();
        const isLoading =
            (routeOptions?.showLoading ?? true) && (protectionState.isValidating || protectionState.isRedirecting);

        const snapshot = {
            isAccessAllowed: protectionState.isAccessAllowed,
            isLoading,
            isRedirecting: protectionState.isRedirecting,
        };

        logger.debug('[🛡️ UI] Protection status snapshot:', snapshot);
        return snapshot;
    },

    setActiveTab: tab => {
        logger.info('[🧭 UI] Setting active tab:', tab);
        set({ activeTab: tab });
    },

    setProtectionState: update => {
        logger.info('[🛡️ UI] Updating protection state:', update);
        console.trace('🔍 Stack trace for protection state update');
        set(state => ({
            protectionState: {
                ...state.protectionState,
                ...update,
            },
        }));
    },

    setRouteOptions: (opts: UseRouteProtectionOptions) => {
        const current = get().routeOptions;

        const isSame = shallow(current, opts);
        if (isSame) {
            logger.debug('[🛡️ UI] No routeOptions update needed — identical');
            return;
        }

        logger.info('[🛡️ UI] Updating routeOptions:', opts);
        set({ routeOptions: opts });
    },

    navigateToChat: () => {
        try {
            logger.info('[🔁 UI] Navigating to /chat');
            window.location.href = '/chat';
        } catch (err) {
            logger.error('[🚨 UI] Failed to navigate to /chat', err);
        }
    },

    navigateToContextCapture: () => {
        try {
            logger.info('[🔁 UI] Navigating to /capture-context');
            window.location.href = '/capture-context';
        } catch (err) {
            logger.error('[🚨 UI] Failed to navigate to /capture-context', err);
        }
    },
});
