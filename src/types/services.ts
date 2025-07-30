import OpenAI from 'openai';

// OpenAI Types
export type ChatMessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type OpenAIModelName = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';

export interface LLMRequestOptions {
    model?: OpenAIModelName;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    response_format?: { type: 'text' | 'json_object' };
    logprobs?: boolean;
    signal?: AbortSignal;
}

export interface ILLMService {
    generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string>;
    generateStreamedResponseChunks?(messages: ChatMessageParam[], options?: LLMRequestOptions): AsyncIterable<string>;
}

// Speech Recognition Types
export interface CustomSpeechError {
    code: SpeechRecognitionErrorCode;
    message: string;
}

export type RecognitionStatus = 'inactive' | 'active' | 'error';

export interface SpeechRecognitionProps {
    onStart: () => void;
    onEnd: () => void;
    onError: (error: SpeechRecognitionErrorEvent | CustomSpeechError) => void;
    onResult: (finalTranscript: string, interimTranscript: string) => void;
}

// Global Window Extension
// declare global {
//     interface Window {
//         webkitSpeechRecognition: typeof SpeechRecognition;
//     }
// }

// Qdrant Types
export interface QdrantPoint {
    id: string;
    payload: {
        text: string;
        source: string;
        chunk_index: number;
        chunk_length: number;
        processed_at: string;
    };
    vector: number[];
}
