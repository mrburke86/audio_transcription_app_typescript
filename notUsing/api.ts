// // src/utils/api.ts

// import { logger } from "@/modules/Logger"; // Import the logger

// const API_BASE_URL = "/api";

// const logApiCall = (method: string, url: string, body?: unknown) => {
//     // Changed 'any' to 'unknown'
//     logger.info(`📡 API Call: ${method} ${url}`); // Use logger for API calls
//     if (body) logger.debug(`✏️ Request Body: ${JSON.stringify(body, null, 2)}`);
// };

// const handleApiResponse = async (response: Response, errorMessage: string) => {
//     logger.info(`🔄 Handling API response for ${response.url}`);
//     if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         logger.error(
//             `❌ ${errorMessage}: Status: ${response.status} ${response.statusText}`,
//         );
//         logger.debug(`📉 Error Data: ${JSON.stringify(errorData, null, 2)}`);
//         throw new Error(errorData.error || errorMessage);
//     }
//     logger.info(
//         `✅ Response received for API call. Status: ${response.status}`,
//     );
//     return response.json();
// };

// // Type guard for Error
// function isErrorWithMessage(error: unknown): error is Error {
//     return typeof error === "object" && error !== null && "message" in error;
// }

// // export const getAssistantDetails = async (assistantId: string) => {
// //     const url = `${API_BASE_URL}/assistant/${assistantId}`;
// //     logApiCall("GET", url);

// //     try {
// //         const response = await fetch(url);
// //         logger.info(`Fetched assistant details for ID: ${assistantId}`);
// //         return await handleApiResponse(
// //             response,
// //             "Failed to fetch assistant details",
// //         );
// //     } catch (error: unknown) {
// //         if (isErrorWithMessage(error)) {
// //             logger.error(`Error in getAssistantDetails: ${error.message}`);
// //         } else {
// //             logger.error("An unknown error occurred in getAssistantDetails");
// //         }
// //         throw error;
// //     }
// // };

// export const updateAssistantPrompts = async (
//     assistantId: string,
//     systemPrompt: string,
// ) => {
//     const url = `${API_BASE_URL}/assistant/${assistantId}`;
//     const body = { systemPrompt };
//     logApiCall("PUT", url, body);

//     try {
//         const response = await fetch(url, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//         });
//         logger.info(`Updated prompts for assistant ID: ${assistantId}`);
//         return await handleApiResponse(
//             response,
//             "Failed to update assistant prompts",
//         );
//     } catch (error: unknown) {
//         if (isErrorWithMessage(error)) {
//             logger.error(`Error in updateAssistantPrompts: ${error.message}`);
//         } else {
//             logger.error("An unknown error occurred in updateAssistantPrompts");
//         }
//         throw error;
//     }
// };

// export const addFileToAssistant = async (
//     assistantId: string,
//     filePath: string,
//     name: string,
//     description: string,
// ) => {
//     const url = `${API_BASE_URL}/assistant/${assistantId}/files`;
//     const body = { filePath, name, description };
//     logApiCall("POST", url, body);

//     try {
//         const response = await fetch(url, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//         });
//         logger.info(`Added file to assistant ID: ${assistantId}`);
//         return await handleApiResponse(
//             response,
//             "Failed to add file to assistant",
//         );
//     } catch (error: unknown) {
//         if (isErrorWithMessage(error)) {
//             logger.error(`Error in addFileToAssistant: ${error.message}`);
//         } else {
//             logger.error("An unknown error occurred in addFileToAssistant");
//         }
//         throw error;
//     }
// };

// export const removeFileFromAssistant = async (
//     assistantId: string,
//     fileId: string,
// ) => {
//     const url = `${API_BASE_URL}/assistant/${assistantId}/files/${fileId}`;
//     logApiCall("DELETE", url);

//     try {
//         const response = await fetch(url, { method: "DELETE" });
//         logger.info(`Removed file from assistant ID: ${assistantId}`);
//         return await handleApiResponse(
//             response,
//             "Failed to remove file from assistant",
//         );
//     } catch (error: unknown) {
//         if (isErrorWithMessage(error)) {
//             logger.error(`Error in removeFileFromAssistant: ${error.message}`);
//         } else {
//             logger.error(
//                 "An unknown error occurred in removeFileFromAssistant",
//             );
//         }
//         throw error;
//     }
// };

// export async function fetchVectorStoreFiles(vectorStoreId: string) {
//     const url = `/api/vectorStore/${vectorStoreId}/files`;
//     logger.info(`🔍 Fetching vector store files for ID: ${vectorStoreId}`);

//     try {
//         const response = await fetch(url);
//         logger.info(
//             `Response received for API call. Status: ${response.status}`,
//         );

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             logger.error(
//                 `❌ Failed to fetch vector store files: Status: ${response.status} ${response.statusText}`,
//             );
//             logger.debug(`🔍 Error Data: ${JSON.stringify(errorData)}`);
//             throw new Error("Failed to fetch vector store files");
//         }

//         const data = await response.json();
//         logger.info(`✅ Fetched vector store files for ID: ${vectorStoreId}`);
//         return data;
//     } catch (error) {
//         if (error instanceof Error) {
//             logger.error(`❌ Error in fetchVectorStoreFiles: ${error.message}`);
//         } else {
//             logger.error("❌ Unknown error in fetchVectorStoreFiles.");
//         }
//         throw error;
//     }
// }
