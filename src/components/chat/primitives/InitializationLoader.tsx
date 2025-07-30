// src/components/chat/primitives/InitializationLoader.tsx - ENHANCED VERSION
'use client';

import { Card, CardContent } from '@/components/ui';
import React from 'react';

interface InitializationLoaderProps {
    isRehydrated: boolean;
    isContextValid: boolean;
    isLLMReady: boolean;
    isKnowledgeBaseReady: boolean;
    error: string | null;
    onRetry?: () => void;
    onClearError?: () => void;
    hasErrors?: boolean;
}

export const InitializationLoader: React.FC<InitializationLoaderProps> = ({
    isRehydrated,
    isContextValid,
    isLLMReady,
    isKnowledgeBaseReady,
    error,
    onRetry,
    onClearError,
    hasErrors = false,
}) => {
    const steps = [
        {
            label: 'Restoring session',
            completed: isRehydrated,
            icon: '🔄',
            description: 'Loading previous conversation and settings',
        },
        {
            label: 'Validating context',
            completed: isContextValid,
            icon: '📋',
            description: 'Checking interview configuration',
        },
        {
            label: 'Initializing AI service',
            completed: isLLMReady,
            icon: '🤖',
            description: 'Connecting to language model',
        },
        {
            label: 'Loading knowledge base',
            completed: isKnowledgeBaseReady,
            icon: '📚',
            description: 'Preparing document search capabilities',
        },
    ];

    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <Card className="w-96 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="text-red-500 text-5xl mb-4">❌</div>
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">Initialization Failed</h2>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
                        <div className="flex gap-3 justify-center">
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                                >
                                    Retry
                                </button>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <Card className="w-96 shadow-lg">
                <CardContent className="p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Initializing Chat Interface</h2>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {completedSteps} of {totalSteps} steps completed
                        </p>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const isActive = !step.completed && steps.slice(0, index).every(s => s.completed);

                            return (
                                <div key={index} className="flex items-start space-x-3">
                                    <div
                                        className={`text-2xl mt-0.5 ${
                                            step.completed
                                                ? 'opacity-100'
                                                : isActive
                                                  ? 'opacity-75 animate-pulse'
                                                  : 'opacity-30'
                                        }`}
                                    >
                                        {step.completed ? '✅' : step.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div
                                            className={`font-medium ${
                                                step.completed
                                                    ? 'text-green-600'
                                                    : isActive
                                                      ? 'text-blue-600'
                                                      : 'text-gray-400'
                                            }`}
                                        >
                                            {step.label}
                                            {step.completed && ' ✓'}
                                            {isActive && '...'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasErrors && !error && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center">
                                <div className="text-yellow-600 text-sm">
                                    ⚠️ Some services may have limited functionality
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
