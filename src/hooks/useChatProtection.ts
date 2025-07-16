// src/hooks/useChatProtection.ts
import { useInterviewContext } from '@/hooks/useInterviewContext';
import { useChatPageProtection } from '@/hooks/useRouteProtection';
import { useMemo } from 'react';

export const useChatProtection = () => {
    const { isAccessAllowed, isLoading: protectionLoading } = useChatPageProtection();
    const { initialContext: initialInterviewContext, isContextValid: hasValidContext } = useInterviewContext();

    // ✅ Memoized protection status to prevent unnecessary re-renders
    const protectionStatus = useMemo(() => {
        if (protectionLoading) return 'loading';
        if (!isAccessAllowed) return 'denied'; // ✅ FIXED: Use correct property name
        if (!hasValidContext) return 'invalid-context';
        if (!initialInterviewContext) return 'missing-context';
        return 'allowed';
    }, [protectionLoading, isAccessAllowed, hasValidContext, initialInterviewContext]);

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
        isAllowed: isAccessAllowed, // ✅ FIXED: Map to expected name
        hasValidContext,
    };
};
