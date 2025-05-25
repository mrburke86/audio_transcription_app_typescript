// src/hooks/useConversationSuggestions.ts
import { useState, useCallback } from 'react';
import { logger } from '@/modules/Logger';
import { LLMErrorHandler } from '@/utils/errorHandler';
import { PromptBuilder } from '@/utils/promptBuilder';
import { ConversationSuggestions, OpenAIClient } from '@/types';

// export interface ConversationSuggestions {
//     questions: string[];
//     statements: string[];
// }

interface UseConversationSuggestionsReturn {
    conversationSuggestions: ConversationSuggestions; // ✅ FIX: Use proper interface
    isGenerating: boolean;
    error: string | null;
    generateSuggestions: () => Promise<void>;
    clearSuggestions: () => void;
}

export const useConversationSuggestions = (
    client: OpenAIClient | null,
    conversationSummary: string,
    goals: string[]
): UseConversationSuggestionsReturn => {
    const [suggestions, setSuggestions] = useState<ConversationSuggestions>({
        questions: [],
        statements: [],
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSuggestions = useCallback(async () => {
        if (!client) {
            const errorMsg = 'OpenAI client not available';
            setError(errorMsg);
            logger.error(`[useConversationSuggestions] ❌ ${errorMsg}`);
            return;
        }

        if (!conversationSummary || conversationSummary.trim() === '') {
            logger.info('[useConversationSuggestions] 💡 No conversation summary for suggestions');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            logger.info('[useConversationSuggestions] 🚀 Generating conversation suggestions');

            const response = await client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Generate 3 relevant questions and 3 relevant statements based on the conversation. 
                        Return as JSON: {"questions": ["..."], "statements": ["..."]}`,
                    },
                    {
                        role: 'user',
                        content: `Conversation:\n${conversationSummary}\n\nGoals: ${goals.join(', ')}`,
                    },
                ],
                max_tokens: 400,
                temperature: 0.8,
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No suggestions received from OpenAI');
            }

            // Parse the structured response using PromptBuilder
            const parsed = PromptBuilder.parseSuggestionsResponse(content);
            setSuggestions(parsed); // ✅ FIX: Set the structured object directly

            logger.info(
                `[useConversationSuggestions] ✅ Generated ${parsed.questions.length} questions, ${parsed.statements.length} statements`
            );
        } catch (err) {
            const llmError = LLMErrorHandler.handleError(err, 'generateSuggestions');
            setError(llmError.userMessage);

            LLMErrorHandler.logError(err, 'generateSuggestions', undefined, {
                summaryLength: conversationSummary.length,
                goalsCount: goals.length,
            });
        } finally {
            setIsGenerating(false);
        }
    }, [client, conversationSummary, goals]); // ✅ FIX: Add goals to dependency array

    const clearSuggestions = useCallback(() => {
        setSuggestions({ questions: [], statements: [] });
        setError(null);
    }, []);

    return {
        conversationSuggestions: suggestions, // ✅ FIX: Return structured object
        isGenerating,
        error,
        generateSuggestions,
        clearSuggestions,
    };
};
