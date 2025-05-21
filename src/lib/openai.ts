// src/lib/openai.ts
import OpenAI from "openai";
import { logger } from "@/modules/Logger";
import { VectorStoreFile } from "@/types/assistant";
import {
    Assistant,
    AssistantUpdateParams,
} from "openai/resources/beta/assistants";
import { revalidatePath } from "next/cache";
import { isErrorWithMessage } from "./error-utils";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

// Update Assistant via OpenAI
export async function updateAssistant(
    assistantId: string,
    updateData: Partial<AssistantUpdateParams>,
): Promise<Assistant> {
    try {
        const updatedAssistant = await openai.beta.assistants.update(
            assistantId,
            updateData,
        );
        logger.info(`✅ OpenAI Assistant ${assistantId} updated successfully`);
        return updatedAssistant;
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(`❌ Error updating assistant: ${error.message}`);
        } else {
            logger.error(
                "❌ An unknown error occurred while updating assistant",
            );
        }
        throw error;
    }
}

// Delete Assistant via OpenAI
export async function deleteAssistant(assistantId: string): Promise<void> {
    try {
        logger.info(`Deleting assistant ${assistantId} from OpenAI`);
        await openai.beta.assistants.del(assistantId);
        logger.info(`✅ Deleted assistant ${assistantId} from OpenAI`);
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(`❌ Error deleting assistant: ${error.message}`);
        } else {
            logger.error(
                "❌ An unknown error occurred while deleting assistant",
            );
        }
        throw error;
    }
}

// Add File to Vector Store
export async function addFileToVectorStore(formData: FormData): Promise<void> {
    const vectorStoreId = formData.get("vectorStoreId") as string;
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    // Note: description is collected but not used in the OpenAI API right now
    // We still keep it in the FormData for future use

    if (!vectorStoreId || !file || !name) {
        throw new Error(
            "Missing required parameters: vectorStoreId, file, or name",
        );
    }

    logger.info(`📄 Adding file "${name}" to vector store ${vectorStoreId}`);

    try {
        // Upload file to OpenAI
        const uploadedFile = await openai.files.create({
            file,
            purpose: "assistants",
        });

        // Add file to vector store
        await openai.beta.vectorStores.files.create(vectorStoreId, {
            file_id: uploadedFile.id,
        });

        logger.info(
            `✅ File added successfully to vector store ${vectorStoreId}`,
        );
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(
                `❌ Error adding file to vector store: ${error.message}`,
            );
        } else {
            logger.error(
                "❌ An unknown error occurred while adding file to vector store",
            );
        }
        throw error;
    }
}

// Remove File from Vector Store
export async function removeFileFromVectorStore(
    formData: FormData,
): Promise<void> {
    const vectorStoreId = formData.get("vectorStoreId") as string;
    const fileId = formData.get("fileId") as string;

    if (!vectorStoreId || !fileId) {
        throw new Error("Missing required parameters: vectorStoreId or fileId");
    }

    try {
        logger.info(
            `Removing file ID: ${fileId} from vector store ID: ${vectorStoreId}`,
        );

        await openai.beta.vectorStores.files.del(vectorStoreId, fileId);

        await revalidatePath(`/vector-stores/${vectorStoreId}`);
        logger.info(
            `Successfully removed file ID: ${fileId} from vector store ID: ${vectorStoreId}`,
        );
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(
                `❌ Error removing file from vector store: ${error.message}`,
            );
        } else {
            logger.error(
                "❌ An unknown error occurred while removing file from vector store",
            );
        }
        throw error;
    }
}

// Create Vector Store
export async function createVectorStore(
    assistantId: string,
    name: string,
): Promise<string> {
    try {
        logger.info(
            `[createVectorStore] Creating a new Vector Store named: ${name}`,
        );
        const vectorStore = await openai.beta.vectorStores.create({ name });

        const vectorStoreId = vectorStore.id;
        logger.info(
            `[createVectorStore] Vector Store created successfully with ID: ${vectorStoreId}`,
        );

        // Update the assistant to use the new vector store
        await updateAssistant(assistantId, {
            tools: [{ type: "file_search" }],
            tool_resources: {
                file_search: {
                    vector_store_ids: [vectorStoreId],
                },
            },
        });

        logger.info(
            `[createVectorStore] Assistant updated with vector store successfully`,
        );

        logger.info(
            `[createVectorStore] Initiating cache revalidation for Assistant ID: ${assistantId}`,
        );

        await revalidatePath(`/assistants/${assistantId}`);

        logger.info(
            `[createVectorStore] Cache revalidated successfully for Assistant ID: ${assistantId}`,
        );

        return vectorStoreId;
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(`❌ Error creating Vector Store: ${error.message}`);
        } else {
            logger.error(
                "❌ An unknown error occurred while creating Vector Store",
            );
        }
        throw error;
    }
}

// Update Assistant Category
export async function updateAssistantCategory(
    assistantId: string,
    category: string,
): Promise<void> {
    try {
        await updateAssistant(assistantId, {
            metadata: { category },
        });
        logger.info(
            `Updated category for assistant ${assistantId} to ${category}`,
        );
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(
                `❌ Error updating assistant category: ${error.message}`,
            );
        } else {
            logger.error(
                "❌ An unknown error occurred while updating assistant category",
            );
        }
        throw error;
    }
}

// Fetch files associated with a Vector Store
export async function getVectorStoreFiles(
    vectorStoreId: string,
): Promise<VectorStoreFile[]> {
    logger.info(`📄 Fetching files for vector store ID: ${vectorStoreId}`);
    try {
        const response = await openai.beta.vectorStores.files.list(
            vectorStoreId,
        );

        // Handle the pagination of results by converting to a simple array
        const files = response.data || [];

        logger.info(
            `✅ Successfully listed ${files.length} files in vector store.`,
        );
        return files;
    } catch (error) {
        if (isErrorWithMessage(error)) {
            logger.error(
                `❌ Error listing vector store files: ${error.message}`,
            );
        } else {
            logger.error(
                "❌ An unknown error occurred while listing vector store files",
            );
        }
        throw error;
    }
}

// Get Assistant by ID with files
export async function getAssistantById(assistantId: string): Promise<{
    assistant: Assistant;
    vectorStoreId?: string;
    files: VectorStoreFile[];
} | null> {
    try {
        const assistant: Assistant = await openai.beta.assistants.retrieve(
            assistantId,
        );
        logger.info(`✅ Assistant retrieved successfully: ${assistant.id}`);
        logger.debug(`📝 Assistant details: ${JSON.stringify(assistant)}`);

        const vectorStoreId =
            assistant.tool_resources?.file_search?.vector_store_ids?.[0];

        const files: VectorStoreFile[] = vectorStoreId
            ? await getVectorStoreFiles(vectorStoreId)
            : [];

        return { assistant, vectorStoreId, files };
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(`❌ Error fetching assistant: ${error.message}`);
        } else {
            logger.error("❌ An unknown error occurred in getAssistantById");
        }
        return null;
    }
}

// Get Assistant Details with Category and Role Description
export async function getAssistantDetailsWithMetadata(assistantId: string) {
    try {
        const result = await getAssistantById(assistantId);
        if (result) {
            const { assistant } = result;
            const metadata = assistant.metadata as Record<string, string>;
            return {
                ...result,
                category: metadata?.category || "uncategorized",
                roleDescription: metadata?.role_description || "",
            };
        }
        return null;
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(
                `❌ Error getting assistant details with metadata: ${error.message}`,
            );
        } else {
            logger.error(
                "❌ An unknown error occurred while getting assistant details with metadata",
            );
        }
        throw error;
    }
}

// Update Assistant Role Description
export async function updateAssistantRoleDescription(
    assistantId: string,
    roleDescription: string,
): Promise<void> {
    try {
        await updateAssistant(assistantId, {
            metadata: { role_description: roleDescription },
        });
        logger.info(`Updated role description for assistant ${assistantId}`);
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(
                `❌ Error updating assistant role description: ${error.message}`,
            );
        } else {
            logger.error(
                "❌ An unknown error occurred while updating assistant role description",
            );
        }
        throw error;
    }
}

// Fetch Assistants with Categories
export async function fetchAssistantsWithCategories(): Promise<Assistant[]> {
    try {
        // Get all assistants
        const assistants = await openai.beta.assistants.list({
            limit: 20,
            order: "desc",
        });

        logger.info(`Retrieved ${assistants.data.length} assistants`);

        // Return assistants with metadata intact
        return assistants.data;
    } catch (error: unknown) {
        if (isErrorWithMessage(error)) {
            logger.error(
                `❌ Error in fetchAssistantsWithCategories: ${error.message}`,
            );
        } else {
            logger.error(
                "❌ An unknown error occurred in fetchAssistantsWithCategories",
            );
        }
        throw error;
    }
}

export async function updateAssistantWithVectorStore(
    assistantId: string,
    files: File[],
): Promise<void> {
    try {
        logger.info(`🔄 Updating assistant ${assistantId} with vector store`);

        // Create a new vector store
        logger.info(`Creating vector store for assistant ${assistantId}`);
        const vectorStore = await openai.beta.vectorStores.create({
            name: `VectorStore for ${assistantId}`,
        });

        const vectorStoreId = vectorStore.id;
        logger.info(`Vector store created with ID: ${vectorStoreId}`);

        // Upload files if any are provided
        if (files.length > 0) {
            logger.info(`Uploading ${files.length} files to vector store`);

            // Process each file
            for (const file of files) {
                try {
                    // Create a file in OpenAI
                    const uploadedFile = await openai.files.create({
                        file,
                        purpose: "assistants",
                    });

                    // Add the file to the vector store
                    await openai.beta.vectorStores.files.create(vectorStoreId, {
                        file_id: uploadedFile.id,
                    });

                    logger.info(
                        `✅ File ${file.name} successfully uploaded and added to vector store`,
                    );
                } catch (fileError) {
                    logger.error(
                        `Error processing file ${file.name}: ${
                            fileError instanceof Error
                                ? fileError.message
                                : "Unknown error"
                        }`,
                    );
                    // Continue with other files even if one fails
                }
            }
        }

        // Update the assistant to use the vector store
        logger.info(
            `Updating assistant with vector store ID: ${vectorStoreId}`,
        );
        await updateAssistant(assistantId, {
            tools: [{ type: "file_search" }],
            tool_resources: {
                file_search: {
                    vector_store_ids: [vectorStoreId],
                },
            },
        });

        logger.info(
            `✅ Assistant ${assistantId} updated successfully with vector store ${vectorStoreId} and files`,
        );
    } catch (error) {
        if (error instanceof Error) {
            logger.error(
                `❌ Error in updateAssistantWithVectorStore: ${error.message}`,
            );
            logger.debug(`Error details: ${JSON.stringify(error)}`);
        } else {
            logger.error(
                "❌ An unknown error occurred in updateAssistantWithVectorStore",
            );
        }
        throw error;
    }
}

// Create an Assistant
export async function createAssistant(assistantData: {
    name: string;
    description?: string;
    instructions?: string;
    model: string;
    tools: Array<{ type: string }>;
    temperature?: number;
    category?: string;
    role_description?: string;
}): Promise<Assistant> {
    logger.info(`🚀 Creating new assistant: ${assistantData.name}`);
    try {
        const {
            category,
            role_description,
            tools: toolsInput,
            ...baseData
        } = assistantData;

        // Prepare metadata
        const metadata: Record<string, string> = {};
        if (category) metadata.category = category;
        if (role_description) metadata.role_description = role_description;

        // Convert tools format to proper OpenAI format
        const tools = toolsInput.map((tool) => {
            if (tool.type === "code_interpreter") {
                return { type: "code_interpreter" as const };
            } else if (
                tool.type === "retrieval" ||
                tool.type === "file_search"
            ) {
                return { type: "file_search" as const };
            }
            // Handle function tools or other types if needed
            return {
                type: "function" as const,
                function: {
                    name: tool.type,
                    parameters: { type: "object", properties: {} },
                },
            };
        });

        logger.debug(`Mapped tools: ${JSON.stringify(tools)}`);

        // Create the assistant
        const assistant = await openai.beta.assistants.create({
            ...baseData,
            tools,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        });

        logger.info(`✅ Assistant created successfully: ${assistant.id}`);
        logger.debug(`Assistant details: ${JSON.stringify(assistant)}`);

        return assistant;
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`❌ Error in createAssistant: ${error.message}`);
            logger.debug(`Error details: ${JSON.stringify(error)}`);
        } else {
            logger.error("❌ An unknown error occurred in createAssistant");
        }
        throw error;
    }
}
