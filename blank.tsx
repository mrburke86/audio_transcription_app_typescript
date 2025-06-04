// src/components/StoreInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useKnowledge } from '@/stores/hooks/useSelectors';
import { logger } from '@/modules';

/**
 * Component that handles store initialization on app startup
 * This ensures the knowledge base and other critical systems are ready
 */
export function StoreInitializer() {
    const { initializeKnowledgeBase, isLoading, error, indexedDocumentsCount } = useKnowledge();

    useEffect(() => {
        // Initialize knowledge base on app startup
        if (!isLoading && !error && indexedDocumentsCount === 0) {
            logger.info('🚀 StoreInitializer: Triggering knowledge base initialization...');
            initializeKnowledgeBase().catch(err => {
                logger.error('❌ StoreInitializer: Knowledge base initialization failed:', err);
            });
        }
    }, [initializeKnowledgeBase, isLoading, error, indexedDocumentsCount]);

    // This component doesn't render anything - it's just for initialization
    return null;
}

// Alternative: Hook-based initialization
export function useStoreInitialization() {
    const { initializeKnowledgeBase, isLoading, error, indexedDocumentsCount } = useKnowledge();

    useEffect(() => {
        if (!isLoading && !error && indexedDocumentsCount === 0) {
            logger.info('🚀 Hook: Triggering knowledge base initialization...');
            initializeKnowledgeBase().catch(err => {
                logger.error('❌ Hook: Knowledge base initialization failed:', err);
            });
        }
    }, [initializeKnowledgeBase, isLoading, error, indexedDocumentsCount]);
}
