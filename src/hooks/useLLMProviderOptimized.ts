// src/hooks/useLLMProviderOptimized.ts
'use client';

import { logger } from '@/modules';
import type OpenAI from 'openai';
import { Dispatch, MutableRefObject, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useKnowledge } from '@/contexts/KnowledgeProvider';
import {
    AnalysisPreview,
    InitialInterviewContext,
    LLMAction,
    LLMProviderHook,
    LLMState,
    StrategicAnalysis,
    OpenAIModelName,
    Message,
} from '@/types';
import {
    createAnalysisUserPrompt,
    createSystemPrompt,
    createUserPrompt,
    createAnalysisSystemPrompt,
    createGenerationSystemPrompt,
    createGenerationUserPrompt,
    createSummarisationSystemPrompt,
    createSummarisationUserPrompt,
} from '@/utils';

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
    const [state, dispatch] = useReducer(reducer, initialState);
    const [openai, setOpenai] = useState<OpenAI | null>(null);

    // Use knowledge context for file access
    const { searchRelevantFiles, isLoading: knowledgeLoading, error: knowledgeError } = useKnowledge();

    const streamedContentRef = useRef<string>('');
    const firstChunkReceivedRef = useRef<boolean>(false);
    const latestUserMessageRef = useRef<string>('');

    const { isLoading, error, streamedContent, isStreamingComplete, conversationSummary, conversationSuggestions } = state;

    // Get goals from initialInterviewContext
    const goals = initialInterviewContext?.goals || [];

    // Handle errors
    const handleError = useCallback((errorInstance: unknown, queryId: string = 'general', context: string = 'generateResponse') => {
        let errorMessage = 'An unexpected error occurred.';
        if (errorInstance instanceof Error) {
            const errorText = errorInstance.message.toLowerCase();
            if (errorText.includes('invalid_api_key')) errorMessage = 'Invalid API key.';
            else if (errorText.includes('rate_limit_exceeded')) errorMessage = 'Rate limit exceeded.';
            else if (errorText.includes('network')) errorMessage = 'Network error.';
            else errorMessage = errorInstance.message;

            logger.error(`[${COMPONENT_ID}][${queryId}] ❌ Error in ${context}: ${errorMessage}`);
            // loglog.error(`Error in ${context}: ${errorMessage}`, queryId);
        } else {
            logger.error(`[${COMPONENT_ID}][${queryId}] ❌ Unknown error in ${context}`);
            // loglog.error('Unknown error occurred.', queryId);
        }
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        dispatch({ type: 'SET_LOADING', payload: false });
    }, []);

    // Initialize OpenAI client
    const initializeOpenAI = useCallback(async () => {
        if (!apiKey) {
            logger.error(`[${COMPONENT_ID}] ❌ API key is missing...`);
            return;
        }

        try {
            const { default: OpenAIModule } = await import('openai');
            const client = new OpenAIModule({
                apiKey,
                dangerouslyAllowBrowser: true,
            });
            setOpenai(client);
            logger.info(`[${COMPONENT_ID}] ✅ OpenAI client initialized successfully.`);
        } catch (error) {
            logger.error(`[${COMPONENT_ID}] ❌ Error initializing OpenAI client: ${(error as Error).message}`);
        }
    }, [apiKey]);

    useEffect(() => {
        initializeOpenAI();
    }, [initializeOpenAI]);

    // Build context from relevant knowledge files
    const buildKnowledgeContext = BuildKnowledgeContext(searchRelevantFiles);

    // Main response generation function using Chat Completions API
    const generateResponse = useGenerateResponse({
        knowledgeLoading,
        dispatch,
        knowledgeError,
        firstChunkReceivedRef,
        buildKnowledgeContext,
        initialInterviewContext,
        goals,
        state,
        openai,
        streamedContentRef,
        handleError,
    });

    // Simplified suggestions generation (same pattern as main response)
    const generateSuggestions = useGenerateSuggestions({
        openai,
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
        async (history: Message[]): Promise<void> => {
            if (!openai || history.length === 0) return;

            try {
                const conversationText = history.map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');

                // Updated: Remove goals parameter, use conversationSummary as existingSummary
                const summarisationUserPrompt = createSummarisationUserPrompt(
                    conversationText,
                    initialInterviewContext || ({} as InitialInterviewContext),
                    conversationSummary // This becomes the "existingSummary" parameter
                );

                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini' as OpenAIModelName,
                    messages: [
                        {
                            role: 'system',
                            content: createSummarisationSystemPrompt,
                        },
                        { role: 'user', content: summarisationUserPrompt },
                    ],
                    max_tokens: 500,
                    temperature: 0.5,
                });

                const newSummarySegment = response.choices[0]?.message.content?.trim() || '';

                // Updated: Append new summary to existing summary instead of replacing
                const updatedSummary = conversationSummary ? `${conversationSummary}\n\n---\n\n${newSummarySegment}` : newSummarySegment;

                dispatch({
                    type: 'SET_CONVERSATION_SUMMARY',
                    payload: updatedSummary,
                });

                logger.info(
                    `[${COMPONENT_ID}] ✅ Summary updated: ${newSummarySegment.length} chars added, total: ${updatedSummary.length} chars`
                );
            } catch (err) {
                logger.error(`[${COMPONENT_ID}] ❌ Error summarizing: ${(err as Error).message}`);
            }
        },
        [openai, initialInterviewContext, conversationSummary] // Updated: Removed goals from dependencies
    );

    // Add a ref to track what we've already summarized
    const lastSummarizedLengthRef = useRef<number>(0);

    // Auto-summarization effect
    useEffect(() => {
        const currentLength = conversationHistory.length;

        const shouldSummarize = currentLength >= 1 && isStreamingComplete && currentLength > lastSummarizedLengthRef.current;

        if (shouldSummarize) {
            logger.info(
                `[${COMPONENT_ID}] 🔄 Triggering summarization for ${currentLength} messages (last summarized: ${lastSummarizedLengthRef.current})`
            );

            lastSummarizedLengthRef.current = currentLength;
            summarizeConversation(conversationHistory);
        }
    }, [conversationHistory.length, isStreamingComplete, summarizeConversation]);

    // Debug logging effect
    useEffect(() => {
        logger.debug(
            `[${COMPONENT_ID}] 🔍 Effect dependencies changed: length=${conversationHistory.length}, streaming=${isStreamingComplete}, lastSummarized=${lastSummarizedLengthRef.current}`
        );
    }, [conversationHistory.length, isStreamingComplete]);

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
    knowledgeLoading: boolean;
    dispatch: Dispatch<LLMAction>;
    knowledgeError: string | null;
    firstChunkReceivedRef: MutableRefObject<boolean>;
    buildKnowledgeContext: (userMessage: string) => string;
    initialInterviewContext: InitialInterviewContext | null;
    goals: string[];
    state: LLMState;
    openai: OpenAI | null;
    streamedContentRef: MutableRefObject<string>;
    handleError: (errorInstance: unknown, queryId?: string, context?: string) => void;
}

function useGenerateResponse({
    knowledgeLoading,
    dispatch,
    knowledgeError,
    firstChunkReceivedRef,
    buildKnowledgeContext,
    initialInterviewContext,
    goals,
    state,
    openai,
    streamedContentRef,
    handleError,
}: UseGenerateResponseProps) {
    return useCallback(
        async (userMessage: string): Promise<void> => {
            if (knowledgeLoading) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: 'Knowledge base is still loading. Please wait...',
                });
                return;
            }

            if (knowledgeError) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: `Knowledge base error: ${knowledgeError}`,
                });
                return;
            }

            const queryId = uuidv4();
            firstChunkReceivedRef.current = false;

            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            dispatch({ type: 'RESET_STREAMED_CONTENT' });

            logger.info(`[${COMPONENT_ID}][${queryId}] 🚀 Starting optimized response generation`);
            // loglog.info('🚀 Starting optimized response generation', queryId);

            try {
                // Build knowledge context (this replaces the file search)
                const knowledgeContext = buildKnowledgeContext(userMessage);

                // Build complete prompt with context
                const systemPrompt = await createSystemPrompt(initialInterviewContext || ({} as InitialInterviewContext), goals);
                const userPrompt = await createUserPrompt(userMessage, state.conversationSummary, knowledgeContext);

                // ===== ENHANCED PROMPT LOGGING =====
                DetailedPromptLogging({
                    queryId,
                    systemPrompt,
                    userPrompt,
                    initialInterviewContext,
                    goals,
                    state,
                    knowledgeContext,
                    userMessage,
                });

                if (!openai) throw new Error('OpenAI client not initialized');

                logger.info(`[${COMPONENT_ID}][${queryId}] 🎯 Starting Chat Completions stream`);

                // Use Chat Completions API with streaming
                const stream = await openai.chat.completions.create({
                    model: 'gpt-4o' as OpenAIModelName,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    stream: true,
                    max_tokens: 2000,
                    temperature: 0.7,
                });

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';

                    if (content) {
                        dispatch({
                            type: 'APPEND_STREAMED_CONTENT',
                            payload: content,
                        });
                        streamedContentRef.current += content;
                    }
                }

                dispatch({ type: 'SET_STREAMING_COMPLETE', payload: true });

                // Log final response for debugging
                logger.info(`[${COMPONENT_ID}][${queryId}] 🏁 Response completed: ${streamedContentRef.current.length} characters`);
                logger.debug(`[${COMPONENT_ID}][${queryId}] 📄 FINAL RESPONSE:\n${streamedContentRef.current}`);
                // loglog.info(`Response completed: ${streamedContentRef.current.length} characters`, queryId);
            } catch (err) {
                handleError(err, queryId);
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [
            knowledgeLoading,
            knowledgeError,
            firstChunkReceivedRef,
            dispatch,
            buildKnowledgeContext,
            initialInterviewContext,
            goals,
            state,
            openai,
            streamedContentRef,
            handleError,
        ]
    );
}

// Geneeate Suggestions Function
interface GenerateSuggestionsFunctionProps {
    openai: OpenAI | null;
    knowledgeLoading: boolean;
    dispatch: Dispatch<LLMAction>;
    latestUserMessageRef: MutableRefObject<string>;
    conversationHistory: Message[];
    buildKnowledgeContext: (userMessage: string) => string;
    conversationSummary: string;
    initialInterviewContext: InitialInterviewContext | null;
    handleError: (errorInstance: unknown, queryId?: string, context?: string) => void;
    state: LLMState; // ADD THIS LINE
}

function useGenerateSuggestions({
    openai,
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
        if (!openai || knowledgeLoading) return;

        const queryId = uuidv4();

        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            // Build context for strategic analysis
            const contextMessage =
                latestUserMessageRef.current ||
                (conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].content : '');

            const knowledgeContext = buildKnowledgeContext(contextMessage);

            // Get previous analysis history
            const previousAnalysisHistory = state.conversationSuggestions.analysisHistory || [];

            logger.info(`[${COMPONENT_ID}][${queryId}] 🧠 Starting strategic intelligence generation`);
            logger.info(`[${COMPONENT_ID}][${queryId}] 📚 Previous analysis history: ${previousAnalysisHistory.length} entries`);

            // ===== STAGE 1: STRATEGIC ANALYSIS =====
            logger.info(`[${COMPONENT_ID}][${queryId}] 🔍 Stage 1: Strategic opportunity analysis`);

            const analysisUserPrompt = await createAnalysisUserPrompt(
                conversationSummary,
                initialInterviewContext,
                knowledgeContext,
                previousAnalysisHistory
            );

            // ===== ANALYSIS PROMPT LOGGING =====
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

            const analysisResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini' as OpenAIModelName,
                // model: 'o3-mini' as OpenAIModelName,
                messages: [
                    {
                        role: 'system',
                        // role: 'developer',
                        content: createAnalysisSystemPrompt,
                    },
                    {
                        role: 'user',
                        content: analysisUserPrompt,
                    },
                ],
                max_tokens: 600,
                // max_completion_tokens: 600,
                // temperature: 0.3, // Lower temperature for consistent strategic analysis
            });

            const analysisContent = analysisResponse.choices[0]?.message.content?.trim() || '';

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

                logger.info(`[${COMPONENT_ID}][${queryId}] ✅ Strategic analysis complete: ${strategicAnalysis.strategic_opportunity}`);
                logger.info(`[${COMPONENT_ID}][${queryId}] 💡 Focus area: ${strategicAnalysis.focus_area}`);
                logger.info(`[${COMPONENT_ID}][${queryId}] 🎯 Insight potential: ${strategicAnalysis.insight_potential}`);
                logger.info(`[${COMPONENT_ID}][${queryId}] 🚀 Differentiation: ${strategicAnalysis.differentiation_angle}`);

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
                const fallbackOpportunity = unusedOpportunities.length > 0 ? unusedOpportunities[0] : 'thought_leadership';

                strategicAnalysis = {
                    strategic_opportunity: fallbackOpportunity as StrategicAnalysis['strategic_opportunity'], // Instead of 'as any'
                    focus_area: 'Strategic positioning and industry expertise',
                    insight_potential: 'Industry insights and strategic positioning opportunities',
                    knowledge_leverage: 'Combine LLM knowledge with available context for strategic insights',
                    differentiation_angle: 'Demonstrate advanced strategic thinking and industry expertise',
                    research_suggestions: 'Industry trends, competitive landscape, real-world examples',
                };

                logger.info(`[${COMPONENT_ID}][${queryId}] 🔄 Using fallback strategic analysis: ${fallbackOpportunity}`);
                console.log('\n🔄 FALLBACK STRATEGIC ANALYSIS:\n', JSON.stringify(strategicAnalysis, null, 2), '\n');
            }

            // ===== STAGE 2: STRATEGIC INTELLIGENCE GENERATION =====
            logger.info(`[${COMPONENT_ID}][${queryId}] 🚀 Stage 2: Generating ${strategicAnalysis.strategic_opportunity} intelligence`);

            const generationUserPrompt = await createGenerationUserPrompt(
                strategicAnalysis,
                initialInterviewContext,
                knowledgeContext,
                previousAnalysisHistory
            );

            // ===== GENERATION PROMPT LOGGING =====
            logger.info(`[${COMPONENT_ID}][${queryId}] 📝 GENERATION SYSTEM PROMPT:`);
            logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ GENERATION SYSTEM (${createGenerationSystemPrompt.length} chars) ─┐`);
            console.log('\n🚀 GENERATION SYSTEM PROMPT:\n', createGenerationSystemPrompt, '\n');

            logger.info(`[${COMPONENT_ID}][${queryId}] 📝 GENERATION USER PROMPT:`);
            logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ GENERATION USER (${generationUserPrompt.length} chars) ─┐`);
            console.log('\n🎯 GENERATION USER PROMPT:\n', generationUserPrompt, '\n');

            const generationResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini' as OpenAIModelName,
                // model: 'o3-mini' as OpenAIModelName,
                messages: [
                    {
                        role: 'system',
                        // role: 'developer',
                        content: createGenerationSystemPrompt,
                    },
                    {
                        role: 'user',
                        content: generationUserPrompt,
                    },
                ],
                max_tokens: 1200,
                // max_completion_tokens: 1200,
                // temperature: 0.7, // Lower temperature for consistent strategic analysis
            });

            const strategicIntelligence = generationResponse.choices[0]?.message.content?.trim() || '';

            // ===== GENERATION OUTPUT LOGGING =====
            logger.info(`[${COMPONENT_ID}][${queryId}] 🚀 GENERATION STAGE OUTPUT:`);
            logger.info(`[${COMPONENT_ID}][${queryId}] ┌─ STRATEGIC INTELLIGENCE (${strategicIntelligence.length} chars) ─┐`);
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
                        lastAnalysis: strategicAnalysis, // Store strategic analysis for context
                        analysisHistory: updatedHistory, // Store updated history
                    },
                });

                logger.info(`[${COMPONENT_ID}][${queryId}] ✅ Strategic intelligence generated: ${strategicIntelligence.length} chars`);
                logger.info(`[${COMPONENT_ID}][${queryId}] 📚 Analysis history updated: ${updatedHistory.length} entries`);

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
                        previousAnalysisHistory.map((h: AnalysisPreview) => h.strategic_opportunity).join(', ') || 'None'
                    }`
                );
                logger.info(`[${COMPONENT_ID}][${queryId}] │ Total Process: Analysis → Generation`);
                logger.info(`[${COMPONENT_ID}][${queryId}] └─ SUCCESS ─┘`);

                // Log variety achievement
                const currentType = strategicAnalysis.strategic_opportunity;
                const previousTypes = previousAnalysisHistory.map((h: AnalysisPreview) => h.strategic_opportunity);
                const isUnique = !previousTypes.includes(currentType);
                logger.info(`[${COMPONENT_ID}][${queryId}] 🎯 Variety Check: ${isUnique ? '✅ UNIQUE' : '⚠️ REPEATED'} (${currentType})`);
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
        openai,
        knowledgeLoading,
        dispatch,
        latestUserMessageRef,
        conversationHistory,
        buildKnowledgeContext,
        state.conversationSuggestions.analysisHistory,
        conversationSummary,
        initialInterviewContext,
        handleError,
    ]);
}
// Enhanced buildKnowledgeContext with intelligent content selection
function BuildKnowledgeContext(
    searchRelevantFiles: (
        query: string,
        topK?: number
    ) => import('c:/Users/markrhysburke/Coding/full_stack_apps/archive/audio_transcription_app_typescript/src/contexts/KnowledgeProvider').KnowledgeFile[]
) {
    return useCallback(
        (userMessage: string): string => {
            const startTime = performance.now();

            // Get relevant files based on user query
            const relevantFiles = searchRelevantFiles(userMessage, 8); // Get more candidates

            if (relevantFiles.length === 0) {
                return 'No specific knowledge context found for this query.';
            }

            logger.debug(`[${COMPONENT_ID}] 🔍 Processing ${relevantFiles.length} relevant files`);

            // Extract keywords for content prioritization
            const keywords = userMessage
                .toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2)
                .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'can', 'how', 'what', 'when', 'where'].includes(word));

            // Smart content extraction function
            const extractRelevantContent = (content: string, fileName: string, maxChars: number = 1800): string => {
                const sections = content.split(/\n\s*\n/); // Split by paragraphs
                const scoredSections: Array<{ text: string; score: number; position: number }> = [];

                sections.forEach((section, index) => {
                    let score = 0;
                    const sectionLower = section.toLowerCase();

                    // Score based on keyword matches
                    keywords.forEach(keyword => {
                        const matches = (sectionLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
                        score += matches * 10;

                        // Partial matches
                        const partialMatches = (sectionLower.match(new RegExp(keyword, 'g')) || []).length - matches;
                        score += partialMatches * 2;
                    });

                    // Boost score for headers/titles (often start with # or are shorter)
                    if (section.startsWith('#') || section.length < 200) {
                        score += 5;
                    }

                    // Position bonus (earlier content often more important)
                    score += Math.max(0, 10 - index);

                    scoredSections.push({
                        text: section.trim(),
                        score,
                        position: index,
                    });
                });

                // Sort by score and build content within character limit
                const sortedSections = scoredSections
                    .filter(s => s.score > 0 || s.position < 3) // Keep high-scoring + early sections
                    .sort((a, b) => b.score - a.score);

                let selectedContent = '';
                let charCount = 0;

                for (const section of sortedSections) {
                    const sectionWithNewline = section.text + '\n\n';
                    if (charCount + sectionWithNewline.length <= maxChars) {
                        selectedContent += sectionWithNewline;
                        charCount += sectionWithNewline.length;
                    } else {
                        // Try to fit partial section if there's room
                        const remainingChars = maxChars - charCount - 50; // Leave room for "..."
                        if (remainingChars > 100) {
                            const partial = section.text.substring(0, remainingChars);
                            const lastSpace = partial.lastIndexOf(' ');
                            selectedContent += partial.substring(0, lastSpace > 0 ? lastSpace : remainingChars) + '...\n\n';
                        }
                        break;
                    }
                }

                return selectedContent.trim() || content.substring(0, maxChars) + '...';
            };

            // Calculate optimal character budget per file
            const targetTotalChars = 8000; // More generous budget
            const charsPerFile = Math.min(2000, Math.floor(targetTotalChars / Math.min(relevantFiles.length, 5)));

            // Process top 5 files with intelligent content selection
            const processedFiles = relevantFiles.slice(0, 5).map(file => {
                const relevantContent = extractRelevantContent(file.content, file.name, charsPerFile);
                const originalLength = file.content.length;
                const selectedLength = relevantContent.length;

                logger.debug(
                    `[${COMPONENT_ID}] 📄 ${file.name}: ${selectedLength}/${originalLength} chars (${Math.round(
                        (selectedLength / originalLength) * 100
                    )}% selected)`
                );

                return `**${file.name}**\n${relevantContent}`;
            });

            const context = processedFiles.join('\n\n---\n\n');
            const endTime = performance.now();

            logger.debug(
                `[${COMPONENT_ID}] ✅ Built intelligent context: ${context.length} chars from ${processedFiles.length} files in ${(
                    endTime - startTime
                ).toFixed(1)}ms`
            );

            return context;
        },
        [searchRelevantFiles]
    );
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
    console.log('\n🎭 SYSTEM PROMPT:\n', systemPrompt, '\n');

    logger.info(`[${COMPONENT_ID}][${queryId}] 📝 USER PROMPT CONSTRUCTED:`);
    logger.info(`[${COMPONENT_ID}][${queryId}] ┌─────────────────────────────────────────────────────────────────┐`);
    logger.info(`[${COMPONENT_ID}][${queryId}] │ USER PROMPT (${userPrompt.length} chars):`);
    logger.info(`[${COMPONENT_ID}][${queryId}] └─────────────────────────────────────────────────────────────────┘`);
    console.log('\n💬 USER PROMPT:\n', userPrompt, '\n');

    // Log prompt analytics
    // loglog.info(`Prompt Analytics: System=${systemPrompt.length}chars, User=${userPrompt.length}chars`, queryId);
    logger.debug(`[${COMPONENT_ID}][${queryId}] 📊 Total prompt size: ${systemPrompt.length + userPrompt.length} characters`);

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
