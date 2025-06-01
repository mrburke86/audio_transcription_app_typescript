// src/services/OpenAILLMService.ts
import OpenAI from 'openai';
import { ChatMessageParam, ILLMService, LLMRequestOptions } from '@/types';

export class OpenAILLMService implements ILLMService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('OpenAI API key is required.');
        }
        this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }

    async generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            model: options?.model || 'gpt-4o-mini', // Default model
            messages: messages as any, // OpenAI SDK might have slightly different type
            temperature: options?.temperature,
            // stream: false, // Explicitly false for this method
        });
        return completion.choices[0]?.message?.content || '';
    }

    async *generateStreamedResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): AsyncIterable<string> {
        const stream = await this.openai.chat.completions.create({
            model: options?.model || 'gpt-4o', // Default model for streaming
            messages: messages as any,
            temperature: options?.temperature,
            stream: true,
        });

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                yield chunk.choices[0].delta.content;
            }
        }
    }
}
