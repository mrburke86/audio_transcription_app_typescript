// src/app/chat/page.tsx
'use client';

import { ErrorState } from '@/components/global/StatusDisplay';
import { useLLMProviderOptimized, useTranscriptions } from '@/hooks';
import { logger } from '@/modules';
import { useCallback } from 'react';
import { useAudioVisualization, useChatInitialization, useChatState, useSpeechManager } from './_hooks';

// FIXED: Updated perf names (useMemoryUsageTracking, useComponentRenderCounter)
import { useComponentRenderCounter, useMemoryUsageTracking } from '@/hooks/usePerformanceTracking';
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
        useComponentRenderCounter('ChatPage-REFACTORED');
        useMemoryUsageTracking('ChatPage-REFACTORED');
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    useChatInitialization(false, true, true, initialInterviewContext, apiKey || '');

    const { conversationHistory } = useChatState([]);

    const {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        strategicSuggestions,
    } = useLLMProviderOptimized(apiKey || '', initialInterviewContext || null);

    const { userMessages, submitTranscripts, resetTranscripts, handleRecognitionResult } = useTranscriptions(); // FIXED: Updated names

    useChatState(userMessages);

    const { recognitionStatus, speechErrorMessage, start, stop, startAudioVisualization } =
        useSpeechManager(handleRecognitionResult);

    const { canvasRef, handleStart } = useAudioVisualization(start, startAudioVisualization);

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
