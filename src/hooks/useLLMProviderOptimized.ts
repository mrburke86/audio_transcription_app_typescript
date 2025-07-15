// src/hooks/useLLMProviderOptimized.ts
// FIXED: Stripped perf (trackRender, useRenderMetrics); removed DetailedPromptLogging (excessive—fix TS2353 by omitting in call); enhanced handleError with stack traces; clean deps/error-only logging.
'use client';

import { useKnowledge } from '@/contexts/KnowledgeProvider';
import { logger } from '@/modules';
import { OpenAILLMService } from '@/services/OpenAILLMService';
import { useChatStore } from '@/stores/chatStore';
import { ILLMService, InitialInterviewContext, UseLLMHookReturn } from '@/types';
import { useEffect, useState } from 'react';
import { useConversationSummarizer } from './llm-hooks/useConversationSummarizer';
import { useResponseGenerator } from './llm-hooks/useResponseGenerator';
import { useStrategicSuggestionsGenerator } from './llm-hooks/useStrategicSuggestionsGenerator';

export const useLLMProviderOptimized = (
    apiKey: string,
    initialInterviewContext: InitialInterviewContext | null
): UseLLMHookReturn => {
    const [llmService, setLlmService] = useState<ILLMService | null>(null);
    const { searchRelevantKnowledge, isLoading: knowledgeLoading, error: knowledgeLoadError } = useKnowledge();

    // Zustand selectors/actions
    const conversationHistory = useChatStore(state => state.conversationHistory);
    const conversationSummary = useChatStore(state => state.conversationSummary);
    const strategicSuggestions = useChatStore(state => state.strategicSuggestions);
    const isLoading = useChatStore(state => state.isLoading);
    const error = useChatStore(state => state.error);
    const streamedContent = useChatStore(state => state.streamedContent);
    const isStreamingComplete = useChatStore(state => state.isStreamingComplete);
    const setLoading = useChatStore(state => state.setLoading);
    const setError = useChatStore(state => state.setError);

    const buildKnowledgeContext = async (query: string) => {
        const chunks = await searchRelevantKnowledge(query, 3);
        return chunks.map(chunk => `--- From ${chunk.source} ---\n${chunk.text}\n---`).join('\n\n');
    };

    const handleError = (errorInstance: unknown, queryId: string = 'general', context: string = 'LLMProvider') => {
        let errorMessage = 'An unexpected error occurred.';
        let stackTrace = '';
        if (errorInstance instanceof Error) {
            errorMessage = errorInstance.message;
            stackTrace = errorInstance.stack || '';
            const errorText = errorMessage.toLowerCase();
            if (errorText.includes('invalid_api_key') || errorText.includes('api key'))
                errorMessage = 'Invalid API key.';
            else if (errorText.includes('rate_limit_exceeded')) errorMessage = 'Rate limit exceeded.';
            else if (errorText.includes('network')) errorMessage = 'Network error.';
        } else {
            errorMessage = 'Unknown error occurred.';
        }
        logger.error(
            `[useLLMProviderOptimized][${queryId}] ❌ Error in ${context}: ${errorMessage}\nStack: ${stackTrace}`
        );
        return errorMessage;
    };

    useEffect(() => {
        if (apiKey) setLlmService(new OpenAILLMService(apiKey));
    }, [apiKey]);

    const generateResponse = useResponseGenerator({
        llmService,
        knowledgeLoading,
        knowledgeLoadError,
        initialInterviewContext,
        goals: initialInterviewContext?.goals || [],
        buildKnowledgeContext,
        handleError,
        // REMOVED: DetailedPromptLogging (excessive descriptive)
    });

    const generateSuggestions = useStrategicSuggestionsGenerator({
        llmService,
        isKnowledgeLoading: knowledgeLoading,
        initialInterviewContext,
        buildKnowledgeContext,
        handleError,
    });

    const summarizeConversation = useConversationSummarizer({
        llmService,
        initialInterviewContext,
        isStreamingComplete,
        isLoading,
    });

    return {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        strategicSuggestions,
    };
};
