// src/app/chat/page.tsx
'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { useConsolidatedSpeech } from '@/hooks/useConsolidatedSpeech';
import { useBoundStore } from '@/stores/chatStore';
import { useCallback, useEffect } from 'react';

export default function ChatPage() {
    // Store selectors
    const {
        // Context
        initialContext,
        isContextValid,
        navigateToContextCapture,

        // Knowledge
        initializeKnowledgeBase,
        knowledgeBaseName,
        indexedDocumentsCount,

        // LLM
        initializeLLMService,
        generateResponse,
        generateSuggestions,
        streamedContent,
        isStreamingComplete,
        llmLoading,

        // Chat
        conversationHistory,
        // addUserMessage,

        // UI
        conversationSummary,
        strategicSuggestions,
    } = useBoundStore();

    // Speech hook - using correct method names
    const {
        // State
        recognitionStatus,
        speechErrorMessage,
        canvasRef,

        // Actions
        startRecording,
        stopRecording,
        clearTranscriptions,
        submitTranscriptionToChat,
    } = useConsolidatedSpeech();

    // Initialize services on mount
    useEffect(() => {
        // Check context validity
        if (!isContextValid()) {
            console.warn('Invalid context, redirecting to context capture');
            navigateToContextCapture();
            return;
        }

        // Initialize LLM service
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        if (apiKey) {
            initializeLLMService(apiKey);
        } else {
            console.error('OpenAI API key not found');
        }

        // Initialize knowledge base
        initializeKnowledgeBase().catch(error => {
            console.error('Failed to initialize knowledge base:', error);
        });
    }, [isContextValid, navigateToContextCapture, initializeLLMService, initializeKnowledgeBase]);

    // Handlers
    const handleStart = useCallback(async () => {
        await startRecording();
    }, [startRecording]);

    const handleStop = useCallback(() => {
        stopRecording();
    }, [stopRecording]);

    const handleClear = useCallback(() => {
        clearTranscriptions();
    }, [clearTranscriptions]);

    const handleMove = useCallback(async () => {
        // Submit transcript and get the final transcript from the store
        await submitTranscriptionToChat();

        // Get the last user message that was just added
        const messages = conversationHistory;
        const lastUserMessage = messages.filter(m => m.type === 'user').pop();

        if (lastUserMessage) {
            // Generate AI response for the last user message
            await generateResponse(lastUserMessage.content);
        }
    }, [submitTranscriptionToChat, conversationHistory, generateResponse]);

    const handleSuggest = useCallback(async () => {
        await generateSuggestions();
    }, [generateSuggestions]);

    const handleContextInfo = useCallback(() => {
        // Could show a modal or navigate to context page
        console.log('Context info requested:', initialContext);
    }, [initialContext]);

    // Filter user messages
    const userMessages = conversationHistory.filter(msg => msg.type === 'user' || msg.type === 'assistant');

    return (
        <ChatInterface
            initialInterviewContext={initialContext}
            knowledgeBaseName={knowledgeBaseName}
            indexedDocumentsCount={indexedDocumentsCount}
            recognitionStatus={recognitionStatus}
            speechErrorMessage={speechErrorMessage}
            canvasRef={canvasRef}
            userMessages={userMessages}
            streamedContent={streamedContent}
            isStreamingComplete={isStreamingComplete}
            conversationSummary={conversationSummary}
            conversationSuggestions={strategicSuggestions}
            isLoading={llmLoading}
            handleStart={handleStart}
            handleStop={handleStop}
            handleClear={handleClear}
            handleMove={handleMove}
            handleSuggest={handleSuggest}
            handleContextInfo={handleContextInfo}
        />
    );
}
