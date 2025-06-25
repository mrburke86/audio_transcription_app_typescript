// src/components/error-boundary/ErrorBoundary.tsx
'use client';

import React from 'react';
import { enhancedLogger } from '@/modules/EnhancedLogger';
import { errorHandler } from '@/utils/enhancedErrorHandler';
import { ErrorBoundaryProps } from '@/types';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    retryCount: number;
    errorId?: string;
    lastErrorTime?: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private retryTimeoutId: NodeJS.Timeout | null = null;
    private readonly componentName: string;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            retryCount: 0,
        };

        // Try to get component name from props or use a default
        this.componentName = this.getComponentName();
    }

    private getComponentName(): string {
        // Try to extract component name from the component tree
        if (React.Children.count(this.props.children) === 1) {
            const child = React.Children.only(this.props.children) as any;
            if (child?.type?.displayName) return child.type.displayName;
            if (child?.type?.name) return child.type.name;
        }
        return 'UnknownComponent';
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
            lastErrorTime: Date.now(),
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const startTime = performance.now();

        try {
            // Create enhanced error with full context
            const enhancedError = errorHandler.handleError(
                error,
                {
                    operation: 'React Component Render',
                    component: `ErrorBoundary-${this.componentName}`,
                    metadata: {
                        componentStack: errorInfo.componentStack,
                        errorBoundary: this.constructor.name,
                        retryCount: this.state.retryCount,
                        propsKeys: Object.keys(this.props),
                        hasCustomFallback: !!this.props.fallback,
                        showDetails: this.props.showDetails,
                        renderTime: performance.now() - startTime,
                    },
                },
                { rethrow: false, notify: false }
            ); // Don't auto-notify, we'll handle it

            // Store error ID for tracking
            this.setState({
                errorId: enhancedError.errorId,
            });

            // Enhanced logging with component context
            enhancedLogger.errorBoundary(`Component error caught in ${this.componentName}`, error, {
                errorId: enhancedError.errorId,
                componentName: this.componentName,
                retryCount: this.state.retryCount,
                errorType: error.name,
                errorMessage: error.message,
                componentStack: this.extractComponentNames(errorInfo.componentStack),
            });

            // Call custom error handler if provided
            if (this.props.onError) {
                try {
                    this.props.onError(error, errorInfo);
                } catch (customHandlerError) {
                    enhancedLogger.errorBoundary(
                        'Error in custom error handler',
                        customHandlerError instanceof Error
                            ? customHandlerError
                            : new Error(String(customHandlerError)),
                        { originalErrorId: enhancedError.errorId }
                    );
                }
            }

            // Enhanced auto-retry logic
            if (this.shouldAutoRetry(error) && this.state.retryCount < 2) {
                enhancedLogger.component('info', 'Scheduling auto-retry for recoverable error', {
                    errorId: enhancedError.errorId,
                    retryAttempt: this.state.retryCount + 1,
                    maxRetries: 2,
                    errorType: error.name,
                });

                this.scheduleRetry();
            } else if (this.state.retryCount >= 2) {
                enhancedLogger.component('warning', 'Max retry attempts reached', {
                    errorId: enhancedError.errorId,
                    totalAttempts: this.state.retryCount + 1,
                    finalError: error.message,
                });
            }

            // Notify user about the error
            this.notifyUser(enhancedError);
        } catch (boundaryError) {
            // Fallback logging if enhanced error handling fails
            console.error('💥 Error Boundary: Critical failure in error handling', {
                originalError: error.message,
                boundaryError: boundaryError instanceof Error ? boundaryError.message : String(boundaryError),
                component: this.componentName,
                stack: error.stack,
            });
        }
    }

    private extractComponentNames(componentStack: string): string[] {
        // Extract component names from the stack for better debugging
        const lines = componentStack.split('\n');
        const components: string[] = [];

        for (const line of lines) {
            const match = line.trim().match(/^(?:at\s+)?(\w+)/);
            if (match && match[1] && !['div', 'span', 'p', 'h1', 'h2', 'h3'].includes(match[1])) {
                components.push(match[1]);
            }
        }

        return components.slice(0, 5); // Limit to top 5 components
    }

    private shouldAutoRetry(error: Error): boolean {
        const message = error.message.toLowerCase();
        const name = error.name.toLowerCase();

        // Check for recent duplicate errors (don't retry too quickly)
        const now = Date.now();
        if (this.state.lastErrorTime && now - this.state.lastErrorTime < 1000) {
            enhancedLogger.component('warning', 'Rapid error occurrence detected, skipping auto-retry', {
                timeSinceLastError: now - this.state.lastErrorTime,
                errorMessage: error.message,
            });
            return false;
        }

        // Define retryable error patterns
        const retryablePatterns = [
            'fetch',
            'network',
            'api',
            'timeout',
            'loading',
            'chunkloaderror',
            'scripterror',
            'loading css chunk',
        ];

        const retryableErrorTypes = ['networkerror', 'timeouterror', 'aborterror'];

        return (
            retryablePatterns.some(pattern => message.includes(pattern)) ||
            retryableErrorTypes.some(type => name.includes(type))
        );
    }

    private scheduleRetry(): void {
        const delay = 1000 * (this.state.retryCount + 1); // 1s, 2s delay

        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }

        this.retryTimeoutId = setTimeout(() => {
            this.retry();
        }, delay);

        enhancedLogger.component('debug', 'Retry scheduled', {
            delay,
            attempt: this.state.retryCount + 1,
            errorId: this.state.errorId,
        });
    }

    private retry = (): void => {
        const newRetryCount = this.state.retryCount + 1;

        enhancedLogger.component('info', `Attempting error recovery`, {
            retryAttempt: newRetryCount,
            errorId: this.state.errorId,
            componentName: this.componentName,
        });

        this.setState({
            hasError: false,
            error: null,
            retryCount: newRetryCount,
            lastErrorTime: undefined,
        });
    };

    private reset = (): void => {
        enhancedLogger.component('info', 'Manual error boundary reset', {
            previousErrorId: this.state.errorId,
            componentName: this.componentName,
            retryCount: this.state.retryCount,
        });

        this.setState({
            hasError: false,
            error: null,
            retryCount: 0,
            errorId: undefined,
            lastErrorTime: undefined,
        });
    };

    private notifyUser(enhancedError: any): void {
        // Try to notify through the app's notification system
        if (typeof window !== 'undefined') {
            try {
                const store = (globalThis as any).__appStore?.getState?.();
                if (store?.addNotification) {
                    // Different messages based on error type
                    let userMessage = 'An unexpected error occurred';

                    if (this.shouldAutoRetry(enhancedError.originalError || enhancedError)) {
                        userMessage =
                            this.state.retryCount < 2
                                ? 'Connection issue detected, retrying...'
                                : 'Connection problems persist. Please refresh the page.';
                    } else {
                        userMessage = `Error in ${this.componentName}. Please try refreshing the page.`;
                    }

                    store.addNotification({
                        type: 'error',
                        message: userMessage,
                        duration: this.state.retryCount >= 2 ? 10000 : 5000,
                    });
                }
            } catch (notificationError) {
                enhancedLogger.component('warning', 'Failed to show error notification', {
                    notificationError:
                        notificationError instanceof Error ? notificationError.message : String(notificationError),
                    originalErrorId: enhancedError.errorId,
                });
            }
        }
    }

    componentWillUnmount(): void {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
            this.retryTimeoutId = null;
        }

        // Log cleanup for debugging
        if (this.state.hasError) {
            enhancedLogger.component('debug', 'Error boundary unmounting with active error', {
                errorId: this.state.errorId,
                componentName: this.componentName,
                retryCount: this.state.retryCount,
            });
        }
    }

    render(): React.ReactNode {
        if (this.state.hasError && this.state.error) {
            // Enhanced error context for fallback component
            const errorContext = {
                errorId: this.state.errorId,
                componentName: this.componentName,
                retryCount: this.state.retryCount,
                canRetry: this.state.retryCount < 2,
                isRetryable: this.shouldAutoRetry(this.state.error),
            };

            // Use custom fallback if provided
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return (
                    <FallbackComponent
                        error={this.state.error}
                        resetErrorBoundary={this.reset}
                        retry={this.state.retryCount < 2 ? this.retry : undefined}
                    />
                );
            }

            // Use default fallback with enhanced context
            return (
                <ErrorFallback
                    error={this.state.error}
                    resetErrorBoundary={this.reset}
                    retry={this.state.retryCount < 2 ? this.retry : undefined}
                />
            );
        }

        return this.props.children;
    }
}

// Enhanced HOC wrapper with better display names
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<any>
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
};

// Enhanced hook to manually trigger errors with context
export const useErrorBoundary = () => {
    const [, setState] = React.useState();

    return React.useCallback((error: Error, context?: Record<string, unknown>) => {
        // Log the manual error trigger
        enhancedLogger.component('warning', 'Manual error boundary trigger', {
            errorMessage: error.message,
            context,
            stackTrace: error.stack,
        });

        setState(() => {
            throw error;
        });
    }, []);
};

// Helper hook for component-level error reporting
export const useErrorReporting = (componentName: string) => {
    const triggerError = useErrorBoundary();

    const reportError = React.useCallback(
        (error: Error | unknown, operation: string, metadata?: Record<string, unknown>) => {
            const enhancedError = errorHandler.handleError(
                error,
                {
                    operation,
                    component: componentName,
                    metadata,
                },
                { rethrow: false }
            );

            enhancedLogger.component('error', `Error in ${componentName}.${operation}`, {
                errorId: enhancedError.errorId,
                componentName,
                operation,
                ...metadata,
            });

            return enhancedError;
        },
        [componentName]
    );

    const reportAndThrow = React.useCallback(
        (error: Error | unknown, operation: string, metadata?: Record<string, unknown>) => {
            const enhancedError = reportError(error, operation, metadata);
            triggerError(enhancedError.originalError || new Error(enhancedError.message), {
                errorId: enhancedError.errorId,
                operation,
                componentName,
                ...metadata,
            });
        },
        [reportError, triggerError, componentName]
    );

    return {
        reportError,
        reportAndThrow,
        triggerError,
    };
};
