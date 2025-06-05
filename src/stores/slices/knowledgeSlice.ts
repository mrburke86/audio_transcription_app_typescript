// src/stores/slices/knowledgeSlice.ts
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

/**
 * 📚 Knowledge Slice — Zustand store segment for managing Qdrant vector DB and knowledge workflows
 *
 * ✅ Responsibilities:
 * - Initialize Qdrant client and ensure the collection exists
 * - Handle indexing of documents via API trigger
 * - Provide search functionality against the knowledge base
 * - Track indexing progress and document count
 * - Show user notifications based on outcomes
 */

export const createKnowledgeSlice: StateCreator<AppState, [], [], KnowledgeSlice> = (set, get) => ({
    // 📊 Total indexed documents in Qdrant collection
    indexedDocumentsCount: 0,

    // 🏷️ Display label for current Qdrant collection name
    knowledgeBaseName: `Qdrant Collection: ${KNOWLEDGE_COLLECTION_NAME}`,

    // ⏳ Indicates loading or initialization state
    isLoading: false,

    // ❌ Stores error messages from any failures
    error: null,

    // 📅 Timestamp of last successful indexing run
    lastIndexedAt: null,

    // 🔁 Tracks progress during document indexing process
    indexingProgress: {
        filesProcessed: 0,
        totalFiles: 0,
        errors: [],
        progress: '',
    },

    // 🔍 Stores results of the latest search query
    searchResults: [],

    /**
     * 🛠 Initializes the Qdrant client and ensures the collection is available.
     * Also sets the current indexed document count and displays appropriate notifications.
     */
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

                // ✅ Safe call to addNotification
                const state = get();
                if (state.addNotification && typeof state.addNotification === 'function') {
                    state.addNotification({
                        type: 'warning',
                        message: 'Knowledge base is empty. Click "Index Knowledge" to get started.',
                        duration: 8000,
                    });
                }
            } else {
                logger.info(`Knowledge base ready: ${currentPointsCount} documents indexed`);

                // ✅ Safe call to addNotification
                const state = get();
                if (state.addNotification && typeof state.addNotification === 'function') {
                    state.addNotification({
                        type: 'success',
                        message: `Knowledge base ready with ${currentPointsCount} indexed documents`,
                        duration: 5000,
                    });
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
            logger.error('Knowledge base initialization failed:', error);

            set({
                error: errorMessage,
                isLoading: false,
            });

            // ✅ Safe call to addNotification
            const state = get();
            if (state.addNotification && typeof state.addNotification === 'function') {
                state.addNotification({
                    type: 'error',
                    message: `Knowledge base initialization failed: ${errorMessage}`,
                    duration: 10000,
                });
            }
        }
    },

    /**
     * 🚀 Triggers server-side knowledge indexing via API call.
     * Updates indexing progress, refreshes document count, and sends appropriate notifications.
     */
    triggerIndexing: async () => {
        // ✅ Fixed: Use underscore prefix for unused parameter
        set(_state => ({
            indexingProgress: {
                ..._state.indexingProgress,
                isIndexing: true,
                progress: 'Starting knowledge indexing...',
                errors: [],
            },
        }));

        // ✅ Safe call to addNotification
        const initialState = get();
        if (initialState.addNotification && typeof initialState.addNotification === 'function') {
            initialState.addNotification({
                type: 'info',
                message: 'Knowledge indexing started...',
                duration: 3000,
            });
        }

        try {
            const response = await fetch('/api/knowledge/index-knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            // ✅ Indexing succeeded — update progress and count
            set(_state => ({
                indexingProgress: {
                    filesProcessed: result.filesProcessed || 0,
                    totalFiles: result.filesProcessed || 0,
                    errors: result.errors || [],
                    progress: 'Indexing completed successfully!',
                    isIndexing: false,
                },
                lastIndexedAt: new Date(),
            }));

            await get().refreshIndexedDocumentsCount();

            const hasErrors = result.errors && result.errors.length > 0;

            // ✅ Safe call to addNotification
            const successState = get();
            if (successState.addNotification && typeof successState.addNotification === 'function') {
                successState.addNotification({
                    type: hasErrors ? 'warning' : 'success',
                    message: hasErrors
                        ? `Indexing completed with ${result.errors.length} errors. ${result.filesProcessed} files processed.`
                        : `Successfully indexed ${result.filesProcessed} documents!`,
                    duration: hasErrors ? 10000 : 5000,
                });
            }

            return !hasErrors;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown indexing error';
            logger.error('Knowledge indexing failed:', error);

            set(_state => ({
                indexingProgress: {
                    ..._state.indexingProgress,
                    progress: `Indexing failed: ${errorMessage}`,
                    errors: [errorMessage],
                    isIndexing: false,
                },
                error: errorMessage,
            }));

            // ✅ Safe call to addNotification
            const errorState = get();
            if (errorState.addNotification && typeof errorState.addNotification === 'function') {
                errorState.addNotification({
                    type: 'error',
                    message: `Knowledge indexing failed: ${errorMessage}`,
                    duration: 10000,
                });
            }

            return false;
        }
    },

    /**
     * 🔍 Searches for relevant knowledge chunks using the Qdrant vector DB.
     * Updates the `searchResults` and shows user feedback.
     */
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
                // ✅ Safe call to addNotification
                const state = get();
                if (state.addNotification && typeof state.addNotification === 'function') {
                    state.addNotification({
                        type: 'warning',
                        message: 'No relevant knowledge found for your query. Try different search terms.',
                        duration: 5000,
                    });
                }
            }

            return results;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
            logger.error('Knowledge search failed:', error);

            set({ error: errorMessage });

            // ✅ Safe call to addNotification
            const state = get();
            if (state.addNotification && typeof state.addNotification === 'function') {
                state.addNotification({
                    type: 'error',
                    message: `Knowledge search failed: ${errorMessage}`,
                    duration: 8000,
                });
            }

            return [];
        }
    },

    /**
     * 🔁 Refreshes the count of indexed knowledge documents by querying Qdrant directly.
     */
    refreshIndexedDocumentsCount: async () => {
        try {
            logger.debug('Refreshing indexed documents count...');
            const currentPointsCount = await countKnowledgePoints();

            set({ indexedDocumentsCount: currentPointsCount });

            logger.debug(`Updated indexed count: ${currentPointsCount} documents`);
        } catch (error) {
            // ✅ Fixed: Use the errorMessage variable or remove it
            logger.error('Failed to refresh indexed count:', error);

            // ✅ Safe call to addNotification
            const state = get();
            if (state.addNotification && typeof state.addNotification === 'function') {
                state.addNotification({
                    type: 'error',
                    message: 'Failed to refresh document count',
                    duration: 3000,
                });
            }
        }
    },
});
