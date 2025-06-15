// src/components/StoreInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useKnowledge, useUI } from '@/stores/hooks/useSelectors';
import { logger } from '@/modules';

/**
 * Component that handles comprehensive store initialization on app startup
 * This ensures all critical systems are ready and properly initialized
 */
export function StoreInitializer() {
    const { initializeKnowledgeBase, isLoading, error, indexedDocumentsCount } = useKnowledge();
    const { setTheme, addNotification } = useUI();

    const hasInitialized = useRef(false); // 🧠 Prevent multiple inits

    // 🎨 Initialize theme from system preference
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
        logger.info('🎨 Theme initialized from system preference');
    }, [setTheme]);

    // 🧠 Initialize knowledge base if needed
    useEffect(() => {
        if (!hasInitialized.current && !isLoading && !error && indexedDocumentsCount === 0) {
            hasInitialized.current = true;
            logger.info('🚀 StoreInitializer: Triggering knowledge base initialization...');

            initializeKnowledgeBase().catch((err: Error) => {
                logger.error('❌ StoreInitializer: Knowledge base initialization failed:', err);
                hasInitialized.current = false; // allow retry if needed
                addNotification({
                    type: 'error',
                    message: 'Failed to initialize knowledge base. Some features may be limited.',
                    duration: 8000,
                });
            });
        }
    }, [initializeKnowledgeBase, isLoading, error, indexedDocumentsCount, addNotification]);

    // ✅ Show welcome message once KB is ready
    const hasWelcomed = useRef(false);
    useEffect(() => {
        if (!hasWelcomed.current && !isLoading && !error && indexedDocumentsCount > 0) {
            hasWelcomed.current = true;
            addNotification({
                type: 'success',
                message: `Welcome! Knowledge base ready with ${indexedDocumentsCount} documents.`,
                duration: 5000,
            });
        }
    }, [isLoading, error, indexedDocumentsCount, addNotification]);

    return null; // Initialization-only component
}

// Alternative: Hook-based initialization for components that need more control
export function useStoreInitialization() {
    const { initializeKnowledgeBase, isLoading, error, indexedDocumentsCount } = useKnowledge();
    const { addNotification } = useUI();

    useEffect(() => {
        if (!isLoading && !error && indexedDocumentsCount === 0) {
            logger.info('🚀 Hook: Triggering knowledge base initialization...');
            initializeKnowledgeBase().catch((err: Error) => {
                logger.error('❌ Hook: Knowledge base initialization failed:', err);
                addNotification({
                    type: 'error',
                    message: 'Knowledge base initialization failed',
                    duration: 5000,
                });
            });
        }
    }, [initializeKnowledgeBase, isLoading, error, indexedDocumentsCount, addNotification]);

    return { isLoading, error, indexedDocumentsCount };
}
