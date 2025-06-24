// src/app/api/llm/generate-response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAILLMService } from '@/services/OpenAILLMService';
import { createSystemPrompt, createUserPrompt } from '@/utils/prompts';
import { logger } from '@/modules';

export async function POST(request: NextRequest) {
    try {
        const { userMessage, callContext, knowledgeResults, conversationSummary } = await request.json();

        // Validate required inputs
        if (!userMessage?.trim()) {
            return NextResponse.json({ error: 'User message is required' }, { status: 400 });
        }

        if (!callContext) {
            return NextResponse.json({ error: 'Call context is required' }, { status: 400 });
        }

        logger.info(`[API] Starting LLM generation for message: "${userMessage.slice(0, 50)}..."`);

        // Build knowledge context from search results
        const knowledgeContext =
            knowledgeResults?.length > 0
                ? knowledgeResults
                      .map(
                          (chunk: any) =>
                              `--- Relevant Information from ${chunk.source} ---\n${chunk.text}\n--- End Information ---`
                      )
                      .join('\n\n')
                : 'No specific knowledge context found for this query.';

        // Get primary goal with fallback
        const primaryGoal = callContext.objectives?.[0]?.primary_goal || 'Successful communication';

        // Create prompts using the unified prompt system
        const systemPrompt = await createSystemPrompt(callContext, primaryGoal);
        const userPromptWithContext = await createUserPrompt(
            userMessage,
            conversationSummary || '',
            knowledgeContext,
            callContext
        );

        // Initialize LLM service (server-side only)
        const llmService = new OpenAILLMService();

        // Prepare messages for API
        const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPromptWithContext },
        ];

        logger.debug('[API] Prompts created, starting streaming response');

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let chunkCount = 0;
                    let totalLength = 0;

                    // Stream the LLM response
                    for await (const chunk of llmService.generateStreamedResponse(messages, {
                        model: 'gpt-4o',
                        temperature: 0.7,
                    })) {
                        chunkCount++;
                        totalLength += chunk.length;

                        // Send chunk to client
                        controller.enqueue(encoder.encode(chunk));

                        // Log progress periodically
                        if (chunkCount % 20 === 0) {
                            logger.debug(`[API] Streaming progress: ${chunkCount} chunks, ${totalLength} chars`);
                        }
                    }

                    logger.info(`[API] LLM generation completed: ${totalLength} characters, ${chunkCount} chunks`);
                } catch (error) {
                    logger.error('[API] LLM generation error:', error);
                    controller.error(error);
                } finally {
                    controller.close();
                }
            },
        });

        // Return streaming response
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        logger.error('[API] Generate response error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: `Failed to generate response: ${errorMessage}` }, { status: 500 });
    }
}
