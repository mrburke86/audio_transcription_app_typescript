// src/components/error-boundary/ErrorBoundary.tsx
'use client';

import { logger } from '@/lib/Logger';
import type { ErrorBoundaryProps, ErrorFallbackProps } from '@/types';
import React from 'react';
import { ErrorFallback } from './ErrorFallback';

/* -------------------------------------------------
   Local state type
-------------------------------------------------- */
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    retryCount: number;
}

/* -------------------------------------------------
   Component
-------------------------------------------------- */
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState // 🛠 correct generic (was “ErrorBoundary”)
> {
    private retryTimeoutId: NodeJS.Timeout | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, retryCount: 0 };
    }

    /* ---------- lifecycle ---------- */

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        logger.error(`💥 Error Boundary: ${error.message}`, {
            error: error.message,
            stack: error.stack,
            component: errorInfo.componentStack,
        });

        this.props.onError?.(error, errorInfo);

        /* auto‑retry (max 2) */
        if (this.shouldAutoRetry(error) && this.state.retryCount < 2) {
            this.scheduleRetry();
        }
    }

    componentWillUnmount() {
        if (this.retryTimeoutId) clearTimeout(this.retryTimeoutId);
    }

    /* ---------- helpers ---------- */

    private shouldAutoRetry(err: Error) {
        const msg = err.message.toLowerCase();
        return msg.includes('fetch') || msg.includes('network') || msg.includes('api') || msg.includes('timeout');
    }

    private scheduleRetry() {
        this.retryTimeoutId = setTimeout(
            this.retry,
            1_000 * (this.state.retryCount + 1) // 1 s, 2 s
        );
    }

    private retry = () => {
        logger.info(`🔄 Error Boundary: Retry #${this.state.retryCount + 1}`);
        this.setState(s => ({
            hasError: false,
            error: null,
            retryCount: s.retryCount + 1,
        }));
    };

    private reset = () => {
        logger.info('🔄 Error Boundary: Manual reset');
        this.setState({ hasError: false, error: null, retryCount: 0 });
    };

    /* ---------- render ---------- */

    render() {
        if (!this.state.hasError || !this.state.error) {
            return this.props.children;
        }

        const retryFn = this.state.retryCount < 2 ? this.retry : undefined;

        /* custom fallback supplied? */
        if (this.props.fallback) {
            const Fallback = this.props.fallback;
            const props: ErrorFallbackProps = {
                error: this.state.error,
                resetErrorBoundary: this.reset,
                ...(retryFn && { retry: retryFn }), // 🛠 omit “retry” when undefined
            };
            return <Fallback {...props} />;
        }

        /* default fallback */
        return (
            <ErrorFallback
                error={this.state.error}
                resetErrorBoundary={this.reset}
                {...(retryFn && { retry: retryFn })} /* 🛠 same conditional spread */
            />
        );
    }
}

/* -------------------------------------------------
   HOC wrapper
-------------------------------------------------- */
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

/* -------------------------------------------------
   Hook
-------------------------------------------------- */
export const useErrorBoundary = () => {
    const [, setState] = React.useState<never>();
    return React.useCallback((err: Error) => {
        setState(() => {
            throw err;
        });
    }, []);
};
