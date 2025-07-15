// src\types\ILLMService.ts
import { ChatMessageParam } from '@/types'; // Or your specific message type

export interface LLMRequestOptions {
    model?: string;
    temperature?: number;
    // other options like max_tokens, stream, etc.
}

export interface ILLMService {
    generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string>;
    generateStreamedResponse?( // Optional if not all providers/tasks stream
        messages: ChatMessageParam[],
        options?: LLMRequestOptions
    ): AsyncIterable<string>;
}
