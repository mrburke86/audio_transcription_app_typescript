/* eslint-disable @typescript-eslint/no-unused-vars */
// src/hooks/useLLMProviderOptimized.ts
'use client';

import { useKnowledge } from '@/contexts/KnowledgeProvider';
import { logger } from '@/modules';
import { OpenAILLMService } from '@/services/OpenAILLMService'; // Adjust path
import {
    AnalysisPreview,
    ChatMessageParam,
    ILLMService,
    InitialInterviewContext,
    LLMAction,
    LLMProviderHook,
    LLMRequestOptions,
    LLMState,
    Message,
    StrategicAnalysis,
} from '@/types';
import {
    createAnalysisSystemPrompt,
    createAnalysisUserPrompt,
    createGenerationSystemPrompt,
    createGenerationUserPrompt,
    createSummarisationSystemPrompt,
    createSummarisationUserPrompt,
    createSystemPrompt,
    createUserPrompt,
} from '@/utils';
import { measureAPICall, useAPIReliabilityMetrics, useRenderMetrics } from '@/utils/performance/measurementHooks';
import { Dispatch, MutableRefObject, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const COMPONENT_ID = 'useLLMProviderOptimized';

const initialState: LLMState = {
    isLoading: false,
    error: null,
    streamedContent: '',
    isStreamingComplete: false,
    conversationSummary: '',
    conversationSuggestions: {
        powerUpContent: '',
        lastAnalysis: undefined,
        analysisHistory: [],
    },
};

const reducer = (state: LLMState, action: LLMAction): LLMState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'APPEND_STREAMED_CONTENT':
            return {
                ...state,
                streamedContent: state.streamedContent + action.payload,
            };
        case 'RESET_STREAMED_CONTENT':
            return {
                ...state,
                streamedContent: '',
                isStreamingComplete: false,
            };
        case 'SET_STREAMING_COMPLETE':
            return {
                ...state,
                isStreamingComplete: action.payload,
            };
        case 'SET_CONVERSATION_SUMMARY':
            return {
                ...state,
                conversationSummary: action.payload,
            };
        case 'SET_CONVERSATION_SUGGESTIONS':
            return {
                ...state,
                conversationSuggestions: action.payload,
            };
        default:
            return state;
    }
};

export const useLLMProviderOptimized = (
    apiKey: string,
    initialInterviewContext: InitialInterviewContext | null,
    conversationHistory: Message[]
): LLMProviderHook => {
    const { trackRender } = useRenderMetrics('useLLMProviderOptimized');
    const { measureAPICall } = useAPIReliabilityMetrics();

    const [state, dispatch] = useReducer(reducer, initialState);

    // State for the LLM service instance
    const [llmService, setLlmService] = useState<ILLMService | null>(null);

    // Use knowledge context for file access
    const { searchRelevantKnowledge, isLoading: knowledgeLoading, error: knowledgeError } = useKnowledge();

    const streamedContentRef = useRef<string>('');
    const firstChunkReceivedRef = useRef<boolean>(false);
    const latestUserMessageRef = useRef<string>(''); // To track the last user message for suggestions trigger

    const { isLoading, error, streamedContent, isStreamingComplete, conversationSummary, conversationSuggestions } =
        state;

    // Get goals from initialInterviewContext
    const goals = initialInterviewContext?.goals || [];

    // Handle errors
    const handleError = useCallback(
        (errorInstance: unknown, queryId: string = 'general', context: string = 'LLMProvider') => {
            let errorMessage = 'An unexpected error occurred.';
            if (errorInstance instanceof Error) {
                const errorText = errorInstance.message.toLowerCase();
                if (errorText.includes('invalid_api_key') || errorText.includes('api key'))
                    errorMessage = 'Invalid API key.';
                else if (errorText.includes('rate_limit_exceeded')) errorMessage = 'Rate limit exceeded.';
                else if (errorText.includes('network')) errorMessage = 'Network error.';
                else errorMessage = errorInstance.message;
                logger.error(`[${COMPONENT_ID}][${queryId}] ❌ Error in ${context}: ${errorMessage}`);
            } else {
                logger.error(`[${COMPONENT_ID}][${queryId}] ❌ Unknown error in ${context}`);
            }
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            dispatch({ type: 'SET_LOADING', payload: false });
        },
        []
    );

    // Initialize LLM Service
    useEffect(() => {
        if (apiKey) {
            try {
                setLlmService(new OpenAILLMService(apiKey));
                logger.info(`[${COMPONENT_ID}] ✅ LLM Service (OpenAI) initialized successfully.`);
            } catch (e) {
                logger.error(`[${COMPONENT_ID}] ❌ Error initializing LLM Service: ${(e as Error).message}`);
                handleError(e, 'initialization', 'LLMServiceSetup');
            }
        } else {
            logger.error(`[${COMPONENT_ID}] ❌ API key is missing. LLM Service not initialized.`);
            dispatch({ type: 'SET_ERROR', payload: 'API key is missing for LLM Service.' });
        }
    }, [apiKey, handleError]);

    // Build context from relevant knowledge files
    // const buildKnowledgeContext = BuildKnowledgeContext(searchRelevantKnowledge);
    const buildKnowledgeContext = useCallback(
        async (query: string): Promise<string> => {
            // isKnowledgeLoading now also covers isIndexing from KnowledgeProvider
            if (knowledgeLoading || knowledgeError) {
                console.warn('Knowledge base is loading or has an error. Skipping knowledge context.');
                return '';
            }
            try {
                const relevantChunks = await searchRelevantKnowledge(query, 3); // Get top 3 relevant chunks
                if (relevantChunks.length === 0) return '';

                // Format the chunks for the LLM prompt
                // You might want to refine this formatting
                const context = relevantChunks
                    .map(
                        chunk =>
                            `--- Relevant Information from ${chunk.source} ---\n${chunk.text}\n--- End Information ---`
                    )
                    .join('\n\n');
                // console.log('Semantic Knowledge Context:', context);
                return `Based on the following relevant information:\n${context}\n\n`;
            } catch (error) {
                console.error('Error building knowledge context:', error);
                // dispatch({ type: 'SET_ERROR', payload: 'Failed to retrieve knowledge context.' }); // Optional: update UI
                return '';
            }
        },
        [searchRelevantKnowledge, knowledgeLoading, knowledgeError]
    );

    // Main response generation function using Chat Completions API
    const generateResponse = useGenerateResponse({
        llmService,
        handleError,
        knowledgeLoading,
        dispatch,
        knowledgeError,
        latestUserMessageRef,
        firstChunkReceivedRef,
        streamedContentRef,
        buildKnowledgeContext,
        initialInterviewContext,
        goals,
        conversationSummary,
        state,
    });

    // Simplified suggestions generation (same pattern as main response)
    const generateSuggestions = useGenerateSuggestions({
        llmService,
        knowledgeLoading,
        dispatch,
        latestUserMessageRef,
        conversationHistory,
        buildKnowledgeContext,
        conversationSummary,
        initialInterviewContext,
        handleError,
        state,
    });

    // Auto-summarization (simplified)
    const summarizeConversation = useCallback(
        async (currentHistory: Message[]): Promise<void> => {
            if (!llmService || currentHistory.length === 0 || !initialInterviewContext) {
                logger.info(`[${COMPONENT_ID}] Summarization skipped (service, history, or context missing).`);
                return;
            }
            dispatch({ type: 'SET_LOADING', payload: true }); // Indicate loading for summarization
            logger.info(`[${COMPONENT_ID}] 🔄 Starting conversation summarization`);
            try {
                const conversationText = currentHistory
                    .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                    .join('\n');

                // Updated: Remove goals parameter, use conversationSummary as existingSummary
                const summarisationUserPrompt = createSummarisationUserPrompt(
                    conversationText,
                    initialInterviewContext, // Pass context
                    conversationSummary // existingSummary
                );

                const messages: ChatMessageParam[] = [
                    { role: 'system', content: createSummarisationSystemPrompt },
                    { role: 'user', content: summarisationUserPrompt },
                ];
                const options: LLMRequestOptions = { model: 'gpt-4o-mini', temperature: 0.5 };

                const newSummarySegment = await llmService.generateCompleteResponse(messages, options);
                const updatedSummary = conversationSummary
                    ? `${conversationSummary}\n\n---\n\n${newSummarySegment}`
                    : newSummarySegment;

                dispatch({ type: 'SET_CONVERSATION_SUMMARY', payload: updatedSummary });
                logger.info(`[${COMPONENT_ID}] ✅ Summarization updated: ${newSummarySegment.length} chars added.`);
            } catch (err) {
                logger.error(`[${COMPONENT_ID}] ❌ Error summarizing: ${(err as Error).message}`);
            }
        },
        [llmService, initialInterviewContext, conversationSummary]
    );

    // Add a ref to track what we've already summarized
    const lastSummarizedLengthRef = useRef<number>(0);

    useEffect(() => {
        trackRender({
            apiKey: !!apiKey,
            hasContext: !!initialInterviewContext,
            historyLength: conversationHistory.length,
        });
    }, [apiKey, initialInterviewContext, conversationHistory, trackRender]);

    // Auto-summarization effect
    useEffect(() => {
        const currentLength = conversationHistory.length;
        const shouldSummarize =
            currentLength >= 1 &&
            isStreamingComplete && // Ensure main response is complete
            currentLength > lastSummarizedLengthRef.current &&
            !isLoading; // Ensure no other LLM operation is in progress

        if (shouldSummarize) {
            logger.info(
                `[${COMPONENT_ID}] Triggering summarization for ${currentLength} messages (last summarized: ${lastSummarizedLengthRef.current})`
            );
            summarizeConversation(conversationHistory).then(() => {
                lastSummarizedLengthRef.current = currentLength;
            });
        }
    }, [conversationHistory, isStreamingComplete, summarizeConversation, isLoading]);

    return {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    };
};

// Generate Response
interface UseGenerateResponseProps {
    llmService: ILLMService | null;
    handleError: (errorInstance: unknown, queryId?: string, context?: string) => void;
    knowledgeLoading: boolean;
    dispatch: Dispatch<LLMAction>;
    knowledgeError: string | null;
    latestUserMessageRef: MutableRefObject<string>;
    firstChunkReceivedRef: MutableRefObject<boolean>;
    streamedContentRef: MutableRefObject<string>;
    buildKnowledgeContext: (userMessage: string) => Promise<string>;
    initialInterviewContext: InitialInterviewContext | null;
    goals: string[];
    conversationSummary: string;
    state: LLMState;
}

function useGenerateResponse({
    llmService,
    handleError,
    knowledgeLoading,
    dispatch,
    knowledgeError,
    latestUserMessageRef,
    firstChunkReceivedRef,
    streamedContentRef,
    buildKnowledgeContext,
    initialInterviewContext,
    goals,
    conversationSummary,
    state,
}: UseGenerateResponseProps) {
    return useCallback(
        async (userMessage: string): Promise<void> => {
            if (!llmService) {
                handleError(new Error('LLM Service not initialized.'), 'generateResponse', 'Prerequisite');
                return;
            }
            if (knowledgeLoading) {
                dispatch({ type: 'SET_ERROR', payload: 'Knowledge base is still loading. Please wait...' });
                return;
            }
            if (knowledgeError) {
                dispatch({ type: 'SET_ERROR', payload: `Knowledge base error: ${knowledgeError}` });
                return;
            }

            const queryId = uuidv4();
            latestUserMessageRef.current = userMessage; // Store for suggestion trigger
            firstChunkReceivedRef.current = false;
            streamedContentRef.current = ''; // Reset ref for new stream

            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            dispatch({ type: 'RESET_STREAMED_CONTENT' });

            logger.info(`[${COMPONENT_ID}][${queryId}] 🚀 Starting main response generation`);
            // loglog.info('🚀 Starting optimized response generation', queryId);

            try {
                // Build knowledge context (this replaces the file search)
                const knowledgeContext = await buildKnowledgeContext(userMessage);

                // Build complete prompt with context
                const systemPrompt = await createSystemPrompt(initialInterviewContext!, goals);
                const userPromptContent = await createUserPrompt(userMessage, conversationSummary, knowledgeContext);

                // ===== ENHANCED PROMPT LOGGING =====
                DetailedPromptLogging({
                    queryId,
                    systemPrompt,
                    userPrompt: userPromptContent,
                    initialInterviewContext,
                    goals,
                    state,
                    knowledgeContext,
                    userMessage,
                });

                const messages: ChatMessageParam[] = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPromptContent },
                ];
                const options: LLMRequestOptions = { model: 'gpt-4o', temperature: 0.7 }; // Example options

                if (llmService.generateStreamedResponse) {
                    logger.info(`[${COMPONENT_ID}][${queryId}] 🎯 Starting Chat Completions stream via LLMService`);
                    for await (const chunk of llmService.generateStreamedResponse(messages, options)) {
                        if (!firstChunkReceivedRef.current) {
                            logger.info(`[${COMPONENT_ID}][${queryId}] 💧 First chunk received`);
                            firstChunkReceivedRef.current = true;
                        }
                        dispatch({ type: 'APPEND_STREAMED_CONTENT', payload: chunk });
                        streamedContentRef.current += chunk;
                    }
                } else {
                    // Fallback for non-streaming services or if generateStreamedResponse is optional and not implemented
                    logger.info(
                        `[${COMPONENT_ID}][${queryId}] 🎯 Generating complete response via LLMService (non-streaming)`
                    );
                    // const fullResponse = await llmService.generateCompleteResponse(messages, options);
                    const fullResponse = await measureAPICall(
                        () => llmService.generateCompleteResponse(messages, options),
                        'LLM-generateResponse'
                    );

                    dispatch({ type: 'APPEND_STREAMED_CONTENT', payload: fullResponse });
                    streamedContentRef.current = fullResponse;
                }

                dispatch({ type: 'SET_STREAMING_COMPLETE', payload: true });
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🏁 Main response completed: ${streamedContentRef.current.length} characters`
                );
            } catch (err) {
                handleError(err, queryId);
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            llmService,
            knowledgeLoading,
            knowledgeError,
            // latestUserMessageRef,
            // firstChunkReceivedRef,
            // streamedContentRef,
            dispatch,
            handleError,
            buildKnowledgeContext,
            initialInterviewContext,
            goals,
            conversationSummary,
            // state,
        ]
    );
}

// Geneeate Suggestions Function
interface GenerateSuggestionsFunctionProps {
    llmService: ILLMService | null;
    knowledgeLoading: boolean;
    dispatch: Dispatch<LLMAction>;
    latestUserMessageRef: MutableRefObject<string>;
    conversationHistory: Message[];
    buildKnowledgeContext: (userMessage: string) => Promise<string>;

    conversationSummary: string;
    initialInterviewContext: InitialInterviewContext | null;
    handleError: (errorInstance: unknown, queryId?: string, context?: string) => void;
    state: LLMState; // ADD THIS LINE
}

function useGenerateSuggestions({
    llmService,
    knowledgeLoading,
    dispatch,
    latestUserMessageRef,
    conversationHistory,
    buildKnowledgeContext,
    conversationSummary,
    initialInterviewContext,
    handleError,
    state,
}: GenerateSuggestionsFunctionProps) {
    return useCallback(async (): Promise<void> => {
        if (!llmService || !initialInterviewContext) {
            logger.info(`[${COMPONENT_ID}] Suggestion generation skipped (service or context missing).`);
            return;
        }

        const queryId = uuidv4();
        dispatch({ type: 'SET_LOADING', payload: true }); // Indicate loading for suggestions
        logger.info(`[${COMPONENT_ID}][${queryId}] 🧠 Starting strategic intelligence generation via LLMService`);

        try {
            // Build context for strategic analysis
            const contextMessage =
                latestUserMessageRef.current ||
                (conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].content : '');
            const knowledgeContext = await buildKnowledgeContext(contextMessage);
            const previousAnalysisHistory = state.conversationSuggestions.analysisHistory || [];

            logger.info(
                `[${COMPONENT_ID}][${queryId}] 📚 Previous analysis history: ${previousAnalysisHistory.length} entries`
            );

            // ===== STAGE 1: STRATEGIC ANALYSIS =====
            logger.info(`[${COMPONENT_ID}][${queryId}] 🔍 Stage 1: Strategic opportunity analysis`);

            const analysisUserPrompt = await createAnalysisUserPrompt(
                conversationSummary,
                initialInterviewContext,
                knowledgeContext,
                previousAnalysisHistory
            );
            const analysisMessages: ChatMessageParam[] = [
                { role: 'system', content: createAnalysisSystemPrompt },
                { role: 'user', content: analysisUserPrompt },
            ];

            // ===== ANALYSIS PROMPT LOGGING =====
            GenerateSuggestionAnalysisStageLogging(queryId, analysisUserPrompt, previousAnalysisHistory);

            const analysisOptions: LLMRequestOptions = { model: 'gpt-4o-mini', temperature: 0.3 };
            // const analysisContent = await llmService.generateCompleteResponse(analysisMessages, analysisOptions);
            const analysisContent = await measureAPICall(
                () => llmService.generateCompleteResponse(analysisMessages, analysisOptions),
                'LLM-generateSuggestions-analysis'
            );

            // const analysisResponse = await openai.chat.completions.create({
            //     model: 'gpt-4o-mini' as OpenAIModelName,
            //     // model: 'o3-mini' as OpenAIModelName,
            //     messages: [
            //         {
            //             role: 'system',
            //             // role: 'developer',
            //             content: createAnalysisSystemPrompt,
            //         },
            //         {
            //             role: 'user',
            //             content: analysisUserPrompt,
            //         },
            //     ],
            //     max_tokens: 600,
            //     // max_completion_tokens: 600,
            //     // temperature: 0.3, // Lower temperature for consistent strategic analysis
            // });

            // const analysisContent = analysisResponse.choices[0]?.message.content?.trim() || '';

            // ===== ANALYSIS OUTPUT LOGGING =====
            logger.info(`[${COMPONENT_ID}][${queryId}] 🔍 ANALYSIS STAGE OUTPUT:`);
            logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ ANALYSIS RESPONSE (${analysisContent.length} chars) ─┐`);
            console.log('\n📊 ANALYSIS STAGE OUTPUT:\n', analysisContent, '\n');

            // Parse strategic analysis results
            let strategicAnalysis: StrategicAnalysis;
            try {
                // Extract JSON from response if wrapped in markdown
                const jsonMatch = analysisContent.match(/\{[\s\S]*\}/) || [analysisContent];
                strategicAnalysis = JSON.parse(jsonMatch[0]);

                logger.info(
                    `[${COMPONENT_ID}][${queryId}] ✅ Strategic analysis complete: ${strategicAnalysis.strategic_opportunity}`
                );
                logger.info(`[${COMPONENT_ID}][${queryId}] 💡 Focus area: ${strategicAnalysis.focus_area}`);
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🎯 Insight potential: ${strategicAnalysis.insight_potential}`
                );
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🚀 Differentiation: ${strategicAnalysis.differentiation_angle}`
                );

                // ===== PARSED ANALYSIS LOGGING =====
                console.log('\n🧠 PARSED STRATEGIC ANALYSIS:\n', JSON.stringify(strategicAnalysis, null, 2), '\n');
            } catch (parseError) {
                logger.error(`[${COMPONENT_ID}][${queryId}] ❌ Strategic analysis parsing failed: ${parseError}`);

                // Fallback strategic analysis with variety consideration
                const usedOpportunities = previousAnalysisHistory.map((h: AnalysisPreview) => h.strategic_opportunity);
                const availableOpportunities = [
                    'thought_leadership',
                    'competitive_intelligence',
                    'data_storytelling',
                    'hidden_connections',
                    'future_vision',
                    'real_world_evidence',
                ];
                const unusedOpportunities = availableOpportunities.filter(op => !usedOpportunities.includes(op));
                const fallbackOpportunity =
                    unusedOpportunities.length > 0 ? unusedOpportunities[0] : 'thought_leadership';

                strategicAnalysis = {
                    strategic_opportunity: fallbackOpportunity as StrategicAnalysis['strategic_opportunity'], // Instead of 'as any'
                    focus_area: 'Strategic positioning and industry expertise',
                    insight_potential: 'Industry insights and strategic positioning opportunities',
                    knowledge_leverage: 'Combine LLM knowledge with available context for strategic insights',
                    differentiation_angle: 'Demonstrate advanced strategic thinking and industry expertise',
                    research_suggestions: 'Industry trends, competitive landscape, real-world examples',
                };

                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🔄 Using fallback strategic analysis: ${fallbackOpportunity}`
                );
                console.log('\n🔄 FALLBACK STRATEGIC ANALYSIS:\n', JSON.stringify(strategicAnalysis, null, 2), '\n');
            }

            // ===== STAGE 2: STRATEGIC INTELLIGENCE GENERATION =====
            logger.info(
                `[${COMPONENT_ID}][${queryId}] 🚀 Stage 2: Generating ${strategicAnalysis.strategic_opportunity} intelligence`
            );

            const generationUserPrompt = await createGenerationUserPrompt(
                strategicAnalysis,
                initialInterviewContext,
                knowledgeContext,
                previousAnalysisHistory
            );

            // ===== GENERATION PROMPT LOGGING =====
            GenerateSuggestioCreateStageLogging(queryId, generationUserPrompt);
            const generationMessages: ChatMessageParam[] = [
                { role: 'system', content: createGenerationSystemPrompt },
                { role: 'user', content: generationUserPrompt },
            ];

            // const generationResponse = await openai.chat.completions.create({
            //     model: 'gpt-4o-mini' as OpenAIModelName,
            //     // model: 'o3-mini' as OpenAIModelName,
            //     messages: [
            //         {
            //             role: 'system',
            //             // role: 'developer',
            //             content: createGenerationSystemPrompt,
            //         },
            //         {
            //             role: 'user',
            //             content: generationUserPrompt,
            //         },
            //     ],
            //     max_tokens: 1200,
            //     // max_completion_tokens: 1200,
            //     // temperature: 0.7, // Lower temperature for consistent strategic analysis
            // });

            const generationOptions: LLMRequestOptions = { model: 'gpt-4o-mini', temperature: 0.7 };
            // const strategicIntelligence = await llmService.generateCompleteResponse(
            //     generationMessages,
            //     generationOptions
            // );
            const strategicIntelligence = await measureAPICall(
                () => llmService.generateCompleteResponse(generationMessages, generationOptions),
                'LLM-generateSuggestions-generation'
            );

            // ===== GENERATION OUTPUT LOGGING =====
            logger.info(`[${COMPONENT_ID}][${queryId}] 🚀 GENERATION STAGE OUTPUT:`);
            logger.info(
                `[${COMPONENT_ID}][${queryId}] ┌─ STRATEGIC INTELLIGENCE (${strategicIntelligence.length} chars) ─┐`
            );
            console.log('\n📋 STRATEGIC INTELLIGENCE OUTPUT:\n', strategicIntelligence, '\n');

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

                dispatch({
                    type: 'SET_CONVERSATION_SUGGESTIONS',
                    payload: {
                        powerUpContent: strategicIntelligence,
                        lastAnalysis: strategicAnalysis,
                        analysisHistory: updatedHistory,
                    },
                });

                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 📚 Analysis history updated: ${updatedHistory.length} entries`
                );
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] ✅ Strategic intelligence generated: ${strategicIntelligence.length} chars`
                );

                // ===== FINAL SUCCESS SUMMARY =====
                logger.info(`[${COMPONENT_ID}][${queryId}] 🎉 STRATEGIC INTELLIGENCE PIPELINE COMPLETE`);
                logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ PIPELINE SUMMARY ─┐`);
                logger.info(`[${COMPONENT_ID}][${queryId}] │ Type: ${strategicAnalysis.strategic_opportunity}`);
                logger.info(`[${COMPONENT_ID}][${queryId}] │ Focus: ${strategicAnalysis.focus_area}`);
                logger.info(`[${COMPONENT_ID}][${queryId}] │ Analysis: ${analysisContent.length} chars`);
                logger.info(`[${COMPONENT_ID}][${queryId}] │ Intelligence: ${strategicIntelligence.length} chars`);
                logger.info(`[${COMPONENT_ID}][${queryId}] │ History: ${updatedHistory.length} entries`);
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] │ Previous Types: ${
                        previousAnalysisHistory.map((h: AnalysisPreview) => h.strategic_opportunity).join(', ') ||
                        'None'
                    }`
                );
                logger.info(`[${COMPONENT_ID}][${queryId}] │ Total Process: Analysis → Generation`);
                logger.info(`[${COMPONENT_ID}][${queryId}] └─ SUCCESS ─┘`);

                // Log variety achievement
                const currentType = strategicAnalysis.strategic_opportunity;
                const previousTypes = previousAnalysisHistory.map((h: AnalysisPreview) => h.strategic_opportunity);
                const isUnique = !previousTypes.includes(currentType);
                logger.info(
                    `[${COMPONENT_ID}][${queryId}] 🎯 Variety Check: ${
                        isUnique ? '✅ UNIQUE' : '⚠️ REPEATED'
                    } (${currentType})`
                );
            } else {
                throw new Error('Empty strategic intelligence generation');
            }
        } catch (err) {
            logger.error(`[${COMPONENT_ID}][${queryId}] ❌ Strategic intelligence pipeline failed: ${err}`);
            handleError(err, queryId, 'generateSuggestions');

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
    Your combination of experience and strategic thinking sets you apart from other candidates.
    
    ## 💪 Confidence Foundation
    You have the strategic expertise to excel in this role - trust your insights and speak with authority about your domain.`;

            dispatch({
                type: 'SET_CONVERSATION_SUGGESTIONS',
                payload: {
                    powerUpContent: fallbackContent,
                    analysisHistory: state.conversationSuggestions.analysisHistory || [], // Preserve history on error
                },
            });

            logger.info(`[${COMPONENT_ID}][${queryId}] 🔄 Fallback strategic intelligence deployed`);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
            logger.info(`[${COMPONENT_ID}][${queryId}] 🏁 Strategic intelligence generation complete`);
        }
    }, [
        llmService,
        initialInterviewContext,
        dispatch,
        latestUserMessageRef,
        conversationHistory,
        buildKnowledgeContext,
        state.conversationSuggestions.analysisHistory,
        conversationSummary,
        handleError,
    ]);
}

function GenerateSuggestioCreateStageLogging(queryId: string, generationUserPrompt: string) {
    logger.info(`[${COMPONENT_ID}][${queryId}] 📝 GENERATION SYSTEM PROMPT:`);
    logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ GENERATION SYSTEM (${createGenerationSystemPrompt.length} chars) ─┐`);
    console.log('\n🚀 GENERATION SYSTEM PROMPT:\n', createGenerationSystemPrompt, '\n');

    logger.info(`[${COMPONENT_ID}][${queryId}] 📝 GENERATION USER PROMPT:`);
    logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ GENERATION USER (${generationUserPrompt.length} chars) ─┐`);
    console.log('\n🎯 GENERATION USER PROMPT:\n', generationUserPrompt, '\n');
}

//
function GenerateSuggestionAnalysisStageLogging(
    queryId: string,
    analysisUserPrompt: string,
    previousAnalysisHistory: AnalysisPreview[]
) {
    logger.info(`[${COMPONENT_ID}][${queryId}] 📝 ANALYSIS SYSTEM PROMPT:`);
    logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ ANALYSIS SYSTEM (${createAnalysisSystemPrompt.length} chars) ─┐`);
    console.log('\n🔍 ANALYSIS SYSTEM PROMPT:\n', createAnalysisSystemPrompt, '\n');

    logger.info(`[${COMPONENT_ID}][${queryId}] 📝 ANALYSIS USER PROMPT:`);
    logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ ANALYSIS USER (${analysisUserPrompt.length} chars) ─┐`);
    console.log('\n💭 ANALYSIS USER PROMPT:\n', analysisUserPrompt, '\n');

    // Log previous analysis context
    if (previousAnalysisHistory.length > 0) {
        logger.info(`[${COMPONENT_ID}][${queryId}] 📚 PREVIOUS ANALYSIS CONTEXT:`);
        console.log('\n📚 PREVIOUS ANALYSIS HISTORY:\n', JSON.stringify(previousAnalysisHistory, null, 2), '\n');
    }
}

// Detailed Prompt Logging Function
interface DetailedPromptLoggingProps {
    queryId: string;
    systemPrompt: string;
    userPrompt: string;
    initialInterviewContext: InitialInterviewContext | null;
    // roleDescription: string,
    goals: string[];
    state: LLMState;
    knowledgeContext: string;
    userMessage: string;
}

function DetailedPromptLogging({
    queryId,
    systemPrompt,
    userPrompt,
    initialInterviewContext,
    goals,
    state,
    knowledgeContext,
    userMessage,
}: DetailedPromptLoggingProps) {
    logger.info(`[${COMPONENT_ID}][${queryId}] 📝 SYSTEM PROMPT CONSTRUCTED:`);
    logger.info(`[${COMPONENT_ID}][${queryId}] ┌─────────────────────────────────────────────────────────────────┐`);
    logger.info(`[${COMPONENT_ID}][${queryId}] │ SYSTEM PROMPT (${systemPrompt.length} chars):`);
    logger.info(`[${COMPONENT_ID}][${queryId}] └─────────────────────────────────────────────────────────────────┘`);
    console.log('\n🎭 GENERATE RESPONSE SYSTEM PROMPT:\n', systemPrompt, '\n');

    logger.info(`[${COMPONENT_ID}][${queryId}] 📝 USER PROMPT CONSTRUCTED:`);
    logger.info(`[${COMPONENT_ID}][${queryId}] ┌─────────────────────────────────────────────────────────────────┐`);
    logger.info(`[${COMPONENT_ID}][${queryId}] │ USER PROMPT (${userPrompt.length} chars):`);
    logger.info(`[${COMPONENT_ID}][${queryId}] └─────────────────────────────────────────────────────────────────┘`);
    console.log('\n💬 GENERATE RESPONSE USER PROMPT:\n', userPrompt, '\n');

    logger.debug(
        `[${COMPONENT_ID}][${queryId}] 📊 Total prompt size: ${systemPrompt.length + userPrompt.length} characters`
    );

    // Log key prompt components for debugging
    logger.debug(`[${COMPONENT_ID}][${queryId}] 🔍 Prompt Components:`);

    // Enhanced logging for InitialInterviewContext
    if (initialInterviewContext) {
        // Log role information if available
        if (initialInterviewContext.roleDescription) {
            const rolePreview =
                initialInterviewContext.roleDescription.length > 50
                    ? `${initialInterviewContext.roleDescription.substring(0, 50)}...`
                    : initialInterviewContext.roleDescription;
            logger.debug(`[${COMPONENT_ID}][${queryId}]   • Role: ${rolePreview}`);
        }

        // Log company information if available
        if (initialInterviewContext.targetCompany) {
            logger.debug(`[${COMPONENT_ID}][${queryId}]   • Company: ${initialInterviewContext.targetCompany}`);
        }

        // Log interview type if available
        if (initialInterviewContext.interviewType) {
            logger.debug(`[${COMPONENT_ID}][${queryId}]   • Interview Type: ${initialInterviewContext.interviewType}`);
        }

        // Log any other relevant context properties
        const contextKeys = Object.keys(initialInterviewContext).filter(
            key => !['roleDescription', 'companyName', 'interviewType', 'goals'].includes(key)
        );
        if (contextKeys.length > 0) {
            logger.debug(`[${COMPONENT_ID}][${queryId}]   • Additional Context: ${contextKeys.join(', ')}`);
        }
    } else {
        logger.debug(`[${COMPONENT_ID}][${queryId}]   • Interview Context: Not configured`);
    }

    logger.debug(`[${COMPONENT_ID}][${queryId}]   • Goals: ${goals.length} items`);
    if (goals.length > 0) {
        const goalsPreview = goals.slice(0, 3).join(', ');
        const moreGoals = goals.length > 3 ? ` (+${goals.length - 3} more)` : '';
        logger.debug(`[${COMPONENT_ID}][${queryId}]     └─ [${goalsPreview}${moreGoals}]`);
    }

    logger.debug(`[${COMPONENT_ID}][${queryId}]   • Conversation Summary: ${state.conversationSummary.length} chars`);
    logger.debug(`[${COMPONENT_ID}][${queryId}]   • Knowledge Context: ${knowledgeContext.length} chars`);
    logger.debug(`[${COMPONENT_ID}][${queryId}]   • User Message: "${userMessage}"`);

    // Log detailed context structure for debugging (only in development)
    if (process.env.NODE_ENV === 'development' && initialInterviewContext) {
        logger.debug(`[${COMPONENT_ID}][${queryId}] 🏗️ Interview Context Structure:`);
        console.log('\n📋 INITIAL INTERVIEW CONTEXT:\n', JSON.stringify(initialInterviewContext, null, 2), '\n');
    }
}
