// src/components/error-boundary/ErrorBoundary.tsx
'use client';

import React from 'react';
import { logger } from '@/modules/Logger';
import { ErrorBoundaryProps } from '@/types';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    retryCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private retryTimeoutId: NodeJS.Timeout | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            retryCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error
        logger.error(`💥 Error Boundary: ${error.message}`, {
            error: error.message,
            stack: error.stack,
            component: errorInfo.componentStack,
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Auto-retry for network/API errors (max 2 times)
        if (this.shouldAutoRetry(error) && this.state.retryCount < 2) {
            this.scheduleRetry();
        }
    }

    private shouldAutoRetry(error: Error): boolean {
        const message = error.message.toLowerCase();
        return (
            message.includes('fetch') ||
            message.includes('network') ||
            message.includes('api') ||
            message.includes('timeout')
        );
    }

    private scheduleRetry() {
        this.retryTimeoutId = setTimeout(() => {
            this.retry();
        }, 1000 * (this.state.retryCount + 1)); // 1s, 2s delay
    }

    private retry = () => {
        logger.info(`🔄 Error Boundary: Retry attempt ${this.state.retryCount + 1}`);

        this.setState({
            hasError: false,
            error: null,
            retryCount: this.state.retryCount + 1,
        });
    };

    private reset = () => {
        logger.info('🔄 Error Boundary: Manual reset');

        this.setState({
            hasError: false,
            error: null,
            retryCount: 0,
        });
    };

    componentWillUnmount() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
    }

    render() {
        if (this.state.hasError && this.state.error) {
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

            // Use default fallback
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

// Simple HOC wrapper
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

// Hook to manually trigger errors
export const useErrorBoundary = () => {
    const [, setState] = React.useState();

    return React.useCallback((error: Error) => {
        setState(() => {
            throw error;
        });
    }, []);
};
