// src/lib/error-utils.ts
import { logger } from "@/modules/Logger";

function isErrorWithMessage(error: unknown): error is Error {
    return typeof error === "object" && error !== null && "message" in error;
}

// Handle errors uniformly
function handleError(error: unknown, context: string): never {
    if (error instanceof Error) {
        logger.error(`${context}: ${error.message}`);
    } else {
        logger.error(`${context}: An unknown error occurred`);
    }
    throw error;
}

export { isErrorWithMessage, handleError };
