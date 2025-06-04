// Custom error handling middleware for centralized error management
import { StateCreator } from 'zustand';
import { AppState } from '@/types/store';
import { logger } from '@/modules';

export const errorHandlingMiddleware =
      <T extends AppState>(config: StateCreator<T>): StateCreator<T> =>
      (set, get, api) => {
            const wrappedSet = (...args: Parameters<typeof set>) => {
                  try {
                        return set(...args);
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
