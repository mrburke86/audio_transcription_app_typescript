// // src/utils/vectorStoreUtils.ts

// import OpenAI from "openai";
// import { neon } from "@neondatabase/serverless";
// import { VectorStoreFile } from "@/types/assistant";
// import { logger } from "@/modules/Logger";

// // Initialize OpenAI with your API key
// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true,
// });

// // Initialize Neon database connection
// const sql = neon(process.env.DATABASE_URL!);

// // Get Vector Store Files with Metadata
// // export async function getVectorStoreFiles(
// //     vectorStoreId: string,
// // ): Promise<VectorStoreFile[]> {
// //     try {
// //         // Fetch the list of vector store files from OpenAI
// //         const response = await openai.beta.vectorStores.files.list(
// //             vectorStoreId,
// //         );
// //         const openAIFiles = response.data; // Assuming 'data' contains the array of files

// //         // Extract file IDs from OpenAI response
// //         const fileIds = openAIFiles.map((file) => file.id);

// //         // Fetch file metadata from PostgreSQL
// //         const dbFiles = await sql`
// //             SELECT id, name, uploaded_at
// //             FROM assistant_files
// //             WHERE id id = ANY(${fileIds})
// //         `;

// //         // Map OpenAI files with metadata
// //         const files: VectorStoreFile[] = openAIFiles.map((file) => {
// //             const dbFile = dbFiles.find((dbf) => dbf.id === file.id);
// //             return {
// //                 id: file.id,
// //                 name: dbFile?.name || "Unnamed File",
// //                 object: file.object,
// //                 created_at: file.created_at,
// //                 status: file.status,
// //                 usage_bytes: file.usage_bytes,
// //                 last_error: file.last_error,
// //                 vector_store_id: vectorStoreId, // Ensure this field is included
// //             };
// //         });

// //         logger.info(
// //             `✅ Retrieved ${files.length} files from vector store ${vectorStoreId}`,
// //         );
// //         return files;
// //     } catch (error) {
// //         if (error instanceof Error) {
// //             logger.error(
// //                 `❌ Error fetching vector store files: ${error.message}`,
// //             );
// //         } else {
// //             logger.error(
// //                 "❌ An unknown error occurred while fetching vector store files",
// //             );
// //         }
// //         throw error;
// //     }
// // }
