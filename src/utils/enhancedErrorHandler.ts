// src/utils/enhancedErrorHandler.ts

import { enhancedLogger } from '@/modules/EnhancedLogger';

export interface ErrorContext {
    operation: string;
    component?: string;
    slice?: string;
    metadata?: Record<string, unknown>;
    userAction?: string;
    url?: string;
    timestamp?: string;
}

export interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    shouldRetry?: (error: Error, attempt: number) => boolean;
}

export class EnhancedError extends Error {
    public readonly context: ErrorContext;
    public readonly originalError?: Error;
    public readonly errorId: string;
    public readonly timestamp: string;

    constructor(message: string, context: ErrorContext, originalError?: Error) {
        super(message);
        this.name = 'EnhancedError';
        this.context = context;
        this.originalError = originalError;
        this.errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.timestamp = new Date().toISOString();

        // Preserve original stack trace
        if (originalError?.stack) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }

    public toJSON() {
        return {
            errorId: this.errorId,
            name: this.name,
            message: this.message,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack,
            originalError: this.originalError
                ? {
                      name: this.originalError.name,
                      message: this.originalError.message,
                      stack: this.originalError.stack,
                  }
                : undefined,
        };
    }
}

export class EnhancedErrorHandler {
    private static instance: EnhancedErrorHandler;
    private errorReports: EnhancedError[] = [];
    private readonly maxReports = 100;

    private constructor() {}

    public static getInstance(): EnhancedErrorHandler {
        if (!this.instance) {
            this.instance = new EnhancedErrorHandler();
        }
        return this.instance;
    }

    /**
     * Handle and log errors with full context
     */
    public handleError(
        error: Error | unknown,
        context: ErrorContext,
        options: { rethrow?: boolean; notify?: boolean } = {}
    ): EnhancedError {
        const { rethrow = false, notify = true } = options;

        // Convert to standardized error
        const standardError = this.standardizeError(error);
        const enhancedError = new EnhancedError(
            `${context.operation}: ${standardError.message}`,
            context,
            standardError
        );

        // Store error report
        this.storeErrorReport(enhancedError);

        // Log with full context
        enhancedLogger.logError('component', `Error in ${context.operation}`, enhancedError, {
            errorId: enhancedError.errorId,
            operation: context.operation,
            component: context.component,
            slice: context.slice,
            userAction: context.userAction,
            ...context.metadata,
        });

        // Optional notification (if UI slice is available)
        if (notify && typeof window !== 'undefined') {
            this.notifyUser(enhancedError);
        }

        if (rethrow) {
            throw enhancedError;
        }

        return enhancedError;
    }

    /**
     * Async operation wrapper with retry logic
     */
    public async withRetry<T>(
        operation: () => Promise<T>,
        context: ErrorContext,
        retryConfig: Partial<RetryConfig> = {}
    ): Promise<T> {
        const config: RetryConfig = {
            maxAttempts: 3,
            baseDelay: 1000,
            shouldRetry: (error, attempt) => {
                // Default retry logic
                const retryableErrors = ['NetworkError', 'TimeoutError', 'fetch', 'ECONNRESET', 'ETIMEDOUT'];
                return (
                    retryableErrors.some(pattern => error.message.toLowerCase().includes(pattern.toLowerCase())) &&
                    attempt < 3
                );
            },
            ...retryConfig,
        };

        let lastError: Error;

        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                const result = await operation();

                // Log successful retry
                if (attempt > 1) {
                    enhancedLogger.api('info', `Operation succeeded on attempt ${attempt}`, {
                        operation: context.operation,
                        attempts: attempt,
                    });
                }

                return result;
            } catch (error) {
                lastError = this.standardizeError(error);

                const shouldRetry = attempt < config.maxAttempts && config.shouldRetry?.(lastError, attempt);

                if (shouldRetry) {
                    const delay = config.baseDelay * Math.pow(2, attempt - 1);

                    enhancedLogger.api('warning', `Attempt ${attempt} failed, retrying in ${delay}ms`, {
                        operation: context.operation,
                        error: lastError.message,
                        attempt,
                        nextDelay: delay,
                    });

                    await this.delay(delay);
                } else {
                    // Final failure
                    return this.handleError(
                        lastError,
                        {
                            ...context,
                            operation: `${context.operation} (after ${attempt} attempts)`,
                            metadata: {
                                ...context.metadata,
                                totalAttempts: attempt,
                                finalAttempt: true,
                            },
                        },
                        { rethrow: true }
                    ) as never;
                }
            }
        }

        // Should never reach here, but TypeScript needs this
        throw lastError!;
    }

    /**
     * Safe execution wrapper for UI operations
     */
    public safeTry<T>(operation: () => T, context: ErrorContext, fallback?: T): T | undefined {
        try {
            return operation();
        } catch (error) {
            this.handleError(error, context, { rethrow: false });
            return fallback;
        }
    }

    /**
     * Async safe execution wrapper
     */
    public async safeAsyncTry<T>(
        operation: () => Promise<T>,
        context: ErrorContext,
        fallback?: T
    ): Promise<T | undefined> {
        try {
            return await operation();
        } catch (error) {
            this.handleError(error, context, { rethrow: false });
            return fallback;
        }
    }

    /**
     * Create error context helper
     */
    public createContext(operation: string, additional: Partial<ErrorContext> = {}): ErrorContext {
        return {
            operation,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            timestamp: new Date().toISOString(),
            ...additional,
        };
    }

    /**
     * Get error statistics
     */
    public getErrorStats(): {
        totalErrors: number;
        recentErrors: number;
        topErrors: Array<{ message: string; count: number }>;
        errorsByComponent: Record<string, number>;
    } {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        const recentErrors = this.errorReports.filter(error => new Date(error.timestamp).getTime() > oneHourAgo);

        const errorCounts = new Map<string, number>();
        const componentCounts: Record<string, number> = {};

        this.errorReports.forEach(error => {
            const key = `${error.context.operation}: ${error.message}`;
            errorCounts.set(key, (errorCounts.get(key) || 0) + 1);

            if (error.context.component) {
                componentCounts[error.context.component] = (componentCounts[error.context.component] || 0) + 1;
            }
        });

        const topErrors = Array.from(errorCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([message, count]) => ({ message, count }));

        return {
            totalErrors: this.errorReports.length,
            recentErrors: recentErrors.length,
            topErrors,
            errorsByComponent: componentCounts,
        };
    }

    /**
     * Export error reports for debugging
     */
    public exportErrorReports(): string {
        return JSON.stringify(
            this.errorReports.map(error => error.toJSON()),
            null,
            2
        );
    }

    private standardizeError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        if (typeof error === 'string') {
            return new Error(error);
        }

        if (error && typeof error === 'object') {
            const message = 'message' in error ? String(error.message) : JSON.stringify(error);
            return new Error(message);
        }

        return new Error('Unknown error occurred');
    }

    private storeErrorReport(error: EnhancedError): void {
        this.errorReports.push(error);

        if (this.errorReports.length > this.maxReports) {
            this.errorReports.shift();
        }
    }

    private async notifyUser(error: EnhancedError): Promise<void> {
        // Try to notify through the app's notification system
        try {
            const store = (globalThis as any).__appStore?.getState?.();
            if (store?.addNotification) {
                store.addNotification({
                    type: 'error',
                    message: `Operation failed: ${error.context.operation}`,
                    duration: 8000,
                });
            }
        } catch (notificationError) {
            // Fallback to console if notification system fails
            console.error('Failed to show error notification:', notificationError);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global instance
export const errorHandler = EnhancedErrorHandler.getInstance();

// Global error handlers
if (typeof window !== 'undefined') {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
        errorHandler.handleError(event.reason, {
            operation: 'Unhandled Promise Rejection',
            component: 'Global',
            metadata: {
                type: 'unhandledrejection',
                promise: event.promise,
            },
        });
    });

    // Global errors
    window.addEventListener('error', event => {
        errorHandler.handleError(event.error || new Error(event.message), {
            operation: 'Global Error',
            component: 'Global',
            metadata: {
                type: 'error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        });
    });

    // Make available for debugging
    (window as any).__errorHandler = errorHandler;
}
