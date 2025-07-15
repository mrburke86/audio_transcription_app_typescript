// src/hooks/llm-hooks/useConversationSummarizer.ts
// FIXED: Internal conversationHistory with selector; clean deps.
'use client';

import { useChatStore } from '@/stores/chatStore';
import { ChatMessageParam, ILLMService, InitialInterviewContext } from '@/types';
import { createSummarisationSystemPrompt, createSummarisationUserPrompt } from '@/utils';
import { useCallback, useEffect, useRef } from 'react';

interface UseConversationSummarizerProps {
    llmService: ILLMService | null;
    initialInterviewContext: InitialInterviewContext | null;
    isStreamingComplete: boolean;
    isLoading: boolean;
    // REMOVED: conversationHistory - internal
}

export const useConversationSummarizer = ({
    llmService,
    initialInterviewContext,
    isStreamingComplete,
    isLoading,
}: UseConversationSummarizerProps) => {
    const lastSummarizedLengthRef = useRef<number>(0);

    const conversationHistory = useChatStore(state => state.conversationHistory); // FIXED: Internal

    const setLoading = useChatStore(state => state.setLoading);
    const setConversationSummary = useChatStore(state => state.setConversationSummary);

    const summarizeConversation = useCallback(async (): Promise<void> => {
        if (!llmService || conversationHistory.length === 0 || !initialInterviewContext) return;

        setLoading(true);
        const conversationText = conversationHistory
            .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');
        const summarisationUserPrompt = createSummarisationUserPrompt(conversationText, initialInterviewContext, '');
        const messages: ChatMessageParam[] = [
            { role: 'system', content: createSummarisationSystemPrompt },
            { role: 'user', content: summarisationUserPrompt },
        ];
        const newSummarySegment = await llmService.generateCompleteResponse(messages, {
            model: 'gpt-4o-mini',
            temperature: 0.5,
        });
        setConversationSummary(newSummarySegment);
        setLoading(false);
    }, [llmService, initialInterviewContext, conversationHistory]);

    useEffect(() => {
        if (conversationHistory.length > lastSummarizedLengthRef.current && isStreamingComplete && !isLoading) {
            summarizeConversation().then(() => (lastSummarizedLengthRef.current = conversationHistory.length));
        }
    }, [conversationHistory, isStreamingComplete, isLoading, summarizeConversation]);

    return summarizeConversation;
};
