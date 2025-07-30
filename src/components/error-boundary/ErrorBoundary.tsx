// src/components/error-boundary/ErrorBoundary.tsx - REMOVE UNUSED METHOD
'use client';

import { ClassifiedError, classifyError } from '@/lib/errorClassification';
import { logger } from '@/lib/Logger';
import type { ErrorBoundaryProps, ErrorFallbackProps } from '@/types';
import React from 'react';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryState {
    hasError: boolean;
    classifiedError: ClassifiedError | null;
    retryCount: number;
    isRecovering: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private retryTimeoutId: NodeJS.Timeout | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            classifiedError: null,
            retryCount: 0,
            isRecovering: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        const classifiedError = classifyError(error);
        return {
            hasError: true,
            classifiedError,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const { context = 'Unknown', onError } = this.props;
        const classified = classifyError(error);

        logger.error(`💥 Error Boundary [${context}]:`, {
            error: error.message,
            category: classified.category,
            severity: classified.severity,
            componentStack: errorInfo.componentStack,
            context,
        });

        onError?.(error, errorInfo);
    }

    componentWillUnmount() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
    }

    // ✅ REMOVED executeRecoveryStrategy - not used in simplified approach

    private retry = async () => {
        const maxRetries = this.props.maxRetries || 3;

        if (this.state.retryCount >= maxRetries) {
            logger.warning(`Max retries (${maxRetries}) exceeded`);
            return;
        }

        logger.info(`🔄 Retrying... (attempt ${this.state.retryCount + 1}/${maxRetries})`);

        this.setState(prevState => ({
            hasError: false,
            classifiedError: null,
            retryCount: prevState.retryCount + 1,
        }));
    };

    private reset = () => {
        logger.info('🔄 Resetting error boundary');
        this.setState({
            hasError: false,
            classifiedError: null,
            retryCount: 0,
            isRecovering: false,
        });
    };

    render(): React.ReactNode {
        if (!this.state.hasError || !this.state.classifiedError) {
            return this.props.children;
        }

        const Fallback = this.props.fallback || ErrorFallback;
        const canRetry = this.state.classifiedError.isRetryable && this.state.retryCount < (this.props.maxRetries || 3);

        const retryFn = canRetry
            ? () => {
                  this.retry();
              }
            : undefined;

        return (
            <Fallback
                error={this.state.classifiedError.originalError}
                resetErrorBoundary={this.reset}
                {...(retryFn && { retry: retryFn })}
            />
        );
    }
}

// ✅ HOC WRAPPER
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<ErrorFallbackProps>
) => {
    const Wrapped = (props: P) => (
        <ErrorBoundary {...(fallback && { fallback })}>
            <Component {...props} />
        </ErrorBoundary>
    );

    Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return Wrapped;
};

// ✅ HOOK
export const useErrorBoundary = () => {
    const [, setState] = React.useState<never>();
    return React.useCallback((err: Error) => {
        setState(() => {
            throw err;
        });
    }, []);
};
