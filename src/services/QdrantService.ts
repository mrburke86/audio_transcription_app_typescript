// src\services\QdrantService.ts
import { QdrantClient } from '@qdrant/qdrant-js';
import { v4 as uuidv4 } from 'uuid';
import { getOpenAIEmbedding } from './OpenAILLMService';
import { logger } from '@/modules';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
export const KNOWLEDGE_COLLECTION_NAME = 'interview_edge_knowledge';
const OPENAI_EMBEDDING_DIMENSION = 1536;

let qdrantClient: QdrantClient | null = null;

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
        const collections = await client.getCollections();
        const collectionExists = collections.collections.some(collection => collection.name === KNOWLEDGE_COLLECTION_NAME);

        if (!collectionExists) {
            logger.info(
                `QdrantService: Creating collection "${KNOWLEDGE_COLLECTION_NAME}" with ${OPENAI_EMBEDDING_DIMENSION}D vectors... 🛠️`
            );
            const startTime = performance.now();

            await client.createCollection(KNOWLEDGE_COLLECTION_NAME, {
                vectors: {
                    size: OPENAI_EMBEDDING_DIMENSION,
                    distance: 'Cosine',
                },
            });

            const creationTime = Math.round(performance.now() - startTime);
            logger.info(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" created successfully in ${creationTime}ms. ✅`);
            return true;
        }

        logger.info(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" already exists. 👍`);

        // Enhanced: Log collection details
        try {
            const collectionInfo = await client.getCollection(KNOWLEDGE_COLLECTION_NAME);
            logger.debug(
                `Collection info - Points: ${collectionInfo.points_count}, Vectors: ${collectionInfo.config.params.vectors?.size}D, Distance: ${collectionInfo.config.params.vectors?.distance}`
            );
        } catch (infoError) {
            logger.warning('Could not retrieve collection details:', infoError);
        }

        return false;
    } catch (error) {
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

export const processAndUpsertDocument = async (fileName: string, fileContent: string): Promise<void> => {
    const client = initQdrantClient();
    await ensureKnowledgeCollection();

    logger.info(`📄 QdrantService: Processing document "${fileName}" (${fileContent.length} characters)...`);
    const startTime = performance.now();

    // Enhanced content validation
    if (!fileContent || fileContent.trim().length < 50) {
        logger.warning(`QdrantService: Document "${fileName}" is too short (${fileContent.length} chars). Skipping. 📏`);
        return;
    }

    const chunks = chunkText(fileContent);
    if (chunks.length === 0) {
        logger.warning(`QdrantService: No valid chunks generated for "${fileName}". Skipping. 🤷`);
        return;
    }

    logger.debug(`QdrantService: Generated ${chunks.length} chunks for "${fileName}". Processing embeddings...`);

    const points = [];
    let embeddingErrors = 0;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            logger.debug(`QdrantService: Generating embedding for chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`);

            const embeddingStartTime = performance.now();
            const embedding = await getOpenAIEmbedding(chunk);
            const embeddingTime = Math.round(performance.now() - embeddingStartTime);

            // Validate embedding
            if (!embedding || embedding.length !== OPENAI_EMBEDDING_DIMENSION) {
                throw new Error(`Invalid embedding: expected ${OPENAI_EMBEDDING_DIMENSION}D, got ${embedding?.length || 0}D`);
            }

            logger.debug(`QdrantService: Embedding generated in ${embeddingTime}ms (${embedding.length}D vector)`);

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
            logger.error(`QdrantService: Error generating embedding for chunk ${i + 1} from "${fileName}": ${errorMessage} 💔`);

            // Log chunk preview for debugging
            logger.debug(`Failed chunk preview: "${chunk.substring(0, 100)}..."`);
        }
    }

    if (points.length > 0) {
        try {
            logger.info(`QdrantService: Upserting ${points.length} vectors to "${KNOWLEDGE_COLLECTION_NAME}"...`);
            const upsertStartTime = performance.now();

            await client.upsert(KNOWLEDGE_COLLECTION_NAME, {
                wait: true,
                points: points,
            });

            const upsertTime = Math.round(performance.now() - upsertStartTime);
            const totalTime = Math.round(performance.now() - startTime);

            logger.info(
                `✅ QdrantService: Successfully upserted ${points.length}/${chunks.length} chunks from "${fileName}" in ${totalTime}ms (upsert: ${upsertTime}ms). 💾`
            );

            if (embeddingErrors > 0) {
                logger.warning(`QdrantService: ${embeddingErrors} embedding errors occurred during processing of "${fileName}"`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown upsert error';
            logger.error(`QdrantService: Error upserting points for "${fileName}": ${errorMessage} 🔥`, error);
            throw error;
        }
    } else {
        logger.error(`QdrantService: No valid points generated for "${fileName}" due to embedding failures. 😞`);
        throw new Error(`Failed to process any chunks for ${fileName}`);
    }
};

export const searchRelevantChunks = async (query: string, limit = 5): Promise<DocumentChunk[]> => {
    const client = initQdrantClient();
    await ensureKnowledgeCollection();

    logger.debug(`🔍 QdrantService: Starting search for "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}" (limit: ${limit})`);
    const startTime = performance.now();

    try {
        // Generate query embedding with timing
        const embeddingStartTime = performance.now();
        const queryEmbedding = await getOpenAIEmbedding(query);
        const embeddingTime = Math.round(performance.now() - embeddingStartTime);

        logger.debug(`QdrantService: Query embedding generated in ${embeddingTime}ms (${queryEmbedding.length}D vector)`);

        // Perform search with enhanced parameters
        const searchStartTime = performance.now();
        const searchResult = await client.search(KNOWLEDGE_COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: limit,
            with_payload: true,
            score_threshold: 0.3, // Filter out very low similarity results
        });
        const searchTime = Math.round(performance.now() - searchStartTime);
        const totalTime = Math.round(performance.now() - startTime);

        logger.info(
            `📚 QdrantService: Search completed in ${totalTime}ms (embedding: ${embeddingTime}ms, search: ${searchTime}ms). Found ${searchResult.length} chunks.`
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

        // Log detailed search results for debugging
        if (results.length > 0) {
            const scoreRange =
                results.length > 1
                    ? `${Math.round((results[results.length - 1].score || 0) * 100)}%-${Math.round((results[0].score || 0) * 100)}%`
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
            logger.warning(`🤔 No chunks found above similarity threshold (30%). Try different query terms or check indexing.`);
        }

        return results;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
        logger.error(`💥 QdrantService: Search error after ${Math.round(performance.now() - startTime)}ms: ${errorMessage}`, error);
        return [];
    }
};

export const countKnowledgePoints = async (): Promise<number> => {
    const client = initQdrantClient();
    try {
        logger.debug(`QdrantService: Counting points in "${KNOWLEDGE_COLLECTION_NAME}"...`);
        const collectionInfo = await client.getCollection(KNOWLEDGE_COLLECTION_NAME);
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
            logger.warning(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" not found during count. Assuming 0 points. 👻`);
            return 0;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown count error';
        logger.error(`QdrantService: Error counting points: ${errorMessage} 📉`, error);
        return 0;
    }
};
