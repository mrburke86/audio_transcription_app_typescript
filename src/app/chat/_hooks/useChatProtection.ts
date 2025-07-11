// src/app/chat/_hooks/useChatProtection.ts
import { useInterviewContext } from '@/hooks/useInterviewContext';
import { useChatPageProtection } from '@/hooks/useRouteProtection';
import { useMemo } from 'react';

export const useChatProtection = () => {
    const { isAllowed, isLoading: protectionLoading } = useChatPageProtection();
    const { context: initialInterviewContext, hasValidContext } = useInterviewContext();

    // ✅ Memoized protection status to prevent unnecessary re-renders
    const protectionStatus = useMemo(() => {
        if (protectionLoading) return 'loading';
        if (!isAllowed) return 'denied';
        if (!hasValidContext) return 'invalid-context';
        if (!initialInterviewContext) return 'missing-context';
        return 'allowed';
    }, [protectionLoading, isAllowed, hasValidContext, initialInterviewContext]);

    // ✅ Memoized context to prevent object recreation
    const stableContext = useMemo(
        () => initialInterviewContext,
        [
            initialInterviewContext?.targetRole,
            initialInterviewContext?.targetCompany,
            initialInterviewContext?.interviewType,
            initialInterviewContext?.goals?.length,
            initialInterviewContext?.emphasizedExperiences?.length,
        ]
    );

    return {
        protectionStatus,
        initialInterviewContext: stableContext,
        protectionLoading,
        isAllowed,
        hasValidContext,
    };
};
