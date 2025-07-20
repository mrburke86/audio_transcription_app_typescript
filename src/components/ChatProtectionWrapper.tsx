// src\components\ChatProtectionWrapper.tsx
'use client';
import { LoadingState } from '@/components/global/StatusDisplay';
import { logger } from '@/lib/Logger';
import { useBoundStore } from '@/stores/chatStore';
import { InitialInterviewContext } from '@/types';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface ChatProtectionWrapperProps {
    children: React.ReactElement<{
        initialInterviewContext: InitialInterviewContext;
        knowledgeBaseName: string;
        indexedDocumentsCount: number;
    }>;
}

export const ChatProtectionWrapper: React.FC<ChatProtectionWrapperProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();

    const initialContext = useBoundStore(state => state.initialContext);
    const contextLoading = useBoundStore(state => state.contextLoading);
    const indexedDocumentsCount = useBoundStore(state => state.indexedDocumentsCount);
    const knowledgeBaseName = useBoundStore(s => s.knowledgeBaseName);

    const isValid = useBoundStore(state => state.isContextValid());

    // Log render and state snapshot
    logger.debug('[PROTECT] 👀 Rendering wrapper with:', {
        pathname,
        contextLoading,
        isValid,
        context: initialContext,
    });

    useEffect(() => {
        logger.debug('[PROTECT] 🔄 useEffect triggered', {
            pathname,
            contextLoading,
            isValid,
        });

        if (pathname === '/chat' && !contextLoading && !isValid) {
            logger.warning('[PROTECT] ❌ Invalid context — redirecting to /capture-context');
            router.replace('/capture-context');
        }
    }, [pathname, contextLoading, isValid, router]);

    // Early guard during SSR/initial render
    if (pathname === '/chat' && !isValid && !contextLoading) {
        return (
            <LoadingState message="Redirecting to interview setup..." subMessage="No valid interview session found." />
        );
    }

    // Clone with memoization removed (unnecessary here; React.cloneElement is cheap)
    const cloned = React.cloneElement(children, {
        initialInterviewContext: initialContext,
        knowledgeBaseName,
        indexedDocumentsCount,
    });

    return cloned; // Return the cloned element
};
