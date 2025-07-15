// src/utils/streamUtils.ts

import { logger } from '@/modules';

// FIXED: Centralized streaming loop/logging—pure, reusable for hook/service.
export async function* streamLLMResponse(stream: AsyncIterable<any>, onFirstChunk?: () => void) {
    // Param stream from OpenAI
    let chunkCount = 0;
    let totalContent = '';
    let firstChunkTime = 0;
    const startTime = performance.now();

    for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            totalContent += content;
            chunkCount++;

            if (chunkCount === 1) {
                firstChunkTime = performance.now() - startTime;
                if (onFirstChunk) onFirstChunk();
            }

            yield content;
        }
    }

    // Logging/stats (adapt to store if needed)
    const totalStreamDurationMs = Math.round(performance.now() - startTime); // RENAMED
    logger.info(
        `Stream completed: ${chunkCount} chunks, ${totalContent.length} chars, TTFB: ${firstChunkTime.toFixed(1)}ms`
    );
    if (firstChunkTime > 10000) logger.warning(`Slow stream start: ${firstChunkTime.toFixed(1)}ms`);
}
