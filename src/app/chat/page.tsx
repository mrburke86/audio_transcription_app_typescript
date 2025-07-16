// src/app/chat/page.tsx
'use client';

import { ErrorState } from '@/components/global/StatusDisplay';
import {
    useAudioVisualization,
    useChatInitialization,
    useChatState,
    useSpeechManager,
    useTranscriptions,
} from '@/hooks';
import { logger } from '@/lib/Logger';
import { useChatStore } from '@/stores/chatStore'; // FIXED: Use store for state/actions
import { useCallback } from 'react';

import { ChatInterface } from './_components/ChatInterface';
import { ChatProtectionWrapper } from './_components/ChatProtectionWrapper';

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
        // useComponentRenderCounter('ChatPage-REFACTORED');
        // useMemoryUsageTracking('ChatPage-REFACTORED');
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    useChatInitialization(false, true, true, initialInterviewContext, apiKey || '');

    // FIXED: Use chat store for LLM-related state and actions
    const {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        strategicSuggestions,
    } = useChatStore(state => ({
        generateResponse: state.generateResponse,
        generateSuggestions: state.generateSuggestions,
        isLoading: state.isLoading,
        error: state.error,
        streamedContent: state.streamedContent,
        isStreamingComplete: state.isStreamingComplete,
        conversationSummary: state.conversationSummary,
        strategicSuggestions: state.strategicSuggestions,
    }));

    const { conversationHistory } = useChatState([]);

    const { userMessages, submitTranscripts, resetTranscripts, handleRecognitionResult } = useTranscriptions(); // FIXED: Updated names

    useChatState(userMessages);

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
