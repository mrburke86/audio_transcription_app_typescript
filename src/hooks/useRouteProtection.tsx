// src/hooks/useRouteProtection.ts
'use client';

import { logger } from '@/modules';
import { useChatStore } from '@/stores/chatStore'; // NEW
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react'; // Removed useState
import { useInterviewContext } from './useInterviewContext';

interface UseRouteProtectionOptions {
    guardedRoutePath: string;
    redirectPath: string;
    showLoading?: boolean;
    customValidation?: () => boolean;
}

interface UseRouteProtectionReturn {
    isAccessAllowed: boolean;
    isLoading: boolean;
    isRedirecting: boolean;
}

export const useRouteProtection = (options: UseRouteProtectionOptions): UseRouteProtectionReturn => {
    const { guardedRoutePath, redirectPath, showLoading = true, customValidation } = options;

    const router = useRouter();
    const pathname = usePathname();
    const { initialContext, isContextValid, isLoading: contextLoading } = useInterviewContext(); // FIXED: Renamed use

    const protectionState = useChatStore(state => state.protectionState);
    const setProtectionState = useChatStore(state => state.setProtectionState);

    useEffect(() => {
        if (pathname !== guardedRoutePath) {
            setProtectionState({ isAccessAllowed: true, isValidating: true });
            return;
        }

        if (contextLoading) {
            logger.debug(`🔒 Route protection waiting for context to load...`);
            return;
        }

        logger.info(`🔒 Evaluating route protection for ${guardedRoutePath}`);

        let validationPassed = isContextValid;

        if (customValidation) {
            validationPassed = validationPassed && customValidation();
            logger.debug(`🔍 Custom validation result: ${validationPassed}`);
        }

        if (validationPassed && initialContext) {
            const requiredFields = ['targetRole', 'targetCompany', 'interviewType'];
            validationPassed = requiredFields.every(field => (initialContext as any)[field]?.trim());
        }

        if (validationPassed) {
            logger.info(`✅ Route protection passed for ${guardedRoutePath}`);
            setProtectionState({ isAccessAllowed: true, isValidating: true });
        } else {
            logger.warning(`❌ Route protection failed for ${guardedRoutePath}, redirecting to ${redirectPath}`);
            setProtectionState({ isAccessAllowed: false, isRedirecting: true });

            setTimeout(() => {
                router.push(redirectPath);
            }, 100);
        }
    }, [
        pathname,
        guardedRoutePath,
        contextLoading,
        isContextValid,
        initialContext,
        customValidation,
        redirectPath,
        router,
    ]);

    const isLoading =
        showLoading &&
        (contextLoading ||
            !protectionState.isValidating ||
            (pathname === guardedRoutePath && !protectionState.isAccessAllowed && !protectionState.isRedirecting));

    return {
        isAccessAllowed: protectionState.isAccessAllowed,
        isLoading,
        isRedirecting: protectionState.isRedirecting,
    };
};

export const withRouteProtection = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    protectionOptions: UseRouteProtectionOptions
) => {
    const ProtectedComponent = (props: P) => {
        const { isAccessAllowed, isLoading, isRedirecting } = useRouteProtection(protectionOptions);

        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <h2 className="text-xl font-semibold">Validating Session...</h2>
                        <p className="text-muted-foreground">Checking interview context and permissions</p>
                    </div>
                </div>
            );
        }

        if (isRedirecting) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <h2 className="text-xl font-semibold">Redirecting...</h2>
                        <p className="text-muted-foreground">Taking you to the setup page</p>
                    </div>
                </div>
            );
        }

        if (isAccessAllowed) {
            return <WrappedComponent {...props} />;
        }

        return null;
    };

    ProtectedComponent.displayName = `withRouteProtection(${WrappedComponent.displayName || WrappedComponent.name})`;

    return ProtectedComponent;
};

export const useChatPageProtection = () => {
    return useRouteProtection({
        guardedRoutePath: '/chat',
        redirectPath: '/capture-context',
        showLoading: true,
        customValidation: () => true,
    });
};
