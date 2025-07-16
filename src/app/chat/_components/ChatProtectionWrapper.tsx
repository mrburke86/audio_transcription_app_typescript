// src\app\chat\_components\ChatProtectionWrapper.tsx
import { ErrorState, LoadingState } from '@/components/global/StatusDisplay';
import { useKnowledge } from '@/contexts';
import { logger } from '@/modules';
import React from 'react';
import { useChatProtection } from '../../../hooks/useChatProtection';

interface ChatProtectionWrapperProps {
    children: React.ReactNode;
}

export const ChatProtectionWrapper: React.FC<ChatProtectionWrapperProps> = ({ children }) => {
    const { protectionStatus, initialInterviewContext } = useChatProtection();

    const {
        isLoading: knowledgeLoading,
        error: knowledgeError,
        indexedDocumentsCount,
        knowledgeBaseName,
    } = useKnowledge();

    // ✅ Handle protection states first
    switch (protectionStatus) {
        case 'loading':
            return (
                <LoadingState
                    message="Validating Interview Session..."
                    subMessage="Checking your setup and permissions."
                />
            );

        case 'denied':
            return (
                <ErrorState
                    title="Access Denied"
                    message="You need to complete interview setup before accessing the chat."
                    onRetry={() => (window.location.href = '/capture-context')}
                />
            );

        case 'invalid-context':
        case 'missing-context':
            logger.error('❌ No interview context available in chat page - redirecting to setup');
            return (
                <ErrorState
                    title="Setup Required"
                    message="Interview context is missing. Please complete the setup process."
                    onRetry={() => (window.location.href = '/capture-context')}
                />
            );
    }

    // ✅ Handle knowledge states
    if (knowledgeLoading) {
        return (
            <LoadingState
                message="Preparing Knowledge Base..."
                subMessage="This might take a moment on first access."
            />
        );
    }

    if (knowledgeError) {
        return (
            <ErrorState
                title="Knowledge Base Error"
                message={knowledgeError}
                onRetry={() => window.location.reload()}
                showTroubleshooting={true}
            />
        );
    }

    // ✅ Pass context and knowledge data to children via cloneElement
    return React.cloneElement(children as React.ReactElement, {
        initialInterviewContext,
        knowledgeBaseName,
        indexedDocumentsCount,
    });
};
