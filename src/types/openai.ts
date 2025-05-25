// src\types\openai.ts
import OpenAI from 'openai';

// ✅ SINGLE SOURCE: Export the client type
export type OpenAIClient = OpenAI;

// ✅ SIMPLIFIED: One message type for your app
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// ✅ SPECIALIZED: Only for transcription interim states
export interface InterimMessage {
    role: 'interim';
    content: string;
}

// ✅ ESSENTIAL OPENAI RE-EXPORTS ONLY
export type ChatMessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion;
export type ChatCompletionChunk = OpenAI.Chat.Completions.ChatCompletionChunk;
export type ChatCompletionCreateParams = OpenAI.Chat.Completions.ChatCompletionCreateParams;
export type OpenAIChatMessageRole = OpenAI.Chat.Completions.ChatCompletionRole;
// ✅ MODEL INTERFACE (simplified - removed batch pricing if not used)
export interface OpenAIModel {
    name: string;
    description: string;
    inputPricePerMillion: number;
    outputPricePerMillion: number;
    additionalDetails?: string;
}

// ✅ MOVE MODEL DATA TO SEPARATE FILE
export type OpenAIModelName =
    | 'gpt-4o'
    | 'gpt-4o-mini'
    | 'gpt-4.1'
    | 'gpt-4.5-preview'
    | 'o1-mini'
    | 'o1'
    | 'o1-pro'
    | 'o3-mini'
    | 'o3'
    | 'o4-mini';
