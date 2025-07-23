// src/utils/knowledgeIntegration.ts
import { logger } from '@/lib/Logger';
import { DocumentChunk } from '@/types';

/**
 * Format knowledge chunks for inclusion in prompts
 */
export function formatKnowledgeContext(chunks: DocumentChunk[]): string {
    if (!chunks || chunks.length === 0) {
        return '';
    }

    return chunks
        .map((chunk, index) => {
            const score = chunk.score ? ` (relevance: ${(chunk.score * 100).toFixed(0)}%)` : '';
            return `[Knowledge ${index + 1} - ${chunk.source}${score}]:\n${chunk.text}`;
        })
        .join('\n\n---\n\n');
}

/**
 * Extract key insights from knowledge chunks
 */
export function extractKeyInsights(chunks: DocumentChunk[]): string[] {
    const insights: string[] = [];

    for (const chunk of chunks) {
        // Look for bullet points or key metrics
        const lines = chunk.text.split('\n');
        for (const line of lines) {
            if (line.match(/^[-•*]\s+/) || line.match(/\d+%/) || line.match(/£[\d,]+/)) {
                insights.push(line.trim());
            }
        }
    }

    return insights.slice(0, 5); // Return top 5 insights
}

/**
 * Check if knowledge is relevant to the query
 */
export function isKnowledgeRelevant(chunk: DocumentChunk, threshold: number = 0.7): boolean {
    return (chunk.score || 0) >= threshold;
}

/**
 * Log knowledge usage for debugging
 */
export function logKnowledgeUsage(query: string, chunks: DocumentChunk[]): void {
    if (chunks.length === 0) {
        logger.debug('📭 No knowledge chunks found for query', { query });
        return;
    }

    logger.info('📚 Knowledge chunks retrieved', {
        query: query.slice(0, 50) + '...',
        count: chunks.length,
        sources: [...new Set(chunks.map(c => c.source))],
        avgScore: chunks.reduce((sum, c) => sum + (c.score || 0), 0) / chunks.length,
    });
}
