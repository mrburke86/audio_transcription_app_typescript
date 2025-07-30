// src/components/error-boundary/EnhancedErrorFallback.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClassifiedError, RecoveryStrategy } from '@/lib/errorClassification';
import { Home, Phone, RefreshCw, RotateCcw, Settings } from 'lucide-react';
import React, { useState } from 'react';

interface EnhancedErrorFallbackProps {
    classifiedError: ClassifiedError;
    retryCount: number;
    maxRetries: number;
    isRecovering: boolean;
    onRetry: () => void;
    onReset: () => void;
    onRecoveryStrategy: (strategy: RecoveryStrategy) => void;
}

export const EnhancedErrorFallback: React.FC<EnhancedErrorFallbackProps> = ({
    classifiedError,
    retryCount,
    maxRetries,
    isRecovering,
    onRetry,
    onReset,
    onRecoveryStrategy,
}) => {
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

    const getIconForCategory = () => {
        switch (classifiedError.category) {
            case 'network':
                return '🌐';
            case 'api':
                return '⚡';
            case 'speech':
                return '🎤';
            case 'permission':
                return '🔒';
            case 'storage':
                return '💾';
            default:
                return '⚠️';
        }
    };

    const getSeverityColor = () => {
        switch (classifiedError.severity) {
            case 'low':
                return 'border-yellow-200 bg-yellow-50';
            case 'medium':
                return 'border-orange-200 bg-orange-50';
            case 'high':
                return 'border-red-200 bg-red-50';
            case 'critical':
                return 'border-red-300 bg-red-100';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const canRetry = classifiedError.isRetryable && retryCount < maxRetries;

    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className={`max-w-lg w-full ${getSeverityColor()}`}>
                <CardHeader className="text-center pb-4">
                    <div className="text-4xl mb-2">{getIconForCategory()}</div>
                    <h2 className="text-xl font-semibold text-gray-900">{classifiedError.userMessage}</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Error Category:{' '}
                        {classifiedError.category.charAt(0).toUpperCase() + classifiedError.category.slice(1)}
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Suggested Actions */}
                    {classifiedError.suggestedActions.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">What you can do:</h3>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {classifiedError.suggestedActions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recovery Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        {canRetry && (
                            <Button
                                onClick={onRetry}
                                disabled={isRecovering}
                                variant="default"
                                size="sm"
                                className="w-full"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
                                {isRecovering ? 'Retrying...' : `Retry (${retryCount}/${maxRetries})`}
                            </Button>
                        )}

                        <Button onClick={onReset} variant="secondary" size="sm" className="w-full">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>

                        {classifiedError.recoveryStrategies.includes(RecoveryStrategy.NAVIGATE_HOME) && (
                            <Button
                                onClick={() => onRecoveryStrategy(RecoveryStrategy.NAVIGATE_HOME)}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        )}

                        {classifiedError.recoveryStrategies.includes(RecoveryStrategy.CONTACT_SUPPORT) && (
                            <Button
                                onClick={() => onRecoveryStrategy(RecoveryStrategy.CONTACT_SUPPORT)}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Support
                            </Button>
                        )}
                    </div>

                    {/* Technical Details Toggle */}
                    {process.env.NODE_ENV === 'development' && (
                        <div>
                            <Button
                                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                variant="ghost"
                                size="sm"
                                className="w-full"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
                            </Button>

                            {showTechnicalDetails && (
                                <div className="mt-3 p-3 bg-gray-100 rounded-md">
                                    <p className="text-xs font-mono text-gray-700 break-all">
                                        {classifiedError.technicalMessage}
                                    </p>
                                    {classifiedError.originalError.stack && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-gray-600 cursor-pointer">
                                                Stack Trace
                                            </summary>
                                            <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                                                {classifiedError.originalError.stack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
