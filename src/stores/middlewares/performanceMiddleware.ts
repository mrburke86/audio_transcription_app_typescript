// src\stores\middlewares\performanceMiddleware.ts
// Performance monitoring middleware for Zustand store
// -----------------------------------------------------
// • Logs updates that take longer than one animation frame (≈16.67 ms)
// • In development, counts how often the store mutates so you can spot noisy components
// -----------------------------------------------------

import { StateCreator } from 'zustand';
import { AppState } from '@/types/store';
import { logger } from '@/modules';

export const performanceMiddleware =
    <T extends AppState>(config: StateCreator<T>): StateCreator<T> =>
    (set, get, api) => {
        /**
         * Wrap the original `set` so we can time each mutation.
         * We handle the two overloads of set explicitly to preserve type safety.
         */
        const wrappedSet: typeof set = (partial, replace) => {
            const start = performance.now();

            // Call the original set with proper type handling
            let result: void;
            if (typeof partial === 'function') {
                // Handle function partial
                result = set(partial as any, replace as any);
            } else {
                // Handle object partial
                result = set(partial, replace as any);
            }

            const duration = performance.now() - start;

            // Warn if an update is longer than one frame (≈16.67 ms at 60 fps)
            if (duration > 16.67) {
                logger.warning(`Slow state update detected: ${duration.toFixed(2)} ms`);
                console.trace('Slow state update trace');
            }

            // Simple mutation counter (dev only)
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                const w = window as unknown as { __zustand_update_count?: number };
                w.__zustand_update_count = (w.__zustand_update_count ?? 0) + 1;

                if (w.__zustand_update_count % 100 === 0) {
                    logger.info(`State update count: ${w.__zustand_update_count}`);
                }
            }

            // Log the keys being updated for debugging
            if (partial && typeof partial === 'object' && !Array.isArray(partial)) {
                logger.debug('[performanceMiddleware] set called with keys:', Object.keys(partial));
            }

            return result;
        };

        return config(wrappedSet, get, api);
    };
