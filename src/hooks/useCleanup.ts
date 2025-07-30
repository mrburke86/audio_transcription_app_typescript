// src/hooks/useCleanup.ts - CENTRALIZED CLEANUP HOOK
'use client';

import { logger } from '@/lib/Logger';
import { registerCleanup } from '@/stores/chatStore';
import { useCallback, useEffect, useRef } from 'react';

interface CleanupItem {
    cleanup: () => void;
    name: string;
}

export const useCleanup = (componentName: string = 'UnknownComponent') => {
    const cleanupItems = useRef<CleanupItem[]>([]);
    const isCleanedUp = useRef(false);

    // ✅ ADD CLEANUP FUNCTION
    const addCleanup = useCallback(
        (cleanup: () => void, name: string) => {
            if (isCleanedUp.current) {
                logger.warning(
                    `⚠️ Attempted to add cleanup "${name}" to already cleaned up component: ${componentName}`
                );
                return;
            }

            cleanupItems.current.push({ cleanup, name });
            logger.debug(`🔧 Added cleanup "${name}" to ${componentName}`);
        },
        [componentName]
    );

    // ✅ REGISTER DEBOUNCED FUNCTION
    const registerDebounced = useCallback(
        (debouncedFn: { cancel: () => void }, name: string) => {
            addCleanup(debouncedFn.cancel, `debounced-${name}`);
            registerCleanup.debounced(debouncedFn.cancel, `${componentName}-${name}`);
        },
        [addCleanup, componentName]
    );

    // ✅ REGISTER TIMER
    const registerTimer = useCallback(
        (timerId: NodeJS.Timeout, name: string) => {
            const cleanup = () => clearTimeout(timerId);
            addCleanup(cleanup, `timer-${name}`);
            registerCleanup.timer(timerId, `${componentName}-${name}`);
        },
        [addCleanup, componentName]
    );

    // ✅ REGISTER EVENT LISTENER
    const registerEventListener = useCallback(
        (target: EventTarget, event: string, handler: EventListener, name: string) => {
            const cleanup = () => target.removeEventListener(event, handler);
            addCleanup(cleanup, `event-${name}`);
            registerCleanup.eventListener(target, event, handler, `${componentName}-${name}`);

            // Add the listener
            target.addEventListener(event, handler);
        },
        [addCleanup, componentName]
    );

    // ✅ EXECUTE CLEANUP
    const executeCleanup = useCallback(() => {
        if (isCleanedUp.current) return;

        logger.info(`🧹 Cleaning up ${componentName} (${cleanupItems.current.length} items)`);

        cleanupItems.current.forEach(({ cleanup, name }) => {
            try {
                cleanup();
                logger.debug(`✅ Cleaned up ${name} in ${componentName}`);
            } catch (error) {
                logger.warning(`⚠️ Error cleaning up ${name} in ${componentName}:`, error);
            }
        });

        cleanupItems.current = [];
        isCleanedUp.current = true;

        logger.info(`✅ Cleanup completed for ${componentName}`);
    }, [componentName]);

    // ✅ CLEANUP ON UNMOUNT
    useEffect(() => {
        return () => {
            executeCleanup();
        };
    }, [executeCleanup]);

    return {
        addCleanup,
        registerDebounced,
        registerTimer,
        registerEventListener,
        executeCleanup,
    };
};
