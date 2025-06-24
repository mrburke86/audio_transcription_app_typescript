// Create: src/utils/retryUtils.ts
export interface RetryOptions {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    shouldRetry?: (error: Error) => boolean;
}

export async function withRetry<T>(operation: () => Promise<T>, options: Partial<RetryOptions> = {}): Promise<T> {
    const {
        maxAttempts = 3,
        baseDelay = 1000,
        maxDelay = 10000,
        shouldRetry = (error: Error) => {
            // Retry on network errors, timeouts, and 5xx status codes
            return (
                error.message.includes('fetch') ||
                error.message.includes('timeout') ||
                error.message.includes('500') ||
                error.message.includes('502') ||
                error.message.includes('503')
            );
        },
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt === maxAttempts || !shouldRetry(lastError)) {
                throw lastError;
            }

            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}
