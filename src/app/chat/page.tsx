'use client';

import { ErrorState } from '@/components/global/StatusDisplay';
import { useLLMProviderOptimized, useTranscriptions } from '@/hooks';
import { logger } from '@/modules';
import { useCallback } from 'react';
import { useAudioVisualization, useChatInitialization, useChatState, useSpeechManager } from './_hooks';

// ✅ Performance tracking (optional - can be disabled in production)
import { useMemoryTracking, useRenderCounter } from '@/hooks/usePerformanceTracking';
import { ChatInterface } from './_components/ChatInterface';
import { ChatProtectionWrapper } from './_components/ChatProtectionWrapper';
import { useIsolatedTranscriptions } from './_hooks/useIsolatedTranscriptions';

export default function ChatPage() {
    return (
        <ChatProtectionWrapper>
            <ChatPageContent />
        </ChatProtectionWrapper>
    );
}

// ✅ Separate content component that receives props from wrapper
const ChatPageContent: React.FC<{
    initialInterviewContext?: any;
    knowledgeBaseName?: string;
    indexedDocumentsCount?: number;
}> = ({ initialInterviewContext, knowledgeBaseName, indexedDocumentsCount }) => {
    // ✅ Performance tracking (only in development)
    if (process.env.NODE_ENV === 'development') {
        useRenderCounter('ChatPage-REFACTORED');
        useMemoryTracking('ChatPage-REFACTORED');
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // ✅ Single responsibility hooks - each handles one concern
    useChatInitialization(false, true, true, initialInterviewContext, apiKey || '');

    // ✅ State management - isolated conversation history
    const { conversationHistory } = useChatState([]);

    // ✅ LLM Provider - handles AI responses and streaming
    const {
        generateResponse,
        generateSuggestions,
        isLoading,
        error,
        streamedContent,
        isStreamingComplete,
        conversationSummary,
        conversationSuggestions,
    } = useLLMProviderOptimized(apiKey || '', initialInterviewContext || null, conversationHistory);

    const isolatedTranscriptions = useIsolatedTranscriptions();

    // ✅ Transcriptions - handles user input
    const { userMessages, handleMove, handleClear, handleRecognitionResult } = useTranscriptions({
        generateResponse,
        streamedContent,
        isStreamingComplete,
        isolatedTranscriptions,
    });

    // ✅ Update conversation history from user messages
    useChatState(userMessages);

    // ✅ Speech management - isolated speech recognition logic
    const { recognitionStatus, speechErrorMessage, start, stop, startAudioVisualization } =
        useSpeechManager(handleRecognitionResult);

    // ✅ Audio visualization - isolated canvas management
    const { canvasRef, handleStart } = useAudioVisualization(start, startAudioVisualization);

    // ✅ Event handlers - clean, isolated responsibilities
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

    // ✅ Handle LLM errors (only error not handled by wrapper)
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

    // ✅ Render clean interface with isolated concerns
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
            isolatedTranscriptions={isolatedTranscriptions}
            conversationSummary={conversationSummary}
            conversationSuggestions={conversationSuggestions}
            isLoading={isLoading}
            handleStart={handleStart}
            handleStop={stop}
            handleClear={handleClear}
            handleMove={handleMove}
            handleSuggest={handleSuggest}
            handleContextInfo={handleContextInfo}
        />
    );
};
