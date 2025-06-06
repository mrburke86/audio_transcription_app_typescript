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
import { logger } from '@/modules/Logger';

const SLICE = 'KnowledgeSlice';

export const createKnowledgeSlice: StateCreator<AppState, [], [], KnowledgeSlice> = (set, get) => ({
    /* ------------------------------------------------------------------ *
     * 📊  STATE
     * ------------------------------------------------------------------ */
    indexedDocumentsCount: 0,
    knowledgeBaseName: `Qdrant Collection: ${KNOWLEDGE_COLLECTION_NAME}`,
    kbIsLoading: false,
    kbError: null,
    lastIndexedAt: null,
    indexingProgress: {
        filesProcessed: 0,
        totalFiles: 0,
        errors: [],
        progress: '',
    },
    searchResults: [],

    /* ------------------------------------------------------------------ *
     * 🛠  INITIALIZE KNOWLEDGE BASE
     * ------------------------------------------------------------------ */
    initializeKnowledgeBase: async () => {
        set({ kbIsLoading: true, kbError: null });

        try {
            logger.info(`[${SLICE}] ⏳ Initializing knowledge base…`);
            initQdrantClient();
            await ensureKnowledgeCollection();

            const count = await countKnowledgePoints();

            set({ indexedDocumentsCount: count, kbIsLoading: false });

            if (count === 0) {
                logger.warning(`[${SLICE}] ⚠️ Knowledge base empty`);
                get().addNotification?.({
                    type: 'warning',
                    message: 'Knowledge base is empty. Click "Index Knowledge" to get started.',
                    duration: 8_000,
                });
            } else {
                logger.info(`[${SLICE}] ✅ ${count} docs indexed`);
                get().addNotification?.({
                    type: 'success',
                    message: `Knowledge base ready with ${count} indexed documents`,
                    duration: 5_000,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown initialization error';
            logger.error(`[${SLICE}] ❌ Init failed: ${message}`, err);

            set({ kbError: message, kbIsLoading: false });

            get().addNotification?.({
                type: 'error',
                message: `Knowledge base initialization failed: ${message}`,
                duration: 10_000,
            });
        }
    },

    /* ------------------------------------------------------------------ *
     * 🚀  TRIGGER INDEXING
     * ------------------------------------------------------------------ */
    triggerIndexing: async () => {
        set(state => ({
            indexingProgress: {
                ...state.indexingProgress,
                isIndexing: true,
                progress: 'Starting knowledge indexing…',
                errors: [],
            },
        }));

        get().addNotification?.({
            type: 'info',
            message: 'Knowledge indexing started…',
            duration: 3_000,
        });

        try {
            const res = await fetch('/api/knowledge/index-knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || `HTTP ${res.status}`);
            }

            set(() => ({
                indexingProgress: {
                    filesProcessed: result.filesProcessed ?? 0,
                    totalFiles: result.filesProcessed ?? 0,
                    errors: result.errors ?? [],
                    progress: 'Indexing completed successfully!',
                    isIndexing: false,
                },
                lastIndexedAt: new Date(),
            }));

            await get().refreshIndexedDocumentsCount();

            const hasErrors = result.errors?.length > 0;
            get().addNotification?.({
                type: hasErrors ? 'warning' : 'success',
                message: hasErrors
                    ? `Indexing completed with ${result.errors.length} errors`
                    : `Indexed ${result.filesProcessed} documents successfully`,
                duration: hasErrors ? 10_000 : 5_000,
            });

            return !hasErrors;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown indexing error';
            logger.error(`[${SLICE}] ❌ Indexing failed: ${message}`, err);

            set(state => ({
                indexingProgress: {
                    ...state.indexingProgress,
                    progress: `Indexing failed: ${message}`,
                    errors: [message],
                    isIndexing: false,
                },
                error: message,
            }));

            get().addNotification?.({
                type: 'error',
                message: `Knowledge indexing failed: ${message}`,
                duration: 10_000,
            });

            return false;
        }
    },

    /* ------------------------------------------------------------------ *
     * 🔍  SEARCH KNOWLEDGE
     * ------------------------------------------------------------------ */
    searchRelevantKnowledge: async (query, limit = 3) => {
        if (get().kbError) {
            logger.error(`[${SLICE}] 🚫 Search aborted due to existing error`);
            return [];
        }

        logger.debug(`[${SLICE}] 🔎 Searching for: "${query.slice(0, 50)}${query.length > 50 ? '…' : ''}"`);
        try {
            const t0 = performance.now();
            const results = await searchRelevantChunks(query, limit);
            const elapsed = Math.round(performance.now() - t0);

            set({ searchResults: results });
            logger.info(`[${SLICE}] ✅ Search completed in ${elapsed} ms (${results.length} hits)`);

            if (results.length === 0) {
                get().addNotification?.({
                    type: 'warning',
                    message: 'No relevant knowledge found. Try different search terms.',
                    duration: 5_000,
                });
            }

            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown search error';
            logger.error(`[${SLICE}] ❌ Search failed: ${message}`, err);

            set({ kbError: message });
            get().addNotification?.({
                type: 'error',
                message: `Knowledge search failed: ${message}`,
                duration: 8_000,
            });

            return [];
        }
    },

    /* ------------------------------------------------------------------ *
     * 🔁  REFRESH DOC COUNT
     * ------------------------------------------------------------------ */
    refreshIndexedDocumentsCount: async () => {
        try {
            logger.debug(`[${SLICE}] 🔄 Refreshing indexed count…`);
            const count = await countKnowledgePoints();
            set({ indexedDocumentsCount: count });
            logger.debug(`[${SLICE}] 📈 New indexed count: ${count}`);
        } catch (err) {
            logger.error(`[${SLICE}] ❌ Failed to refresh count`, err);
            get().addNotification?.({
                type: 'error',
                message: 'Failed to refresh document count',
                duration: 3_000,
            });
        }
    },
});
