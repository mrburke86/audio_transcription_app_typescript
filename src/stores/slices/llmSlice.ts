// src/stores/slices/llmSlice.ts
// LLM Slice: Handles all interactions with the Language Model service, including initialization, response generation, streaming, and suggestions.
// This slice encapsulates AI-related operations and state (e.g., loading, errors, streamed content) to separate compute-intensive tasks from UI or data slices, allowing independent scaling and error isolation.
import { logger } from '@/lib/Logger';
import { OpenAIClientService } from '@/services/OpenAIClientService';
import { StoreState } from '@/stores/chatStore'; // FIXED: Import the full composed State (BoundStore) type from chatStore.ts
import { ChatMessageParam, LLMSlice, Message, StrategicSuggestions } from '@/types';
import { buildAnalysisPrompt, buildSummaryPrompt, buildSystemPrompt, buildUserPrompt } from '@/utils/prompts';
import { StateCreator } from 'zustand';

export const createLLMSlice: StateCreator<StoreState, [], [], LLMSlice> = (set, get) => ({
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
        try {
            const service = new OpenAIClientService(apiKey);
            set({ llmService: service });
            logger.info('LLM Service initialized successfully');
            console.trace('[🔍 Trace] LLM initialized from stack');
        } catch (error) {
            logger.error(`Failed to initialize LLM service: ${(error as Error).message}`);
            set({ llmError: 'Failed to initialize AI service' });
        }
    },

    // Generate Response
    generateResponse: async (text: string, knowledgeContext = '') => {
        const { llmService, conversationSummary, initialContext } = get();

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
            console.trace('[🔍 Trace] generateResponse triggered');

            const systemPrompt = buildSystemPrompt(initialContext, initialContext.goals || []);
            const userPrompt = buildUserPrompt(text, conversationSummary, knowledgeContext);

            const messages: ChatMessageParam[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ];

            if (llmService.generateStreamedResponseChunks) {
                let fullResponse = '';
                for await (const chunk of llmService.generateStreamedResponseChunks(messages, {
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                })) {
                    fullResponse += chunk;
                    set(state => ({ streamedContent: state.streamedContent + chunk }));
                }
                set({ isStreamingComplete: true });
                logger.info(`Streaming response completed: ${fullResponse.length} characters`);
            } else {
                logger.warning('[🪫 Fallback] Streaming not supported, using complete response');
                const response = await llmService.generateCompleteResponse(messages, {
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                });
                set({ streamedContent: response, isStreamingComplete: true });
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

    // Generate System
    generateSuggestions: async (knowledgeContext = '') => {
        const { llmService, conversationSummary, initialContext } = get();

        if (!llmService || !initialContext) {
            set({ llmError: 'Service or context not available for suggestions' });
            return;
        }

        set({ llmLoading: true });

        try {
            logger.info('Generating strategic suggestions');
            console.trace('[🔍 Trace] generateSuggestions triggered');

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
                knowledgeContext ? `Knowledge Context:\n${knowledgeContext}\n` : ''
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

    // Summarise Conversation
    summarizeConversation: async () => {
        const { llmService, conversationHistory, initialContext } = get();

        if (!llmService || conversationHistory.length === 0 || !initialContext) {
            logger.warning('[📭 Summarize] Missing context or empty history — skipping summarization');
            return;
        }

        try {
            logger.info('Summarizing conversation');
            console.trace('[🔍 Trace] summarizeConversation triggered');

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

    // Append Streamed Content
    appendStreamedContent: (content: string) =>
        set(state => {
            const updated = state.streamedContent + content;
            logger.debug(`[🔄 LLM] Appended ${content.length} chars. New total: ${updated.length}`);
            return { streamedContent: updated };
        }),

    resetStreamedContent: () => set({ streamedContent: '', isStreamingComplete: false }),
    setStreamingComplete: (isComplete: boolean) => set({ isStreamingComplete: isComplete }),
    setLlmLoading: (llmLoading: boolean) => set({ llmLoading }),
    setLlmError: (llmError: string | null) => set({ llmError }),

    __dev_logSliceState: () => {
        const { llmService, streamedContent, ...rest } = get();
        logger.debug('[🧪 DEV] LLMSlice State Snapshot', {
            streamedContentLength: streamedContent.length,
            ...rest,
        });
    },
});
