// src/services/OpenAILLMService.ts
// FIXED: Stripped perf (measureAPICall, stats, timings, warnings); added stack traces in errors; descriptive names (e.g., generateStreamedResponseChunks).
import { logger } from '@/modules';
import { ChatMessageParam, ILLMService, isOpenAIModel, LLMRequestOptions, OpenAIModelName } from '@/types';
import OpenAI from 'openai';

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
        this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        this.modelName = modelName;

        logger.debug(`OpenAILLMService: Initialized with model ${modelName}`);
    }

    async generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string> {
        logger.debug(`OpenAILLMService: Generating complete response with ${messages.length} messages`);

        try {
            const completion = await this.openai.chat.completions.create({
                model: options?.model || this.modelName,
                messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
                temperature: options?.temperature,
            });

            const response = completion.choices[0]?.message?.content || '';

            logger.info(
                `OpenAILLMService: Complete response generated (${response.length} chars, model: ${
                    options?.model || this.modelName
                })`
            );

            return response;
        } catch (error) {
            logger.error(
                `OpenAILLMService: Error generating complete response: ${(error as Error).message}\nStack: ${
                    (error as Error).stack
                }`
            );
            throw error;
        }
    }

    async *generateStreamedResponseChunks(
        messages: ChatMessageParam[],
        options?: LLMRequestOptions
    ): AsyncIterable<string> {
        // RENAMED
        logger.debug(`OpenAILLMService: Starting streamed response with ${messages.length} messages`);

        try {
            const stream = await this.openai.chat.completions.create({
                model: options?.model || this.modelName,
                messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
                temperature: options?.temperature,
                stream: true,
            });

            for await (const chunk of stream) {
                if (chunk.choices[0]?.delta?.content) {
                    yield chunk.choices[0].delta.content;
                }
            }

            logger.info(`OpenAILLMService: Streamed response completed`);
        } catch (error) {
            logger.error(
                `OpenAILLMService: Error in streamed response: ${(error as Error).message}\nStack: ${
                    (error as Error).stack
                }`
            );
            throw error;
        }
    }
}
