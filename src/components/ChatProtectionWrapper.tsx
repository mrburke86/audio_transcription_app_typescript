// src/components/ChatProtectionWrapper.tsx - FIXED HOOKS ORDER
'use client';
import { LoadingState } from '@/components/global/StatusDisplay';
import { logger } from '@/lib/Logger';
import { useBoundStore } from '@/stores/chatStore';
import { DEFAULT_INTERVIEW_CONTEXT, InitialInterviewContext } from '@/types';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface ChatProtectionWrapperProps {
    children: React.ReactElement<{
        initialInterviewContext?: InitialInterviewContext;
        knowledgeBaseName?: string;
        indexedDocumentsCount?: number;
    }>;
}

export const ChatProtectionWrapper: React.FC<ChatProtectionWrapperProps> = ({ children }) => {
    // ✅ ALL HOOKS AT THE TOP - NEVER CONDITIONAL
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // ✅ ALL ZUSTAND HOOKS TOGETHER
    const initialContext = useBoundStore(state => state.initialContext);
    const contextLoading = useBoundStore(state => state.contextLoading);
    const indexedDocumentsCount = useBoundStore(state => state.indexedDocumentsCount);
    const knowledgeBaseName = useBoundStore(s => s.knowledgeBaseName);
    const resetToDefaultContext = useBoundStore(state => state.resetToDefaultContext);

    // ✅ ALL MEMOIZED VALUES TOGETHER
    const isValid = useMemo(() => {
        return !!(initialContext?.targetRole?.trim() && initialContext?.targetCompany?.trim());
    }, [initialContext?.targetRole, initialContext?.targetCompany]);

    const safeProps = useMemo(
        () => ({
            initialInterviewContext: {
                ...DEFAULT_INTERVIEW_CONTEXT,
                ...initialContext,
            },
            knowledgeBaseName: knowledgeBaseName || 'Knowledge Base',
            indexedDocumentsCount: Math.max(0, indexedDocumentsCount || 0),
        }),
        [initialContext, knowledgeBaseName, indexedDocumentsCount]
    );

    // ✅ ALL CALLBACKS TOGETHER
    const initializeContext = useCallback(() => {
        if (!initialContext?.targetRole || !initialContext?.targetCompany) {
            logger.info('[🔧 Protection] One-time context initialization');
            resetToDefaultContext();
        }
    }, [initialContext, resetToDefaultContext]);

    // ✅ ALL EFFECTS TOGETHER - NO CONDITIONAL LOGIC
    // Effect 1: Client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Effect 2: One-time initialization
    useEffect(() => {
        if (!isClient || hasInitialized) return;

        initializeContext();
        setHasInitialized(true);
    }, [isClient, hasInitialized, initializeContext]);

    // Effect 3: Navigation logic
    useEffect(() => {
        if (!isClient || !hasInitialized) return;

        if (pathname === '/chat' && !contextLoading && !isValid) {
            logger.warning('[PROTECT] Redirecting due to invalid context');
            router.replace('/capture-context');
        }
    }, [isClient, hasInitialized, pathname, contextLoading, isValid, router]);

    // Effect 4: Debug logging (safe, no state updates)
    useEffect(() => {
        if (!isClient) return;

        console.group('🛡️ PROTECTION STATE UPDATE');
        console.log('🔍 Protection state:', {
            pathname,
            contextLoading,
            isValid,
            hasInitialized,
            targetRole: initialContext?.targetRole,
            targetCompany: initialContext?.targetCompany,
        });
        console.groupEnd();
    }, [isClient, pathname, contextLoading, isValid, hasInitialized, initialContext]);

    // ✅ RENDER LOGIC - NO HOOKS BELOW THIS POINT
    if (!isClient || !hasInitialized) {
        return <LoadingState message="Initializing..." subMessage="Setting up application..." />;
    }

    if (contextLoading) {
        return <LoadingState message="Loading context..." subMessage="Please wait..." />;
    }

    if (pathname === '/chat' && !isValid) {
        return <LoadingState message="Redirecting..." subMessage="Setting up interview context..." />;
    }

    return React.cloneElement(children, safeProps);
};
