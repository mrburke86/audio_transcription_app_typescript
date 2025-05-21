// // src/lib/database.ts
// import { neon } from "@neondatabase/serverless";
// import { logger } from "../modules/Logger";
// import { Assistant, VectorStoreFile } from "@/types/assistant";

// export async function setAssistantCategory(
//     assistantId: string,
//     category: string,
// ): Promise<void> {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         await sql`
//             INSERT INTO assistant_categories (assistant_id, category)
//             VALUES (${assistantId}, ${category})
//             ON CONFLICT (assistant_id) DO UPDATE SET category = ${category}
//         `;
//         logger.info(`Set category for assistant ${assistantId} to ${category}`);
//     } catch (err) {
//         const error = err as Error;
//         logger.error(
//             `Failed to set category for assistant ${assistantId}: ${error.message}`,
//         );
//         throw err;
//     }
// }

// export async function getAssistantCategory(
//     assistantId: string,
// ): Promise<string | null> {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         const result = await sql`
//             SELECT category FROM assistant_categories WHERE assistant_id = ${assistantId}
//         `;
//         const category = result[0]?.category || null;
//         logger.info(
//             `Fetched category for assistant ${assistantId}: ${category}`,
//         );
//         return category;
//     } catch (err) {
//         const error = err as Error;
//         logger.error(
//             `Failed to fetch category for assistant ${assistantId}: ${error.message}`,
//         );
//         throw err;
//     }
// }

// export async function getAllAssistantCategories() {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         const result = await sql`
//             SELECT assistant_id, category FROM assistant_categories
//         `;
//         const categories = Object.fromEntries(
//             result.map(({ assistant_id, category }) => [
//                 assistant_id,
//                 category,
//             ]),
//         );
//         logger.info("Fetched all assistant categories");
//         return categories;
//     } catch (err) {
//         const error = err as Error;
//         logger.error(
//             `Failed to fetch all assistant categories: ${error.message}`,
//         );
//         throw err;
//     }
// }

// // CRUD Operations for Assistants

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

// export async function updateAssistantMetadata(
//     assistantId: string,
//     updates: Partial<{
//         name: string;
//         description: string;
//         instructions: string;
//         category: string;
//         role_description: string;
//     }>,
// ): Promise<void> {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         const { name, description, instructions, category, role_description } =
//             updates;

//         await sql`
//             UPDATE assistants
//             SET
//                 name = COALESCE(${name}, name),
//                 description = COALESCE(${description}, description),
//                 instructions = COALESCE(${instructions}, instructions),
//                 category = COALESCE(${category}, category),
//                 role_description = COALESCE(${role_description}, role_description),
//                 updated_at = NOW()
//             WHERE id = ${assistantId}
//         `;

//         logger.info(`✅ Updated metadata for assistant ${assistantId}`);
//     } catch (error: unknown) {
//         if (error instanceof Error) {
//             logger.error(
//                 `❌ Error updating assistant metadata: ${error.message}`,
//             );
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while updating assistant metadata",
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
//     } catch (error: unknown) {
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

// // Fetch All Assistants from DB
// export async function fetchAllAssistants(): Promise<Assistant[]> {
//     const sql = neon(process.env.DATABASE_URL!);

//     try {
//         const result = await sql`
//             SELECT * FROM assistants ORDER BY created_at DESC
//         `;
//         const assistants: Assistant[] = result.map((row) => ({
//             id: row.id,
//             name: row.name,
//             description: row.description,
//             instructions: row.instructions,
//             category: row.category,
//             role_description: row.role_description,
//             metadata: row.metadata, // Ensure these fields exist in your database
//             model: row.model,
//             object: row.object,
//             tools: row.tools,
//             created_at: row.created_at,
//             updated_at: row.updated_at,
//         }));
//         logger.info(`✅ Fetched ${assistants.length} assistants from DB`);
//         return assistants;
//     } catch (error: unknown) {
//         if (error instanceof Error) {
//             logger.error(`❌ Error fetching assistants: ${error.message}`);
//         } else {
//             logger.error(
//                 "❌ An unknown error occurred while fetching assistants",
//             );
//         }
//         throw error;
//     }
// }

// // Type guard for Error
// function isErrorWithMessage(error: unknown): error is Error {
//     return typeof error === "object" && error !== null && "message" in error;
// }
