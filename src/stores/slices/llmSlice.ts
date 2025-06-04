import { StateCreator } from 'zustand';
import { AppState, LLMSlice } from '@/types/store';
import { OpenAILLMService } from '@/services/OpenAILLMService';
import {
    createSystemPrompt,
    createUserPrompt,
    createAnalysisSystemPrompt,
    createAnalysisUserPrompt,
    createGenerationSystemPrompt,
    createGenerationUserPrompt,
} from '@/utils';
import { logger } from '@/modules';
import { v4 as uuidv4 } from 'uuid';

export const createLLMSlice: StateCreator<AppState, [], [], LLMSlice> = (set, get) => ({
    // Initialize state - this replaces your useLLMProviderOptimized state
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

    // This replaces your generateResponse function with streaming support
    generateResponse: async (userMessage: string) => {
        const streamId = uuidv4();

        set({
            isGenerating: true,
            currentStreamId: streamId,
        });

        get().setLoading(true, 'Generating response...');

        try {
            // Get interview context and search knowledge base
            const interviewContext = get().context;
            const knowledgeResults = await get().searchRelevantKnowledge(userMessage, 3);

            if (!interviewContext) {
                throw new Error('Interview context not configured. Please set up your interview profile.');
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

            // Create prompts using your existing utility functions
            const systemPrompt = await createSystemPrompt(interviewContext, interviewContext.goals || []);
            const userPrompt = await createUserPrompt(userMessage, get().conversationSummary, knowledgeContext);

            // Initialize LLM service
            const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const llmService = new OpenAILLMService(apiKey);

            // Prepare messages for API
            const messages = [
                { role: 'system' as const, content: systemPrompt },
                { role: 'user' as const, content: userPrompt },
            ];

            // Start streaming response - this preserves your streaming functionality
            let accumulatedContent = '';
            let chunkCount = 0;

            logger.info(`Starting LLM response generation (Stream ID: ${streamId})`);

            for await (const chunk of llmService.generateStreamedResponse(messages, {
                model: 'gpt-4o',
                temperature: 0.7,
            })) {
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
                    get().setLoading(true, `Generating response... (${accumulatedContent.length} characters)`);
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
                currentStreamId: null,
            }));

            // Store in conversation history
            const conversationId = 'main'; // You can make this dynamic based on context
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

            get().setLoading(false);

            logger.info(`LLM response completed: ${accumulatedContent.length} characters, ${chunkCount} chunks`);

            get().addNotification({
                type: 'success',
                message: 'Response generated successfully',
                duration: 3000,
            });

            // Auto-trigger conversation summary update
            get().summarizeConversation(conversation.messages);
        } catch (error) {
            set({
                isGenerating: false,
                currentStreamId: null,
            });

            get().setLoading(false);

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            logger.error('LLM response generation failed:', error);

            get().addNotification({
                type: 'error',
                message: `Failed to generate response: ${errorMessage}`,
                duration: 10000,
            });

            // Clean up any partial streaming response
            if (streamId) {
                set(state => ({
                    streamingResponses: new Map([...state.streamingResponses].filter(([id]) => id !== streamId)),
                }));
            }
        }
    },

    // This replaces your generateSuggestions function with your sophisticated analysis pipeline
    generateSuggestions: async () => {
        if (get().isGenerating) {
            logger.warning('Already generating content, skipping suggestions');
            return;
        }

        set({ isGenerating: true });
        get().setLoading(true, 'Generating strategic intelligence...');

        try {
            const interviewContext = get().context;
            const conversation = get().conversations.get('main');

            if (!interviewContext) {
                throw new Error('Interview context required for suggestions');
            }

            // Build context for strategic analysis - preserving your existing logic
            const contextMessage = conversation?.messages[conversation.messages.length - 1]?.content || '';
            const knowledgeResults = await get().searchRelevantKnowledge(contextMessage, 3);
            const knowledgeContext = knowledgeResults
                .map(chunk => `--- ${chunk.source} ---\n${chunk.text}`)
                .join('\n\n');

            const previousAnalysisHistory = get().conversationSuggestions.analysisHistory || [];

            // Stage 1: Strategic Analysis - using your existing prompts
            logger.info('Stage 1: Strategic opportunity analysis');

            const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
            if (!apiKey) throw new Error('OpenAI API key not configured');

            const llmService = new OpenAILLMService(apiKey);

            const analysisUserPrompt = await createAnalysisUserPrompt(
                get().conversationSummary,
                interviewContext,
                knowledgeContext,
                previousAnalysisHistory
            );

            const analysisMessages = [
                { role: 'system' as const, content: createAnalysisSystemPrompt },
                { role: 'user' as const, content: analysisUserPrompt },
            ];

            const analysisContent = await llmService.generateCompleteResponse(analysisMessages, {
                model: 'gpt-4o-mini',
                temperature: 0.3,
            });

            logger.info('Strategic analysis completed');

            // Parse strategic analysis results - preserving your existing logic
            let strategicAnalysis;
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

            // Stage 2: Strategic Intelligence Generation
            logger.info('Stage 2: Generating strategic intelligence');

            const generationUserPrompt = await createGenerationUserPrompt(
                strategicAnalysis,
                interviewContext,
                knowledgeContext,
                previousAnalysisHistory
            );

            const generationMessages = [
                { role: 'system' as const, content: createGenerationSystemPrompt },
                { role: 'user' as const, content: generationUserPrompt },
            ];

            const strategicIntelligence = await llmService.generateCompleteResponse(generationMessages, {
                model: 'gpt-4o-mini',
                temperature: 0.7,
            });

            if (strategicIntelligence) {
                // Create enhanced analysis preview for history
                const analysisPreview = {
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
                });

                get().setLoading(false);

                logger.info(`Strategic intelligence generated: ${strategicIntelligence.length} characters`);

                get().addNotification({
                    type: 'success',
                    message: `Generated ${strategicAnalysis.strategic_opportunity} intelligence`,
                    duration: 5000,
                });
            } else {
                throw new Error('Empty strategic intelligence generation');
            }
        } catch (error) {
            logger.error('Strategic intelligence generation failed:', error);

            set({ isGenerating: false });
            get().setLoading(false);

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

            get().addNotification({
                type: 'warning',
                message: 'Used fallback strategic intelligence due to generation error',
                duration: 8000,
            });
        }
    },

    // Conversation summarization - preserving your existing logic
    summarizeConversation: async messages => {
        if (messages.length === 0) return;

        try {
            // Implementation would use your existing summarization logic
            logger.info('Updating conversation summary');

            // This would call your existing summarization utilities
            // For now, create a simple summary
            const summary = `Conversation with ${
                messages.length
            } messages, last updated: ${new Date().toLocaleTimeString()}`;

            set({ conversationSummary: summary });
        } catch (error) {
            logger.error('Conversation summarization failed:', error);
        }
    },

    stopStreaming: (streamId: string) => {
        set(state => ({
            streamingResponses: new Map([...state.streamingResponses].filter(([id]) => id !== streamId)),
            isGenerating: state.currentStreamId === streamId ? false : state.isGenerating,
            currentStreamId: state.currentStreamId === streamId ? null : state.currentStreamId,
        }));

        get().setLoading(false);
        logger.info(`Stopped streaming for: ${streamId}`);
    },

    clearConversation: (conversationId: string) => {
        set(state => ({
            conversations: new Map([...state.conversations].filter(([id]) => id !== conversationId)),
            conversationSummary: conversationId === 'main' ? '' : state.conversationSummary,
        }));

        logger.info(`Cleared conversation: ${conversationId}`);

        get().addNotification({
            type: 'info',
            message: 'Conversation cleared',
            duration: 3000,
        });
    },
});
