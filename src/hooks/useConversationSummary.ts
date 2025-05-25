// src/hooks/useConversationSummary.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { OpenAIClient, OpenAIModelName, Message } from '@/types/openai';
import { logger } from '@/modules/Logger';

interface UseConversationSummaryReturn {
    conversationSummary: string;
    isSummarizing: boolean;
    summarizeConversation: (history: Message[]) => Promise<void>;
    clearSummary: () => void;
}

export const useConversationSummary = (openaiClient: OpenAIClient | null): UseConversationSummaryReturn => {
    const [conversationSummary, setConversationSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    const summarizationInProgressRef = useRef(false);

    const summarizeConversation = useCallback(
        async (history: Message[]): Promise<void> => {
            if (summarizationInProgressRef.current || !openaiClient || history.length < 1) {
                return;
            }

            summarizationInProgressRef.current = true;
            setIsSummarizing(true);

            try {
                logger.info(`[useConversationSummary] 📝 Starting conversation summarization (${history.length} messages)`);

                const conversationText = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');

                // ✅ IMPROVED: Better summarization prompt
                const summaryPrompt = `You are an AI assistant trained to create concise conversation summaries.

Please provide a focused summary of the following conversation. Focus on:
- Key topics and themes discussed
- Important decisions or conclusions reached
- Progress toward stated goals
- Current context and direction

Keep the summary concise (2-3 sentences) but comprehensive enough to provide context for future responses.

Conversation:
${conversationText}

Summary:`;

                const modelName: OpenAIModelName = 'gpt-4o-mini';
                const response = await openaiClient.chat.completions.create({
                    model: modelName,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that creates concise, accurate conversation summaries.',
                        },
                        { role: 'user', content: summaryPrompt },
                    ],
                    max_tokens: 200, // ✅ IMPROVED: Slightly more room (was 150)
                    temperature: 0.3, // ✅ IMPROVED: Lower for consistency (was 0.5)
                });

                const summary = response.choices[0]?.message.content?.trim() || '';

                if (summary) {
                    setConversationSummary(summary);
                    logger.info(`[useConversationSummary] ✅ Summary generated (${summary.length} chars)`);
                } else {
                    logger.warning(`[useConversationSummary] ⚠️ Empty summary received`);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger.error(`[useConversationSummary] ❌ Error summarizing: ${errorMessage}`);
            } finally {
                summarizationInProgressRef.current = false;
                setIsSummarizing(false);
            }
        },
        [openaiClient]
    );

    const clearSummary = useCallback(() => {
        setConversationSummary('');
        logger.info('[useConversationSummary] 🧹 Summary cleared');
    }, []);

    return {
        conversationSummary,
        isSummarizing,
        summarizeConversation,
        clearSummary,
    };
};
