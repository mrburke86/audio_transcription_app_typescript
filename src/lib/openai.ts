// // src/lib/openai.ts

// // Interactions with the OpenAI API, including fetching, creating, updating, and deleting assistants, as well as managing vector stores and files.

// // src/lib/openai.ts
// import OpenAI, { toFile } from "openai";
// import { logger } from "@/modules/Logger";
// import { VectorStoreFile } from "@/types/assistant";
// import {
//     Assistant,
//     AssistantCreateParams,
//     AssistantTool,
//     AssistantUpdateParams,
// } from "openai/resources/beta/assistants";
// // import { toFile, Uploadable } from "openai/uploads";
// import { revalidatePath } from "next/cache";
// import { neon } from "@neondatabase/serverless";
// import { getFormDataValue } from "@/utils/helpers";
// import { Uploadable } from "openai/uploads.mjs";

// const MAX_FILE_SIZE = 512 * 1024 * 1024;

// // Initialize OpenAI
// const openai = new OpenAI({
//     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true,
// });

// // Type guard for Error
// function isErrorWithMessage(error: unknown): error is Error {
//     return typeof error === "object" && error !== null && "message" in error;
// }

// // Handle errors uniformly
// function handleError(error: unknown, context: string): never {
//     if (error instanceof Error) {
//         logger.error(`${context}: ${error.message}`);
//     } else {
//         logger.error(`${context}: An unknown error occurred`);
//     }
//     throw error;
// }

// // Fetch Assistants from OpenAI
// export async function fetchAssistants(): Promise<Assistant[]> {
//     try {
//         const assistants = await openai.beta.assistants.list({
//             limit: 20,
//             order: "desc",
//         });
//         logger.info("✅ Successfully fetched assistants from OpenAI");
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

// // Fetch Assistant Details from OpenAI and Vector Store
// export const getAssistantById = async (
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

// // Create an Assistant via OpenAI and insert into DB
// export async function createAssistant(
//     assistantData: Omit<AssistantCreateParams, "tools"> & {
//         tools: Array<{ type: string }>;
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
//             ...assistantData,
//             tools,
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

//         // logger.info(
//         //     `✅ Assistant created and metadata stored successfully: ${assistant.id}`,
//         // );
//         // logger.debug(`Assistant details: ${JSON.stringify(assistant)}`);

//         return assistant;
//     } catch (error: unknown) {
//         if (isErrorWithMessage(error)) {
//             logger.error(`❌ Error in createAssistant: ${error.message}`);
//             logger.debug(`Error details: ${JSON.stringify(error)}`);
//         } else {
//             logger.error("❌ An unknown error occurred in createAssistant");
//         }
//         throw error;
//     }
// }

// // Update Assistant with Vector Store
// // export async function updateAssistantWithVectorStore(
// //     assistantId: string,
// //     files: File[],
// // ): Promise<void> {
// //     try {
// //         logger.info(`🔄 Updating assistant ${assistantId} with vector store`);

// //         logger.info(`Creating vector store for assistant ${assistantId}`);
// //         const vectorStore = await openai.beta.vectorStores.create({
// //             name: `VectorStore for ${assistantId}`,
// //         });
// //         logger.info(`Vector store created with ID: ${vectorStore.id}`);

// //         logger.info(`Uploading ${files.length} files to vector store`);
// //         const uploadables: Promise<Uploadable>[] = files.map((file) =>
// //             toFile(file),
// //         );
// //         const uploadableFiles = await Promise.all(uploadables);

// //         const uploadResponse =
// //             await openai.beta.vectorStores.fileBatches.uploadAndPoll(
// //                 vectorStore.id,
// //                 {
// //                     files: uploadableFiles,
// //                 },
// //             );

// //         // Ensure 'uploadResponse.files' exists
// //         if (uploadResponse.files && Array.isArray(uploadResponse.files)) {
// //             // const sql = neon(process.env.DATABASE_URL!);
// //             await Promise.all(
// //                 uploadResponse.files.map(
// //                     async (uploadedFile: VectorStoreFile) => {
// //                         await sql`
// //                         INSERT INTO assistant_files (id, assistant_id, name)
// //                         VALUES (${uploadedFile.id}, ${assistantId}, ${uploadedFile.name})
// //                         ON CONFLICT (id) DO NOTHING
// //                     `;
// //                     },
// //                 ),
// //             );
// //         } else {
// //             logger.error("Upload response does not contain 'files'");
// //         }
// //         logger.info(
// //             `Files uploaded successfully to vector store ${vectorStore.id}`,
// //         );

// //         // Store file metadata in PostgreSQL
// //         const sql = neon(process.env.DATABASE_URL!);
// //         await Promise.all(
// //             uploadResponse.files.map(async (uploadedFile) => {
// //                 await sql`
// //                     INSERT INTO assistant_files (id, assistant_id, name)
// //                     VALUES (${uploadedFile.id}, ${assistantId}, ${uploadedFile.filename})
// //                     ON CONFLICT (id) DO NOTHING
// //                 `;
// //             }),
// //         );
// //         logger.info(
// //             `✅ File metadata stored in DB for assistant ${assistantId}`,
// //         );

// //         logger.info(`Updating assistant with vector store`);
// //         await openai.beta.assistants.update(assistantId, {
// //             tools: [{ type: "file_search" }],
// //             tool_resources: {
// //                 file_search: {
// //                     vector_store_ids: [vectorStore.id],
// //                 },
// //             },
// //         });

// //         logger.info(
// //             `✅ Assistant ${assistantId} updated successfully with vector store ${vectorStore.id} and files`,
// //         );
// //     } catch (error: unknown) {
// //         if (error instanceof OpenAI.APIError) {
// //             logger.error(
// //                 `❌ Error in updateAssistantWithVectorStore: ${error.message}`,
// //             );
// //             logger.debug(`Error details: ${JSON.stringify(error)}`);
// //             logger.error(`HTTP Status: ${error.status}`);
// //             if (error.error && typeof error.error === "object") {
// //                 const errorObj = error.error as Record<string, unknown>;
// //                 if ("type" in errorObj) {
// //                     logger.error(`Error type: ${String(errorObj.type)}`);
// //                 }
// //                 if ("message" in errorObj) {
// //                     logger.error(`Error message: ${String(errorObj.message)}`);
// //                 }
// //             }
// //         } else if (error instanceof Error) {
// //             logger.error(
// //                 `❌ Error in updateAssistantWithVectorStore: ${error.message}`,
// //             );
// //             logger.debug(`Error details: ${JSON.stringify(error)}`);
// //         } else {
// //             logger.error(
// //                 "❌ An unknown error occurred in updateAssistantWithVectorStore",
// //             );
// //         }
// //         throw error;
// //     }
// // }

// // Update OpenAI Assistant
// export async function updateOpenAIAssistant(
//     assistantId: string,
//     updateData: Partial<AssistantUpdateParams>,
// ) {
//     try {
//         const updatedAssistant = await openai.beta.assistants.update(
//             assistantId,
//             updateData,
//         );
//         logger.info(`✅ OpenAI Assistant ${assistantId} updated successfully`);
//         return updatedAssistant;
//     } catch (error: unknown) {
//         handleError(error, "Failed to update OpenAI Assistant");
//     }
// }

// // Update Assistant (both OpenAI and DB)
// export async function updateAssistant(
//     assistantId: string,
//     updateData: Partial<AssistantUpdateParams> & {
//         category?: string;
//         role_description?: string;
//     },
// ): Promise<{ success: boolean }> {
//     try {
//         logger.info(`Updating assistant with ID: ${assistantId}`);

//         const { category, ...openAIUpdateData } = updateData;

//         // Update OpenAI Assistant
//         await updateOpenAIAssistant(assistantId, openAIUpdateData);

//         // Update PostgreSQL Metadata
//         await updateAssistantMetadata(assistantId, {
//             // name: updateData.name,
//             // description: updateData.description,
//             // instructions: updateData.instructions,
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
//     } catch (error: unknown) {
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

// // Delete Assistant via OpenAI and DB
// export async function deleteAssistant(assistantId: string): Promise<void> {
//     try {
//         logger.info(`Deleting assistant ${assistantId} from OpenAI`);
//         await openai.beta.assistants.del(assistantId);
//         logger.info(`✅ Deleted assistant ${assistantId} from OpenAI`);

//         // Delete from PostgreSQL
//         // await deleteAssistantFromDB(assistantId);
//         logger.info(`✅ Deleted assistant ${assistantId} from DB`);
//     } catch (error: unknown) {
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

// // Add File to Vector Store
// export async function addFileToVectorStore(formData: FormData) {
//     const vectorStoreId = getFormDataValue(formData, "vectorStoreId");
//     const file = formData.get("file") as File;
//     const name = getFormDataValue(formData, "name");
//     const description = formData.get("description") as string | null;

//     logger.info(
//         `📄 File details - Name: ${name} | Size: ${file?.size} bytes | Type: ${file?.type} | Description: ${description}`,
//     );

//     if (file.size > MAX_FILE_SIZE) {
//         const errorMessage = `❌ File size (${file.size} bytes) exceeds maximum allowed (${MAX_FILE_SIZE} bytes)`;
//         logger.error(errorMessage);
//         throw new Error(errorMessage);
//     }

//     try {
//         logger.info(
//             `Uploading file to OpenAI for vector store ID: ${vectorStoreId}`,
//         );

//         const uploadedFile = await openai.files.create({
//             file,
//             purpose: "assistants",
//         });

//         await openai.beta.vectorStores.files.create(vectorStoreId, {
//             file_id: uploadedFile.id,
//         });

//         await revalidatePath(`/vector-stores/${vectorStoreId}`);
//         logger.info(
//             `Successfully added file to vector store ID: ${vectorStoreId}`,
//         );
//     } catch (error: unknown) {
//         handleError(error, "Failed to add file to vector store");
//     }
// }

// // Remove File from Vector Store
// export async function removeFileFromVectorStore(formData: FormData) {
//     const vectorStoreId = getFormDataValue(formData, "vectorStoreId");
//     const fileId = getFormDataValue(formData, "fileId");

//     try {
//         logger.info(
//             `Removing file ID: ${fileId} from vector store ID: ${vectorStoreId}`,
//         );

//         await openai.beta.vectorStores.files.del(vectorStoreId, fileId);

//         await revalidatePath(`/vector-stores/${vectorStoreId}`);
//         logger.info(
//             `Successfully removed file ID: ${fileId} from vector store ID: ${vectorStoreId}`,
//         );
//     } catch (error: unknown) {
//         handleError(error, "Failed to remove file from vector store");
//     }
// }

// // Create Vector Store
// export async function createVectorStore(
//     assistantId: string,
//     name: string,
// ): Promise<string> {
//     try {
//         logger.info(
//             `[createVectorStore] Creating a new Vector Store named: ${name}`,
//         );
//         const vectorStore = await openai.beta.vectorStores.create({ name });

//         const vectorStoreId = vectorStore.id;
//         logger.info(
//             `[createVectorStore] Vector Store created successfully with ID: ${vectorStoreId}`,
//         );

//         logger.info(
//             `[createVectorStore] Initiating cache revalidation for Assistant ID: ${assistantId}`,
//         );
//         await revalidatePath(`/assistants/${assistantId}`);
//         logger.info(
//             `[createVectorStore] Cache revalidated successfully for Assistant ID: ${assistantId}`,
//         );

//         return vectorStoreId;
//     } catch (error: unknown) {
//         handleError(error, "Failed to create Vector Store");
//         return ""; // This line is to satisfy TypeScript, but it will never be reached due to handleError
//     }
// }

// // Fetch Assistants with Categories
// export async function fetchAssistantsWithCategories(): Promise<Assistant[]> {
//     try {
//         const assistants = await fetchAssistants();
//         const sql = neon(process.env.DATABASE_URL!);

//         const categoryMap = await sql`
//             SELECT assistant_id, category FROM assistant_categories
//         `;

//         return assistants.map((assistant) => ({
//             ...assistant,
//             category:
//                 categoryMap.find((item) => item.assistant_id === assistant.id)
//                     ?.category || "Uncategorized",
//         }));
//     } catch (error: unknown) {
//         logger.error(`Failed to fetch assistants with categories: ${error}`);
//         throw error;
//     }
// }

// // Update Assistant Category
// export async function updateAssistantCategory(
//     assistantId: string,
//     category: string,
// ) {
//     try {
//         await setAssistantCategory(assistantId, category);
//         logger.info(
//             `Updated category for assistant ${assistantId} to ${category}`,
//         );
//     } catch (error: unknown) {
//         logger.error(`Failed to update assistant category: ${error}`);
//         throw error;
//     }
// }

// // Get Assistant Details with Category
// export async function getAssistantDetailsWithCategory(assistantId: string) {
//     try {
//         const details = await getAssistantDetails(assistantId);
//         if (details) {
//             const category = await getAssistantCategory(assistantId);
//             return { ...details, category };
//         }
//         return null;
//     } catch (error: unknown) {
//         logger.error(`Failed to get assistant details with category: ${error}`);
//         throw error;
//     }
// }

// // Update Assistant Role Description
// export async function updateAssistantRoleDescription(
//     assistantId: string,
//     roleDescription: string,
// ) {
//     try {
//         const sql = neon(process.env.DATABASE_URL!);

//         await sql`
//             UPDATE assistants SET role_description = ${roleDescription}, updated_at = CURRENT_TIMESTAMP WHERE id = ${assistantId}
//         `;
//         logger.info(`Updated role description for assistant ${assistantId}`);
//     } catch (error: unknown) {
//         logger.error(`Failed to update assistant role description: ${error}`);
//         throw error;
//     }
// }

// // Fetch Vector Store Details
// export async function getVectorStoreDetails(vectorStoreId: string) {
//     try {
//         const vectorStore = await openai.beta.vectorStores.retrieve(
//             vectorStoreId,
//         );
//         logger.info(`✅ Fetched vector store details for ID: ${vectorStoreId}`);
//         return vectorStore;
//     } catch (error: unknown) {
//         if (isErrorWithMessage(error)) {
//             logger.error(
//                 `❌ Error fetching vector store details: ${error.message}`,
//             );
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while fetching vector store details",
//             );
//         }
//         throw error;
//     }
// }

// // Fetch Assistants (Duplicate from fetchAssistants)
// export async function getAssistants() {
//     return await fetchAssistants();
// }

// // Fetch files associated with a Vector Store
// export async function getVectorStoreFiles(vectorStoreId: string) {
//     logger.info(`📄 Fetching files for vector store ID: ${vectorStoreId}`);
//     try {
// const vectorStoreFiles = await openai.beta.vectorStores.files.list(
//     vectorStoreId,
// );
//         logger.info("✅ Successfully listed files in vector store.");
//         return vectorStoreFiles;
//     } catch (error) {
//         logger.error(`❌ Error listing vector store files: ${error}`);
//         throw error;
//     }
// }

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
//             const processedFiles = uploadedFiles.map((uploadedFile: any) => {
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
