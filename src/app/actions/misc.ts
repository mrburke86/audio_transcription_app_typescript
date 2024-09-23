// // src/app/actions/misc.ts

// // src/app/actions.ts
// "use server";

// import { logger } from "@/modules/Logger";
// import {
//     updateAssistant,
//     deleteAssistant,
//     addFileToVectorStore,
//     removeFileFromVectorStore,
//     createVectorStore,
//     fetchAssistantsWithCategories,
//     updateAssistantCategory,
//     getAssistantDetailsWithCategory,
//     updateAssistantRoleDescription,
// } from "@/lib/openai";
// import { revalidatePath } from "next/cache";
// // import { setAssistantCategory } from "@/lib/database";

// // const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512 MB limit as per OpenAI docs

// // Utility function to extract form data values
// const getFormDataValue = (formData: FormData, key: string): string => {
//     const value = formData.get(key);
//     if (!value) {
//         throw new Error(`Form data missing key: ${key}`);
//     }
//     return value as string;
// };

// // Update Assistant
// export async function handleUpdateAssistant(formData: FormData) {
//     const assistantId = getFormDataValue(formData, "assistantId");
//     const updateData: Partial<AssistantUpdateParams> & {
//         category?: string;
//         role_description?: string;
//     } = {};

//     const instructions = formData.get("instructions") as string | null;
//     const name = formData.get("name") as string | null;
//     const model = formData.get("model") as string | null;
//     const temperature = formData.get("temperature")
//         ? parseFloat(formData.get("temperature") as string)
//         : null;
//     const tools = formData.get("tools")
//         ? JSON.parse(formData.get("tools") as string)
//         : null;
//     const category = formData.get("category") as string | null;

//     if (instructions !== null) updateData.instructions = instructions;
//     if (name !== null) updateData.name = name;
//     if (model !== null) updateData.model = model;
//     if (temperature !== null) updateData.temperature = temperature;
//     if (tools !== null) updateData.tools = tools;
//     if (category !== null) updateData.category = category;

//     const roleDescription = formData.get("role_description") as string | null;

//     try {
//         logger.info(`Updating assistant with ID: ${assistantId}`);

//         await updateAssistant(assistantId, updateData);
//         if (roleDescription !== null) {
//             await updateAssistantRoleDescription(assistantId, roleDescription);
//         }

//         await revalidatePath(`/assistants/${assistantId}`);
//         logger.info(`Successfully updated assistant with ID: ${assistantId}`);
//         return { success: true };
//     } catch (error: unknown) {
//         handleError(error, "Failed to update assistant");
//     }
// }

// // Delete Assistant
// export async function handleDeleteAssistant(assistantId: string) {
//     try {
//         // Delete the assistant using the OpenAI API and DB
//         await deleteAssistant(assistantId);
//         return { success: true };
//     } catch (error: unknown) {
//         logger.error(`Error deleting assistant: ${error}`);
//         throw new Error("Failed to delete assistant");
//     }
// }

// // Add File to Vector Store
// export async function handleAddFileToVectorStore(formData: FormData) {
//     try {
//         await addFileToVectorStore(formData);
//         return { success: true };
//     } catch (error: unknown) {
//         logger.error(`Error adding file to vector store: ${error}`);
//         throw new Error("Failed to add file to vector store");
//     }
// }

// // Remove File from Vector Store
// export async function handleRemoveFileFromVectorStore(formData: FormData) {
//     try {
//         await removeFileFromVectorStore(formData);
//         return { success: true };
//     } catch (error: unknown) {
//         logger.error(`Error removing file from vector store: ${error}`);
//         throw new Error("Failed to remove file from vector store");
//     }
// }

// // Create Vector Store
// export async function handleCreateVectorStore(
//     assistantId: string,
//     name: string,
// ): Promise<{ vectorStoreId: string }> {
//     try {
//         const vectorStoreId = await createVectorStore(assistantId, name);
//         return { vectorStoreId };
//     } catch (error: unknown) {
//         logger.error(`Error creating vector store: ${error}`);
//         throw new Error("Failed to create vector store");
//     }
// }

// // Fetch Assistants with Categories
// export async function handleFetchAssistantsWithCategories() {
//     try {
//         const assistants = await fetchAssistantsWithCategories();
//         return assistants;
//     } catch (error: unknown) {
//         logger.error(`Error fetching assistants with categories: ${error}`);
//         throw new Error("Failed to fetch assistants with categories");
//     }
// }

// // Update Assistant Category
// export async function handleUpdateAssistantCategory(
//     assistantId: string,
//     category: string,
// ) {
//     try {
//         await updateAssistantCategory(assistantId, category);
//         return { success: true };
//     } catch (error: unknown) {
//         logger.error(`Error updating assistant category: ${error}`);
//         throw new Error("Failed to update assistant category");
//     }
// }

// // Get Assistant Details with Category
// export async function handleGetAssistantDetailsWithCategory(
//     assistantId: string,
// ) {
//     try {
//         const details = await getAssistantDetailsWithCategory(assistantId);
//         return details;
//     } catch (error: unknown) {
//         logger.error(`Error getting assistant details with category: ${error}`);
//         throw new Error("Failed to get assistant details with category");
//     }
// }

// // Update Assistant Role Description
// export async function handleUpdateAssistantRoleDescription(
//     assistantId: string,
//     roleDescription: string,
// ) {
//     try {
//         await updateAssistantRoleDescription(assistantId, roleDescription);
//         return { success: true };
//     } catch (error: unknown) {
//         logger.error(`Error updating assistant role description: ${error}`);
//         throw new Error("Failed to update assistant role description");
//     }
// }
