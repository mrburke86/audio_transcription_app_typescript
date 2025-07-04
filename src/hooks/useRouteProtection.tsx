// src/hooks/useRouteProtection.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useInterviewContext } from './useInterviewContext';
import { logger } from '@/modules';

interface UseRouteProtectionOptions {
    // The route that requires protection
    protectedRoute: string;
    // Where to redirect if protection fails
    redirectTo: string;
    // Whether to show loading state during validation
    showLoading?: boolean;
    // Custom validation function (optional)
    customValidation?: () => boolean;
}

interface UseRouteProtectionReturn {
    isAllowed: boolean;
    isLoading: boolean;
    redirecting: boolean;
}

/**
 * Hook for protecting routes that require valid interview context
 * 
 * This hook provides a robust way to ensure users have completed the necessary
 * setup steps before accessing protected pages like the chat interface.
 * It handles automatic redirection and provides loading states for smooth UX.
 * 
 * @param options Configuration for route protection behavior
 * @returns Protection state and loading indicators
 */
export const useRouteProtection = (options: UseRouteProtectionOptions): UseRouteProtectionReturn => {
    const {
        protectedRoute,
        redirectTo,
        showLoading = true,
        customValidation
    } = options;

    const router = useRouter();
    const pathname = usePathname();
    const { context, hasValidContext, isLoading: contextLoading } = useInterviewContext();
    
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [redirecting, setRedirecting] = useState<boolean>(false);
    const [validationComplete, setValidationComplete] = useState<boolean>(false);

    useEffect(() => {
        // Only run protection logic if we're on the protected route
        if (pathname !== protectedRoute) {
            setIsAllowed(true);
            setValidationComplete(true);
            return;
        }

        // Wait for context to finish loading before making decisions
        if (contextLoading) {
            logger.debug(`🔒 Route protection waiting for context to load...`);
            return;
        }

        logger.info(`🔒 Evaluating route protection for ${protectedRoute}`);

        // Perform validation checks
        let validationPassed = hasValidContext;

        // Apply custom validation if provided
        if (customValidation) {
            validationPassed = validationPassed && customValidation();
            logger.debug(`🔍 Custom validation result: ${validationPassed}`);
        }

        // Additional context-specific validation
        if (validationPassed && context) {
            // Ensure required fields are present
            const requiredFields = ['targetRole', 'targetCompany', 'interviewType'];
            validationPassed = requiredFields.every(field => {
                const hasField = !!(context as any)[field]?.trim();
                if (!hasField) {
                    logger.warning(`⚠️ Missing required field: ${field}`);
                }
                return hasField;
            });
        }

        if (validationPassed) {
            logger.info(`✅ Route protection passed for ${protectedRoute}`);
            setIsAllowed(true);
            setValidationComplete(true);
        } else {
            logger.warning(`❌ Route protection failed for ${protectedRoute}, redirecting to ${redirectTo}`);
            setIsAllowed(false);
            setRedirecting(true);
            
            // Perform redirect with a small delay for smooth UX
            setTimeout(() => {
                router.push(redirectTo);
            }, 100);
        }
    }, [
        pathname,
        protectedRoute,
        contextLoading,
        hasValidContext,
        context,
        customValidation,
        redirectTo,
        router
    ]);

    // Determine loading state
    const isLoading = showLoading && (
        contextLoading || 
        !validationComplete || 
        (pathname === protectedRoute && !isAllowed && !redirecting)
    );

    return {
        isAllowed,
        isLoading,
        redirecting
    };
};

/**
 * Higher-order component that wraps pages with route protection
 * 
 * This provides a declarative way to protect entire pages by wrapping them
 * with protection logic. It's particularly useful for protecting the chat page.
 * 
 * @param WrappedComponent The component to protect
 * @param protectionOptions Configuration for protection behavior
 * @returns Protected component with automatic redirection and loading states
 */
export const withRouteProtection = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    protectionOptions: UseRouteProtectionOptions
) => {
    const ProtectedComponent = (props: P) => {
        const { isAllowed, isLoading, redirecting } = useRouteProtection(protectionOptions);

        // Show loading state while validating
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <h2 className="text-xl font-semibold">Validating Session...</h2>
                        <p className="text-muted-foreground">
                            Checking interview context and permissions
                        </p>
                    </div>
                </div>
            );
        }

        // Show redirecting state
        if (redirecting) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <h2 className="text-xl font-semibold">Redirecting...</h2>
                        <p className="text-muted-foreground">
                            Taking you to the setup page
                        </p>
                    </div>
                </div>
            );
        }

        // Only render the wrapped component if allowed
        if (isAllowed) {
            return <WrappedComponent {...props} />;
        }

        // Fallback - should not normally reach here due to redirecting logic
        return null;
    };

    ProtectedComponent.displayName = `withRouteProtection(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return ProtectedComponent;
};

/**
 * Specialized hook for chat page protection
 * 
 * This is a convenient wrapper around useRouteProtection specifically
 * configured for protecting the chat interface. It includes chat-specific
 * validation rules and appropriate redirect logic.
 */
export const useChatPageProtection = () => {
    return useRouteProtection({
        protectedRoute: '/chat',
        redirectTo: '/capture-context',
        showLoading: true,
        customValidation: () => {
            // Add any chat-specific validation logic here
            // For example, checking if required services are available
            return true;
        }
    });
};