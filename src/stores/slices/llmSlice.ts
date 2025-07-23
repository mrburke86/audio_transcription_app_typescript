// src/stores/slices/llmSlice.ts - Enhanced with Knowledge Integration
import { logger } from '@/lib/Logger';
import { OpenAIClientService } from '@/services/OpenAIClientService';
import { StoreState } from '@/stores/chatStore';
import { ChatMessageParam, LLMSlice, Message, StrategicSuggestions } from '@/types';
import { formatKnowledgeContext, logKnowledgeUsage } from '@/utils/knowledgeIntegration';
import {
    buildAnalysisPrompt,
    buildKnowledgeSearchPrompt,
    buildSummaryPrompt,
    buildSystemPrompt,
    buildUserPrompt,
} from '@/utils/prompts';
import { debounce } from 'lodash';
import { StateCreator } from 'zustand';

export const createLLMSlice: StateCreator<StoreState, [], [], LLMSlice> = (set, get) => {
    // DEBOUNCED STREAMING UPDATE to prevent circuit breaker
    const debouncedStreamUpdate = debounce((content: string) => {
        set({ streamedContent: content });
    }, 50); // Update every 50ms instead of every chunk

    return {
        llmService: null,
        streamedContent: '',
        isStreamingComplete: false,
        conversationSummary: '',
        strategicSuggestions: {
            strategicIntelligenceContent: '',
            currentAnalysis: undefined as StrategicSuggestions['currentAnalysis'],
            previousAnalyses: [],
        },
        llmLoading: false,
        llmError: null,

        // Initialize LLM Service
        initializeLLMService: (apiKey: string) => {
            if (typeof window !== 'undefined') {
                console.group('🤖 LLM SERVICE INIT (CLIENT)');
                console.log('🔑 Initializing LLM:', {
                    hasKey: !!apiKey,
                    keyLength: apiKey.length,
                    keyPrefix: apiKey.substring(0, 8) || 'EMPTY',
                });
                console.groupEnd();
            }

            try {
                const service = new OpenAIClientService(apiKey);
                set({ llmService: service });
                logger.info('LLM Service initialized successfully');

                if (typeof window !== 'undefined') {
                    console.log('✅ LLM Service ready on client');
                }
            } catch (error) {
                logger.error(`Failed to initialize LLM service: ${(error as Error).message}`);
                set({ llmError: 'Failed to initialize AI service' });

                if (typeof window !== 'undefined') {
                    console.error('❌ LLM initialization failed:', error);
                }
            }
        },

        // Generate Response with knowledge integration
        generateResponse: async (text: string, knowledgeContext = '') => {
            if (typeof performance !== 'undefined') {
                performance.clearMarks(); // Add: Clean previous marks
                performance.mark('generate-response-start'); // Start before logger
            }
            const {
                llmService,
                conversationSummary,
                initialContext,
                addAssistantMessage,
                searchRelevantKnowledge,
                indexedDocumentsCount,
            } = get();

            if (!llmService) {
                set({ llmError: 'AI service not initialized' });
                return;
            }

            if (!initialContext) {
                set({ llmError: 'Interview context not set' });
                return;
            }

            set({ llmLoading: true, llmError: null });
            set({ streamedContent: '', isStreamingComplete: false });

            try {
                logger.info(`Generating response for: "${text.substring(0, 50)}..."`);

                // 🔍 KNOWLEDGE INTEGRATION: Search for relevant knowledge if available
                let enhancedKnowledgeContext = knowledgeContext;
                if (indexedDocumentsCount > 0 && !knowledgeContext) {
                    logger.info('🔍 Searching knowledge base for relevant information...');

                    try {
                        const searchQuery = buildKnowledgeSearchPrompt(text, initialContext);
                        const relevantChunks = await searchRelevantKnowledge(searchQuery, 5);

                        if (relevantChunks.length > 0) {
                            enhancedKnowledgeContext = formatKnowledgeContext(relevantChunks);
                            logKnowledgeUsage(searchQuery, relevantChunks);

                            logger.info(`✅ Found ${relevantChunks.length} relevant knowledge chunks`);
                        } else {
                            logger.info('📭 No relevant knowledge chunks found for this query');
                        }
                    } catch (error) {
                        logger.error(`Knowledge search failed: ${(error as Error).message}`);
                        // Continue without knowledge enhancement
                    }
                }

                const systemPrompt = buildSystemPrompt(initialContext, initialContext.goals || []);
                const userPrompt = buildUserPrompt(text, conversationSummary, enhancedKnowledgeContext);

                const messages: ChatMessageParam[] = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ];

                if (llmService.generateStreamedResponseChunks) {
                    let fullResponse = '';

                    // BATCH CHUNKS to reduce state updates
                    for await (const chunk of llmService.generateStreamedResponseChunks(messages, {
                        model: 'gpt-4o-mini',
                        temperature: 0.7,
                        max_tokens: 1000,
                    })) {
                        fullResponse += chunk;
                        performance.mark('generate-response-chunk-received');
                        // Mark each chunk received

                        // ✅ USE DEBOUNCED UPDATE instead of immediate state change
                        debouncedStreamUpdate(fullResponse);
                    }

                    const measure = performance.measure(
                        'Time to First Chunk',
                        'generate-response-start',
                        'generate-response-chunk-received'
                    );
                    console.log('[DIAG-Perf] Generate First Chunk:', measure.duration + 'ms');

                    // FINAL UPDATE - ensure we get the complete response
                    debouncedStreamUpdate.flush(); // Force immediate flush
                    set({ streamedContent: fullResponse, isStreamingComplete: true });

                    // ✅ CRITICAL FIX: Add completed response to chat history
                    if (fullResponse.trim()) {
                        addAssistantMessage(fullResponse.trim());
                        logger.info(`✅ Assistant message added to chat history: ${fullResponse.length} characters`);

                        // Log if knowledge was used
                        if (enhancedKnowledgeContext) {
                            logger.info('📚 Response enhanced with knowledge base information');
                        }
                    }

                    // ✅ CLEAR STREAMED CONTENT after saving to history
                    setTimeout(() => {
                        set({ streamedContent: '', isStreamingComplete: false });
                        logger.debug('🧹 Streamed content cleared after saving to history');
                    }, 1000); // 1 second delay to show completion

                    logger.info(`Streaming response completed: ${fullResponse.length} characters`);
                } else {
                    logger.warning('[🪫 Fallback] Streaming not supported, using complete response');
                    const response = await llmService.generateCompleteResponse(messages, {
                        model: 'gpt-4o-mini',
                        temperature: 0.7,
                        max_tokens: 1000,
                    });

                    // ✅ FALLBACK: Add non-streaming response to chat history
                    if (response.trim()) {
                        addAssistantMessage(response.trim());
                        logger.info(`✅ Non-streaming assistant message added: ${response.length} characters`);
                    }

                    set({ streamedContent: response, isStreamingComplete: true });

                    // Clear after delay
                    setTimeout(() => {
                        set({ streamedContent: '', isStreamingComplete: false });
                    }, 1000);

                    logger.info(`Complete response generated: ${response.length} characters`);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                logger.error(`Response generation failed: ${errorMessage}`);
                set({ llmError: errorMessage });
            } finally {
                set({ llmLoading: false });
            }
        },

        // Generate Suggestions with knowledge integration
        generateSuggestions: async (knowledgeContext = '') => {
            const { llmService, conversationSummary, initialContext, searchRelevantKnowledge, indexedDocumentsCount } =
                get();

            if (!llmService || !initialContext) {
                set({ llmError: 'Service or context not available for suggestions' });
                return;
            }

            set({ llmLoading: true });

            try {
                logger.info('Generating strategic suggestions');

                // Search for additional knowledge if available
                let enhancedKnowledgeContext = knowledgeContext;
                if (indexedDocumentsCount > 0 && !knowledgeContext && conversationSummary) {
                    try {
                        const searchQuery = `${conversationSummary} ${initialContext.industry} insights`;
                        const relevantChunks = await searchRelevantKnowledge(searchQuery, 3);

                        if (relevantChunks.length > 0) {
                            enhancedKnowledgeContext = relevantChunks.map(chunk => chunk.text).join('\n\n');
                        }
                    } catch (error) {
                        logger.error(`Knowledge search for suggestions failed: ${(error as Error).message}`);
                    }
                }

                const analysisPrompt = buildAnalysisPrompt(conversationSummary, initialContext);

                const analysisResponse = await llmService.generateCompleteResponse(
                    [
                        { role: 'system', content: 'You are a strategic intelligence analyst.' },
                        { role: 'user', content: analysisPrompt },
                    ],
                    { model: 'gpt-4o-mini', temperature: 0.3 }
                );

                let analysis;
                try {
                    analysis = JSON.parse(analysisResponse.match(/\{[\s\S]*\}/)?.[0] || '{}');
                } catch (e) {
                    logger.warning('Failed to parse analysis response', {
                        rawResponse: analysisResponse,
                        error: (e as Error).message,
                    });
                    analysis = {
                        strategic_opportunity: 'thought_leadership',
                        insight_potential: 'Industry expertise demonstration',
                        primary_focus_area: 'thought leadership',
                    };
                }

                const generationPrompt = `Based on this analysis: ${JSON.stringify(analysis)}\n\nCreate strategic intelligence for ${initialContext.targetRole} at ${initialContext.targetCompany}:\n\n${
                    enhancedKnowledgeContext ? `Knowledge Context:\n${enhancedKnowledgeContext}\n` : ''
                }\nGenerate markdown content with:\n# 🧠 Strategic Intelligence - ${analysis.strategic_opportunity}\n\n## 🎯 Strategic Context\n[Why this intelligence is valuable]\n\n## 💡 Key Strategic Insights\n[Multiple valuable insights with evidence]\n\n## 🚀 Competitive Differentiation\n[How this positions you uniquely]`;

                const strategicContent = await llmService.generateCompleteResponse(
                    [
                        { role: 'system', content: 'You are a master strategic intelligence generator.' },
                        { role: 'user', content: generationPrompt },
                    ],
                    { model: 'gpt-4o-mini', temperature: 0.7 }
                );

                const currentSuggestions = get().strategicSuggestions;
                set({
                    strategicSuggestions: {
                        strategicIntelligenceContent: strategicContent,
                        currentAnalysis: analysis,
                        previousAnalyses: [
                            ...currentSuggestions.previousAnalyses,
                            {
                                strategic_opportunity: analysis.strategic_opportunity,
                                primary_focus_area: analysis.primary_focus_area,
                                insight_summary: analysis.insight_potential,
                                timestamp: Date.now(),
                            },
                        ].slice(-3),
                    },
                });

                logger.info('Strategic suggestions generated successfully');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
                logger.error(`Suggestions generation failed: ${errorMessage}`);
                set({ llmError: errorMessage });
            } finally {
                set({ llmLoading: false });
            }
        },

        // Summarize Conversation
        summarizeConversation: async () => {
            const { llmService, conversationHistory, initialContext } = get();

            if (!llmService || conversationHistory.length === 0 || !initialContext) {
                logger.warning('[📭 Summarize] Missing context or empty history — skipping summarization');
                return;
            }

            try {
                logger.info('Summarizing conversation');

                const conversationText = conversationHistory
                    .map((msg: Message) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                    .join('\n');

                const summaryPrompt = buildSummaryPrompt(conversationText);

                const summary = await llmService.generateCompleteResponse(
                    [
                        { role: 'system', content: 'You are an expert conversation summarizer.' },
                        { role: 'user', content: summaryPrompt },
                    ],
                    { model: 'gpt-4o-mini', temperature: 0.5 }
                );

                set({ conversationSummary: summary });
                logger.info('Conversation summarized successfully');
            } catch (error) {
                logger.error(`Summary generation failed: ${(error as Error).message}`);
            }
        },

        // KEEP appendStreamedContent for compatibility (but debounce it)
        appendStreamedContent: (content: string) => {
            const currentContent = get().streamedContent;
            const newContent = currentContent + content;
            debouncedStreamUpdate(newContent);
        },

        resetStreamedContent: () => set({ streamedContent: '', isStreamingComplete: false }),
        setStreamingComplete: (isComplete: boolean) => set({ isStreamingComplete: isComplete }),
        setLlmLoading: (llmLoading: boolean) => set({ llmLoading }),
        setLlmError: (llmError: string | null) => set({ llmError }),
    };
};
