import { useCallback } from 'react';

import { logger } from '@/lib/Logger';
import { useBoundStore } from '@/stores/chatStore';

/**
 * Wraps generateResponse with standardized error handling.
 * Logs errors and sets the LLM error state on failure.
 * Clears any existing LLM error on success.
 */
export const useSafeGenerateResponse = () => {
    const { generateResponse, setLlmError } = useBoundStore();

    return useCallback(
        async (message: string) => {
            try {
                await generateResponse(message);
                setLlmError(null);
                return true;
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Failed to generate response';
                logger.error(`generateResponse failed: ${errMsg}`);
                setLlmError(errMsg);
                return false;
            }
        },
        [generateResponse, setLlmError]
    );
};
