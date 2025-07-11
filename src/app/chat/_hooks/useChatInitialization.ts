// src/app/chat/_hooks/useChatProtection.ts/useChatInitialization.ts
import { logger } from '@/modules';
import { useEffect, useRef } from 'react';

export const useChatInitialization = (
    protectionLoading: boolean,
    isAllowed: boolean,
    hasValidContext: boolean,
    initialInterviewContext: any,
    apiKey: string
) => {
    const initialized = useRef(false);

    useEffect(() => {
        // ✅ Only initialize once when protection is resolved
        if (protectionLoading || initialized.current) {
            return;
        }

        initialized.current = true;

        // 🚀 Initialize chat
        logger.info('🚀 Initializing optimized chat (Chat Completions API)');

        // 🔑 Validate API key
        if (!apiKey) {
            logger.error('🔑❌ OpenAI API key is missing');
        }

        // Log successful context load (removed redirect to prevent loops)
        if (initialInterviewContext && hasValidContext) {
            logger.info('✅ Chat page loaded with valid context:', {
                role: initialInterviewContext.targetRole,
                company: initialInterviewContext.targetCompany,
                type: initialInterviewContext.interviewType,
            });
        } else if (!hasValidContext) {
            logger.warning('⚠️ Chat loaded without valid context - protection should handle this');
        }

        // 🧹 Cleanup on unmount
        return () => {
            logger.info('🧹 Cleaning up optimized chat');
            initialized.current = false;
        };
    }, [protectionLoading]); // Only depend on protection loading, not the changing values

    return { initialized: initialized.current };
};
