// // src/utils/assistantUtils.ts
// import OpenAI from "openai";
// import { logger } from "@/modules/Logger"; // Import the logger
// import { Assistant, VectorStoreFile } from "@/types/assistant";
// import { getVectorStoreFiles } from "./vectorStoreUtils";
// import {
//     AssistantCreateParams,
//     AssistantTool,
//     AssistantUpdateParams,
// } from "openai/resources/beta/assistants";
// import { toFile, Uploadable } from "openai/uploads";
// import { setAssistantCategory, updateAssistantMetadata } from "../lib/database";
// import { revalidatePath } from "next/cache";
// import { neon } from "@neondatabase/serverless";

// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true,
// });

// // Type guard for Error
// function isErrorWithMessage(error: unknown): error is Error {
//     return typeof error === "object" && error !== null && "message" in error;
// }

// // Fetch Assistants
// export async function fetchAssistants(): Promise<Assistant[]> {
//     try {
//         const assistants = await openai.beta.assistants.list({
//             limit: 20,
//             order: "desc",
//         });
//         logger.info("✅ Successfully fetched assistants on server");
//         return assistants.data;
//     } catch (error: unknown) {
//         if (isErrorWithMessage(error)) {
//             logger.error(`❌ Error in fetchAssistants: ${error.message}`);
//         } else {
//             logger.error("❌ An unknown error occurred in fetchAssistants");
//         }
//         throw error;
//     }
// }

// // Fetch Assistant by ID
// export const getAssistantDetails = async (
//     assistantId: string,
// ): Promise<{
//     assistant: Assistant;
//     vectorStoreId?: string;
//     files: VectorStoreFile[];
// } | null> => {
//     try {
//         const assistant: Assistant = await openai.beta.assistants.retrieve(
//             assistantId,
//         );
//         logger.info(`✅ Assistant retrieved successfully: ${assistant.id}`);
//         logger.debug(`📝 Assistant details: ${JSON.stringify(assistant)}`);
//         const vectorStoreId =
//             assistant.tool_resources?.file_search?.vector_store_ids?.[0];
//         const files: VectorStoreFile[] = vectorStoreId
//             ? await getVectorStoreFiles(vectorStoreId)
//             : [];

//         return { assistant, vectorStoreId, files };
//     } catch (error: unknown) {
//         if (isErrorWithMessage(error)) {
//             logger.error(`❌ Error fetching assistant: ${error.message}`);
//         } else {
//             logger.error("❌ An unknown error occurred in getAssistantDetails");
//         }
//         return null;
//     }
// };

// // Create an Assistant
// export async function createAssistant(
//     assistantData: Omit<AssistantCreateParams, "tools"> & {
//         tools: Array<{ type: string }>;
//         role_description?: string;
//         category: string;
//     },
// ): Promise<Assistant> {
//     logger.info(`🚀 Creating new assistant: ${assistantData.name}`);
//     try {
//         const tools: AssistantTool[] = assistantData.tools.map((tool) => {
//             if (tool.type === "code_interpreter" || tool.type === "retrieval") {
//                 return { type: "file_search" };
//             }
//             return {
//                 type: "function",
//                 function: {
//                     name: tool.type,
//                     parameters: { type: "object", properties: {} },
//                 },
//             };
//         });
//         logger.debug(`Mapped tools: ${JSON.stringify(tools)}`);

//         const assistant = await openai.beta.assistants.create({
//             name: assistantData.name,
//             description: assistantData.description,
//             instructions: assistantData.instructions,
//             tools,
//             // Metadata is a set of 16 key-value pairs that can be attached to an object. Keys can be a maximum of 64 characters. Values can be a maxium of 512 characters long
//             metadata: {
//                 category: assistantData.category,
//                 role_description: assistantData.role_description,
//             },
//             model: assistantData.model,
//             temperature: assistantData.temperature,
//         });

//         // Insert assistant metadata into PostgreSQL
//         // const sql = neon(process.env.DATABASE_URL!);
//         // await sql`
//         //     INSERT INTO assistants (id, name, description, instructions, category, role_description)
//         //     VALUES (${assistant.id}, ${assistantData.name}, ${
//         //     assistantData.description
//         // }, ${assistantData.instructions}, ${assistantData.category}, ${
//         //     assistantData.role_description || ""
//         // })
//         //     ON CONFLICT (id) DO UPDATE SET
//         //         name = EXCLUDED.name,
//         //         description = EXCLUDED.description,
//         //         instructions = EXCLUDED.instructions,
//         //         category = EXCLUDED.category,
//         //         role_description = EXCLUDED.role_description,
//         //         updated_at = NOW()
//         // `;

//         logger.info(
//             `✅ Assistant created and metadata stored successfully: ${assistant.id}`,
//         );
//         logger.debug(`Assistant details: ${JSON.stringify(assistant)}`);

//         return assistant;
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(`❌ Error in createAssistant: ${error.message}`);
//             logger.debug(`Error details: ${JSON.stringify(error)}`);
//         } else {
//             logger.error("❌ An unknown error occurred in createAssistant");
//         }
//         throw error;
//     }
// }

// // Update Assistant with Vector Store
// export async function updateAssistantWithVectorStore(
//     assistantId: string,
//     files: File[],
// ): Promise<void> {
//     try {
//         logger.info(`🔄 Updating assistant ${assistantId} with vector store`);

//         logger.info(`Creating vector store for assistant ${assistantId}`);
//         const vectorStore = await openai.beta.vectorStores.create({
//             name: `VectorStore for ${assistantId}`,
//         });
//         logger.info(`Vector store created with ID: ${vectorStore.id}`);

//         logger.info(`Uploading ${files.length} files to vector store`);
//         const uploadables: Promise<Uploadable>[] = files.map((file) =>
//             toFile(file),
//         );
//         const uploadableFiles = await Promise.all(uploadables);

//         const uploadResponse =
//             await openai.beta.vectorStores.fileBatches.uploadAndPoll(
//                 vectorStore.id,
//                 {
//                     files: uploadableFiles,
//                 },
//             );
//         logger.debug(
//             `Upload response: ${JSON.stringify(uploadResponse, null, 2)}`,
//         );

//         // Ensure 'uploadResponse.files' exists
//         if (uploadResponse.id && Array.isArray(uploadResponse.id)) {
//             await Promise.all(
//                 uploadResponse.id.map(async (uploadedFile: VectorStoreFile) => {
//                     await sql`
//                             INSERT INTO assistant_files (id, assistant_id, name)
//                             VALUES (${uploadedFile.id}, ${assistantId}, ${uploadedFile.name})
//                             ON CONFLICT (id) DO NOTHING
//                         `;
//                 }),
//             );
//         } else {
//             logger.error("Upload response does not contain 'files'");
//         }
//         logger.info(
//             `Files uploaded successfully to vector store ${vectorStore.id}`,
//         );

//         // Store file metadata in PostgreSQL
//         const sql = neon(process.env.DATABASE_URL!);
//         await Promise.all(
//             uploadResponse.id.map(async (uploadedFile) => {
//                 await sql`
//                     INSERT INTO assistant_files (id, assistant_id, name)
//                     VALUES (${uploadedFile.id}, ${assistantId}, ${uploadedFile.filename})
//                     ON CONFLICT (id) DO NOTHING
//                 `;
//             }),
//         );
//         logger.info(
//             `✅ File metadata stored in DB for assistant ${assistantId}`,
//         );

//         logger.info(`Updating assistant with vector store`);
//         await openai.beta.assistants.update(assistantId, {
//             tools: [{ type: "file_search" }],
//             tool_resources: {
//                 file_search: {
//                     vector_store_ids: [vectorStore.id],
//                 },
//             },
//         });

//         logger.info(
//             `✅ Assistant ${assistantId} updated successfully with vector store ${vectorStore.id} and files`,
//         );
//     } catch (error) {
//         if (error instanceof OpenAI.APIError) {
//             logger.error(
//                 `❌ Error in updateAssistantWithVectorStore: ${error.message}`,
//             );
//             logger.debug(`Error details: ${JSON.stringify(error)}`);
//             logger.error(`HTTP Status: ${error.status}`);
//             if (error.error && typeof error.error === "object") {
//                 const errorObj = error.error as Record<string, unknown>;
//                 if ("type" in errorObj) {
//                     logger.error(`Error type: ${String(errorObj.type)}`);
//                 }
//                 if ("message" in errorObj) {
//                     logger.error(`Error message: ${String(errorObj.message)}`);
//                 }
//             }
//         } else if (error instanceof Error) {
//             logger.error(
//                 `❌ Error in updateAssistantWithVectorStore: ${error.message}`,
//             );
//             logger.debug(`Error details: ${JSON.stringify(error)}`);
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred in updateAssistantWithVectorStore",
//             );
//         }
//         throw error;
//     }
// }

// // Get Assistant Details from Database
// export async function getAssistantDetailsFromDB(assistantId: string) {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         const result = await sql`
//         SELECT * FROM assistants WHERE id = ${assistantId}
//       `;

//         if (result.length === 0) {
//             logger.info(`No assistant found with ID: ${assistantId}`);
//             return null;
//         }

//         const assistantData = result[0];

//         logger.info(
//             `✅ Fetched assistant details from DB for ID: ${assistantId}`,
//         );
//         return {
//             assistant: assistantData,
//             role_description: assistantData.role_description,
//             vectorStoreId: undefined,
//             files: undefined,
//         };
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(
//                 `❌ Error fetching assistant details from DB: ${error.message}`,
//             );
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while fetching assistant details from DB",
//             );
//         }
//         throw error;
//     }
// }

// // Update Assistant Role Description
// export async function updateAssistantRoleDescription(
//     assistantId: string,
//     roleDescription: string,
// ) {
//     // const { query } = await import("./db");
//     const sql = neon(process.env.DATABASE_URL!);

//     await sql`
//     UPDATE assistants SET role_description = ${roleDescription} WHERE id = ${assistantId}
//   `;
// }

// // Update OpenAI Assistant
// export async function updateOpenAIAssistant(
//     assistantId: string,
//     updateData: Partial<AssistantUpdateParams>,
// ) {
//     return await openai.beta.assistants.update(assistantId, updateData);
// }

// // Update Assistant
// export async function updateAssistant(
//     assistantId: string,
//     updateData: Partial<AssistantUpdateParams> & {
//         category?: string;
//         role_description?: string;
//     },
// ): Promise<{ success: boolean }> {
//     try {
//         logger.info(`Updating assistant with ID: ${assistantId}`);

//         const { category, role_description, ...openAIUpdateData } = updateData;

//         // Update OpenAI Assistant
//         await openai.beta.assistants.update(assistantId, openAIUpdateData);

//         // Update PostgreSQL Metadata
//         await updateAssistantMetadata(assistantId, {
//             name: updateData.name,
//             description: updateData.description,
//             instructions: updateData.instructions,
//             category: updateData.category,
//             role_description: updateData.role_description,
//         });

//         // If category is updated separately
//         if (category !== undefined) {
//             await setAssistantCategory(assistantId, category);
//         }

//         await revalidatePath(`/assistants/${assistantId}`);
//         logger.info(
//             `✅ Successfully updated assistant with ID: ${assistantId}`,
//         );
//         return { success: true };
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(`❌ Failed to update assistant: ${error.message}`);
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while updating assistant",
//             );
//         }
//         throw error;
//     }
// }

// // Delete Assistant
// export async function deleteAssistant(assistantId: string): Promise<void> {
//     try {
//         logger.info(`Deleting assistant ${assistantId} from OpenAI`);
//         await openai.beta.assistants.del(assistantId);
//         logger.info(`✅ Deleted assistant ${assistantId} from OpenAI`);

//         // Delete from PostgreSQL
//         await deleteAssistantFromDB(assistantId);
//         logger.info(`✅ Deleted assistant ${assistantId} from DB`);
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(`❌ Error deleting assistant: ${error.message}`);
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while deleting assistant",
//             );
//         }
//         throw error;
//     }
// }

// // Delete Assistant from DB
// export async function deleteAssistantFromDB(
//     assistantId: string,
// ): Promise<void> {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         await sql`
//             DELETE FROM assistants WHERE id = ${assistantId}
//         `;
//         logger.info(`✅ Deleted assistant ${assistantId} from DB`);
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(
//                 `❌ Error deleting assistant from DB: ${error.message}`,
//             );
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while deleting assistant from DB",
//             );
//         }
//         throw error;
//     }
// }

// // Get Assistant by ID
// export async function getAssistantById(
//     assistantId: string,
// ): Promise<Assistant | null> {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         const result = await sql`
//             SELECT * FROM assistants WHERE id = ${assistantId}
//         `;

//         if (result.length === 0) {
//             logger.info(`No assistant found with ID: ${assistantId}`);
//             return null;
//         }

//         const assistantData = result[0];

//         logger.info(
//             `✅ Fetched assistant details from DB for ID: ${assistantId}`,
//         );
//         return {
//             id: assistantData.id,
//             name: assistantData.name,
//             description: assistantData.description,
//             instructions: assistantData.instructions,
//             category: assistantData.category,
//             role_description: assistantData.role_description,
//             created_at: assistantData.created_at,
//             updated_at: assistantData.updated_at,
//         };
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(
//                 `❌ Error fetching assistant from DB: ${error.message}`,
//             );
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while fetching assistant from DB",
//             );
//         }
//         throw error;
//     }
// }
