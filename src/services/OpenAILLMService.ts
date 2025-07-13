// src/services/OpenAILLMService.ts
import { logger } from '@/modules';
import { ChatMessageParam, ILLMService, isOpenAIModel, LLMRequestOptions, OpenAIModelName } from '@/types';
import { measureAPICall } from '@/utils/performance/measurementHooks';
import OpenAI from 'openai';

// ✅ NEW: Service-level performance tracking
const openAIServiceStats = {
    totalCompletions: 0,
    totalStreamedResponses: 0,
    totalEmbeddings: 0,
    totalErrors: 0,
    totalTokensGenerated: 0,
    totalCharactersGenerated: 0,
    averageResponseTime: 0,
    responseTimes: [] as number[],
};

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

    // ✅ ENHANCED: Generate Completions API Response with full reliability tracking
    async generateCompleteResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<string> {
        const startTime = performance.now();
        logger.debug(`OpenAILLMService: Generating complete response with ${messages.length} messages`);

        try {
            // ✅ ENHANCED: Wrap with comprehensive API reliability tracking
            const completion = await measureAPICall(
                () =>
                    this.openai.chat.completions.create({
                        model: options?.model || this.modelName,
                        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
                        temperature: options?.temperature,
                    }),
                `OpenAI-Chat-${options?.model || this.modelName}`,
                {
                    timeout: 60000, // 60s timeout for completions
                    retries: 2, // Retry twice on failure
                    logDetails: true,
                }
            );

            const responseTime = Math.round(performance.now() - startTime);
            const response = completion.choices[0]?.message?.content || '';

            // ✅ ENHANCED: Track service statistics
            openAIServiceStats.totalCompletions++;
            openAIServiceStats.totalCharactersGenerated += response.length;
            openAIServiceStats.responseTimes.push(responseTime);

            // Keep only last 100 response times for memory efficiency
            if (openAIServiceStats.responseTimes.length > 100) {
                openAIServiceStats.responseTimes.shift();
            }

            // Update average response time
            openAIServiceStats.averageResponseTime = Math.round(
                openAIServiceStats.responseTimes.reduce((sum, time) => sum + time, 0) /
                    openAIServiceStats.responseTimes.length
            );

            // ✅ ENHANCED: Track token usage if available
            if (completion.usage) {
                openAIServiceStats.totalTokensGenerated += completion.usage.completion_tokens || 0;
                logger.debug(
                    `Token usage - Prompt: ${completion.usage.prompt_tokens}, Completion: ${completion.usage.completion_tokens}, Total: ${completion.usage.total_tokens}`
                );
            }

            logger.info(
                `OpenAILLMService: Complete response generated in ${responseTime}ms (${response.length} chars, model: ${
                    options?.model || this.modelName
                })`
            );

            // ✅ ENHANCED: Performance warnings
            if (responseTime > 30000) {
                // 30+ seconds
                logger.warning(`🐌 Slow OpenAI completion: ${responseTime}ms for ${messages.length} messages`);
            }

            return response;
        } catch (error) {
            openAIServiceStats.totalErrors++;
            const errorTime = Math.round(performance.now() - startTime);
            logger.error(`OpenAILLMService: Error generating complete response after ${errorTime}ms:`, error);
            throw error;
        }
    }

    // ✅ ENHANCED: Generate Streamed Response with performance tracking
    async *generateStreamedResponse(messages: ChatMessageParam[], options?: LLMRequestOptions): AsyncIterable<string> {
        const startTime = performance.now();
        logger.debug(`OpenAILLMService: Starting streamed response with ${messages.length} messages`);

        try {
            // ✅ ENHANCED: Wrap stream initiation with API reliability tracking
            const stream = await measureAPICall(
                () =>
                    this.openai.chat.completions.create({
                        model: options?.model || this.modelName,
                        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
                        temperature: options?.temperature,
                        stream: true,
                    }),
                `OpenAI-Stream-${options?.model || this.modelName}`,
                {
                    timeout: 45000, // 45s timeout for stream initiation
                    retries: 1, // One retry for streams
                    logDetails: true,
                }
            );

            let chunkCount = 0;
            let totalContent = '';
            let firstChunkTime = 0;
            let lastChunkTime = startTime;

            for await (const chunk of stream) {
                if (chunk.choices[0]?.delta?.content) {
                    const content = chunk.choices[0].delta.content;
                    totalContent += content;
                    chunkCount++;

                    // ✅ Track first chunk latency (TTFB - Time To First Byte)
                    if (chunkCount === 1) {
                        firstChunkTime = performance.now() - startTime;
                        logger.debug(`OpenAI Stream: First chunk received in ${firstChunkTime.toFixed(1)}ms`);
                    }

                    lastChunkTime = performance.now();
                    yield content;
                }
            }

            const totalStreamTime = Math.round(performance.now() - startTime);
            const avgChunkInterval =
                chunkCount > 1 ? ((lastChunkTime - (startTime + firstChunkTime)) / (chunkCount - 1)).toFixed(1) : 0;

            // ✅ ENHANCED: Track streaming statistics
            openAIServiceStats.totalStreamedResponses++;
            openAIServiceStats.totalCharactersGenerated += totalContent.length;
            openAIServiceStats.responseTimes.push(totalStreamTime);

            if (openAIServiceStats.responseTimes.length > 100) {
                openAIServiceStats.responseTimes.shift();
            }

            openAIServiceStats.averageResponseTime = Math.round(
                openAIServiceStats.responseTimes.reduce((sum, time) => sum + time, 0) /
                    openAIServiceStats.responseTimes.length
            );

            logger.info(
                `OpenAILLMService: Streamed response completed in ${totalStreamTime}ms (${chunkCount} chunks, ${
                    totalContent.length
                } chars, TTFB: ${firstChunkTime.toFixed(1)}ms, avg chunk interval: ${avgChunkInterval}ms)`
            );

            // ✅ ENHANCED: Streaming performance warnings
            if (firstChunkTime > 10000) {
                // 10+ seconds to first chunk
                logger.warning(`🐌 Slow OpenAI stream start: ${firstChunkTime.toFixed(1)}ms to first chunk`);
            }

            if (totalStreamTime > 60000) {
                // 60+ seconds total
                logger.warning(`🐌 Long OpenAI stream: ${totalStreamTime}ms total duration`);
            }
        } catch (error) {
            openAIServiceStats.totalErrors++;
            const errorTime = Math.round(performance.now() - startTime);
            logger.error(`OpenAILLMService: Error in streamed response after ${errorTime}ms:`, error);
            throw error;
        }
    }

    // ✅ ENHANCED: Get Embeddings with full reliability tracking
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
            const processedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

            if (processedText !== text) {
                logger.warning(
                    `OpenAILLMService: Text truncated from ${text.length} to ${processedText.length} characters for embedding`
                );
            }

            // ✅ ENHANCED: Wrap embedding generation with API reliability tracking
            const response = await measureAPICall(
                () =>
                    this.openai.embeddings.create({
                        model: 'text-embedding-3-small',
                        input: processedText.replace(/\n/g, ' '), // API best practice
                    }),
                'OpenAI-Embeddings',
                {
                    timeout: 30000, // 30s timeout for embeddings
                    retries: 2, // Retry twice for embeddings
                    logDetails: true,
                }
            );

            const embedding = response.data[0].embedding;
            const embeddingTime = Math.round(performance.now() - startTime);

            // ✅ ENHANCED: Track embedding statistics
            openAIServiceStats.totalEmbeddings++;

            // Validate embedding
            if (!embedding || embedding.length !== 1536) {
                throw new Error(`Invalid embedding received: expected 1536D, got ${embedding?.length || 0}D`);
            }

            logger.debug(`OpenAILLMService: Embedding generated in ${embeddingTime}ms (${embedding.length}D vector)`);

            // ✅ ENHANCED: Track token usage for embeddings
            if (response.usage) {
                openAIServiceStats.totalTokensGenerated += response.usage.total_tokens || 0;
                logger.debug(`Embedding token usage: ${response.usage.total_tokens} tokens`);
            }

            // Log embedding statistics for debugging
            const embeddingStats = {
                mean: embedding.reduce((sum, val) => sum + val, 0) / embedding.length,
                min: Math.min(...embedding),
                max: Math.max(...embedding),
            };
            logger.debug(
                `Embedding stats - Mean: ${embeddingStats.mean.toFixed(4)}, Range: [${embeddingStats.min.toFixed(
                    4
                )}, ${embeddingStats.max.toFixed(4)}]`
            );

            // ✅ ENHANCED: Embedding performance warnings
            if (embeddingTime > 10000) {
                // 10+ seconds
                logger.warning(`🐌 Slow OpenAI embedding: ${embeddingTime}ms for ${text.length} characters`);
            }

            return embedding;
        } catch (error) {
            openAIServiceStats.totalErrors++;
            const errorTime = Math.round(performance.now() - startTime);
            logger.error(`OpenAILLMService: Error generating embedding after ${errorTime}ms:`, error);
            throw error;
        }
    }
}

// ✅ ENHANCED: Standalone embedding function with comprehensive performance tracking
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

        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

        // ✅ ENHANCED: Wrap with comprehensive API reliability tracking
        const response = await measureAPICall(
            () =>
                openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: processedText.replace(/\n/g, ' '),
                }),
            'OpenAI-Embeddings-Standalone',
            {
                timeout: 30000, // 30s timeout
                retries: 2, // Retry twice
                logDetails: true,
            }
        );

        const embedding = response.data[0].embedding;
        const embeddingTime = Math.round(performance.now() - startTime);

        // Comprehensive validation
        if (!embedding) {
            throw new Error('No embedding data received from OpenAI');
        }

        if (embedding.length !== 1536) {
            throw new Error(`Invalid embedding dimension: expected 1536, received ${embedding.length}`);
        }

        // Check for invalid values
        const hasInvalidValues = embedding.some(val => isNaN(val) || !isFinite(val));
        if (hasInvalidValues) {
            throw new Error('Embedding contains invalid values (NaN or Infinity)');
        }

        logger.debug(`getOpenAIEmbedding: Successfully generated ${embedding.length}D embedding in ${embeddingTime}ms`);

        // ✅ ENHANCED: Track standalone embedding statistics
        openAIServiceStats.totalEmbeddings++;
        if (response.usage) {
            openAIServiceStats.totalTokensGenerated += response.usage.total_tokens || 0;
        }

        // Log sample values for debugging (first 5 dimensions)
        const sampleValues = embedding
            .slice(0, 5)
            .map(val => val.toFixed(4))
            .join(', ');
        logger.debug(`Embedding sample values: [${sampleValues}, ...]`);

        return embedding;
    } catch (error) {
        openAIServiceStats.totalErrors++;
        const errorTime = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : 'Unknown embedding error';

        logger.error(`getOpenAIEmbedding: Failed after ${errorTime}ms - ${errorMessage}`, error);

        // Re-throw with more context
        throw new Error(`Embedding generation failed: ${errorMessage}`);
    }
};

// ✅ NEW: Get OpenAI service performance statistics
export const getOpenAIServiceStats = () => {
    const totalRequests =
        openAIServiceStats.totalCompletions +
        openAIServiceStats.totalStreamedResponses +
        openAIServiceStats.totalEmbeddings;

    const errorRate =
        totalRequests > 0 ? ((openAIServiceStats.totalErrors / totalRequests) * 100).toFixed(1) + '%' : '0%';

    const avgCharsPerRequest =
        totalRequests > 0 ? Math.round(openAIServiceStats.totalCharactersGenerated / totalRequests) : 0;

    return {
        totalCompletions: openAIServiceStats.totalCompletions,
        totalStreamedResponses: openAIServiceStats.totalStreamedResponses,
        totalEmbeddings: openAIServiceStats.totalEmbeddings,
        totalRequests,
        totalErrors: openAIServiceStats.totalErrors,
        errorRate,
        totalTokensGenerated: openAIServiceStats.totalTokensGenerated,
        totalCharactersGenerated: openAIServiceStats.totalCharactersGenerated,
        averageResponseTime: openAIServiceStats.averageResponseTime,
        avgCharsPerRequest,
        recentResponseTimes: openAIServiceStats.responseTimes.slice(-10), // Last 10 response times
    };
};

// ✅ NEW: Reset OpenAI service statistics
export const resetOpenAIServiceStats = () => {
    Object.keys(openAIServiceStats).forEach(key => {
        if (key === 'responseTimes') {
            openAIServiceStats[key as keyof typeof openAIServiceStats] = [] as any;
        } else {
            openAIServiceStats[key as keyof typeof openAIServiceStats] = 0 as any;
        }
    });

    logger.info('🔄 OpenAI service statistics reset');
};
