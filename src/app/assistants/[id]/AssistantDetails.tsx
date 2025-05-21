// src/app/assistants/[id]/AssistantDetails.tsx
"use client";
import React, { useState, useEffect } from "react";
import { MyCustomAssistant } from "@/types/assistant";
import { AssistantTool } from "openai/resources/beta/assistants";
import { logger } from "@/modules/Logger";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface AssistantDetailsProps {
    initialAssistant: MyCustomAssistant;
}

// Define a more explicit type for our tools to avoid TypeScript issues
type ToolInfo = {
    type: string;
    config?: Record<string, any>;
};

const AssistantDetails: React.FC<AssistantDetailsProps> = ({
    initialAssistant,
}) => {
    const [assistant] = useState<MyCustomAssistant>(initialAssistant);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [tools, setTools] = useState<AssistantTool[]>([]);
    const [counter, setCounter] = useState<number>(0);

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        logger.info(
            `AssistantDetails component mounted for assistant: ${assistant.name}`,
        );

        // Fetch or initialize tools for the assistant based on the actual assistant configuration
        const assistantTools = assistant.tools || [];

        // If no tools are configured, set up default tools
        if (assistantTools.length === 0) {
            const defaultTools: AssistantTool[] = [
                { type: "code_interpreter" },
                {
                    type: "file_search",
                    file_search: { max_num_results: 10 },
                } as AssistantTool,
            ];
            setTools(defaultTools);
            logger.debug(
                `Initialized ${defaultTools.length} default tools for assistant ${assistant.id}`,
            );
        } else {
            setTools(assistantTools);
            logger.debug(
                `Using ${assistantTools.length} configured tools for assistant ${assistant.id}`,
            );
        }
    }, [assistant]);

    const deleteAssistant = async (assistantId: string): Promise<void> => {
        logger.info(`Attempting to delete assistant: ${assistantId}`);

        // TODO: Implement actual deletion logic here
        // This could be an API call to your backend or direct OpenAI API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                const success = Math.random() > 0.2; // 80% success rate for demo
                if (success) {
                    logger.info(
                        `Successfully deleted assistant: ${assistantId}`,
                    );
                    resolve();
                } else {
                    const error = new Error("Failed to delete assistant");
                    logger.error(
                        `Failed to delete assistant ${assistantId}: ${error.message}`,
                    );
                    reject(error);
                }
            }, 1000);
        });
    };

    const handleDelete = async () => {
        logger.info(`User initiated deletion of assistant: ${assistant.id}`);
        setIsDeleting(true);

        try {
            await deleteAssistant(assistant.id);

            toast({
                title: "Success",
                description: `Assistant "${assistant.name}" has been deleted successfully.`,
                variant: "default",
            });

            logger.info(
                `Assistant ${assistant.id} deleted successfully, redirecting to assistants list`,
            );
            router.push("/assistants");
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            logger.error(
                `Error deleting assistant ${assistant.id}: ${errorMessage}`,
            );

            toast({
                title: "Error",
                description: `Failed to delete assistant: ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const incrementCounter = () => {
        const newValue = counter + 1;
        setCounter(newValue);
        logger.debug(`Counter incremented to: ${newValue}`);
    };

    const handleToolClick = (tool: AssistantTool) => {
        logger.info(`Tool clicked: ${tool.type}`);

        switch (tool.type) {
            case "code_interpreter":
                logger.debug("Code Interpreter Tool clicked");
                toast({
                    title: "Tool Selected",
                    description: "Code Interpreter tool activated",
                });
                break;
            case "file_search":
                if (tool.file_search) {
                    const maxResults = tool.file_search.max_num_results;
                    logger.debug(
                        `File Search Tool clicked with max results: ${maxResults}`,
                    );
                    toast({
                        title: "Tool Selected",
                        description: `File Search tool activated (max results: ${maxResults})`,
                    });
                }
                break;
            case "function":
                logger.debug("Function Tool clicked");
                toast({
                    title: "Tool Selected",
                    description: "Function tool activated",
                });
                break;
            default:
                logger.warning(`Unknown tool type clicked: ${tool.type}`);
                toast({
                    title: "Warning",
                    description: `Unknown tool type: ${tool.type}`,
                    variant: "destructive",
                });
                break;
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{assistant.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    {assistant.description || "No description available"}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                    <span>Assistant ID: {assistant.id}</span>
                    <span className="ml-4">
                        Category:{" "}
                        {assistant.metadata?.category || "Uncategorized"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <div className="space-y-3">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded transition-colors"
                        >
                            {isDeleting ? "Deleting..." : "Delete Assistant"}
                        </button>

                        <div className="border-t pt-3">
                            <h3 className="font-medium mb-2">
                                Debug Counter: {counter}
                            </h3>
                            <button
                                onClick={incrementCounter}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                            >
                                Increment Counter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">
                        Available Tools
                    </h2>
                    {tools.length === 0 ? (
                        <p className="text-gray-500">No tools configured</p>
                    ) : (
                        <div className="space-y-2">
                            {tools.map((tool, index) => {
                                const toolType = tool.type;
                                const displayName = toolType.replace("_", " ");
                                const isFileSearch = toolType === "file_search";

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleToolClick(tool)}
                                        className="w-full text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded transition-colors"
                                    >
                                        <div className="font-medium capitalize">
                                            {displayName}
                                        </div>
                                        {isFileSearch &&
                                            "file_search" in tool &&
                                            tool.file_search && (
                                                <div className="text-sm text-gray-500">
                                                    Max results:{" "}
                                                    {
                                                        tool.file_search
                                                            .max_num_results
                                                    }
                                                </div>
                                            )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssistantDetails;
