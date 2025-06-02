// src/services/OpenAILLMService.ts
import OpenAI from 'openai';
import {
    ChatMessageParam,
    ILLMService,
    isOpenAIModel,
    LLMRequestOptions,
    OpenAIModelName,
} from '@/types';
import { logger } from '@/modules';

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

    // Generate Completions API Response
    async generateCompleteResponse(
        messages: ChatMessageParam[],
        options?: LLMRequestOptions
    ): Promise<string> {
        const startTime = performance.now();
        logger.debug(
            `OpenAILLMService: Generating complete response with ${messages.length} messages`
        );

        try {
            const completion = await this.openai.chat.completions.create({
                model: options?.model || this.modelName,
                messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
                temperature: options?.temperature,
            });

            const responseTime = Math.round(performance.now() - startTime);
            const response = completion.choices[0]?.message?.content || '';

            logger.info(
                `OpenAILLMService: Complete response generated in ${responseTime}ms (${response.length} chars)`
            );
            return response;
        } catch (error) {
            const errorTime = Math.round(performance.now() - startTime);
            logger.error(
                `OpenAILLMService: Error generating complete response after ${errorTime}ms:`,
                error
            );
            throw error;
        }
    }

    // Generate Streamed Response
    async *generateStreamedResponse(
        messages: ChatMessageParam[],
        options?: LLMRequestOptions
    ): AsyncIterable<string> {
        const startTime = performance.now();
        logger.debug(
            `OpenAILLMService: Starting streamed response with ${messages.length} messages`
        );

        try {
            const stream = await this.openai.chat.completions.create({
                model: options?.model || this.modelName,
                messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
                temperature: options?.temperature,
                stream: true,
            });

            let chunkCount = 0;
            let totalContent = '';

            for await (const chunk of stream) {
                if (chunk.choices[0]?.delta?.content) {
                    const content = chunk.choices[0].delta.content;
                    totalContent += content;
                    chunkCount++;
                    yield content;
                }
            }

            const streamTime = Math.round(performance.now() - startTime);
            logger.info(
                `OpenAILLMService: Streamed response completed in ${streamTime}ms (${chunkCount} chunks, ${totalContent.length} chars)`
            );
        } catch (error) {
            const errorTime = Math.round(performance.now() - startTime);
            logger.error(
                `OpenAILLMService: Error in streamed response after ${errorTime}ms:`,
                error
            );
            throw error;
        }
    }

    // Get Embeddings
    async getEmbedding(text: string): Promise<number[]> {
        const startTime = performance.now();
        logger.debug(`OpenAILLMService: Generating embedding for ${text.length} characters`);

        try {
            // Validate input
            if (!text || text.trim().length === 0) {
                throw new Error('Empty text provided for embedding');
            }

            // Truncate if too long (OpenAI has token limits)
            const maxLength = 8000; // Conservative limit
            const processedText =
                text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

            if (processedText !== text) {
                logger.warning(
                    `OpenAILLMService: Text truncated from ${text.length} to ${processedText.length} characters for embedding`
                );
            }

            const response = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: processedText.replace(/\n/g, ' '), // API best practice
            });

            const embedding = response.data[0].embedding;
            const embeddingTime = Math.round(performance.now() - startTime);

            // Validate embedding
            if (!embedding || embedding.length !== 1536) {
                throw new Error(
                    `Invalid embedding received: expected 1536D, got ${embedding?.length || 0}D`
                );
            }

            logger.debug(
                `OpenAILLMService: Embedding generated in ${embeddingTime}ms (${embedding.length}D vector)`
            );

            // Log embedding statistics for debugging
            const embeddingStats = {
                mean: embedding.reduce((sum, val) => sum + val, 0) / embedding.length,
                min: Math.min(...embedding),
                max: Math.max(...embedding),
            };
            logger.debug(
                `Embedding stats - Mean: ${embeddingStats.mean.toFixed(
                    4
                )}, Range: [${embeddingStats.min.toFixed(4)}, ${embeddingStats.max.toFixed(4)}]`
            );

            return embedding;
        } catch (error) {
            const errorTime = Math.round(performance.now() - startTime);
            logger.error(
                `OpenAILLMService: Error generating embedding after ${errorTime}ms:`,
                error
            );
            throw error;
        }
    }
}

// Enhanced standalone embedding function with comprehensive logging
export const getOpenAIEmbedding = async (text: string): Promise<number[]> => {
    const startTime = performance.now();

    try {
        const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not found for embedding generation');
        }

        logger.debug(`getOpenAIEmbedding: Processing ${text.length} characters`);

        // Input validation and preprocessing
        if (!text || text.trim().length === 0) {
            throw new Error('Empty or null text provided for embedding');
        }

        const maxLength = 8000;
        const processedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

        if (processedText !== text) {
            logger.warning(
                `getOpenAIEmbedding: Text truncated from ${text.length} to ${processedText.length} characters`
            );
        }

        // const response = await this.openai.embeddings.create({
        //     model: 'text-embedding-ada-002',
        //     input: processedText.replace(/\n/g, ' '), // API best practice
        // });

        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: processedText.replace(/\n/g, ' '),
        });

        const embedding = response.data[0].embedding;
        const embeddingTime = Math.round(performance.now() - startTime);

        // Comprehensive validation
        if (!embedding) {
            throw new Error('No embedding data received from OpenAI');
        }

        if (embedding.length !== 1536) {
            throw new Error(
                `Invalid embedding dimension: expected 1536, received ${embedding.length}`
            );
        }

        // Check for invalid values
        const hasInvalidValues = embedding.some(val => isNaN(val) || !isFinite(val));
        if (hasInvalidValues) {
            throw new Error('Embedding contains invalid values (NaN or Infinity)');
        }

        logger.debug(
            `getOpenAIEmbedding: Successfully generated ${embedding.length}D embedding in ${embeddingTime}ms`
        );

        // Log sample values for debugging (first 5 dimensions)
        const sampleValues = embedding
            .slice(0, 5)
            .map(val => val.toFixed(4))
            .join(', ');
        logger.debug(`Embedding sample values: [${sampleValues}, ...]`);

        return embedding;
    } catch (error) {
        const errorTime = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : 'Unknown embedding error';

        logger.error(`getOpenAIEmbedding: Failed after ${errorTime}ms - ${errorMessage}`, error);

        // Re-throw with more context
        throw new Error(`Embedding generation failed: ${errorMessage}`);
    }
};
