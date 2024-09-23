// src/lib/openai-server.ts
import OpenAI from "openai";
import { logger } from "@/modules/Logger";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function getAssistantDetails(assistantId: string) {
    logger.info(`🔍 Fetching assistant details for ID: ${assistantId}`);
    try {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        logger.info("✅ Successfully fetched assistant details.");
        return assistant;
    } catch (error) {
        logger.error(`❌ Error fetching assistant: ${error}`);
        throw error;
    }
}

// export async function getVectorStoreFiles(vectorStoreId: string) {
//     logger.info(`📄 Fetching files for vector store ID: ${vectorStoreId}`);
//     try {
//         const vectorStoreFiles = await openai.beta.vectorStores.files.list(
//             vectorStoreId,
//         );
//         logger.info("✅ Successfully listed files in vector store.");
//         return vectorStoreFiles;
//     } catch (error) {
//         logger.error(`❌ Error listing vector store files: ${error}`);
//         throw error;
//     }
// }

// Add other OpenAI-related functions here...
