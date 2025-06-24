import { logger } from '@/modules';
import { OpenAILLMService } from '@/services/OpenAILLMService';
import { AnalysisPreview, StrategicAnalysis } from '@/types';
import { AppState, LLMSlice } from '@/types/store';
import {
    createAnalysisSystemPrompt,
    createAnalysisUserPrompt,
    createGenerationSystemPrompt,
    createGenerationUserPrompt,
    createSystemPrompt,
    createUserPrompt,
} from '@/utils';
import { createSummarisationSystemPrompt, createSummarisationUserPrompt } from '@/utils/prompts';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export const createLLMSlice: StateCreator<AppState, [], [], LLMSlice> = (set, get) => ({
    // Initialize state
    conversations: new Map(),
    streamingResponses: new Map(),
    isGenerating: false,
    currentStreamId: null,
    conversationSummary: '',
    conversationSuggestions: {
        powerUpContent: '',
        lastAnalysis: undefined,
        analysisHistory: [],
    },
    // Add missing state properties
    llmError: null,
    isGeneratingResponse: false,
    isGeneratingSuggestions: false,
    isSummarizing: false,
    currentAbortController: null,

    /**
     * 🔍 Generate response using the new prompt system
     */
    generateResponse: async (userMessage: string) => {
        const streamId = uuidv4();
        const abortController = new AbortController();

        set({
            isGenerating: true,
            isGeneratingResponse: true,
            currentStreamId: streamId,
            llmError: null,
            currentAbortController: abortController,
        });

        // ✅ Safe call to setLoading - make it optional
        const state = get();
        if (state.setLoading && typeof state.setLoading === 'function') {
            state.setLoading(true, 'Generating response...');
        }

        try {
            // Get call context and search knowledge base
            const callContext = get().context;
            const knowledgeResults = await get().searchRelevantKnowledge(userMessage, 3);

            if (!callContext) {
                throw new Error('Call context not configured. Please set up your call profile.');
            }

            // Check for cancellation
            if (abortController.signal.aborted) {
                throw new Error('Request was cancelled');
            }

            // Build knowledge context from search results
            const knowledgeContext =
                knowledgeResults.length > 0
                    ? knowledgeResults
                          .map(
                              chunk =>
                                  `--- Relevant Information from ${chunk.source} ---\n${chunk.text}\n--- End Information ---`
                          )
                          .join('\n\n')
                    : 'No specific knowledge context found for this query.';

            // ✅ Fixed: Safe access to objectives with fallback
            const primaryGoal = callContext.objectives?.[0]?.primary_goal || 'Successful communication';

            // Create prompts using the new unified prompt system
            const systemPrompt = await createSystemPrompt(callContext, primaryGoal);

            // ✅ Fixed: Use correct signature for createUserPrompt
            const userPromptWithContext = await createUserPrompt(
                userMessage,
                get().conversationSummary,
                knowledgeContext,
                callContext
            );

            // Initialize LLM service
            const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const llmService = new OpenAILLMService();

            // Prepare messages for API
            const messages = [
                { role: 'system' as const, content: systemPrompt },
                { role: 'user' as const, content: userPromptWithContext },
            ];

            // Start streaming response
            let accumulatedContent = '';
            let chunkCount = 0;

            logger.info(`Starting LLM response generation (Stream ID: ${streamId})`);

            // Create streaming with abort signal
            const streamGenerator = llmService.generateStreamedResponse(messages, {
                model: 'gpt-4o',
                temperature: 0.7,
            });

            for await (const chunk of streamGenerator) {
                // Check for cancellation after each chunk
                if (abortController.signal.aborted) {
                    throw new Error('Request was cancelled');
                }

                accumulatedContent += chunk;
                chunkCount++;

                // Update streaming response in real-time
                set(state => ({
                    streamingResponses: new Map(state.streamingResponses).set(streamId, {
                        content: accumulatedContent,
                        isComplete: false,
                        timestamp: Date.now(),
                    }),
                }));

                // Update loading message periodically
                if (chunkCount % 10 === 0) {
                    const currentState = get();
                    if (currentState.setLoading && typeof currentState.setLoading === 'function') {
                        currentState.setLoading(
                            true,
                            `Generating response... (${accumulatedContent.length} characters)`
                        );
                    }
                }
            }

            // Mark streaming as complete
            set(state => ({
                streamingResponses: new Map(state.streamingResponses).set(streamId, {
                    content: accumulatedContent,
                    isComplete: true,
                    timestamp: Date.now(),
                }),
                isGenerating: false,
                isGeneratingResponse: false,
                currentStreamId: null,
                currentAbortController: null,
            }));

            // Store in conversation history
            const conversationId = 'main';
            const conversation = get().conversations.get(conversationId) || {
                id: conversationId,
                messages: [],
                createdAt: new Date(),
                lastUpdated: new Date(),
            };

            conversation.messages.push(
                {
                    content: userMessage,
                    type: 'user' as const,
                    timestamp: new Date().toISOString(),
                },
                {
                    content: accumulatedContent,
                    type: 'assistant' as const,
                    timestamp: new Date().toISOString(),
                }
            );
            conversation.lastUpdated = new Date();

            set(state => ({
                conversations: new Map(state.conversations).set(conversationId, conversation),
            }));

            // ✅ Safe call to setLoading
            const finalState = get();
            if (finalState.setLoading && typeof finalState.setLoading === 'function') {
                finalState.setLoading(false);
            }

            logger.info(`LLM response completed: ${accumulatedContent.length} characters, ${chunkCount} chunks`);

            // ✅ Safe call to addNotification
            if (finalState.addNotification && typeof finalState.addNotification === 'function') {
                finalState.addNotification({
                    type: 'success',
                    message: 'Response generated successfully',
                    duration: 3000,
                });
            }

            // Auto-trigger conversation summary update
            get().summarizeConversation(conversation.messages);
        } catch (error) {
            const isAborted = error instanceof Error && error.message.includes('cancelled');

            set({
                isGenerating: false,
                isGeneratingResponse: false,
                currentStreamId: null,
                currentAbortController: null,
                llmError: isAborted ? null : error instanceof Error ? error.message : 'Unknown error occurred',
            });

            // ✅ Safe error handling
            const errorState = get();
            if (errorState.setLoading && typeof errorState.setLoading === 'function') {
                errorState.setLoading(false);
            }

            if (!isAborted) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                logger.error('LLM response generation failed:', error);

                if (errorState.addNotification && typeof errorState.addNotification === 'function') {
                    errorState.addNotification({
                        type: 'error',
                        message: `Failed to generate response: ${errorMessage}`,
                        duration: 10000,
                    });
                }
            }

            // ✅ Clean up streaming response on error
            if (streamId) {
                set(state => ({
                    streamingResponses: new Map(
                        Array.from(state.streamingResponses.entries()).filter(([id]) => id !== streamId)
                    ),
                }));
            }
        }
    },

    /**
     * 🧠 Two-stage pipeline to generate strategic insights
     */
    generateSuggestions: async () => {
        if (get().isGenerating) {
            logger.warning('Already generating content, skipping suggestions');
            return;
        }

        const abortController = new AbortController();

        set({
            isGenerating: true,
            isGeneratingSuggestions: true,
            llmError: null,
            currentAbortController: abortController,
        });

        // ✅ Safe call to setLoading
        const state = get();
        if (state.setLoading && typeof state.setLoading === 'function') {
            state.setLoading(true, 'Generating strategic intelligence...');
        }

        try {
            const callContext = get().context;
            const conversation = get().conversations.get('main');

            if (!callContext) {
                throw new Error('Call context required for suggestions');
            }

            // Check for cancellation
            if (abortController.signal.aborted) {
                throw new Error('Request was cancelled');
            }

            // Build context for strategic analysis
            const userMessage = conversation?.messages[conversation.messages.length - 1]?.content || '';
            let knowledgeContext = '';
            if (callContext.knowledge_search_enabled !== false) {
                const knowledgeResults = await get().searchRelevantKnowledge(userMessage, 3);
                knowledgeContext =
                    knowledgeResults.length > 0
                        ? knowledgeResults
                              .map(
                                  chunk =>
                                      `--- Relevant Information from ${chunk.source} ---\n${chunk.text}\n--- End Information ---`
                              )
                              .join('\n\n')
                        : '';
            }

            const previousAnalysisHistory = get().conversationSuggestions.analysisHistory || [];

            // Stage 1: Strategic Analysis
            logger.info('Stage 1: Strategic opportunity analysis');

            const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
            if (!apiKey) throw new Error('OpenAI API key not configured');

            const llmService = new OpenAILLMService();

            const analysisUserPrompt = await createAnalysisUserPrompt(
                get().conversationSummary,
                callContext,
                knowledgeContext,
                previousAnalysisHistory
            );

            const analysisMessages = [
                { role: 'system' as const, content: createAnalysisSystemPrompt() },
                { role: 'user' as const, content: analysisUserPrompt },
            ];

            // Check for cancellation before API call
            if (abortController.signal.aborted) {
                throw new Error('Request was cancelled');
            }

            const analysisContent = await llmService.generateCompleteResponse(analysisMessages, {
                model: 'gpt-4o-mini',
                temperature: 0.3,
            });

            logger.info('Strategic analysis completed');

            // Parse strategic analysis results
            let strategicAnalysis: StrategicAnalysis;
            try {
                const jsonMatch = analysisContent.match(/\{[\s\S]*\}/) || [analysisContent];
                strategicAnalysis = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                logger.error('Analysis parsing failed:', parseError);

                // Fallback strategic analysis
                strategicAnalysis = {
                    strategic_opportunity: 'thought_leadership',
                    focus_area: 'Strategic positioning and industry expertise',
                    insight_potential: 'Industry insights and strategic positioning opportunities',
                    knowledge_leverage: 'Combine LLM knowledge with available context for strategic insights',
                    differentiation_angle: 'Demonstrate advanced strategic thinking and industry expertise',
                    research_suggestions: 'Industry trends, competitive landscape, real-world examples',
                };
            }

            // Check for cancellation before second API call
            if (abortController.signal.aborted) {
                throw new Error('Request was cancelled');
            }

            // Stage 2: Strategic Intelligence Generation
            logger.info('Stage 2: Generating strategic intelligence');

            const generationUserPrompt = await createGenerationUserPrompt(
                strategicAnalysis,
                callContext,
                knowledgeContext,
                previousAnalysisHistory
            );

            const generationMessages = [
                { role: 'system' as const, content: createGenerationSystemPrompt() },
                { role: 'user' as const, content: generationUserPrompt },
            ];

            const strategicIntelligence = await llmService.generateCompleteResponse(generationMessages, {
                model: 'gpt-4o-mini',
                temperature: 0.7,
            });

            if (strategicIntelligence) {
                // Create enhanced analysis preview for history
                const analysisPreview: AnalysisPreview = {
                    strategic_opportunity: strategicAnalysis.strategic_opportunity,
                    focus_area: strategicAnalysis.focus_area,
                    insight_summary: strategicAnalysis.insight_potential,
                    timestamp: Date.now(),
                };

                // Update history (keep last 3 entries to prevent infinite growth)
                const updatedHistory = [...previousAnalysisHistory, analysisPreview].slice(-3);

                set({
                    conversationSuggestions: {
                        powerUpContent: strategicIntelligence,
                        lastAnalysis: strategicAnalysis,
                        analysisHistory: updatedHistory,
                    },
                    isGenerating: false,
                    isGeneratingSuggestions: false,
                    currentAbortController: null,
                });

                // ✅ Safe call to setLoading
                const finalState = get();
                if (finalState.setLoading && typeof finalState.setLoading === 'function') {
                    finalState.setLoading(false);
                }

                logger.info(`Strategic intelligence generated: ${strategicIntelligence.length} characters`);

                if (finalState.addNotification && typeof finalState.addNotification === 'function') {
                    finalState.addNotification({
                        type: 'success',
                        message: `Generated ${strategicAnalysis.strategic_opportunity} intelligence`,
                        duration: 5000,
                    });
                }
            } else {
                throw new Error('Empty strategic intelligence generation');
            }
        } catch (error) {
            logger.error('Strategic intelligence generation failed:', error);

            const isAborted = error instanceof Error && error.message.includes('cancelled');

            set({
                isGenerating: false,
                isGeneratingSuggestions: false,
                currentAbortController: null,
                llmError: isAborted ? null : error instanceof Error ? error.message : 'Unknown error occurred',
            });

            // ✅ Safe error handling
            const errorState = get();
            if (errorState.setLoading && typeof errorState.setLoading === 'function') {
                errorState.setLoading(false);
            }

            if (!isAborted) {
                // Enhanced fallback with strategic intelligence theme
                const fallbackContent = `# 🧠 Strategic Intelligence Boost

## 🎯 Strategic Positioning
You're in an excellent position to demonstrate thought leadership and strategic thinking.

## 💡 Key Strategic Assets
- **Your Experience**: Leverage specific examples that show strategic impact
- **Industry Knowledge**: Position yourself as someone who understands market dynamics
- **Future Vision**: Demonstrate forward-thinking about industry evolution
- **Problem-Solving**: Show how you approach complex strategic challenges

## 🗣️ Strategic Communication
"That's an excellent strategic question. Based on my experience with [relevant context], I see this as an opportunity to..."

## 🚀 Competitive Advantage
Your combination of experience and strategic thinking sets you apart from other candidates.`;

                set({
                    conversationSuggestions: {
                        powerUpContent: fallbackContent,
                        analysisHistory: get().conversationSuggestions.analysisHistory || [],
                    },
                });

                if (errorState.addNotification && typeof errorState.addNotification === 'function') {
                    errorState.addNotification({
                        type: 'warning',
                        message: 'Used fallback strategic intelligence due to generation error',
                        duration: 8000,
                    });
                }
            }
        }
    },

    /**
     * 📄 Generates a quick summary of conversation
     */
    summarizeConversation: async messages => {
        // if (messages.length === 0) return;

        const abortController = new AbortController();

        set({
            isSummarizing: true,
            llmError: null,
            currentAbortController: abortController,
        });

        try {
            const callContext = get().context;
            if (!callContext) return;

            logger.info('🔎 Generating LLM summary');

            const system = createSummarisationSystemPrompt();
            const user = createSummarisationUserPrompt(
                messages.map(m => m.content).join('\n'),
                callContext,
                get().conversationSummary
            );
            const llmService = new OpenAILLMService();

            // Check for cancellation
            if (abortController.signal.aborted) {
                return;
            }

            const summary = await llmService.generateCompleteResponse(
                [
                    { role: 'system', content: system },
                    { role: 'user', content: user },
                ],
                {
                    model: 'gpt-4o-mini',
                    temperature: 0.3,
                }
            );

            set({
                conversationSummary: summary,
                isSummarizing: false,
                currentAbortController: null,
            });
        } catch (error) {
            const isAborted = error instanceof Error && error.message.includes('cancelled');
            logger.error('Conversation summarization failed:', error);

            set({
                isSummarizing: false,
                currentAbortController: null,
                llmError: isAborted ? null : error instanceof Error ? error.message : 'Summarization failed',
            });
        }
    },

    /**
     * ⛔ Stop streaming response and clear state
     */
    stopStreaming: (streamId: string) => {
        set(state => ({
            streamingResponses: new Map(
                Array.from(state.streamingResponses.entries()).filter(([id]) => id !== streamId)
            ),
            isGenerating: state.currentStreamId === streamId ? false : state.isGenerating,
            isGeneratingResponse: state.currentStreamId === streamId ? false : state.isGeneratingResponse,
            currentStreamId: state.currentStreamId === streamId ? null : state.currentStreamId,
        }));

        // ✅ Safe call to setLoading
        const state = get();
        if (state.setLoading && typeof state.setLoading === 'function') {
            state.setLoading(false);
        }

        logger.info(`Stopped streaming for: ${streamId}`);
    },

    /**
     * 🧹 Clears conversation by ID
     */
    clearConversation: (conversationId: string) => {
        set(state => ({
            conversations: new Map(Array.from(state.conversations.entries()).filter(([id]) => id !== conversationId)),
            conversationSummary: conversationId === 'main' ? '' : state.conversationSummary,
        }));

        logger.info(`Cleared conversation: ${conversationId}`);

        // ✅ Safe call to addNotification
        const state = get();
        if (state.addNotification && typeof state.addNotification === 'function') {
            state.addNotification({
                type: 'info',
                message: 'Conversation cleared',
                duration: 3000,
            });
        }
    },

    /**
     * ❌ Clear LLM error state
     */
    clearLLMError: () => {
        set({ llmError: null });
        logger.info('LLM error cleared');
    },

    /**
     * 🛑 Cancel current request
     */
    cancelCurrentRequest: () => {
        const { currentAbortController } = get();
        if (currentAbortController) {
            currentAbortController.abort();
            logger.info('Current LLM request cancelled');

            // Update state
            set({
                isGenerating: false,
                isGeneratingResponse: false,
                isGeneratingSuggestions: false,
                isSummarizing: false,
                currentStreamId: null,
                currentAbortController: null,
            });
        }
    },
});
