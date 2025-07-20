// src/services/QdrantService.ts
import { logger } from '@/lib/Logger';
// import { performanceMonitor } from '@/utils/performance/PerformanceMonitor';
// import { measureAPICall } from '@/utils/performance/measurementHooks';
import { DocumentChunk, QdrantPoint } from '@/types';
import { QdrantClient } from '@qdrant/qdrant-js';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIEmbeddingService } from './OpenAIEmbeddingService';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
export const KNOWLEDGE_COLLECTION_NAME = 'interview_edge_knowledge';
const OPENAI_EMBEDDING_DIMENSION = 1536;

let qdrantClient: QdrantClient | null = null;

// Initial Qdrant Client
export const initQdrantClient = (): QdrantClient => {
    if (!qdrantClient) {
        qdrantClient = new QdrantClient({ url: QDRANT_URL });
        logger.info(`QdrantService: Client initialized for URL: ${QDRANT_URL} 🟢`);
    }
    return qdrantClient;
};

// Ensure Knowledge Collection Exists
export const ensureKnowledgeCollection = async (): Promise<void> => {
    const client = initQdrantClient();

    try {
        const collections = await client.getCollections();
        const collectionExists = collections.collections.some(
            collection => collection.name === KNOWLEDGE_COLLECTION_NAME
        );

        if (!collectionExists) {
            logger.info(
                `QdrantService: Creating collection "${KNOWLEDGE_COLLECTION_NAME}" with ${OPENAI_EMBEDDING_DIMENSION}D vectors...`
            );

            await client.createCollection(KNOWLEDGE_COLLECTION_NAME, {
                vectors: {
                    size: OPENAI_EMBEDDING_DIMENSION,
                    distance: 'Cosine',
                },
            });

            logger.info(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" created successfully.`);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`QdrantService: Error ensuring collection. ${errorMessage}`, error);
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

    return chunks;
};

// Process and Upsert Document
export const processAndUpsertDocument = async (fileName: string, fileContent: string): Promise<void> => {
    const client = initQdrantClient();
    await ensureKnowledgeCollection();

    logger.info(`QdrantService: Processing document "${fileName}" (${fileContent.length} characters)...`);

    if (!fileContent || fileContent.trim().length < 50) {
        logger.warning(`QdrantService: Document "${fileName}" is too short. Skipping.`);
        return;
    }

    const chunks = chunkText(fileContent);
    if (chunks.length === 0) {
        logger.warning(`QdrantService: No valid chunks generated for "${fileName}". Skipping.`);
        return;
    }

    const points: QdrantPoint[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OpenAI API key is not defined in environment variables.');
            }
            const embeddingService = new OpenAIEmbeddingService(apiKey);
            const embedding = await embeddingService.generateEmbeddingVector(chunk);

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
            const errorMessage = error instanceof Error ? error.message : 'Unknown embedding error';
            logger.error(
                `QdrantService: Error generating embedding for chunk ${i + 1} from "${fileName}": ${errorMessage}`
            );
        }
    }

    if (points.length === 0) {
        logger.error(`QdrantService: No valid points generated for "${fileName}".`);
        throw new Error(`Failed to process any chunks for ${fileName}`);
    }

    try {
        logger.info(`QdrantService: Upserting ${points.length} vectors to "${KNOWLEDGE_COLLECTION_NAME}"...`);
        await client.upsert(KNOWLEDGE_COLLECTION_NAME, {
            wait: true,
            points,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown upsert error';
        logger.error(`QdrantService: Error upserting points for "${fileName}": ${errorMessage}`, error);
        throw error;
    }
};

// Search for relevant document chunks
export const searchRelevantChunks = async (query: string, limit = 5): Promise<DocumentChunk[]> => {
    const cacheKey = `search_${query}_${limit}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    try {
        const client = initQdrantClient();
        await ensureKnowledgeCollection();
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is not defined in environment variables.');
        }
        const embeddingService = new OpenAIEmbeddingService(apiKey);

        const queryEmbedding = await embeddingService.generateEmbeddingVector(query);

        const searchResult = await client.search(KNOWLEDGE_COLLECTION_NAME, {
            vector: queryEmbedding,
            limit,
            with_payload: true,
            score_threshold: 0.3,
        });

        const results: DocumentChunk[] = searchResult.map(result => ({
            id: result.id.toString(),
            text: result.payload?.text as string,
            source: result.payload?.source as string,
            score: result.score,
        }));

        try {
            sessionStorage.setItem(cacheKey, JSON.stringify(results));
        } catch {
            // Ignore cache write failures
        }

        return results;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
        logger.error(`QdrantService: Search error: ${errorMessage}`, error);
        return [];
    }
};

// Count indexed knowledge points
export const countKnowledgePoints = async (): Promise<number> => {
    const client = initQdrantClient();
    try {
        const collectionInfo = await client.getCollection(KNOWLEDGE_COLLECTION_NAME);
        return collectionInfo.points_count || 0;
    } catch (error) {
        const isQdrantError = (e: unknown): e is { status?: number; message?: string } =>
            typeof e === 'object' && e !== null;

        if (isQdrantError(error) && (error.status === 404 || error.message?.includes('Not found'))) {
            return 0;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown count error';
        logger.error(`QdrantService: Error counting points: ${errorMessage}`, error);
        return 0;
    }
};
