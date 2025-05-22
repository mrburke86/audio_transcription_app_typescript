// src/app/settings/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { FileUpload } from "@/components/FileUpload"; // Import the FileUpload component
// import {
//     getAssistantDetails,
//     updateAssistantPrompts,
//     addFileToAssistant,
//     removeFileFromAssistant,
//     fetchVectorStoreFiles,
// } from "@/utils/api"; // Make sure you add a new utility function for fetching vector store files
// import { logger } from "@/modules/Logger"; // Import the logger

// interface VectorStoreFile {
//     id: string;
//     object: string;
//     created_at: number;
//     vector_store_id: string;
//     status: string;
//     name?: string; // Add custom fields if needed
//     description?: string; // Add custom fields if needed
// }

const SettingsPage = () => {
    // const [assistantId, setAssistantId] = useState("");
    // const [systemPrompt, setSystemPrompt] = useState("");
    // const [files, setFiles] = useState<VectorStoreFile[]>([]); // Ensure it's an array
    // const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState("");

    // useEffect(() => {
    //     logger.info("🌀 Fetching assistant details on component mount.");
    //     fetchAssistantDetails();
    // }, []);

    // const fetchAssistantDetails = async () => {
    //     setIsLoading(true);
    //     setError("");
    //     try {
    //         const id = process.env.NEXT_PUBLIC_ASSISTANT_ID;
    //         if (!id) {
    //             logger.error(
    //                 "❌ Assistant ID not found in environment variables.",
    //             );
    //             throw new Error("Assistant ID not found");
    //         }
    //         logger.info(`🔍 Fetching details for assistant ID: ${id}`);
    //         setAssistantId(id);

    //         const assistant = await getAssistantDetails(id);
    //         logger.info("✅ Successfully fetched assistant details.");
    //         setSystemPrompt(assistant.instructions || "");

    //         // Fetch vector store files
    //         const vectorStoreFiles: { data: VectorStoreFile[] } =
    //             await fetchVectorStoreFiles(
    //                 assistant.tool_resources.file_search.vector_store_ids[0],
    //             );

    //         // Ensure that data is an array
    //         if (Array.isArray(vectorStoreFiles.data)) {
    //             setFiles(vectorStoreFiles.data);
    //         } else {
    //             throw new Error("Expected an array of files");
    //         }

    //         logger.info("📁 Fetched vector store files successfully.");
    //     } catch (err) {
    //         logger.error(
    //             `❌ Failed to fetch assistant details. Error: ${JSON.stringify(
    //                 err,
    //             )}`,
    //         );
    //         setError("Failed to fetch assistant details. Please try again.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // const handleSavePrompts = async () => {
    //     setIsLoading(true);
    //     setError("");
    //     try {
    //         logger.info("💾 Saving updated system prompts.");
    //         await updateAssistantPrompts(assistantId, systemPrompt);
    //         alert("Prompts updated successfully!");
    //         logger.info("✅ Prompts updated successfully!");
    //     } catch (err) {
    //         logger.error(
    //             `❌ Failed to update prompts. Error: ${JSON.stringify(err)}`,
    //         );
    //         setError("Failed to update prompts. Please try again.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // // Handle file upload from FileUpload component
    // const handleFileUpload = async (
    //     uploadedFile: File,
    //     name: string,
    //     description: string,
    // ) => {
    //     logger.info(`➕ Uploading file: ${uploadedFile.name}`);
    //     setIsLoading(true);
    //     setError("");
    //     try {
    //         // Call the API to add the file to the assistant
    //         const updatedAssistant = await addFileToAssistant(
    //             assistantId,
    //             uploadedFile.name,
    //             name, // Pass the custom name
    //             description, // Pass the description
    //         );
    //         setFiles(updatedAssistant.file_ids || []);
    //         logger.info("✅ File added successfully!");
    //     } catch (err) {
    //         logger.error(
    //             `❌ Failed to upload file. Error: ${JSON.stringify(err)}`,
    //         );
    //         setError("Failed to upload file. Please try again.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // const handleRemoveFile = async (fileId: string) => {
    //     setIsLoading(true);
    //     setError("");
    //     try {
    //         logger.info(`➖ Removing file ID: ${fileId} from assistant.`);
    //         const updatedAssistant = await removeFileFromAssistant(
    //             assistantId,
    //             fileId,
    //         );
    //         setFiles(updatedAssistant.file_ids || []);
    //         alert("File removed successfully!");
    //         logger.info("✅ File removed successfully!");
    //     } catch (err) {
    //         logger.error(
    //             `❌ Failed to remove file. Error: ${JSON.stringify(err)}`,
    //         );
    //         setError("Failed to remove file. Please try again.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // if (isLoading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>

            {/* <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <label
                            htmlFor="systemPrompt"
                            className="block text-sm font-medium text-gray-700"
                        >
                            System Prompt
                        </label>
                        <Textarea
                            id="systemPrompt"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <Button onClick={handleSavePrompts}>Save Prompts</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>File Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <FileUpload onFileUpload={handleFileUpload} />

                    <div>
                        <h3 className="text-lg font-medium mb-2">
                            Current Files
                        </h3>
                        <ul>
                            {files.map((file) => (
                                <li
                                    key={file.id}
                                    className="flex justify-between items-center mb-2"
                                >
                                    {file.name || file.id}{" "}
                                    <Button
                                        variant="destructive"
                                        onClick={() =>
                                            handleRemoveFile(file.id)
                                        }
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card> */}
        </div>
    );
};

export default SettingsPage;
