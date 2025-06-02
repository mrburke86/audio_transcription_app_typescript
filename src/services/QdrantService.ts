// src\services\QdrantService.ts
import { QdrantClient } from '@qdrant/qdrant-js';
import { v4 as uuidv4 } from 'uuid';
import { getOpenAIEmbedding } from './OpenAILLMService'; // We will add this function later
import { logger } from '@/modules';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
export const KNOWLEDGE_COLLECTION_NAME = 'interview_edge_knowledge';
const OPENAI_EMBEDDING_DIMENSION = 1536; // Dimension for text-embedding-ada-002

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
        const collections = await client.getCollections();
        const collectionExists = collections.collections.some(collection => collection.name === KNOWLEDGE_COLLECTION_NAME);

        if (!collectionExists) {
            logger.info(`QdrantService: Creating collection "${KNOWLEDGE_COLLECTION_NAME}"... 🛠️`);
            await client.createCollection(KNOWLEDGE_COLLECTION_NAME, {
                vectors: {
                    size: OPENAI_EMBEDDING_DIMENSION,
                    distance: 'Cosine', // Cosine similarity is good for text embeddings
                },
            });
            logger.info(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" created successfully. ✅`);
            return true;
        }
        logger.info(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" already exists. 👍`);
        return false;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`QdrantService: Error ensuring collection. ${errorMessage} ❌`, error);
        throw error;
    }
};

// Simple text chunking strategy (can be improved)
const chunkText = (text: string, chunkSize = 500, overlap = 50): string[] => {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
        const end = Math.min(i + chunkSize, text.length);
        chunks.push(text.substring(i, end));
        i += chunkSize - overlap;
        if (end === text.length) break;
    }
    return chunks;
};

export interface DocumentChunk {
    id: string;
    text: string;
    source: string; // e.g., filename
}

export const processAndUpsertDocument = async (fileName: string, fileContent: string): Promise<void> => {
    const client = initQdrantClient();
    await ensureKnowledgeCollection(); // Ensure collection exists before upserting

    const chunks = chunkText(fileContent);
    if (chunks.length === 0) {
        logger.info(`QdrantService: No chunks generated for ${fileName}. Skipping. 🤷`);
        return;
    }

    const points = [];
    for (const chunk of chunks) {
        try {
            const embedding = await getOpenAIEmbedding(chunk); // This function needs to be implemented
            points.push({
                id: uuidv4(),
                payload: {
                    text: chunk,
                    source: fileName,
                },
                vector: embedding,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`QdrantService: Error embedding chunk from ${fileName}. ${errorMessage} 💔`, error);
        }
    }

    if (points.length > 0) {
        try {
            await client.upsert(KNOWLEDGE_COLLECTION_NAME, {
                wait: true, // Wait for operation to complete
                points: points,
            });
            logger.info(
                `QdrantService: Successfully upserted ${points.length} chunks from ${fileName} to "${KNOWLEDGE_COLLECTION_NAME}". 💾`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`QdrantService: Error upserting points for ${fileName}. ${errorMessage} 🔥`, error);
            throw error;
        }
    } else {
        logger.info(`QdrantService: No points to upsert for ${fileName}. 🤔`);
    }
};

export const searchRelevantChunks = async (query: string, limit = 5): Promise<DocumentChunk[]> => {
    const client = initQdrantClient();
    await ensureKnowledgeCollection(); // Ensure collection exists before searching

    try {
        const queryEmbedding = await getOpenAIEmbedding(query);
        logger.debug(`QdrantService: Searching in "${KNOWLEDGE_COLLECTION_NAME}" for query: "${query.substring(0, 30)}..." 🎯`);

        const searchResult = await client.search(KNOWLEDGE_COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: limit,
            // with_payload: true, // Include the payload in the results
            // score_threshold: 0.5 // Optional: filter by similarity score
        });
        logger.info(`QdrantService: Search returned ${searchResult.length} chunks. 📚`);

        return searchResult.map(result => ({
            id: result.id.toString(), // Qdrant ID can be number or string, ensure string
            text: result.payload?.text as string,
            source: result.payload?.source as string,
        }));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`QdrantService: Error during search. ${errorMessage} 💥`, error);
        return []; // Return empty array on error or throw
    }
};

// Optional: function to count points in collection, useful for checking if indexing is needed
export const countKnowledgePoints = async (): Promise<number> => {
    const client = initQdrantClient();
    try {
        const collectionInfo = await client.getCollection(KNOWLEDGE_COLLECTION_NAME);
        logger.info(`QdrantService: Counted ${collectionInfo.points_count || 0} points in "${KNOWLEDGE_COLLECTION_NAME}". 📊`);

        return collectionInfo.points_count || 0;
    } catch (error) {
        // if ((error as any)?.status === 404 || (error as any)?.message?.includes('Not found')) {
        // If collection doesn't exist, it will throw. We can treat this as 0 points.
        // Type guard for error handling
        const isQdrantError = (e: unknown): e is { status?: number; message?: string } => {
            return typeof e === 'object' && e !== null;
        };
        if (isQdrantError(error) && (error.status === 404 || error.message?.includes('Not found'))) {
            logger.warning(`QdrantService: Collection "${KNOWLEDGE_COLLECTION_NAME}" not found during count. Assuming 0 points. 👻`);
            return 0;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`QdrantService: Error counting points. ${errorMessage} 📉`, error);
        return 0; // Or throw error
    }
};
