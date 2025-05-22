// src/types/assistant.ts
import { Assistant as OpenAIAssistant } from "openai/resources/beta/assistants";

export interface MyCustomAssistant extends OpenAIAssistant {
    metadata: Metadata;
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
