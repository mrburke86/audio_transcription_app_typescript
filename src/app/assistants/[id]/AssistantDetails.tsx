// src/app/assistants/[id]/AssistantDetails.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Assistant } from "@/types/assistant";
import { AssistantTool } from "openai/resources/beta/assistants";
import { deleteAssistant } from "@/lib/openai";

interface AssistantDetailsProps {
    initialAssistant: Assistant; // Ensure this prop is passed from the parent
}

const AssistantDetails: React.FC<AssistantDetailsProps> = ({
    initialAssistant,
}) => {
    const [assistant, setAssistant] = useState<Assistant>(initialAssistant);
    const [isDeleting, setIsDeleting] = useState<boolean>(false); // Remove if not used
    const [tools, setTools] = useState<AssistantTool[]>([]);
    const [counter, setCounter] = useState<number>(0);

    useEffect(() => {
        // Fetch or initialize tools for the assistant
        // This could be from an API or predefined
        const fetchedTools: AssistantTool[] = [
            { type: "code_interpreter" },
            { type: "file_search", file_search: { max_num_results: 10 } },
            // { type: 'function', function: { /* function definition */ } },
        ];
        setTools(fetchedTools);
    }, [assistant]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Perform delete operation, e.g., call deleteAssistant API
            await deleteAssistant(assistant.id);
            // Handle successful deletion, e.g., redirect or update state
        } catch (error) {
            // Handle error, e.g., show error message
            console.error("Error deleting assistant:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const incrementCounter = () => {
        setCounter((prev: number) => prev + 1);
    };

    const handleToolClick = (tool: AssistantTool) => {
        switch (tool.type) {
            case "code_interpreter":
                // Handle code interpreter tool
                console.log("Code Interpreter Tool clicked");
                break;
            case "file_search":
                if (tool.file_search) {
                    // Handle file search tool with overrides
                    console.log(
                        `Max results: ${tool.file_search.max_num_results}`,
                    );
                }
                break;
            case "function":
                // Handle function tool
                console.log("Function Tool clicked");
                break;
            default:
                // Handle unknown tool type
                console.warn("Unknown tool type:", tool);
                break;
        }
    };

    return (
        <div>
            <h1>{assistant.name}</h1>
            <p>{assistant.description}</p>
            <button onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Assistant"}
            </button>
            <div>
                <h2>Counter: {counter}</h2>
                <button onClick={incrementCounter}>Increment</button>
            </div>
            <div>
                <h2>Tools</h2>
                <ul>
                    {tools.map((tool, index) => (
                        <li key={index}>
                            <button onClick={() => handleToolClick(tool)}>
                                {tool.type}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Rest of your component JSX */}
        </div>
    );
};

export default AssistantDetails;

// // Mock deleteAssistant function
// const deleteAssistant = async (assistantId: string): Promise<void> => {
//     // Implement your delete logic here, e.g., API call
//     return new Promise((resolve) => setTimeout(resolve, 1000));
// };
