// src/components/error-boundary/ErrorFallback.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ErrorFallbackProps } from '@/types';
import { RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary, retry }) => {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        if (!retry) return;
        setIsRetrying(true);
        try {
            await retry();
        } finally {
            setIsRetrying(false);
        }
    };

    const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
    const isAPIError = error.message.includes('API') || error.message.includes('429');

    return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
            <div className="max-w-md w-full">
                {/* Error Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Something went wrong
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {isNetworkError
                                        ? 'Connection issue detected'
                                        : isAPIError
                                        ? 'Service temporarily unavailable'
                                        : 'An unexpected error occurred'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            {isNetworkError
                                ? 'Please check your internet connection and try again.'
                                : isAPIError
                                ? 'Our services are experiencing high demand. Please try again in a moment.'
                                : 'This usually resolves quickly. Try refreshing or resetting the component.'}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {retry && (
                                <button
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex-1 justify-center"
                                >
                                    <RefreshCw className={cn('w-4 h-4', isRetrying && 'animate-spin')} />
                                    {isRetrying ? 'Retrying...' : 'Try Again'}
                                </button>
                            )}

                            <button
                                onClick={resetErrorBoundary}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex-1 justify-center"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Details (dev only) */}
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                            Error Details (Development)
                        </summary>
                        <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                            {error.message}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
};

// Simple inline error for smaller components
export const InlineErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary, retry }) => {
    return (
        <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    {error.message.length > 50 ? `${error.message.substring(0, 50)}...` : error.message}
                </p>
                <div className="flex gap-2 justify-center">
                    {retry && (
                        <button
                            onClick={retry}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Retry
                        </button>
                    )}
                    <button
                        onClick={resetErrorBoundary}
                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};
