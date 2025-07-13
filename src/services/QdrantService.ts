// src/services/QdrantService.ts
import { logger } from '@/modules';
import { performanceMonitor } from '@/utils/performance/PerformanceMonitor';
import { measureAPICall } from '@/utils/performance/measurementHooks';
import { QdrantClient } from '@qdrant/qdrant-js';
import { v4 as uuidv4 } from 'uuid';
import { getOpenAIEmbedding } from './OpenAILLMService';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
export const KNOWLEDGE_COLLECTION_NAME = 'interview_edge_knowledge';
const OPENAI_EMBEDDING_DIMENSION = 1536;

let qdrantClient: QdrantClient | null = null;

// ✅ NEW: Performance tracking for service
const serviceStats = {
    totalSearches: 0,
    totalUpserts: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0,
    totalErrors: 0,
};

export const initQdrantClient = (): QdrantClient => {
    if (!qdrantClient) {
        qdrantClient = new QdrantClient({ url: QDRANT_URL });
        logger.info(`QdrantService: Client initialized for URL: ${QDRANT_URL} 🟢`);
    }
    return qdrantClient;
};

export const ensureKnowledgeCollection = async (): Promise<boolean> => {
    const client = initQdrantClient();
    try {
        logger.debug(`QdrantService: Checking if collection "${KNOWLEDGE_COLLECTION_NAME}" exists...`);

        // ✅ ENHANCED: Wrap collection check with API reliability tracking
        const collections = await measureAPICall(() => client.getCollections(), 'Qdrant-GetCollections', {
            timeout: 10000,
            retries: 2,
        });

        const collectionExists = collections.collections.some(
            collection => collection.name === KNOWLEDGE_COLLECTION_NAME
        );

        if (!collectionExists) {
            logger.info(
                `QdrantService: Creating collection "${KNOWLEDGE_COLLECTION_NAME}" with ${OPENAI_EMBEDDING_DIMENSION}D vectors... 🛠️`
            );
            const startTime = performance.now();

            // ✅ ENHANCED: Wrap collection creation with API reliability tracking
            await measureAPICall(
                () =>
                    client.createCollection(KNOWLEDGE_COLLECTION_NAME, {
                        vectors: {
                            size: OPENAI_EMBEDDING_DIMENSION,
                            distance: 'Cosine',
                        },
                    }),
                'Qdrant-CreateCollection',
                { timeout: 30000, retries: 1 } // Longer timeout for collection creation
            );

            const creationTime = Math.round(performance.now() - startTime);
            logger.info(
                `QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" created successfully in ${creationTime}ms. ✅`
            );
            return true;
        }

        logger.info(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" already exists. 👍`);

        // ✅ ENHANCED: Wrap collection info retrieval with API tracking
        try {
            const collectionInfo = await measureAPICall(
                () => client.getCollection(KNOWLEDGE_COLLECTION_NAME),
                'Qdrant-GetCollectionInfo',
                { timeout: 5000, retries: 1 }
            );

            logger.debug(
                `Collection info - Points: ${collectionInfo.points_count}, Vectors: ${collectionInfo.config.params.vectors?.size}D, Distance: ${collectionInfo.config.params.vectors?.distance}`
            );
        } catch (infoError) {
            logger.warning('Could not retrieve collection details:', infoError);
        }

        return false;
    } catch (error) {
        serviceStats.totalErrors++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`QdrantService: Error ensuring collection. ${errorMessage} ❌`, error);
        throw error;
    }
};

// Enhanced text chunking with better logging
const chunkText = (text: string, chunkSize = 800, overlap = 100): string[] => {
    if (!text || text.trim().length === 0) {
        logger.warning('QdrantService: Empty or null text provided to chunkText function');
        return [];
    }

    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
        const end = Math.min(i + chunkSize, text.length);
        const chunk = text.substring(i, end).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        i += chunkSize - overlap;
        if (end === text.length) break;
    }

    logger.debug(
        `QdrantService: Generated ${chunks.length} chunks (size: ${chunkSize}, overlap: ${overlap}) from ${text.length} characters`
    );
    return chunks;
};

export interface DocumentChunk {
    id: string;
    text: string;
    source: string;
    score?: number; // For search results
}

// ✅ NEW: Interface for Qdrant points
interface QdrantPoint {
    id: string;
    payload: {
        text: string;
        source: string;
        chunk_index: number;
        chunk_length: number;
        processed_at: string;
    };
    vector: number[];
}

export const processAndUpsertDocument = async (fileName: string, fileContent: string): Promise<void> => {
    const client = initQdrantClient();
    await ensureKnowledgeCollection();

    logger.info(`📄 QdrantService: Processing document "${fileName}" (${fileContent.length} characters)...`);
    const startTime = performance.now();

    // Enhanced content validation
    if (!fileContent || fileContent.trim().length < 50) {
        logger.warning(
            `QdrantService: Document "${fileName}" is too short (${fileContent.length} chars). Skipping. 📏`
        );
        return;
    }

    const chunks = chunkText(fileContent);
    if (chunks.length === 0) {
        logger.warning(`QdrantService: No valid chunks generated for "${fileName}". Skipping. 🤷`);
        return;
    }

    logger.debug(`QdrantService: Generated ${chunks.length} chunks for "${fileName}". Processing embeddings...`);

    const points: QdrantPoint[] = []; // ✅ FIXED: Explicit typing
    let embeddingErrors = 0;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            logger.debug(
                `QdrantService: Generating embedding for chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`
            );

            // ✅ ENHANCED: Embedding generation is already tracked in OpenAILLMService
            // Just get the embedding - API reliability tracking happens there
            const embedding = await getOpenAIEmbedding(chunk);

            // Validate embedding
            if (!embedding || embedding.length !== OPENAI_EMBEDDING_DIMENSION) {
                throw new Error(
                    `Invalid embedding: expected ${OPENAI_EMBEDDING_DIMENSION}D, got ${embedding?.length || 0}D`
                );
            }

            points.push({
                id: uuidv4(),
                payload: {
                    text: chunk,
                    source: fileName,
                    chunk_index: i,
                    chunk_length: chunk.length,
                    processed_at: new Date().toISOString(),
                },
                vector: embedding,
            });
        } catch (error) {
            embeddingErrors++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown embedding error';
            logger.error(
                `QdrantService: Error generating embedding for chunk ${i + 1} from "${fileName}": ${errorMessage} 💔`
            );

            // Log chunk preview for debugging
            logger.debug(`Failed chunk preview: "${chunk.substring(0, 100)}..."`);
        }
    }

    if (points.length > 0) {
        try {
            logger.info(`QdrantService: Upserting ${points.length} vectors to "${KNOWLEDGE_COLLECTION_NAME}"...`);
            const upsertStartTime = performance.now();

            // ✅ ENHANCED: Wrap upsert with API reliability tracking
            await measureAPICall(
                () =>
                    client.upsert(KNOWLEDGE_COLLECTION_NAME, {
                        wait: true,
                        points: points,
                    }),
                'Qdrant-Upsert',
                { timeout: 60000, retries: 2 } // Long timeout for large upserts
            );

            serviceStats.totalUpserts++;
            const upsertTime = Math.round(performance.now() - upsertStartTime);
            const totalTime = Math.round(performance.now() - startTime);

            logger.info(
                `✅ QdrantService: Successfully upserted ${points.length}/${chunks.length} chunks from "${fileName}" in ${totalTime}ms (upsert: ${upsertTime}ms). 💾`
            );

            if (embeddingErrors > 0) {
                logger.warning(
                    `QdrantService: ${embeddingErrors} embedding errors occurred during processing of "${fileName}"`
                );
            }
        } catch (error) {
            serviceStats.totalErrors++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown upsert error';
            logger.error(`QdrantService: Error upserting points for "${fileName}": ${errorMessage} 🔥`, error);
            throw error;
        }
    } else {
        serviceStats.totalErrors++;
        logger.error(`QdrantService: No valid points generated for "${fileName}" due to embedding failures. 😞`);
        throw new Error(`Failed to process any chunks for ${fileName}`);
    }
};

export const searchRelevantChunks = async (query: string, limit = 5): Promise<DocumentChunk[]> => {
    // ✅ ALREADY PERFECT: Track vector search performance
    const startTime = performanceMonitor.trackVectorSearchStart();
    serviceStats.totalSearches++;

    try {
        // ✅ ENHANCED: Check cache with performance tracking
        const cacheKey = `search_${query}_${limit}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            serviceStats.totalCacheHits++;
            performanceMonitor.trackVectorSearchEnd(startTime, true); // from cache
            logger.debug(
                `🎯 Cache hit for query: "${query.substring(0, 30)}..." (${JSON.parse(cached).length} results)`
            );
            return JSON.parse(cached);
        }

        serviceStats.totalCacheMisses++;

        // Perform actual search
        const client = initQdrantClient();
        await ensureKnowledgeCollection();

        logger.debug(
            `🔍 QdrantService: Starting search for "${query.substring(0, 50)}${
                query.length > 50 ? '...' : ''
            }" (limit: ${limit})`
        );

        // ✅ ENHANCED: Embedding generation is already tracked in OpenAILLMService
        const queryEmbedding = await getOpenAIEmbedding(query);

        // ✅ ENHANCED: Wrap search with API reliability tracking
        const searchResult = await measureAPICall(
            () =>
                client.search(KNOWLEDGE_COLLECTION_NAME, {
                    vector: queryEmbedding,
                    limit: limit,
                    with_payload: true,
                    score_threshold: 0.3, // Filter out very low similarity results
                }),
            'Qdrant-Search',
            { timeout: 15000, retries: 2 } // 15s timeout for search
        );

        // Enhanced result processing with scoring
        const results = searchResult.map(result => {
            const chunk: DocumentChunk = {
                id: result.id.toString(),
                text: result.payload?.text as string,
                source: result.payload?.source as string,
                score: result.score,
            };
            return chunk;
        });

        // ✅ ENHANCED: Log search performance and cache statistics
        if (results.length > 0) {
            const scoreRange =
                results.length > 1
                    ? `${Math.round((results[results.length - 1].score || 0) * 100)}%-${Math.round(
                          (results[0].score || 0) * 100
                      )}%`
                    : `${Math.round((results[0].score || 0) * 100)}%`;

            logger.debug(`Search results: ${results.length} chunks with similarity ${scoreRange}`);

            results.forEach((result, i) => {
                logger.debug(
                    `  ${i + 1}. "${result.text.substring(0, 80)}..." from ${result.source} (${Math.round(
                        (result.score || 0) * 100
                    )}% match)`
                );
            });
        } else {
            logger.warning(
                `🤔 No chunks found above similarity threshold (30%). Try different query terms or check indexing.`
            );
        }

        // ✅ ENHANCED: Cache results with size tracking
        const cacheData = JSON.stringify(results);
        const cacheSize = new Blob([cacheData]).size;

        try {
            sessionStorage.setItem(cacheKey, cacheData);
            logger.debug(`💾 Cached ${results.length} search results (${(cacheSize / 1024).toFixed(1)}KB)`);
        } catch (cacheError) {
            logger.warning(`Failed to cache search results: ${cacheError}`);
        }

        performanceMonitor.trackVectorSearchEnd(startTime, false); // not from cache
        return results;
    } catch (error) {
        serviceStats.totalErrors++;
        performanceMonitor.trackVectorSearchEnd(startTime, false);
        const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
        logger.error(`💥 QdrantService: Search error: ${errorMessage}`, error);
        return [];
    }
};

export const countKnowledgePoints = async (): Promise<number> => {
    const client = initQdrantClient();
    try {
        logger.debug(`QdrantService: Counting points in "${KNOWLEDGE_COLLECTION_NAME}"...`);

        // ✅ ENHANCED: Wrap count operation with API reliability tracking
        const collectionInfo = await measureAPICall(
            () => client.getCollection(KNOWLEDGE_COLLECTION_NAME),
            'Qdrant-GetCollectionCount',
            { timeout: 5000, retries: 1 }
        );

        const count = collectionInfo.points_count || 0;

        logger.info(`📊 QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" contains ${count} indexed points.`);

        // Additional collection statistics
        if (count > 0) {
            logger.debug(
                `Collection stats - Vector size: ${collectionInfo.config.params.vectors?.size}D, Distance metric: ${collectionInfo.config.params.vectors?.distance}`
            );
        }

        return count;
    } catch (error) {
        const isQdrantError = (e: unknown): e is { status?: number; message?: string } => {
            return typeof e === 'object' && e !== null;
        };

        if (isQdrantError(error) && (error.status === 404 || error.message?.includes('Not found'))) {
            logger.warning(
                `QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" not found during count. Assuming 0 points. 👻`
            );
            return 0;
        }

        serviceStats.totalErrors++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown count error';
        logger.error(`QdrantService: Error counting points: ${errorMessage} 📉`, error);
        return 0;
    }
};

// ✅ NEW: Get service performance statistics
export const getQdrantServiceStats = () => {
    const cacheHitRate =
        serviceStats.totalSearches > 0
            ? ((serviceStats.totalCacheHits / serviceStats.totalSearches) * 100).toFixed(1) + '%'
            : '0%';

    const errorRate =
        serviceStats.totalSearches + serviceStats.totalUpserts > 0
            ? ((serviceStats.totalErrors / (serviceStats.totalSearches + serviceStats.totalUpserts)) * 100).toFixed(1) +
              '%'
            : '0%';

    return {
        totalSearches: serviceStats.totalSearches,
        totalUpserts: serviceStats.totalUpserts,
        cacheHits: serviceStats.totalCacheHits,
        cacheMisses: serviceStats.totalCacheMisses,
        cacheHitRate,
        totalErrors: serviceStats.totalErrors,
        errorRate,
        // Estimate cache size
        estimatedCacheSize: Object.keys(sessionStorage).filter(key => key.startsWith('search_')).length,
    };
};

// ✅ NEW: Clear service cache and reset stats
export const clearQdrantCache = () => {
    const cacheKeys = Object.keys(sessionStorage).filter(key => key.startsWith('search_'));
    cacheKeys.forEach(key => sessionStorage.removeItem(key));

    logger.info(`🧹 Cleared ${cacheKeys.length} cached search results`);

    // Reset cache stats
    serviceStats.totalCacheHits = 0;
    serviceStats.totalCacheMisses = 0;

    return cacheKeys.length;
};
