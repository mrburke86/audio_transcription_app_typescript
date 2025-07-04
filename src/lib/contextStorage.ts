// src/lib/contextStorage.ts (Simplified Debug Version)
'use client';

import { InitialInterviewContext } from '@/types';
import { logger } from '@/modules';

const CONTEXT_STORAGE_KEY = 'interview_context';

/**
 * Simplified version with more debugging to help identify the issue
 */

export const storeInterviewContext = (context: InitialInterviewContext): boolean => {
    try {
        if (typeof window === 'undefined') {
            logger.warning('storeInterviewContext: Window not available (SSR)');
            return false;
        }

        logger.info('🔍 About to store context:', {
            targetRole: context.targetRole,
            targetCompany: context.targetCompany,
            interviewType: context.interviewType,
            hasGoals: Array.isArray(context.goals),
            goalsLength: context.goals?.length || 0
        });

        const serializedContext = JSON.stringify(context);
        sessionStorage.setItem(CONTEXT_STORAGE_KEY, serializedContext);
        
        // ✅ Immediate verification that storage worked
        const verification = sessionStorage.getItem(CONTEXT_STORAGE_KEY);
        if (verification) {
            logger.info(`✅ Context successfully stored and verified (${serializedContext.length} chars)`);
            return true;
        } else {
            logger.error('❌ Context storage failed - verification returned null');
            return false;
        }
    } catch (error) {
        logger.error('❌ Failed to store interview context:', error);
        return false;
    }
};

export const getStoredInterviewContext = (): InitialInterviewContext | null => {
    try {
        if (typeof window === 'undefined') {
            logger.warning('getStoredInterviewContext: Window not available (SSR)');
            return null;
        }

        const storedData = sessionStorage.getItem(CONTEXT_STORAGE_KEY);
        if (!storedData) {
            logger.debug('No stored interview context found');
            return null;
        }

        logger.info(`🔍 Found stored context data (${storedData.length} chars)`);

        const context = JSON.parse(storedData) as InitialInterviewContext;
        
        // ✅ More detailed validation logging
        logger.info('🔍 Parsed context:', {
            targetRole: context.targetRole,
            targetCompany: context.targetCompany,
            interviewType: context.interviewType,
            hasRequiredFields: !!(context.targetRole && context.targetCompany)
        });

        // Simple validation - just check the most essential fields
        if (!context.targetRole || !context.targetCompany) {
            logger.warning('⚠️ Context missing essential fields:', {
                hasTargetRole: !!context.targetRole,
                hasTargetCompany: !!context.targetCompany
            });
            return null;
        }

        logger.info(`✅ Valid context retrieved: ${context.targetRole} at ${context.targetCompany}`);
        return context;
    } catch (error) {
        logger.error('❌ Failed to retrieve interview context:', error);
        clearStoredInterviewContext();
        return null;
    }
};

export const clearStoredInterviewContext = (): void => {
    try {
        if (typeof window === 'undefined') {
            logger.warning('clearStoredInterviewContext: Window not available (SSR)');
            return;
        }

        sessionStorage.removeItem(CONTEXT_STORAGE_KEY);
        logger.info('🧹 Interview context cleared from storage');
    } catch (error) {
        logger.error('❌ Failed to clear interview context:', error);
    }
};

export const hasValidStoredContext = (): boolean => {
    const context = getStoredInterviewContext();
    const isValid = context !== null;
    logger.info(`🔍 Context validity check: ${isValid}`);
    return isValid;
};

// ✅ Simplified validation - just check the bare essentials
export const validateInterviewContext = (context: Partial<InitialInterviewContext>): boolean => {
    if (!context) {
        logger.warning('⚠️ Validation failed: No context provided');
        return false;
    }

    // Just check the two most essential fields
    const hasRole = !!(context.targetRole && context.targetRole.trim());
    const hasCompany = !!(context.targetCompany && context.targetCompany.trim());

    logger.info('🔍 Context validation:', {
        hasRole,
        hasCompany,
        valid: hasRole && hasCompany
    });

    if (!hasRole) {
        logger.warning('⚠️ Validation failed: Missing targetRole');
        return false;
    }

    if (!hasCompany) {
        logger.warning('⚠️ Validation failed: Missing targetCompany');
        return false;
    }

    logger.info('✅ Context validation passed');
    return true;
};