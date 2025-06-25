// src/app/api/llm/generate-response/route.ts
import { enhancedLogger } from '@/modules/EnhancedLogger';
import { OpenAILLMService } from '@/services/OpenAILLMService';
import { errorHandler } from '@/utils/enhancedErrorHandler';
import { createSystemPrompt, createUserPrompt } from '@/utils/prompts';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const context = errorHandler.createContext('generateResponse', {
        component: 'API',
        slice: 'llm',
    });

    try {
        const { userMessage, callContext, knowledgeResults, conversationSummary } = await request.json();

        // Validate required inputs
        if (!userMessage?.trim()) {
            throw new Error('User message is required');
        }

        if (!callContext) {
            throw new Error('Call context is required');
        }

        enhancedLogger.api('info', 'Starting LLM generation', {
            messageLength: userMessage.length,
            hasKnowledge: knowledgeResults?.length > 0,
            hasSummary: !!conversationSummary,
        });

        // Build knowledge context from search results
        const knowledgeContext = errorHandler.safeTry(
            () =>
                knowledgeResults?.length > 0
                    ? knowledgeResults
                          .map(
                              (chunk: any) =>
                                  `--- Relevant Information from ${chunk.source} ---\n${chunk.text}\n--- End Information ---`
                          )
                          .join('\n\n')
                    : 'No specific knowledge context found for this query.',
            { ...context, operation: 'buildKnowledgeContext' },
            'No specific knowledge context found for this query.'
        );

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
        const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPromptWithContext },
        ];

        enhancedLogger.api('debug', 'Prompts created, starting streaming response');

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
                            enhancedLogger.api('debug', 'Streaming progress', {
                                chunks: chunkCount,
                                totalChars: totalLength,
                            });
                        }
                    }

                    enhancedLogger.api('info', 'LLM generation completed', {
                        totalChars: totalLength,
                        chunks: chunkCount,
                    });
                } catch (error) {
                    const enhancedError = errorHandler.handleError(error, {
                        ...context,
                        operation: 'LLM streaming',
                    });
                    controller.error(enhancedError);
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
        const enhancedError = errorHandler.handleError(error, context);

        return NextResponse.json(
            {
                error: enhancedError.message,
                errorId: enhancedError.errorId,
                context: enhancedError.context.operation,
            },
            { status: 500 }
        );
    }
}
