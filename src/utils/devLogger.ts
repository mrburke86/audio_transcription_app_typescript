import { logger } from '@/lib/Logger';

// src/utils/devLogger.ts
export const devLog = {
    log: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            logger.info(message, ...args);
        }
    },

    warning: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            logger.warning(message, ...args);
        }
    },

    error: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            logger.error(message, ...args);
        }
    },

    group: (label: string) => {
        if (process.env.NODE_ENV === 'development') {
            console.group(label);
        }
    },

    groupEnd: () => {
        if (process.env.NODE_ENV === 'development') {
            console.groupEnd();
        }
    },

    timing: (message: string, duration: number) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`⏱️ [TIMING] ${message}: ${duration}ms`);
        }
    },

    render: (component: string, count: number) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🧮 [DIAG] ${component} rendered ${count} times`);
        }
    },
};
