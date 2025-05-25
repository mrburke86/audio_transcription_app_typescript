// src/hooks/useLLMProvider.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/modules/Logger';

// Import our modular hooks and utilities
import { useOpenAIClient } from './useOpenAIClient';
import { useKnowledgeContext } from './useKnowledgeContext';
import { useStreamingResponse } from './useStreamingResponse';
import { PromptBuilder } from '@/utils/promptBuilder';
import { LLMErrorHandler } from '@/utils/errorHandler';
import { useConversationSummary } from './useConversationSummary';
import { useConversationSuggestions } from './useConversationSuggestions';
import { ConversationSuggestions, OpenAIClient, OpenAIModelName, Message } from '@/types';

const COMPONENT_ID = 'useLLMProvider';

interface LLMProviderHook {
    generateResponse: (userMessage: string) => Promise<void>;
    generateSuggestions: () => Promise<void>;
    isLoading: boolean;
    isGeneratingSuggestions: boolean;
    error: string | null;
    streamedContent: string;
    isStreamingComplete: boolean;
    conversationSummary: string;
    conversationSuggestions: ConversationSuggestions; // ✅ FIX: Use proper interface
    isSummarizing: boolean;
    clearSummary: () => void;
    openaiClient: OpenAIClient | null;
}

export const useLLMProvider = (
    apiKey: string,
    roleDescription: string,
    conversationHistory: Message[],
    goals: string[]
): LLMProviderHook => {
    // Local state for the main hook
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Composed hooks - each handling a specific responsibility
    const { client: openaiClient, isInitialized: clientInitialized, error: clientError, initializeClient } = useOpenAIClient(apiKey);

    const { buildContext, isKnowledgeReady, knowledgeError, knowledgeStats } = useKnowledgeContext();

    const { streamedContent, isStreamingComplete, isStreaming, handleStreamChunk, resetStream, startStreaming, completeStreaming } =
        useStreamingResponse();

    const { conversationSummary, isSummarizing, summarizeConversation, clearSummary } = useConversationSummary(openaiClient);

    const {
        conversationSuggestions,
        isGenerating: isSuggestionsLoading,
        error: suggestionsError, // ✅ FIX: Extract suggestions error
        generateSuggestions,
    } = useConversationSuggestions(openaiClient, conversationSummary, goals);

    // Initialize OpenAI client on mount
    useEffect(() => {
        if (apiKey && !clientInitialized && !clientError) {
            initializeClient();
        }
    }, [apiKey, clientInitialized, clientError, initializeClient]);

    // Log initialization and essential stats
    useEffect(() => {
        logger.info(`[${COMPONENT_ID}] 🚀 Initializing optimized chat system`);
        logger.info(`[${COMPONENT_ID}] 📝 Role Description: ${roleDescription}`);
        logger.info(`[${COMPONENT_ID}] 🗂️ Knowledge ready: ${isKnowledgeReady}`);

        if (isKnowledgeReady) {
            logger.info(
                `[${COMPONENT_ID}] 📚 Knowledge stats: ${knowledgeStats.totalFiles} files, ` +
                    `${knowledgeStats.totalWords.toLocaleString()} words`
            );
        }

        return () => {
            logger.info(`[${COMPONENT_ID}] 🧹 Cleaning up optimized chat`);
        };
    }, [roleDescription, isKnowledgeReady, knowledgeStats.totalFiles, knowledgeStats.totalWords]);

    // Main response generation function
    const generateResponse = useCallback(
        async (userMessage: string): Promise<void> => {
            // Validation
            if (!openaiClient) {
                const errorMsg = 'OpenAI client not initialized';
                setError(errorMsg);
                logger.error(`[${COMPONENT_ID}] ❌ ${errorMsg}`);
                return;
            }

            if (!isKnowledgeReady) {
                const errorMsg = knowledgeError || 'Knowledge base is still loading';
                setError(errorMsg);
                logger.error(`[${COMPONENT_ID}] ❌ Knowledge not ready: ${errorMsg}`);
                return;
            }

            // Reset state
            setIsLoading(true);
            setError(null);
            resetStream();

            logger.info(`[${COMPONENT_ID}] 🚀 Starting new request`);

            try {
                // 1. Build knowledge context
                const knowledgeContext = buildContext(userMessage);

                // 2. Build complete prompt
                const messages = PromptBuilder.buildCompletePrompt(
                    roleDescription,
                    goals,
                    conversationSummary,
                    knowledgeContext,
                    conversationHistory,
                    PromptBuilder.sanitizeUserInput(userMessage)
                );

                // 3. Validate prompt length
                if (!PromptBuilder.validatePromptLength(messages)) {
                    logger.warning(`[${COMPONENT_ID}] ⚠️ Prompt may be too long, proceeding anyway`);
                }

                // 4. Create and process stream
                startStreaming();

                const stream = await openaiClient.chat.completions.create({
                    model: 'gpt-4o' as OpenAIModelName,
                    messages: messages,
                    stream: true,
                    max_tokens: 2000,
                    temperature: 0.7,
                });

                // 5. Process stream chunks
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        handleStreamChunk(content);
                    }
                }

                // 6. Complete streaming
                completeStreaming();

                logger.info(`[${COMPONENT_ID}] 🎉 Response generation completed successfully`);
            } catch (err) {
                // Use centralized error handling
                const llmError = LLMErrorHandler.handleError(err, 'generateResponse');
                setError(llmError.userMessage);

                LLMErrorHandler.logError(err, 'generateResponse', undefined, {
                    userMessage: userMessage.substring(0, 100),
                    knowledgeReady: isKnowledgeReady,
                    clientInitialized,
                });

                completeStreaming(); // Ensure streaming state is reset
            } finally {
                setIsLoading(false);
            }
        },
        [
            openaiClient,
            isKnowledgeReady,
            knowledgeError,
            clientInitialized,
            buildContext,
            roleDescription,
            goals,
            conversationHistory,
            conversationSummary,
            resetStream,
            startStreaming,
            completeStreaming,
            handleStreamChunk,
        ]
    );

    // Auto-summarization effect
    useEffect(() => {
        if (conversationHistory.length >= 10 && isStreamingComplete && openaiClient && !isSummarizing) {
            logger.info(`[${COMPONENT_ID}] 📝 Auto-summarizing conversation (${conversationHistory.length} messages)`);
            summarizeConversation(conversationHistory);
        }
    }, [conversationHistory, isStreamingComplete, openaiClient, isSummarizing, summarizeConversation]);

    // Combine all possible errors
    const combinedError = error || clientError || knowledgeError || suggestionsError;

    // Loading state combines all loading states
    const combinedLoading = isLoading || isStreaming || !clientInitialized;

    return {
        generateResponse,
        generateSuggestions,
        isLoading: combinedLoading,
        isGeneratingSuggestions: isSuggestionsLoading,
        error: combinedError,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
        isSummarizing,
        clearSummary,
        openaiClient,
    };
};
