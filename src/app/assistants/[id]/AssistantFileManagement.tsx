// src/app/assistants/[category]/[id]/AssistantFileManagement.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { VectorStoreFile, Assistant } from "@/types/assistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, FileIcon } from "lucide-react";
import { logger } from "@/modules/Logger";
import { createVectorStore, removeFileFromVectorStore } from "@/lib/openai";

interface AssistantFileManagementProps {
    assistant: Assistant;
    vectorStoreId: string | undefined;
    files: VectorStoreFile[];
}

export function AssistantFileManagement({
    assistant,
    vectorStoreId: initialVectorStoreId,
    files: initialFiles,
}: AssistantFileManagementProps) {
    const [vectorStoreId, setVectorStoreId] = useState<string | undefined>(
        initialVectorStoreId,
    );
    const [files, setFiles] = useState<VectorStoreFile[]>(initialFiles);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting state for individual files
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        logger.info("Assistant details: " + JSON.stringify(assistant));
    }, [assistant]);

    const handleCreateVectorStore = useCallback(async () => {
        setIsCreating(true);
        try {
            const newVectorStoreId = await createVectorStore(
                assistant.id,
                `VectorStore_${assistant.id}`,
            );
            if (newVectorStoreId) {
                setVectorStoreId(newVectorStoreId);
                setFiles([]); // Reset files as the new store is empty
                router.refresh(); // Refresh the page to reflect the changes
                toast({
                    title: "Success",
                    description: "Vector Store created successfully.",
                    variant: "default",
                });
            } else {
                throw new Error("Failed to retrieve a valid Vector Store ID");
            }
        } catch (error) {
            console.error("Failed to create Vector Store:", error);
            toast({
                title: "Error",
                description: "Failed to create Vector Store. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    }, [assistant.id, router, toast]);

    const handleDeleteFile = async (fileId: string) => {
        setIsDeleting(fileId);
        const formData = new FormData();
        formData.append("vectorStoreId", vectorStoreId || "");
        formData.append("fileId", fileId);
        try {
            await removeFileFromVectorStore(formData);
            setFiles((prevFiles) =>
                prevFiles.filter((file) => file.id !== fileId),
            );
            toast({
                title: "File deleted",
                description: "The file has been successfully removed.",
            });
        } catch (error) {
            console.error("Failed to delete file:", error); // Now error is used
            toast({
                title: "Error",
                description: "Failed to delete the file. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    };

    const renderFileCard = (file: VectorStoreFile) => {
        logger.info("File data: " + JSON.stringify(file, null, 2));
        return (
            <Card
                key={file.id}
                className="hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardTitle className="text-lg font-semibold flex items-center">
                        <FileIcon className="w-5 h-5 mr-2" />
                        {file.name || "Unnamed File"}
                    </CardTitle>
                    <p className="text-xs opacity-80">
                        Created:{" "}
                        {new Date(file.created_at * 1000).toLocaleString()}
                    </p>
                </CardHeader>
                <CardContent className="pt-4">
                    <p
                        className="text-sm font-medium mb-3 truncate"
                        title={file.id}
                    >
                        ID: {file.id}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <InfoItem label="Object" value={file.object} />
                        <InfoItem
                            label="Usage"
                            value={`${file.usage_bytes} bytes`}
                        />
                        <InfoItem label="Status" value={file.status} />
                        <InfoItem
                            label="Last Error"
                            value={
                                typeof file.last_error === "string"
                                    ? file.last_error
                                    : JSON.stringify(file.last_error)
                            }
                        />
                    </div>

                    <Button
                        onClick={() => handleDeleteFile(file.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full mt-4 hover:bg-red-600 transition-colors duration-300"
                        disabled={isDeleting === file.id}
                    >
                        {isDeleting === file.id ? "Deleting..." : "Delete File"}
                        <Trash2 className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        );
    };

    const InfoItem = ({ label, value }: { label: string; value: string }) => (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {label}
            </span>
            <span className="font-medium truncate" title={value}>
                {value}
            </span>
        </div>
    );

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>File Management </CardTitle>
            </CardHeader>
            <CardContent>
                {vectorStoreId ? (
                    <>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">
                                Vector Store Details
                            </h3>
                            <p>Vector Store ID: {vectorStoreId}</p>
                            <p>Total Files: {files.length}</p>
                        </div>
                        <Tabs defaultValue="files">
                            <TabsList className="mb-4">
                                <TabsTrigger value="files">Files</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                            </TabsList>
                            <TabsContent value="files">
                                {files.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        No files available for this assistant.
                                    </p>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {files.map(renderFileCard)}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="upload">
                                <FileUpload
                                    assistantId={assistant.id}
                                    vectorStoreId={vectorStoreId}
                                />
                            </TabsContent>
                        </Tabs>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            No vector store associated with this assistant.
                        </p>
                        <Button
                            onClick={handleCreateVectorStore}
                            disabled={isCreating}
                            aria-busy={isCreating}
                            aria-live="polite"
                        >
                            {isCreating ? "Creating..." : "Create Vector Store"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
