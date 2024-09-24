// src/types/assistant.ts
import { Assistant as OpenAIAssistant } from "openai/resources/beta/assistants";
// import openAIModels, { OpenAIModel } from "./openai-models";

export interface MyCustomAssistant extends OpenAIAssistant {
    metadata: Metadata;
    // model: OpenAIModel; // Type-safe model selection from the predefined models
}

export interface Metadata {
    category?: string;
    role_description?: string;
}

export interface VectorStoreFile {
    id: string;
    object: string;
    usage_bytes: number;
    created_at: number;
    vector_store_id: string;
    status: string;
    last_error: { code: string; message: string } | null;
    chunking_strategy?: {
        type: string;
        static?: {
            max_chunk_size_tokens: number;
            chunk_overlap_tokens: number;
        };
    };
    name?: string;
}

export interface Tool {
    type: string;
}

export type ValidToolType = "function" | "code_interpreter" | "file_search";

export type ComponentProps = React.HTMLAttributes<HTMLElement>;

export interface CodeProps
    extends React.ClassAttributes<HTMLElement>,
        React.HTMLAttributes<HTMLElement> {
    inline?: boolean;
    className?: string;
    children: string;
}

// export interface AssistantCategory {
//     name: string;
//     slug: string;
//     assistants: Assistant[];
// }

export interface VectorStoreFileBatch {
    files: VectorStoreFile[];
}
