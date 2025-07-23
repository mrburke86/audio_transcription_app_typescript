// src/components/chat/KnowledgeIndicator.tsx
'use client';

import { useBoundStore } from '@/stores/chatStore';
import React, { useRef } from 'react';

interface KnowledgeIndicatorProps {
    className?: string;
}

export const KnowledgeIndicator: React.FC<KnowledgeIndicatorProps> = ({ className = '' }) => {
    // Render Counter for diagnostics
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`🧮 [DIAG] KnowledgeIndicator Component rendered ${renderCount.current} times`);

    const { knowledgeLoading, indexedDocumentsCount, knowledgeError } = useBoundStore();

    // Don't show if knowledge base is not initialized or empty
    if (indexedDocumentsCount === 0 || knowledgeError) {
        return null;
    }

    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            {knowledgeLoading ? (
                <>
                    <div className="animate-pulse">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>
                    <span className="text-blue-600">Searching knowledge base...</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="text-gray-600">Knowledge base active ({indexedDocumentsCount} documents)</span>
                </>
            )}
        </div>
    );
};

// Mini version for inline use
export const KnowledgeIndicatorMini: React.FC<{ active?: boolean }> = ({ active = false }) => {
    // Render Counter for diagnostics
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`🧮 [DIAG] ChatInterface rendered ${renderCount.current} times`);

    const { indexedDocumentsCount } = useBoundStore();

    if (indexedDocumentsCount === 0 || !active) {
        return null;
    }

    return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100-2H6V7h5a1 1 0 011 1v5h2V8a3 3 0 00-3-3H4z"
                    clipRule="evenodd"
                />
            </svg>
            KB
        </span>
    );
};
