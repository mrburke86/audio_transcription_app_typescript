// src/services/OpenAILLMService.ts
import OpenAI from 'openai';
import { ChatMessageParam, ILLMService, isOpenAIModel, LLMRequestOptions, OpenAIModelName } from '@/types';

export class OpenAILLMService implements ILLMService {
    private openai: OpenAI;
    private modelName: OpenAIModelName;

    constructor(apiKey: string, modelName: OpenAIModelName = 'gpt-4o-mini') {
        if (!apiKey) {
            throw new Error('OpenAI API key is required.');
        }
        if (!isOpenAIModel(modelName)) {
            throw new Error(`Invalid OpenAI model name: ${modelName}`);
        }
        this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true }); // dangerouslyAllowBrowser for client-side usage
        this.modelName = modelName;
    }

    // Generate Completions API Response
    async generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            model: options?.model || this.modelName,
            messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
            temperature: options?.temperature,
            // stream: false, // Explicitly false for this method
        });
        return completion.choices[0]?.message?.content || '';
    }

    // Generate Streamed Response
    async *generateStreamedResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): AsyncIterable<string> {
        const stream = await this.openai.chat.completions.create({
            model: options?.model || this.modelName, // Default model for streaming
            messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
            temperature: options?.temperature,
            stream: true,
        });

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                yield chunk.choices[0].delta.content;
            }
        }
    }

    // Get Embeddings
    async getEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: 'text-embedding-ada-002', // Or other embedding model
                input: text.replace(/\n/g, ' '), // API best practice: replace newlines
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error('Error generating OpenAI embedding:', error);
            throw error;
        }
    }
}

// Export a standalone function for easier use in QdrantService or elsewhere
export const getOpenAIEmbedding = async (text: string): Promise<number[]> => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OpenAI API key not found for embedding.');
    }
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text.replace(/\n/g, ' '),
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating OpenAI embedding (standalone):', error);
        throw error;
    }
};
