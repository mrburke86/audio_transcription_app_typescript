// src/stores/middleware/loggerMiddleware.ts

import { StateCreator } from 'zustand';

export const loggerMiddleware =
    <T extends object>(config: StateCreator<T>): StateCreator<T> =>
    (set, get, api) =>
        config(
            (args: Parameters<typeof set>[0]) => {
                console.groupCollapsed('%c🧠 Zustand State Change', 'color: #00b894; font-weight: bold;');
                console.log('📥 New State:', args);
                console.trace('🔍 Stack Trace');
                console.groupEnd();
                set(args);
            },
            get,
            api
        );
