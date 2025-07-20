// src/app/chat/page.tsx
'use client';

import { ErrorState } from '@/components/global/StatusDisplay';
import { useAudioVisualization, useSpeechManager, useTranscriptions } from '@/hooks';
import { logger } from '@/lib/Logger';
import { StoreState, useBoundStore } from '@/stores/chatStore';
import { useCallback, useEffect } from 'react';

import { ChatProtectionWrapper } from '@/components/ChatProtectionWrapper';
import { ChatInterface } from '../../components/chat/ChatInterface';

export default function ChatPage() {
    return (
        <ChatProtectionWrapper>
            <ChatPageContent />
        </ChatProtectionWrapper>
    );
}

const ChatPageContent: React.FC<{
    initialInterviewContext?: any;
    knowledgeBaseName?: string;
    indexedDocumentsCount?: number;
}> = ({ initialInterviewContext, knowledgeBaseName, indexedDocumentsCount }) => {
    if (process.env.NODE_ENV === 'development') {
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    const { initializeLLMService } = useBoundStore();

    useEffect(() => {
        initializeLLMService(apiKey);
    }, [apiKey, initializeLLMService]);

    // FIXED: Use chat store for LLM-related state and actions (typed selector to resolve 'any')
    const {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        strategicSuggestions,
    } = useBoundStore((state: StoreState) => ({
        // FIXED: Typed state as State for explicit typing
        generateResponse: state.generateResponse,
        generateSuggestions: state.generateSuggestions,
        isLoading: state.llmLoading,
        error: state.llmError,
        streamedContent: state.streamedContent,
        isStreamingComplete: state.isStreamingComplete,
        conversationSummary: state.conversationSummary,
        strategicSuggestions: state.strategicSuggestions,
    }));

    // FIXED: Replaced useChatState with direct store access for conversationHistory
    const conversationHistory = useBoundStore(state => state.conversationHistory);

    const { userMessages, submitTranscripts, resetTranscripts, handleRecognitionResult } = useTranscriptions(); // FIXED: Updated names

    // FIXED: Removed useChatState call - unnecessary; if state consistency needed, implement in store

    const { recognitionStatus, speechErrorMessage, start, stop, startAudioVisualization } =
        useSpeechManager(handleRecognitionResult);

    const { canvasRef, handleStart } = useAudioVisualization(start, startAudioVisualization);

    // Handle Suggest Generation
    const handleSuggest = useCallback(async () => {
        try {
            await generateSuggestions();
        } catch (genError) {
            logger.error(`Error generating suggestions: ${(genError as Error).message}`);
        }
    }, [generateSuggestions]);

    const handleContextInfo = useCallback(() => {
        if (initialInterviewContext) {
            logger.info('📋 Current context:', {
                role: initialInterviewContext.targetRole,
                company: initialInterviewContext.targetCompany,
                type: initialInterviewContext.interviewType,
                goals: initialInterviewContext.goals?.length || 0,
                experiences: initialInterviewContext.emphasizedExperiences?.length || 0,
            });
        }
    }, [initialInterviewContext]);

    if (error) {
        return (
            <ErrorState
                title="AI Provider Error"
                message={error}
                onRetry={() => window.location.reload()}
                showTroubleshooting={true}
            />
        );
    }
    useEffect(() => {
        logger.info('[PAGE] 👋 Chat page mounted');
        return () => logger.info('[PAGE] 👋 Chat page unmounted');
    }, []);

    return (
        <ChatInterface
            initialInterviewContext={initialInterviewContext}
            knowledgeBaseName={knowledgeBaseName || ''}
            indexedDocumentsCount={indexedDocumentsCount || 0}
            recognitionStatus={recognitionStatus}
            speechErrorMessage={speechErrorMessage}
            canvasRef={canvasRef}
            userMessages={userMessages}
            streamedContent={streamedContent}
            isStreamingComplete={isStreamingComplete}
            conversationSummary={conversationSummary}
            conversationSuggestions={strategicSuggestions}
            isLoading={isLoading}
            handleStart={handleStart}
            handleStop={stop}
            handleClear={resetTranscripts} // FIXED: Updated
            handleMove={submitTranscripts} // FIXED: Updated
            handleSuggest={handleSuggest}
            handleContextInfo={handleContextInfo}
        />
    );
};
