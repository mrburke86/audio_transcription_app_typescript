// // src\types\ILLMService.ts
// import { ChatMessageParam, OpenAIModelName } from '@/types'; // Or your specific message type

// export interface LLMRequestOptions {
//     model?: OpenAIModelName;
//     temperature?: number;
//     max_tokens?: number;
//     stream?: boolean;
// }

// // This interface defines the contract for LLM services
// export interface ILLMService {
//     generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string>;
//     generateStreamedResponseChunks?(messages: ChatMessageParam[], options?: LLMRequestOptions): AsyncIterable<string>;
// }
