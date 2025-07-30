// src/components/chat/areas/TopNavigationArea.tsx
'use client';

import { InlineErrorBoundary } from '@/components/error-boundary';
import { TopNavigationBar } from '@/components/global/TopNavigationBar';
import { useSpeechSession } from '@/hooks';
import { useBoundStore } from '@/stores/chatStore';
import { DEFAULT_INTERVIEW_CONTEXT } from '@/types';
import React, { useCallback, useMemo } from 'react';

export const TopNavigationArea: React.FC = () => {
    const { initialContext, knowledgeBaseName, indexedDocumentsCount, navigateToContextCapture } = useBoundStore();

    const { recognitionStatus, speechErrorMessage } = useSpeechSession();

    const context = initialContext || DEFAULT_INTERVIEW_CONTEXT;
    const knowledgeBase = knowledgeBaseName || 'Knowledge Base';
    const documentCount = indexedDocumentsCount || 0;

    // ✅ CONTEXT INFO HANDLERS
    const handleSetupContext = useCallback(() => {
        console.log('🔧 Navigating to context setup...');
        navigateToContextCapture();
    }, [navigateToContextCapture]);

    const handleViewContextInfo = useCallback(() => {
        console.log('📋 Showing context information...');

        // Create a formatted context display
        const contextInfo = {
            'Target Role': context.targetRole,
            'Target Company': context.targetCompany,
            'Interview Type': context.interviewType,
            Industry: context.industry,
            'Seniority Level': context.seniorityLevel,
            'Company Size': context.companySizeType,
            Goals: context.goals?.join(', ') || 'None set',
            'Response Style': `${context.responseConfidence} confidence, ${context.responseStructure} structure`,
            'Include Metrics': context.includeMetrics ? 'Yes' : 'No',
            'Context Depth': `${context.contextDepth}/10`,
        };

        // Display context in a nice alert format
        const formattedInfo = Object.entries(contextInfo)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        alert(
            `Current Interview Context:\n\n${formattedInfo}\n\nTo modify this context, click "Setup Required" to navigate to the context editor.`
        );

        // TODO: Replace with proper modal/popup component in the future
        // For now, using alert for immediate functionality
    }, [context]);

    // Only memoize expensive context button creation
    const contextButton = useMemo(() => {
        if (!context.targetRole || !context.targetCompany) {
            return {
                targetRole: 'Setup Required',
                targetCompany: 'No Company',
                onClick: handleSetupContext, // ✅ Navigate to setup
            };
        }
        return {
            targetRole: context.targetRole,
            targetCompany: context.targetCompany,
            onClick: handleViewContextInfo, // ✅ Show context info
        };
    }, [context.targetRole, context.targetCompany, handleSetupContext, handleViewContextInfo]);

    return (
        <div className="flex-shrink-0 bg-background border-b shadow-sm" style={{ minHeight: '110px' }}>
            <InlineErrorBoundary>
                <div className="px-4 py-2">
                    <TopNavigationBar
                        status={recognitionStatus}
                        errorMessage={speechErrorMessage}
                        knowledgeBaseName={knowledgeBase}
                        indexedDocumentsCount={documentCount}
                        contextButton={contextButton}
                    />
                </div>
            </InlineErrorBoundary>
        </div>
    );
};
