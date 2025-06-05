// Performance monitoring middleware for Zustand store
// -----------------------------------------------------
// • Logs updates that take longer than one animation frame (≈16.67 ms)
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
         * The cast at the end preserves Zustand’s overloaded signatures.
         */
        const wrappedSet = ((...args: Parameters<typeof set>) => {
            const start = performance.now();
            // @ts-expect-error – overloads are preserved by the cast below
            const result = set(...(args as any));
            const duration = performance.now() - start;

            // Warn if an update is longer than one frame (≈16.67 ms at 60 fps)
            if (duration > 16.67) {
                logger.warning(`Slow state update detected: ${duration.toFixed(2)} ms`);
                console.trace('Slow state update trace');
            }

            // Simple mutation counter (dev only)
            if (process.env.NODE_ENV === 'development') {
                const w = window as unknown as { __zustand_update_count?: number };
                w.__zustand_update_count = (w.__zustand_update_count ?? 0) + 1;

                if (w.__zustand_update_count % 100 === 0) {
                    logger.info(`State update count: ${w.__zustand_update_count}`);
                }
            }

            return result;
        }) as typeof set; // <-- cast keeps the original call‑signature(s)

        return config(wrappedSet, get, api);
    };
