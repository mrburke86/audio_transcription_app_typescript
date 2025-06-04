import { StateCreator } from 'zustand';
import { AppState, KnowledgeSlice } from '@/types/store';
import {
    initQdrantClient,
    ensureKnowledgeCollection,
    searchRelevantChunks,
    countKnowledgePoints,
    KNOWLEDGE_COLLECTION_NAME,
} from '@/services/QdrantService';
import { logger } from '@/modules';

export const createKnowledgeSlice: StateCreator<AppState, [], [], KnowledgeSlice> = (set, get) => ({
    // Initialize state - this replaces your KnowledgeProvider initial state
    indexedDocumentsCount: 0,
    knowledgeBaseName: `Qdrant Collection: ${KNOWLEDGE_COLLECTION_NAME}`,
    isLoading: false,
    error: null,
    lastIndexedAt: null,
    indexingProgress: {
        filesProcessed: 0,
        totalFiles: 0,
        errors: [],
        progress: '',
    },
    searchResults: [],

    // This replaces your KnowledgeProvider's initializeKnowledgeBase
    initializeKnowledgeBase: async () => {
        set({ isLoading: true, error: null });

        try {
            logger.info('Initializing knowledge base with Zustand...');

            initQdrantClient();
            await ensureKnowledgeCollection();

            const currentPointsCount = await countKnowledgePoints();

            set({
                indexedDocumentsCount: currentPointsCount,
                isLoading: false,
            });

            if (currentPointsCount === 0) {
                logger.warning('Knowledge base is empty. Consider running indexing.');
                get().addNotification({
                    type: 'warning',
                    message: 'Knowledge base is empty. Click "Index Knowledge" to get started.',
                    duration: 8000,
                });
            } else {
                logger.info(`Knowledge base ready: ${currentPointsCount} documents indexed`);
                get().addNotification({
                    type: 'success',
                    message: `Knowledge base ready with ${currentPointsCount} indexed documents`,
                    duration: 5000,
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
            logger.error('Knowledge base initialization failed:', error);

            set({
                error: errorMessage,
                isLoading: false,
            });

            get().addNotification({
                type: 'error',
                message: `Knowledge base initialization failed: ${errorMessage}`,
                duration: 10000,
            });
        }
    },

    // This replaces your KnowledgeProvider's triggerIndexing
    triggerIndexing: async () => {
        set(state => ({
            indexingProgress: {
                ...state.indexingProgress,
                isIndexing: true,
                progress: 'Starting knowledge indexing...',
                errors: [],
            },
        }));

        get().addNotification({
            type: 'info',
            message: 'Knowledge indexing started...',
            duration: 3000,
        });

        try {
            const response = await fetch('/api/knowledge/index-knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Update indexing progress
            set(state => ({
                indexingProgress: {
                    filesProcessed: result.filesProcessed || 0,
                    totalFiles: result.filesProcessed || 0,
                    errors: result.errors || [],
                    progress: 'Indexing completed successfully!',
                    isIndexing: false,
                },
                lastIndexedAt: new Date(),
            }));

            // Refresh the indexed count
            await get().refreshIndexedDocumentsCount();

            // Notify user of success
            const hasErrors = result.errors && result.errors.length > 0;
            get().addNotification({
                type: hasErrors ? 'warning' : 'success',
                message: hasErrors
                    ? `Indexing completed with ${result.errors.length} errors. ${result.filesProcessed} files processed.`
                    : `Successfully indexed ${result.filesProcessed} documents!`,
                duration: hasErrors ? 10000 : 5000,
            });

            return !hasErrors;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown indexing error';
            logger.error('Knowledge indexing failed:', error);

            set(state => ({
                indexingProgress: {
                    ...state.indexingProgress,
                    progress: `Indexing failed: ${errorMessage}`,
                    errors: [errorMessage],
                    isIndexing: false,
                },
                error: errorMessage,
            }));

            get().addNotification({
                type: 'error',
                message: `Knowledge indexing failed: ${errorMessage}`,
                duration: 10000,
            });

            return false;
        }
    },

    // This replaces your KnowledgeProvider's searchRelevantKnowledge
    searchRelevantKnowledge: async (query: string, limit = 3) => {
        if (get().error) {
            logger.error('Cannot search: Knowledge base has errors');
            return [];
        }

        logger.debug(`Searching knowledge base for: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);

        try {
            const startTime = performance.now();
            const results = await searchRelevantChunks(query, limit);
            const searchTime = Math.round(performance.now() - startTime);

            set({ searchResults: results });

            logger.info(`Knowledge search completed in ${searchTime}ms. Found ${results.length} relevant chunks.`);

            if (results.length === 0) {
                get().addNotification({
                    type: 'warning',
                    message: 'No relevant knowledge found for your query. Try different search terms.',
                    duration: 5000,
                });
            }

            return results;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
            logger.error('Knowledge search failed:', error);

            set({ error: errorMessage });

            get().addNotification({
                type: 'error',
                message: `Knowledge search failed: ${errorMessage}`,
                duration: 8000,
            });

            return [];
        }
    },

    // This replaces your KnowledgeProvider's refreshIndexedDocumentsCount
    refreshIndexedDocumentsCount: async () => {
        try {
            logger.debug('Refreshing indexed documents count...');
            const currentPointsCount = await countKnowledgePoints();

            set({ indexedDocumentsCount: currentPointsCount });

            logger.debug(`Updated indexed count: ${currentPointsCount} documents`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Count refresh failed';
            logger.error('Failed to refresh indexed count:', error);

            get().addNotification({
                type: 'error',
                message: 'Failed to refresh document count',
                duration: 3000,
            });
        }
    },
});
