// src/components/StoreInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useKnowledge, useUI } from '@/stores/hooks/useSelectors';
import { logger } from '@/modules';

/**
 * Component that handles comprehensive store initialization on app startup
 * This ensures all critical systems are ready and properly initialized
 */
export function StoreInitializer() {
    const { initializeKnowledgeBase, isLoading, error, indexedDocumentsCount } = useKnowledge();
    const { setTheme, addNotification } = useUI();

    useEffect(() => {
        // Initialize theme from system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');

        logger.info('🎨 Theme initialized from system preference');
    }, [setTheme]);

    useEffect(() => {
        // Initialize knowledge base on app startup
        if (!isLoading && !error && indexedDocumentsCount === 0) {
            logger.info('🚀 StoreInitializer: Triggering knowledge base initialization...');
            initializeKnowledgeBase().catch((err: Error) => {
                logger.error('❌ StoreInitializer: Knowledge base initialization failed:', err);
                addNotification({
                    type: 'error',
                    message: 'Failed to initialize knowledge base. Some features may be limited.',
                    duration: 8000,
                });
            });
        }
    }, [initializeKnowledgeBase, isLoading, error, indexedDocumentsCount, addNotification]);

    useEffect(() => {
        // Show welcome notification after store is ready
        if (!isLoading && !error && indexedDocumentsCount > 0) {
            addNotification({
                type: 'success',
                message: `Welcome! Knowledge base ready with ${indexedDocumentsCount} documents.`,
                duration: 5000,
            });
        }
    }, [isLoading, error, indexedDocumentsCount, addNotification]);

    // This component doesn't render anything - it's just for initialization
    return null;
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
