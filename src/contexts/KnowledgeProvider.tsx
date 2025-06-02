// src/contexts/KnowledgeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
// import { logger } from '@/modules/Logger';
import {
    initQdrantClient,
    ensureKnowledgeCollection,
    searchRelevantChunks,
    countKnowledgePoints,
    DocumentChunk,
    KNOWLEDGE_COLLECTION_NAME,
} from '@/services/QdrantService'; // Adjust path as needed
import { logger } from '@/modules';

interface KnowledgeContextType {
    isLoading: boolean;
    error: string | null;
    searchRelevantKnowledge: (query: string, limit?: number) => Promise<DocumentChunk[]>;
    knowledgeBaseName: string;
    // triggerIndexing: () => Promise<void>;
    // isIndexing: boolean;
    indexedDocumentsCount: number;
    refreshIndexedDocumentsCount: () => Promise<void>; // To manually refresh count from UI if needed
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export const KnowledgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    //   const [files, setFiles] = useState<KnowledgeFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [isIndexing, setIsIndexing] = useState(false);
    const [indexedDocumentsCount, setIndexedDocumentsCount] = useState(0);

    const knowledgeBaseName = `Qdrant Collection: ${KNOWLEDGE_COLLECTION_NAME}`;

    // const fetchAndIndexFiles = useCallback(async (forceReindex = false) => {
    const initializeKnowledgeBase = useCallback(async () => {
        logger.info('KnowledgeProvider: Initializing status...');
        setIsLoading(true);
        setError(null);
        try {
            initQdrantClient(); // Initialize client
            await ensureKnowledgeCollection(); // Ensure collection exists

            const currentPointsCount = await countKnowledgePoints();
            setIndexedDocumentsCount(currentPointsCount);
            logger.info(`Knowledge base initialized. Found ${currentPointsCount} indexed items.`);
        } catch (err) {
            logger.error(`Error during knowledge base initialization: ${err}`);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during initialization.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeKnowledgeBase();
    }, [initializeKnowledgeBase]);

    const refreshIndexedDocumentsCount = useCallback(async () => {
        try {
            const currentPointsCount = await countKnowledgePoints();
            setIndexedDocumentsCount(currentPointsCount);
        } catch (err) {
            console.error('Error refreshing indexed documents count:', err);
        }
    }, []);

    // Simple relevance scoring for context selection
    // const searchRelevantFiles = (
    const searchRelevantKnowledge = async (query: string, limit = 3): Promise<DocumentChunk[]> => {
        if (error) {
            console.error('Cannot search knowledge base due to provider initialization error:', error);
            return [];
        }

        try {
            return await searchRelevantChunks(query, limit);
        } catch (searchError) {
            logger.error(`Error during knowledge search:  ${searchError} `);
            setError(searchError instanceof Error ? searchError.message : 'An unknown error occurred during search.');
            return [];
        }
    };

    return (
        <KnowledgeContext.Provider
            value={{
                isLoading,
                error,
                searchRelevantKnowledge,
                knowledgeBaseName,
                indexedDocumentsCount,
                refreshIndexedDocumentsCount,
            }}
        >
            {children}
        </KnowledgeContext.Provider>
    );
};

// Hook to use the knowledge context
export const useKnowledge = (): KnowledgeContextType => {
    const context = useContext(KnowledgeContext);
    if (context === undefined) {
        throw new Error('useKnowledge must be used within a KnowledgeProvider');
    }
    return context;
};
