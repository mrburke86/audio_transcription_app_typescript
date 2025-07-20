// src/services/OpenAIClientService.ts

import { logger } from '@/lib/Logger';
import { ChatMessageParam, ILLMService, LLMRequestOptions, OpenAIModelName } from '@/types';
import OpenAI from 'openai';

// Custom error class for better typing and context in LLM operations
export class LLMError extends Error {
    constructor(
        message: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'LLMError';
    }
}

// Inline type guard for model validation (replaces external isOpenAIModel for self-containment)
function isValidOpenAIModel(model: string): model is OpenAIModelName {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'].includes(model as OpenAIModelName);
}

export class OpenAIClientService implements ILLMService {
    private readonly openai: OpenAI;
    private readonly defaultModel: OpenAIModelName;

    // Constructor with API key and default model
    constructor(apiKey: string, defaultModel: OpenAIModelName = 'gpt-4o-mini') {
        if (!apiKey) {
            throw new LLMError('OpenAI API key is required.');
        }
        if (!isValidOpenAIModel(defaultModel)) {
            throw new LLMError(`Invalid OpenAI model name: ${defaultModel}`);
        }

        // Security tip: In browser, keys are exposed—use only for dev; proxy via Next.js API routes for prod
        if (typeof window !== 'undefined') {
            logger.warning(
                'OpenAIClientService: Using API key in browser—risk of exposure! Use server-side proxy in production.'
            );
        }

        this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true }); // Kept for compat; remove in server-only
        this.defaultModel = defaultModel;

        logger.info('OpenAIClientService initialized', { model: defaultModel }); // Structured logging
    }

    async generateCompleteResponse<T = string>(messages: ChatMessageParam[], options?: LLMRequestOptions): Promise<T> {
        const model = options?.model || this.defaultModel;
        logger.debug('Generating complete response', { messageCount: messages.length, model });

        try {
            const completion = await this.retryWithBackoff(async () => {
                return this.openai.chat.completions.create({
                    model,
                    messages,
                    temperature: options?.temperature,
                    max_tokens: options?.max_tokens, // Added: Direct support from options
                    // v5+ feature: Structured outputs (e.g., for JSON)
                    response_format: options?.response_format ? { type: 'json_object' } : undefined,
                    // Trick: logprobs for confidence (new in v5; useful for debugging uncertain responses)
                    logprobs: options?.logprobs ?? false,
                });
            });

            const response = (completion.choices[0]?.message?.content ?? '') as T;

            logger.info('Complete response generated', {
                chars: typeof response === 'string' ? response.length : 'N/A',
                model,
                usage: completion.usage,
            });

            return response;
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error generating complete response', {
                error: errMsg,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw new LLMError('Failed to generate complete response', error);
        }
    }

    async *generateStreamedResponseChunks(
        messages: ChatMessageParam[],
        options?: LLMRequestOptions & { signal?: AbortSignal }
    ): AsyncIterable<string> {
        const model = options?.model || this.defaultModel;
        logger.debug('Starting streamed response', { messageCount: messages.length, model });

        try {
            const stream = await this.retryWithBackoff(async () => {
                return this.openai.chat.completions.create({
                    model,
                    messages,
                    temperature: options?.temperature,
                    max_tokens: options?.max_tokens,
                    stream: true,
                    response_format: options?.response_format ? { type: 'json_object' } : undefined,
                    logprobs: options?.logprobs ?? false,
                });
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }

            logger.info('Streamed response completed', { model });
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Error in streamed response', {
                error: errMsg,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw new LLMError('Failed to generate streamed response', error);
        }
    }

    private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0 && (error as { status?: number }).status === 429) {
                logger.warning('Rate limit hit—retrying', { retriesLeft: retries - 1, delay });
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryWithBackoff(fn, retries - 1, delay * 2); // Exponential: 1s → 2s → 4s
            }
            throw error;
        }
    }
}
