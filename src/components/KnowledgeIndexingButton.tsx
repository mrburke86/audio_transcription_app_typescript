// src\components\KnowledgeIndexingButton.tsx
'use client';

import React, { useState } from 'react';
import { useKnowledge as useKnowledgeStore } from '@/stores/hooks/useSelectors';
import { logger } from '@/modules/Logger';

interface KnowledgeIndexingButtonProps {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
    className?: string;
}

export const KnowledgeIndexingButton: React.FC<KnowledgeIndexingButtonProps> = ({
    variant = 'primary',
    size = 'md',
    showProgress = true,
    className = '',
}) => {
    const { triggerIndexing, indexingStatus, indexedDocumentsCount, lastIndexedAt } = useKnowledgeStore();
    const [showDetails, setShowDetails] = useState(false);

    const handleIndexing = async () => {
        logger.info('🎯 User triggered knowledge indexing from UI');

        try {
            const success = await triggerIndexing();

            if (success) {
                logger.info('✅ Knowledge indexing completed successfully via UI trigger');
            } else {
                logger.warning('⚠️ Knowledge indexing completed with errors via UI trigger');
            }
        } catch (error) {
            logger.error('❌ Knowledge indexing failed via UI trigger:', error);
        }
    };

    // Dynamic button styling
    const baseClasses =
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-sm rounded-md',
        lg: 'px-6 py-3 text-base rounded-lg',
    };

    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    // Button content based on state
    const getButtonContent = () => {
        if (indexingStatus.isIndexing) {
            return (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Indexing...
                </>
            );
        }

        if (indexedDocumentsCount === 0) {
            return (
                <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                    </svg>
                    Index Knowledge
                </>
            );
        }

        return (
            <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
                Re-index Knowledge
            </>
        );
    };

    return (
        <div className="space-y-3">
            {/* Main Button */}
            <button
                onClick={handleIndexing}
                disabled={indexingStatus.isIndexing}
                className={buttonClasses}
                title={indexingStatus.isIndexing ? 'Indexing in progress...' : 'Index knowledge base files'}
            >
                {getButtonContent()}
            </button>

            {/* Progress Display */}
            {showProgress && (
                <div className="space-y-2">
                    {/* Status Display */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">📊 {indexedDocumentsCount} items indexed</span>
                        {lastIndexedAt && (
                            <span className="text-gray-500">Last: {lastIndexedAt.toLocaleTimeString()}</span>
                        )}
                    </div>

                    {/* Progress Text */}
                    {indexingStatus.progress && (
                        <div
                            className={`text-sm p-2 rounded ${
                                indexingStatus.isIndexing
                                    ? 'bg-blue-50 text-blue-700'
                                    : indexingStatus.errors.length > 0
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : 'bg-green-50 text-green-700'
                            }`}
                        >
                            {indexingStatus.progress}
                        </div>
                    )}

                    {/* Processing Details */}
                    {indexingStatus.isIndexing && indexingStatus.filesProcessed > 0 && (
                        <div className="text-xs text-gray-500">
                            Processed: {indexingStatus.filesProcessed}/{indexingStatus.totalFiles} files
                        </div>
                    )}

                    {/* Error Summary */}
                    {indexingStatus.errors.length > 0 && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                            >
                                {indexingStatus.errors.length} error(s) - {showDetails ? 'Hide' : 'Show'} details
                            </button>

                            {showDetails && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 max-h-32 overflow-y-auto">
                                    {indexingStatus.errors.map((error, index) => (
                                        <div key={index} className="mb-1">
                                            • {error}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Debug Information (only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700">Debug Info</summary>
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(
                            {
                                indexedCount: indexedDocumentsCount,
                                isIndexing: indexingStatus.isIndexing,
                                lastIndexed: lastIndexedAt?.toISOString(),
                                errorCount: indexingStatus.errors.length,
                            },
                            null,
                            2
                        )}
                    </pre>
                </details>
            )}
        </div>
    );
};
