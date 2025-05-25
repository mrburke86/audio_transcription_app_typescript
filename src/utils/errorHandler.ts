// src/utils/errorHandler.ts
import { logger } from "@/modules/Logger";
import { loglog } from "@/modules/log-log";

export interface LLMError {
    code: string;
    message: string;
    userMessage: string;
    isRetryable: boolean;
    retryDelay?: number;
}

export class LLMErrorHandler {
    /**
     * Classify and handle different types of LLM errors
     */
    static handleError(
        error: unknown,
        context: string = "generateResponse",
        queryId?: string,
    ): LLMError {
        const logPrefix = queryId ? `[${context}][${queryId}]` : `[${context}]`;

        try {
            if (error instanceof Error) {
                const errorText = error.message.toLowerCase();
                const llmError = this.classifyError(error.message, errorText);

                logger.error(`${logPrefix} ❌ Error: ${llmError.message}`);
                if (queryId) {
                    loglog.error(
                        `Error in ${context}: ${llmError.message}`,
                        queryId,
                    );
                } else {
                    loglog.error(`Error in ${context}: ${llmError.message}`);
                }

                return llmError;
            } else {
                const unknownError: LLMError = {
                    code: "unknown_error",
                    message: "An unknown error occurred",
                    userMessage:
                        "An unexpected error occurred. Please try again.",
                    isRetryable: true,
                    retryDelay: 2000,
                };

                logger.error(`${logPrefix} ❌ Unknown error occurred`);
                if (queryId) {
                    loglog.error("Unknown error occurred", queryId);
                } else {
                    loglog.error("Unknown error occurred");
                }

                return unknownError;
            }
        } catch (handlerError) {
            // Fallback if error handler itself fails
            logger.error(
                `${logPrefix} ❌ Error handler failed: ${handlerError}`,
            );

            return {
                code: "handler_error",
                message: "Error handler failed",
                userMessage:
                    "A system error occurred. Please refresh and try again.",
                isRetryable: false,
            };
        }
    }

    /**
     * Classify error based on error message content
     */
    private static classifyError(
        originalMessage: string,
        lowerCaseMessage: string,
    ): LLMError {
        // OpenAI API Errors
        if (
            lowerCaseMessage.includes("invalid_api_key") ||
            lowerCaseMessage.includes("unauthorized")
        ) {
            return {
                code: "invalid_api_key",
                message: originalMessage,
                userMessage:
                    "API key is invalid or missing. Please check your configuration.",
                isRetryable: false,
            };
        }

        if (
            lowerCaseMessage.includes("rate_limit_exceeded") ||
            lowerCaseMessage.includes("rate limit")
        ) {
            return {
                code: "rate_limit_exceeded",
                message: originalMessage,
                userMessage:
                    "Rate limit exceeded. Please wait a moment and try again.",
                isRetryable: true,
                retryDelay: 60000, // 1 minute
            };
        }

        if (
            lowerCaseMessage.includes("quota_exceeded") ||
            lowerCaseMessage.includes("quota")
        ) {
            return {
                code: "quota_exceeded",
                message: originalMessage,
                userMessage:
                    "API quota exceeded. Please check your OpenAI account.",
                isRetryable: false,
            };
        }

        if (
            lowerCaseMessage.includes("model_not_found") ||
            lowerCaseMessage.includes("model")
        ) {
            return {
                code: "model_not_found",
                message: originalMessage,
                userMessage:
                    "The AI model is currently unavailable. Please try again later.",
                isRetryable: true,
                retryDelay: 5000,
            };
        }

        if (
            lowerCaseMessage.includes("context_length_exceeded") ||
            lowerCaseMessage.includes("context")
        ) {
            return {
                code: "context_length_exceeded",
                message: originalMessage,
                userMessage:
                    "Your message is too long. Please shorten it and try again.",
                isRetryable: false,
            };
        }

        // Network Errors
        if (
            lowerCaseMessage.includes("network") ||
            lowerCaseMessage.includes("fetch")
        ) {
            return {
                code: "network_error",
                message: originalMessage,
                userMessage:
                    "Network error. Please check your internet connection and try again.",
                isRetryable: true,
                retryDelay: 3000,
            };
        }

        if (
            lowerCaseMessage.includes("timeout") ||
            lowerCaseMessage.includes("timed out")
        ) {
            return {
                code: "timeout_error",
                message: originalMessage,
                userMessage: "Request timed out. Please try again.",
                isRetryable: true,
                retryDelay: 2000,
            };
        }

        // Server Errors
        if (
            lowerCaseMessage.includes("500") ||
            lowerCaseMessage.includes("internal server")
        ) {
            return {
                code: "server_error",
                message: originalMessage,
                userMessage: "Server error. Please try again in a moment.",
                isRetryable: true,
                retryDelay: 5000,
            };
        }

        if (
            lowerCaseMessage.includes("503") ||
            lowerCaseMessage.includes("service unavailable")
        ) {
            return {
                code: "service_unavailable",
                message: originalMessage,
                userMessage:
                    "Service temporarily unavailable. Please try again later.",
                isRetryable: true,
                retryDelay: 10000,
            };
        }

        // Client Initialization Errors
        if (
            lowerCaseMessage.includes("not initialized") ||
            lowerCaseMessage.includes("client")
        ) {
            return {
                code: "client_not_initialized",
                message: originalMessage,
                userMessage:
                    "System is initializing. Please wait a moment and try again.",
                isRetryable: true,
                retryDelay: 1000,
            };
        }

        // Knowledge Base Errors
        if (
            lowerCaseMessage.includes("knowledge") ||
            lowerCaseMessage.includes("files")
        ) {
            return {
                code: "knowledge_error",
                message: originalMessage,
                userMessage:
                    "Knowledge base error. Some features may be limited.",
                isRetryable: true,
                retryDelay: 2000,
            };
        }

        // Streaming Errors
        if (
            lowerCaseMessage.includes("stream") ||
            lowerCaseMessage.includes("streaming")
        ) {
            return {
                code: "streaming_error",
                message: originalMessage,
                userMessage: "Streaming error occurred. Please try again.",
                isRetryable: true,
                retryDelay: 1000,
            };
        }

        // Default case
        return {
            code: "generic_error",
            message: originalMessage,
            userMessage: "An error occurred. Please try again.",
            isRetryable: true,
            retryDelay: 2000,
        };
    }

    /**
     * Check if an error is retryable
     */
    static isRetryableError(error: unknown): boolean {
        const llmError = this.handleError(error);
        return llmError.isRetryable;
    }

    /**
     * Get retry delay for an error
     */
    static getRetryDelay(error: unknown): number {
        const llmError = this.handleError(error);
        return llmError.retryDelay || 2000;
    }

    /**
     * Create a retry strategy for operations
     */
    static async withRetry<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        context: string = "operation",
        queryId?: string,
    ): Promise<T> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                const llmError = this.handleError(error, context, queryId);

                if (!llmError.isRetryable || attempt === maxRetries) {
                    throw error;
                }

                const delay = llmError.retryDelay || 2000;
                logger.info(
                    `[${context}] Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms: ${llmError.message}`,
                );

                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    /**
     * Format error for user display
     */
    static formatUserError(
        error: unknown,
        includeDetails: boolean = false,
    ): string {
        try {
            const llmError = this.handleError(error);

            if (includeDetails && process.env.NODE_ENV === "development") {
                return `${llmError.userMessage}\n\nTechnical details: ${llmError.message}`;
            }

            return llmError.userMessage;
        } catch {
            return "An unexpected error occurred. Please try again.";
        }
    }

    /**
     * Log error with appropriate severity
     */
    static logError(
        error: unknown,
        context: string,
        queryId?: string,
        additionalInfo?: Record<string, any>,
    ): void {
        try {
            const llmError = this.handleError(error, context, queryId);
            const logPrefix = queryId
                ? `[${context}][${queryId}]`
                : `[${context}]`;

            // Log with appropriate severity
            if (
                llmError.code === "invalid_api_key" ||
                llmError.code === "quota_exceeded"
            ) {
                logger.error(
                    `${logPrefix} 🔑 Configuration Error: ${llmError.message}`,
                );
            } else if (llmError.code === "rate_limit_exceeded") {
                logger.warning(
                    `${logPrefix} ⏱️ Rate Limit: ${llmError.message}`,
                );
            } else if (llmError.code === "network_error") {
                logger.warning(
                    `${logPrefix} 🌐 Network Issue: ${llmError.message}`,
                );
            } else if (llmError.isRetryable) {
                logger.warning(
                    `${logPrefix} ⚠️ Retryable Error: ${llmError.message}`,
                );
            } else {
                logger.error(
                    `${logPrefix} ❌ Fatal Error: ${llmError.message}`,
                );
            }

            // Log additional context
            if (additionalInfo) {
                logger.debug(
                    `${logPrefix} Additional context: ${JSON.stringify(
                        additionalInfo,
                    )}`,
                );
            }
        } catch (logError) {
            // Fallback logging if error handler fails
            console.error("Error handler failed:", logError);
            console.error("Original error:", error);
        }
    }
}
