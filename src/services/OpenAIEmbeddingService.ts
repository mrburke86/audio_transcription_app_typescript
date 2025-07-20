// src/services/OpenAIEmbeddingService.ts
// FIXED: Stripped perf (measureAPICall, timings, warnings, stats); added stack traces in errors; descriptive names (e.g., generateEmbeddingVector).
import { logger } from '@/lib/Logger';
import OpenAI from 'openai';

export class OpenAIEmbeddingService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('OpenAI API key is required for embeddings.');
        }
        this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }

    async generateEmbeddingVector(text: string): Promise<number[]> {
        logger.debug(`OpenAIEmbeddingService: Generating embedding for ${text.length} characters`);

        try {
            if (!text || text.trim().length === 0) {
                throw new Error('Empty text provided for embedding');
            }

            const maxLength = 8000;
            const processedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

            if (processedText !== text) {
                logger.warning(
                    `OpenAIEmbeddingService: Text truncated from ${text.length} to ${processedText.length} characters`
                );
            }

            const response = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: processedText.replace(/\n/g, ' '),
            });

            const embedding = response.data[0].embedding;

            if (!embedding || embedding.length !== 1536) {
                throw new Error(`Invalid embedding: expected 1536D, got ${embedding?.length || 0}D`);
            }

            return embedding;
        } catch (error) {
            logger.error(
                `OpenAIEmbeddingService: Error generating embedding: ${(error as Error).message}\nStack: ${
                    (error as Error).stack
                }`
            );
            throw error;
        }
    }
}
