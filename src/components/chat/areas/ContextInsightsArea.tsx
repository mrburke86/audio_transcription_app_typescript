// src/components/chat/areas/ContextInsightsArea.tsx
'use client';

import { ConversationContext, ConversationInsights } from '@/components/chat';
import { AIErrorBoundary } from '@/components/error-boundary';
import { useBoundStore } from '@/stores/chatStore';
import { DEFAULT_INTERVIEW_CONTEXT } from '@/types';
import React from 'react';

export const ContextInsightsArea: React.FC = () => {
    const { initialContext, conversationSummary, strategicSuggestions, llmLoading, generateSuggestions } =
        useBoundStore();

    const context = initialContext || DEFAULT_INTERVIEW_CONTEXT;

    return (
        <div className="grid grid-rows-2 gap-2 w-full">
            <div className="overflow-hidden scroll-smooth">
                <ConversationContext summary={conversationSummary} goals={context.goals || []} />
            </div>

            <div className="overflow-hidden scroll-smooth">
                <AIErrorBoundary>
                    <ConversationInsights
                        suggestions={strategicSuggestions}
                        onSuggest={generateSuggestions}
                        isLoading={llmLoading}
                    />
                </AIErrorBoundary>
            </div>
        </div>
    );
};
