// src/services/QdrantService.ts
import { logger } from '@/lib/Logger';
import { OpenAIEmbeddingService } from '@/services/OpenAIEmbeddingService';
import { DocumentChunk } from '@/types';
import { QdrantClient } from '@qdrant/qdrant-js';
import { v4 as uuidv4 } from 'uuid';
export const KNOWLEDGE_COLLECTION_NAME = 'interview_edge_knowledge';
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const apiKey = process.env.OPENAI_API_KEY;
const CHUNK_SIZE = 800; // Characters per chunk
const CHUNK_OVERLAP = 100; // Overlap between chunks
const OPENAI_EMBEDDING_DIMENSION = 1536;

let qdrantClient: QdrantClient | null = null;
let embeddingService: OpenAIEmbeddingService | null = null;

// Initial Qdrant Client
export function initQdrantClient(): void {
    if (!apiKey) {
        throw new Error('OpenAI API key is required for embeddings');
    }

    qdrantClient = new QdrantClient({
        url: QDRANT_URL,
        // apiKey: process.env.QDRANT_API_KEY, // Optional Qdrant API key
    });

    embeddingService = new OpenAIEmbeddingService(apiKey);

    logger.info(`QdrantService: Client initialized for URL: ${QDRANT_URL} 🟢`);
}

// Ensure Knowledge Collection Exists
export async function ensureKnowledgeCollection(): Promise<void> {
    if (!qdrantClient) {
        throw new Error('Qdrant client not initialized');
    }

    try {
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            collection => collection.name === KNOWLEDGE_COLLECTION_NAME
        );

        if (!collectionExists) {
            logger.info(
                `QdrantService: Creating collection "${KNOWLEDGE_COLLECTION_NAME}" with ${OPENAI_EMBEDDING_DIMENSION}D vectors...`
            );

            await qdrantClient.createCollection(KNOWLEDGE_COLLECTION_NAME, {
                vectors: {
                    size: OPENAI_EMBEDDING_DIMENSION,
                    distance: 'Cosine',
                },
                optimizers_config: {
                    default_segment_number: 2,
                },
                replication_factor: 1,
            });

            logger.info(`Collection ${KNOWLEDGE_COLLECTION_NAME} created successfully`);
        } else {
            logger.debug(`Collection ${KNOWLEDGE_COLLECTION_NAME} already exists`);
        }
    } catch (error) {
        logger.error(`Failed to ensure collection: ${(error as Error).message}`);
        throw error;
    }
}

// Count indexed knowledge points
export const countKnowledgePoints = async (): Promise<number> => {
    if (!qdrantClient) {
        throw new Error('Qdrant client not initialized');
    }

    try {
        const collectionInfo = await qdrantClient.getCollection(KNOWLEDGE_COLLECTION_NAME);
        return collectionInfo.points_count || 0;
    } catch (error) {
        const isQdrantError = (e: unknown): e is { status?: number; message?: string } =>
            typeof e === 'object' && e !== null;

        if (isQdrantError(error) && (error.status === 404 || error.message?.includes('Not found'))) {
            return 0;
        }

        logger.error(`Failed to count knowledge points: ${(error as Error).message}`);
        return 0;
    }
};

// Chunk text with overlap
function chunkText(text: string, source: string): Array<{ text: string; metadata: any }> {
    const chunks: Array<{ text: string; metadata: any }> = [];
    const cleanText = text.trim();

    if (!cleanText || cleanText.length === 0) {
        logger.warning(`Empty text provided for chunking from source: ${source}`);
        return [];
    }

    if (cleanText.length <= CHUNK_SIZE) {
        chunks.push({
            text: cleanText,
            metadata: {
                source,
                chunk_index: 0,
                chunk_length: cleanText.length,
                total_chunks: 1,
            },
        });
        return chunks;
    }

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < cleanText.length) {
        let endIndex = Math.min(startIndex + CHUNK_SIZE, cleanText.length);

        // Find a good break point (end of sentence or paragraph)
        if (endIndex < cleanText.length) {
            const nextPeriod = cleanText.indexOf('.', endIndex - 100);
            const nextNewline = cleanText.indexOf('\n', endIndex - 100);

            if (nextPeriod > endIndex - 100 && nextPeriod < endIndex + 100) {
                endIndex = nextPeriod + 1;
            } else if (nextNewline > endIndex - 100 && nextNewline < endIndex + 100) {
                endIndex = nextNewline + 1;
            }
        }

        const chunkText = cleanText.slice(startIndex, endIndex).trim();

        if (chunkText.length > 0) {
            chunks.push({
                text: chunkText,
                metadata: {
                    source,
                    chunk_index: chunkIndex,
                    chunk_length: chunkText.length,
                    total_chunks: -1, // Will be updated later
                },
            });
            chunkIndex++;
        }

        startIndex = endIndex - CHUNK_OVERLAP;
        if (endIndex === cleanText.length) break;
    }

    // Update total chunks count
    chunks.forEach(chunk => {
        chunk.metadata.total_chunks = chunks.length;
    });

    logger.debug(`Chunked text from ${source} into ${chunks.length} chunks`);
    return chunks;
}

// Process and Upsert Document
export async function processAndUpsertDocument(fileName: string, fileContent: string): Promise<void> {
    if (!qdrantClient || !embeddingService) {
        throw new Error('Services not initialized');
    }

    const startTime = performance.now();
    logger.info(`Processing document: ${fileName} (${fileContent.length} characters)`);

    if (!fileContent || fileContent.trim().length < 50) {
        logger.warning(`Document "${fileName}" is too short (${fileContent.length} chars). Skipping.`);
        return;
    }

    try {
        // Chunk the document
        const chunks = chunkText(fileContent, fileName);
        if (chunks.length === 0) {
            logger.warning(`No valid chunks generated for "${fileName}". Skipping.`);
            return;
        }

        logger.debug(`Document chunked into ${chunks.length} pieces`);

        // Generate embeddings and prepare points
        const points: any[] = []; // Using any[] for compatibility

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const chunkId = uuidv4();

            try {
                // Generate embedding
                const embedding = await embeddingService.generateEmbeddingVector(chunk.text);

                if (!embedding || embedding.length !== OPENAI_EMBEDDING_DIMENSION) {
                    throw new Error(
                        `Invalid embedding: expected ${OPENAI_EMBEDDING_DIMENSION}D, got ${embedding?.length || 0}D`
                    );
                }

                points.push({
                    id: chunkId,
                    vector: embedding,
                    payload: {
                        text: chunk.text,
                        source: fileName,
                        chunk_index: chunk.metadata.chunk_index,
                        chunk_length: chunk.metadata.chunk_length,
                        total_chunks: chunk.metadata.total_chunks,
                        processed_at: new Date().toISOString(),
                    },
                });
            } catch (error) {
                logger.error(`Failed to generate embedding for chunk ${i} of ${fileName}: ${(error as Error).message}`);
                // Continue with other chunks
            }
        }

        // Upsert points to Qdrant
        if (points.length > 0) {
            logger.info(`Upserting ${points.length} vectors to "${KNOWLEDGE_COLLECTION_NAME}"...`);

            await qdrantClient.upsert(KNOWLEDGE_COLLECTION_NAME, {
                wait: true,
                points,
            });

            const processingTime = Math.round(performance.now() - startTime);
            logger.info(
                `✅ Document ${fileName} processed successfully: ${points.length} chunks in ${processingTime}ms`
            );
        } else {
            throw new Error(`No valid embeddings generated for ${fileName}`);
        }
    } catch (error) {
        logger.error(`Failed to process document ${fileName}: ${(error as Error).message}`);
        throw error;
    }
}

// Search for relevant document chunks
export async function searchRelevantChunks(query: string, limit: number = 5): Promise<DocumentChunk[]> {
    if (!qdrantClient || !embeddingService) {
        throw new Error('Services not initialized');
    }

    // Try to get from session storage cache
    const cacheKey = `search_${query}_${limit}`;
    if (typeof window !== 'undefined') {
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                logger.debug('Returning cached search results');
                return JSON.parse(cached);
            }
        } catch (e) {
            // Ignore cache errors
        }
    }

    try {
        logger.debug(`Searching for: "${query.slice(0, 50)}..." (limit: ${limit})`);

        // Generate query embedding
        const queryEmbedding = await embeddingService.generateEmbeddingVector(query);

        // Search in Qdrant
        const searchResult = await qdrantClient.search(KNOWLEDGE_COLLECTION_NAME, {
            vector: queryEmbedding,
            limit,
            with_payload: true,
            score_threshold: 0.3, // Minimum similarity score
        });

        // Convert to DocumentChunk format
        const chunks: DocumentChunk[] = searchResult.map(result => ({
            id: result.id.toString(),
            text: (result.payload?.text ?? '') as string,
            source: (result.payload?.source ?? 'Unknown') as string,
            score: result.score,
        }));

        logger.info(`Found ${chunks.length} relevant chunks for query`);

        // Cache results
        if (typeof window !== 'undefined' && chunks.length > 0) {
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(chunks));
            } catch (e) {
                // Ignore cache write errors
            }
        }

        return chunks;
    } catch (error) {
        logger.error(`Search failed: ${(error as Error).message}`);
        return [];
    }
}

// Health check
export async function checkQdrantHealth(): Promise<{
    healthy: boolean;
    collections?: number;
    error?: string;
    knowledgeCount?: number;
}> {
    try {
        if (!qdrantClient) {
            initQdrantClient();
        }

        const collections = await qdrantClient!.getCollections();
        const knowledgeCount = await countKnowledgePoints();

        return {
            healthy: true,
            collections: collections.collections.length,
            knowledgeCount,
        };
    } catch (error) {
        return {
            healthy: false,
            error: (error as Error).message,
        };
    }
}

// Delete all points in collection (useful for re-indexing)
export async function clearKnowledgeCollection(): Promise<void> {
    if (!qdrantClient) {
        throw new Error('Qdrant client not initialized');
    }

    try {
        // Delete all points by filter
        await qdrantClient.delete(KNOWLEDGE_COLLECTION_NAME, {
            wait: true,
            filter: {
                must: [
                    {
                        key: 'processed_at',
                        match: {
                            any: ['*'], // Match any value
                        },
                    },
                ],
            },
        });

        logger.info(`Cleared all points from ${KNOWLEDGE_COLLECTION_NAME}`);
    } catch (error) {
        logger.error(`Failed to clear collection: ${(error as Error).message}`);
        throw error;
    }
}
