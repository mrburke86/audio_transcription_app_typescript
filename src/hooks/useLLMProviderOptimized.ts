// src/hooks/useLLMProviderOptimized.ts
'use client';

import { useState, useCallback, useReducer, useEffect, useRef } from 'react';
import { logger } from '@/modules/Logger';
import type OpenAI from 'openai';
import { Message } from '@/types/Message';
import { OpenAIModelName } from '@/types/openai-models';
// import { usePerformance, ExtendedPerformanceEntry } from '@/contexts/PerformanceContext';
import { v4 as uuidv4 } from 'uuid';
import { loglog } from '@/modules/log-log';
// import { performanceTracker } from '@/modules/PerformanceTracker';
// import { EnhancedPerformanceOperations } from '@/global';
import { useKnowledge } from '@/contexts/KnowledgeProvider';
// import { createUserMessage } from '@/utils/createUserMessage';
import { createSystemPrompt } from '@/utils/createSystemPrompt';
import { createUserPrompt } from '@/utils/createUserPrompt';

const COMPONENT_ID = 'useLLMProviderOptimized';

interface ConversationSuggestions {
    questions: string[];
    statements: string[];
}

interface LLMProviderHook {
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions;
}

interface LLMState {
    isLoading: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions;
}

type LLMAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'APPEND_STREAMED_CONTENT'; payload: string }
    | { type: 'RESET_STREAMED_CONTENT' }
    | { type: 'SET_STREAMING_COMPLETE'; payload: boolean }
    | { type: 'SET_CONVERSATION_SUMMARY'; payload: string }
    | {
          type: 'SET_CONVERSATION_SUGGESTIONS';
          payload: ConversationSuggestions;
      };

const initialState: LLMState = {
    isLoading: false,
    error: null,
    streamedContent: '',
    isStreamingComplete: false,
    conversationSummary: '',
    conversationSuggestions: {
        questions: [],
        statements: [],
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
    roleDescription: string,
    conversationHistory: Message[],
    goals: string[]
): LLMProviderHook => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [openai, setOpenai] = useState<OpenAI | null>(null);

    // Use knowledge context for file access
    const { searchRelevantFiles, isLoading: knowledgeLoading, error: knowledgeError } = useKnowledge();

    const streamedContentRef = useRef<string>('');
    const firstChunkReceivedRef = useRef<boolean>(false);

    const { isLoading, error, streamedContent, isStreamingComplete, conversationSummary, conversationSuggestions } = state;

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
            loglog.error(`Error in ${context}: ${errorMessage}`, queryId);
        } else {
            logger.error(`[${COMPONENT_ID}][${queryId}] ❌ Unknown error in ${context}`);
            loglog.error('Unknown error occurred.', queryId);
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
    const generateResponse = useCallback(
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
            loglog.info('🚀 Starting optimized response generation', queryId);

            try {
                // Build knowledge context (this replaces the file search)
                const knowledgeContext = buildKnowledgeContext(userMessage);

                // Build complete prompt with context
                const systemPrompt = await createSystemPrompt(roleDescription, goals);
                const userPrompt = await createUserPrompt(userMessage, state.conversationSummary, knowledgeContext);

                // ===== ENHANCED PROMPT LOGGING =====
                DetailedPromptLogging(queryId, systemPrompt, userPrompt, roleDescription, goals, state, knowledgeContext, userMessage);

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
                loglog.info(`Response completed: ${streamedContentRef.current.length} characters`, queryId);
            } catch (err) {
                handleError(err, queryId);
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [knowledgeLoading, knowledgeError, buildKnowledgeContext, roleDescription, goals, state, openai, handleError]
    );

    // Simplified suggestions generation (same pattern as main response)
    const generateSuggestions = useCallback(async (): Promise<void> => {
        if (!openai || knowledgeLoading) return;

        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const conversationText = conversationHistory
                .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                .join('\n');

            logger.debug(`Conversation Text\n\n${conversationText}`);

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini' as OpenAIModelName,
                messages: [
                    {
                        role: 'system',
                        content: `Generate 3 relevant questions and 3 relevant statements based on the conversation. 
                        Return as JSON: {"questions": ["..."], "statements": ["..."]}`,
                    },
                    {
                        role: 'user',
                        content: `Conversation:\n${conversationText}\n\nGoals: ${goals.join(', ')}`,
                    },
                ],
                max_tokens: 300,
                temperature: 0.7,
            });

            const content = response.choices[0]?.message.content?.trim() || '';

            try {
                const parsed = JSON.parse(content);
                dispatch({
                    type: 'SET_CONVERSATION_SUGGESTIONS',
                    payload: {
                        questions: parsed.questions || [],
                        statements: parsed.statements || [],
                    },
                });
            } catch {
                // Fallback if JSON parsing fails
                dispatch({
                    type: 'SET_CONVERSATION_SUGGESTIONS',
                    payload: { questions: [], statements: [] },
                });
            }
        } catch (err) {
            handleError(err, 'suggestions', 'generateSuggestions');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [openai, conversationHistory, goals, knowledgeLoading, handleError]);

    // Auto-summarization (simplified)
    const summarizeConversation = useCallback(
        async (history: Message[]): Promise<void> => {
            if (!openai || history.length === 0) return;

            try {
                const conversationText = history.map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');

                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini' as OpenAIModelName,
                    messages: [
                        {
                            role: 'system',
                            content: 'Provide a concise summary of this conversation focusing on key points and decisions.',
                        },
                        { role: 'user', content: conversationText },
                    ],
                    max_tokens: 500,
                    temperature: 0.5,
                });

                const summary = response.choices[0]?.message.content?.trim() || '';
                dispatch({
                    type: 'SET_CONVERSATION_SUMMARY',
                    payload: summary,
                });
            } catch (err) {
                logger.error(`[${COMPONENT_ID}] ❌ Error summarizing: ${(err as Error).message}`);
            }
        },
        [openai]
    );

    // Auto-summarization effect
    useEffect(() => {
        // Trigger summarization with lower threshold and more conditions
        const shouldSummarize =
            conversationHistory.length >= 1 && // Reduced from 10 to 4
            isStreamingComplete &&
            conversationHistory.length % 1 === 0; // Update every 4 messages

        if (shouldSummarize) {
            logger.info(`[${COMPONENT_ID}] 🔄 Triggering summarization for ${conversationHistory.length} messages`);
            summarizeConversation(conversationHistory);
        }
    }, [conversationHistory, isStreamingComplete, summarizeConversation]);

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
function DetailedPromptLogging(
    queryId: string,
    systemPrompt: string,
    userPrompt: string,
    roleDescription: string,
    goals: string[],
    state: LLMState,
    knowledgeContext: string,
    userMessage: string
) {
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
    loglog.info(`Prompt Analytics: System=${systemPrompt.length}chars, User=${userPrompt.length}chars`, queryId);
    logger.debug(`[${COMPONENT_ID}][${queryId}] 📊 Total prompt size: ${systemPrompt.length + userPrompt.length} characters`);

    // Log key prompt components for debugging
    logger.debug(`[${COMPONENT_ID}][${queryId}] 🔍 Prompt Components:`);
    logger.debug(`[${COMPONENT_ID}][${queryId}]   • Role: ${roleDescription.substring(0, 50)}...`);
    logger.debug(`[${COMPONENT_ID}][${queryId}]   • Goals: ${goals.length} items`);
    logger.debug(`[${COMPONENT_ID}][${queryId}]   • Conversation Summary: ${state.conversationSummary.length} chars`);
    logger.debug(`[${COMPONENT_ID}][${queryId}]   • Knowledge Context: ${knowledgeContext.length} chars`);
    logger.debug(`[${COMPONENT_ID}][${queryId}]   • User Message: "${userMessage}"`);
}
