// src/stores/slices/knowledgeSlice.ts
import { logger } from '@/lib/Logger';
import {
    countKnowledgePoints,
    ensureKnowledgeCollection,
    initQdrantClient,
    KNOWLEDGE_COLLECTION_NAME,
    searchRelevantChunks,
} from '@/services/QdrantService';
import { IndexingStatus, KnowledgeSlice } from '@/types';
import { StateCreator } from 'zustand';

export const createKnowledgeSlice: StateCreator<KnowledgeSlice> = (set, get) => ({
    knowledgeLoading: true,
    knowledgeError: null,
    indexedDocumentsCount: 0,
    lastIndexedAt: null,
    indexingStatus: { isIndexing: false, progress: '', filesProcessed: 0, totalFiles: 0, errors: [] },
    knowledgeBaseName: `Qdrant Collection: ${KNOWLEDGE_COLLECTION_NAME}`,

    // Initialize the knowledge base
    initializeKnowledgeBase: async (): Promise<void> => {
        if (typeof performance !== 'undefined') {
            performance.clearMarks(); // Add: Clean previous marks
            performance.mark('knowledge-init-start'); // Start before logger
        }
        logger.info('📚 Initializing Knowledge Base...');
        set({ knowledgeLoading: true, knowledgeError: null });
        try {
            initQdrantClient();
            await ensureKnowledgeCollection();
            const count = await countKnowledgePoints();
            set({ indexedDocumentsCount: count });

            if (count === 0) {
                logger.warning(`Knowledge base initialized but is EMPTY.`);
            } else {
                logger.info(`Knowledge base initialized with ${count} documents.`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown initialization error';
            logger.error(`❌ Knowledge base initialization failed: ${message}`, err);
            set({ knowledgeError: message });
        } finally {
            set({ knowledgeLoading: false });
            if (typeof performance !== 'undefined') {
                performance.mark('knowledge-init-end'); // End in finally (captures errors)
                const measure = performance.measure(
                    'Knowledge Init Duration',
                    'knowledge-init-start',
                    'knowledge-init-end'
                );
                console.log('[DIAG-Perf] Knowledge Init:', measure.duration + 'ms');
            }
        }
    },

    // Refresh the count of indexed documents
    refreshIndexedDocumentsCount: async (): Promise<void> => {
        try {
            logger.debug('🔄 Refreshing indexed document count...');
            const count = await countKnowledgePoints();
            set({ indexedDocumentsCount: count });
            logger.debug(`Indexed documents updated: ${count}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error refreshing count';
            logger.error(`❌ Failed to refresh document count: ${message}`, err);
        }
    },

    // Trigger knowledge indexing process
    triggerIndexing: async (): Promise<boolean> => {
        logger.info('⚙️ Triggering Knowledge Indexing...');
        set({
            indexingStatus: {
                isIndexing: true,
                progress: 'Starting indexing...',
                filesProcessed: 0,
                totalFiles: 0,
                errors: [],
            },
        });

        try {
            const response = await fetch('/api/knowledge/index-knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error ?? `HTTP ${response.status}`);
            }

            const updatedStatus: IndexingStatus = {
                isIndexing: false,
                progress: 'Indexing completed successfully!',
                filesProcessed: result.filesProcessed || 0,
                totalFiles: result.filesProcessed || 0,
                errors: result.errors || [],
            };

            set({ indexingStatus: updatedStatus, lastIndexedAt: new Date() });
            await get().refreshIndexedDocumentsCount();

            if (result.errors?.length) {
                logger.warning(`Indexing finished with ${result.errors.length} errors`);
                logger.debug(`Indexing errors: ${JSON.stringify(result.errors)}`);
                return false;
            }

            logger.info(`✅ Indexing complete: ${result.filesProcessed} files processed`);
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown indexing error';
            logger.error(`❌ Indexing failed: ${message}`, err);

            set({
                indexingStatus: {
                    isIndexing: false,
                    progress: `Indexing failed: ${message}`,
                    filesProcessed: 0,
                    totalFiles: 0,
                    errors: [message],
                },
                knowledgeError: message,
            });

            return false;
        }
    },

    // Search for relevant knowledge chunks based on a query
    searchRelevantKnowledge: async (query: string, limit = 3) => {
        const { knowledgeError } = get();

        if (knowledgeError) {
            logger.error(`🚫 Skipping search due to initialization error: ${knowledgeError}`);
            return [];
        }

        logger.debug(
            `🔍 Searching knowledge: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}" (limit: ${limit})`
        );

        try {
            const start = performance.now();
            const results = await searchRelevantChunks(query, limit);
            const duration = Math.round(performance.now() - start);

            logger.info(`🔎 Search complete in ${duration}ms — ${results.length} results found`);

            if (results.length > 0) {
                logger.debug(results.map(r => `→ "${r.text.slice(0, 60)}..." (from: ${r.source})`).join(' | '));
            } else {
                logger.warning('🕵️‍♂️ No relevant chunks found. Check query or indexing status.');
            }

            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown search error';
            logger.error(`❌ Search failed: ${message}`, err);
            set({ knowledgeError: message });
            return [];
        }
    },
});
