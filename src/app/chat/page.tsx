// src/app/chat/page.tsx - FULL IMPLEMENTATION WITH LOADING STATES
'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { InitializationLoader } from '@/components/chat/primitives/InitializationLoader';
import { useInitialization } from '@/hooks';

export default function ChatPage() {
    const {
        isFullyInitialized,
        isRehydrated,
        isContextValid,
        isLLMReady,
        isKnowledgeBaseReady,
        error,
        hasErrors,
        knowledgeBaseError,
        retry,
        clearError,
    } = useInitialization({
        autoRedirect: true, // Automatically redirect to context setup if invalid
        skipKnowledgeBase: false, // Initialize knowledge base
    });

    // Show loading screen during initialization
    if (!isFullyInitialized) {
        return (
            <InitializationLoader
                isRehydrated={isRehydrated}
                isContextValid={isContextValid}
                isLLMReady={isLLMReady}
                isKnowledgeBaseReady={isKnowledgeBaseReady}
                error={error || knowledgeBaseError}
                onRetry={retry}
                onClearError={clearError}
                hasErrors={hasErrors}
            />
        );
    }

    // Show main chat interface when fully initialized
    return <ChatInterface />;
}
