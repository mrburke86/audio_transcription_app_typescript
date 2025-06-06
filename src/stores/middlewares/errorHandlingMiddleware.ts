// Custom error handling middleware for centralized error management
import { StateCreator } from 'zustand';
import { AppState } from '@/types/store';
import { logger } from '@/modules';

export const errorHandlingMiddleware =
    <T extends AppState>(config: StateCreator<T>): StateCreator<T> =>
    (set, get, api) => {
        const wrappedSet: typeof set = (partial, replace) => {
            try {
                if (replace === true) {
                    // Overload 2: replace must be true, partial must be T or (state: T) => T
                    return set(partial as T | ((state: T) => T), true);
                }
                // Overload 1: replace is false or undefined, partial can be Partial<T> or (state: T) => T | Partial<T>
                return set(partial as T | Partial<T> | ((state: T) => T | Partial<T>), replace as false | undefined);
            } catch (error) {
                logger.error('State update error:', error);

                // Add error notification to UI
                const state = get();
                if ('addNotification' in state && typeof state.addNotification === 'function') {
                    state.addNotification({
                        type: 'error',
                        message: 'An unexpected error occurred',
                        duration: 5000,
                    });
                }

                throw error;
            }
        };

        return config(wrappedSet, get, api);
    };
